import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const papersRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, categoryId, search } = input;
      
      const papers = await ctx.db.paper.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          status: 'PUBLISHED',
          ...(categoryId && { categoryId }),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { abstract: { contains: search, mode: 'insensitive' } },
              { keywords: { hasSome: [search] } },
            ],
          }),
        },
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
              citations: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (papers.length > limit) {
        const nextItem = papers.pop();
        nextCursor = nextItem!.id;
      }

      return {
        papers,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const paper = await ctx.db.paper.findUnique({
        where: { id: input.id },
        include: {
          authors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  institution: true,
                },
              },
            },
          },
          category: true,
          reviews: {
            include: {
              reviewer: {
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
          comments: {
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
          },
          _count: {
            select: {
              likes: true,
              bookmarks: true,
              citations: true,
            },
          },
        },
      });

      if (!paper) {
        throw new Error('Paper not found');
      }

      // Increment view count
      await ctx.db.paper.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      });

      return paper;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        abstract: z.string().min(1),
        content: z.string().optional(),
        keywords: z.array(z.string()),
        categoryId: z.string(),
        language: z.string().default('ar'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const paper = await ctx.db.paper.create({
        data: {
          ...input,
          authors: {
            create: {
              userId: ctx.session.user.id,
              order: 0,
            },
          },
        },
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
        },
      });

      return paper;
    }),

  like: protectedProcedure
    .input(z.object({ paperId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.like.findUnique({
        where: {
          userId_paperId: {
            userId: ctx.session.user.id,
            paperId: input.paperId,
          },
        },
      });

      if (existingLike) {
        await ctx.db.like.delete({
          where: { id: existingLike.id },
        });
        return { liked: false };
      } else {
        await ctx.db.like.create({
          data: {
            userId: ctx.session.user.id,
            paperId: input.paperId,
          },
        });
        return { liked: true };
      }
    }),

  bookmark: protectedProcedure
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
});

