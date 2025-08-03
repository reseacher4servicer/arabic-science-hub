import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const interactionsRouter = createTRPCRouter({
  // Comments
  createComment: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        paperId: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.create({
        data: {
          content: input.content,
          authorId: ctx.session.user.id,
          paperId: input.paperId,
          parentId: input.parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      });

      // إنشاء إشعار للمؤلف
      const paper = await ctx.db.paper.findUnique({
        where: { id: input.paperId },
        include: {
          authors: {
            include: {
              user: true,
            },
          },
        },
      });

      if (paper) {
        for (const author of paper.authors) {
          if (author.userId !== ctx.session.user.id) {
            await ctx.db.notification.create({
              data: {
                userId: author.userId,
                type: 'COMMENT',
                entityId: comment.id,
                message: `علق ${ctx.session.user.name} على ورقتك "${paper.title}"`,
              },
            });
          }
        }
      }

      return comment;
    }),

  getCommentsByPaper: publicProcedure
    .input(z.object({ paperId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.db.comment.findMany({
        where: {
          paperId: input.paperId,
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return comments;
    }),

  // Likes
  toggleLike: protectedProcedure
    .input(
      z.object({
        paperId: z.string().optional(),
        commentId: z.string().optional(),
        reviewId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { paperId, commentId, reviewId } = input;
      
      if (!paperId && !commentId && !reviewId) {
        throw new Error('يجب تحديد نوع الكيان للإعجاب');
      }

      const whereClause = {
        userId: ctx.session.user.id,
        ...(paperId && { paperId }),
        ...(commentId && { commentId }),
        ...(reviewId && { reviewId }),
      };

      const existingLike = await ctx.db.like.findFirst({
        where: whereClause,
      });

      if (existingLike) {
        await ctx.db.like.delete({
          where: { id: existingLike.id },
        });
        return { liked: false };
      } else {
        await ctx.db.like.create({
          data: whereClause,
        });

        // إنشاء إشعار للمؤلف
        if (paperId) {
          const paper = await ctx.db.paper.findUnique({
            where: { id: paperId },
            include: {
              authors: {
                include: {
                  user: true,
                },
              },
            },
          });

          if (paper) {
            for (const author of paper.authors) {
              if (author.userId !== ctx.session.user.id) {
                await ctx.db.notification.create({
                  data: {
                    userId: author.userId,
                    type: 'LIKE',
                    entityId: paperId,
                    message: `أعجب ${ctx.session.user.name} بورقتك "${paper.title}"`,
                  },
                });
              }
            }
          }
        }

        return { liked: true };
      }
    }),

  // Bookmarks
  toggleBookmark: protectedProcedure
    .input(z.object({ paperId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingBookmark = await ctx.db.bookmark.findUnique({
        where: {
          userId_paperId: {
            userId: ctx.session.user.id,
            paperId: input.paperId,
          },
        },
      });

      if (existingBookmark) {
        await ctx.db.bookmark.delete({
          where: { id: existingBookmark.id },
        });
        return { bookmarked: false };
      } else {
        await ctx.db.bookmark.create({
          data: {
            userId: ctx.session.user.id,
            paperId: input.paperId,
          },
        });
        return { bookmarked: true };
      }
    }),

  getUserBookmarks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page } = input;
      const skip = (page - 1) * limit;

      const [bookmarks, total] = await Promise.all([
        ctx.db.bookmark.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            paper: {
              include: {
                authors: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                      },
                    },
                  },
                },
                category: true,
                _count: {
                  select: {
                    likes: true,
                    comments: true,
                    bookmarks: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip,
        }),
        ctx.db.bookmark.count({
          where: { userId: ctx.session.user.id },
        }),
      ]);

      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.paper.id,
        title: bookmark.paper.title,
        abstract: bookmark.paper.abstract,
        authorName: bookmark.paper.authors[0]?.user.name || 'مؤلف غير معروف',
        categoryName: bookmark.paper.category.name,
        createdAt: bookmark.paper.createdAt,
        viewCount: bookmark.paper.views,
        bookmarkedAt: bookmark.createdAt,
      }));

      return {
        bookmarks: formattedBookmarks,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Notifications
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, unreadOnly } = input;
      const skip = (page - 1) * limit;

      const where = {
        userId: ctx.session.user.id,
        ...(unreadOnly && { isRead: false }),
      };

      const [notifications, total] = await Promise.all([
        ctx.db.notification.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip,
        }),
        ctx.db.notification.count({ where }),
      ]);

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.update({
        where: {
          id: input.notificationId,
          userId: ctx.session.user.id, // تأكد من أن الإشعار يخص المستخدم
        },
        data: {
          isRead: true,
        },
      });

      return { success: true };
    }),

  markAllNotificationsAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.db.notification.updateMany({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return { success: true };
    }),

  getUnreadNotificationsCount: protectedProcedure
    .query(async ({ ctx }) => {
      const count = await ctx.db.notification.count({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
      });

      return { count };
    }),
});

