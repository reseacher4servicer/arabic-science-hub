import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const submissionsRouter = createTRPCRouter({
  // Submit a new paper
  submitPaper: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "العنوان مطلوب"),
        abstract: z.string().min(1, "الملخص مطلوب"),
        content: z.string().optional(),
        categoryId: z.string().min(1, "التصنيف مطلوب"),
        keywords: z.array(z.string()).optional(),
        fileUrl: z.string().url("رابط الملف غير صحيح").optional(),
        doi: z.string().optional(),
        arxivId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create the paper
        const paper = await ctx.db.paper.create({
          data: {
            title: input.title,
            abstract: input.abstract,
            content: input.content,
            categoryId: input.categoryId,
            keywords: input.keywords || [],
            fileUrl: input.fileUrl,
            doi: input.doi,
            arxivId: input.arxivId,
            status: "SUBMITTED",
            language: "ar",
          },
        });

        // Add the current user as the author
        await ctx.db.paperAuthor.create({
          data: {
            paperId: paper.id,
            userId: ctx.session.user.id,
            order: 1,
          },
        });

        // Create notification for new paper submission
        await ctx.db.notification.create({
          data: {
            userId: ctx.session.user.id,
            type: "NEW_PAPER",
            entityId: paper.id,
            message: `تم رفع ورقة بحثية جديدة: ${paper.title}`,
          },
        });

        return paper;
      } catch (error) {
        console.error("Error submitting paper:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "حدث خطأ أثناء رفع الورقة البحثية",
        });
      }
    }),

  // Get user's submitted papers
  getMyPapers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
        status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "REJECTED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where = {
        authors: {
          some: {
            userId: ctx.session.user.id,
          },
        },
        ...(input.status && { status: input.status }),
      };

      const [papers, totalCount] = await Promise.all([
        ctx.db.paper.findMany({
          where,
          include: {
            category: true,
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
            _count: {
              select: {
                likes: true,
                comments: true,
                reviews: true,
                bookmarks: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: input.limit,
        }),
        ctx.db.paper.count({ where }),
      ]);

      return {
        papers: papers.map((paper) => ({
          id: paper.id,
          title: paper.title,
          abstract: paper.abstract,
          status: paper.status,
          categoryName: paper.category.nameAr,
          authorName: paper.authors[0]?.user.name || "غير محدد",
          createdAt: paper.createdAt,
          updatedAt: paper.updatedAt,
          publishedAt: paper.publishedAt,
          views: paper.views,
          downloads: paper.downloads,
          fileUrl: paper.fileUrl,
          _count: paper._count,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / input.limit),
        currentPage: input.page,
      };
    }),

  // Update paper status (for editors/admins)
  updatePaperStatus: protectedProcedure
    .input(
      z.object({
        paperId: z.string(),
        status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "PUBLISHED", "REJECTED"]),
        reviewComment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update status
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || !["EDITOR", "ADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتحديث حالة الورقة",
        });
      }

      try {
        const paper = await ctx.db.paper.update({
          where: { id: input.paperId },
          data: {
            status: input.status,
            ...(input.status === "PUBLISHED" && { publishedAt: new Date() }),
          },
          include: {
            authors: {
              include: {
                user: true,
              },
            },
          },
        });

        // Create notifications for all authors
        const notifications = paper.authors.map((author) => ({
          userId: author.userId,
          type: "REVIEW" as const,
          entityId: paper.id,
          message: `تم تحديث حالة ورقتك البحثية "${paper.title}" إلى: ${getStatusText(input.status)}`,
        }));

        await ctx.db.notification.createMany({
          data: notifications,
        });

        return paper;
      } catch (error) {
        console.error("Error updating paper status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "حدث خطأ أثناء تحديث حالة الورقة",
        });
      }
    }),

  // Submit a review for a paper
  submitReview: protectedProcedure
    .input(
      z.object({
        paperId: z.string(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1, "عنوان المراجعة مطلوب"),
        content: z.string().min(1, "محتوى المراجعة مطلوب"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has reviewer role
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || !["REVIEWER", "EDITOR", "ADMIN"].includes(user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لمراجعة الأوراق البحثية",
        });
      }

      // Check if user already reviewed this paper
      const existingReview = await ctx.db.review.findUnique({
        where: {
          paperId_reviewerId: {
            paperId: input.paperId,
            reviewerId: ctx.session.user.id,
          },
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "لقد قمت بمراجعة هذه الورقة مسبقاً",
        });
      }

      try {
        const review = await ctx.db.review.create({
          data: {
            paperId: input.paperId,
            reviewerId: ctx.session.user.id,
            rating: input.rating,
            title: input.title,
            content: input.content,
            status: "APPROVED",
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                institution: true,
              },
            },
          },
        });

        // Get paper authors to notify them
        const paper = await ctx.db.paper.findUnique({
          where: { id: input.paperId },
          include: {
            authors: true,
          },
        });

        if (paper) {
          // Create notifications for all authors
          const notifications = paper.authors.map((author) => ({
            userId: author.userId,
            type: "REVIEW" as const,
            entityId: review.id,
            message: `تم إضافة مراجعة جديدة لورقتك البحثية "${paper.title}"`,
          }));

          await ctx.db.notification.createMany({
            data: notifications,
          });
        }

        return review;
      } catch (error) {
        console.error("Error submitting review:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "حدث خطأ أثناء إرسال المراجعة",
        });
      }
    }),

  // Get reviews for a paper
  getReviewsByPaper: publicProcedure
    .input(
      z.object({
        paperId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const [reviews, totalCount] = await Promise.all([
        ctx.db.review.findMany({
          where: {
            paperId: input.paperId,
            status: "APPROVED",
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                institution: true,
                verified: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: input.limit,
        }),
        ctx.db.review.count({
          where: {
            paperId: input.paperId,
            status: "APPROVED",
          },
        }),
      ]);

      return {
        reviews,
        totalCount,
        totalPages: Math.ceil(totalCount / input.limit),
        currentPage: input.page,
      };
    }),

  // Get paper statistics for dashboard
  getPaperStats: protectedProcedure
    .input(z.object({ paperId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is the author of this paper
      const paperAuthor = await ctx.db.paperAuthor.findFirst({
        where: {
          paperId: input.paperId,
          userId: ctx.session.user.id,
        },
      });

      if (!paperAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لعرض إحصائيات هذه الورقة",
        });
      }

      const stats = await ctx.db.paper.findUnique({
        where: { id: input.paperId },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
              reviews: true,
              bookmarks: true,
              citations: true,
            },
          },
        },
      });

      if (!stats) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "الورقة البحثية غير موجودة",
        });
      }

      // Get average rating from reviews
      const avgRating = await ctx.db.review.aggregate({
        where: {
          paperId: input.paperId,
          status: "APPROVED",
        },
        _avg: {
          rating: true,
        },
      });

      return {
        views: stats.views,
        downloads: stats.downloads,
        likes: stats._count.likes,
        comments: stats._count.comments,
        reviews: stats._count.reviews,
        bookmarks: stats._count.bookmarks,
        citations: stats._count.citations,
        averageRating: avgRating._avg.rating || 0,
      };
    }),
});

// Helper function to get status text in Arabic
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "مسودة",
    SUBMITTED: "مرسلة",
    UNDER_REVIEW: "قيد المراجعة",
    PUBLISHED: "منشورة",
    REJECTED: "مرفوضة",
  };
  return statusMap[status] || status;
}

