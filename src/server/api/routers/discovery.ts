import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const searchInputSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(["relevance", "date", "likes", "reviews"]).default("relevance"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

const rankingInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(["totalScore", "papersCount", "reviewsCount", "avgReviewRating"]).default("totalScore"),
});

export const discoveryRouter = createTRPCRouter({
  // البحث المتقدم في الأوراق
  searchPapers: publicProcedure
    .input(searchInputSchema)
    .query(async ({ ctx, input }) => {
      const { query, category, author, dateFrom, dateTo, sortBy, page, limit } = input;
      const skip = (page - 1) * limit;

      // بناء شروط البحث
      const where: any = {
        status: "PUBLISHED",
      };

      // البحث النصي في العنوان والملخص والكلمات المفتاحية
      if (query) {
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { abstract: { contains: query, mode: "insensitive" } },
          { keywords: { hasSome: [query] } },
        ];
      }

      // فلترة حسب التصنيف
      if (category) {
        where.categoryId = category;
      }

      // فلترة حسب المؤلف
      if (author) {
        where.authors = {
          some: {
            user: {
              OR: [
                { name: { contains: author, mode: "insensitive" } },
                { username: { contains: author, mode: "insensitive" } },
              ],
            },
          },
        };
      }

      // فلترة حسب التاريخ
      if (dateFrom || dateTo) {
        where.publishedAt = {};
        if (dateFrom) where.publishedAt.gte = dateFrom;
        if (dateTo) where.publishedAt.lte = dateTo;
      }

      // ترتيب النتائج
      let orderBy: any = {};
      switch (sortBy) {
        case "date":
          orderBy = { publishedAt: "desc" };
          break;
        case "likes":
          orderBy = { likes: { _count: "desc" } };
          break;
        case "reviews":
          orderBy = { reviews: { _count: "desc" } };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      try {
        const [papers, total] = await Promise.all([
          ctx.db.paper.findMany({
            where,
            orderBy,
            skip,
            take: limit,
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
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  reviews: true,
                  views: true,
                },
              },
            },
          }),
          ctx.db.paper.count({ where }),
        ]);

        return {
          papers: papers.map((paper) => ({
            ...paper,
            stats: paper._count,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في البحث عن الأوراق",
        });
      }
    }),

  // تصنيف الباحثين
  getResearcherRanking: publicProcedure
    .input(rankingInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, sortBy } = input;
      const skip = (page - 1) * limit;

      // ترتيب حسب المعيار المحدد
      let orderBy: any = {};
      switch (sortBy) {
        case "papersCount":
          orderBy = { papersCount: "desc" };
          break;
        case "reviewsCount":
          orderBy = { reviewsCount: "desc" };
          break;
        case "avgReviewRating":
          orderBy = { avgReviewRating: "desc" };
          break;
        default:
          orderBy = { totalScore: "desc" };
      }

      try {
        const [profiles, total] = await Promise.all([
          ctx.db.researcherProfile.findMany({
            orderBy,
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  institution: true,
                  department: true,
                  position: true,
                  verified: true,
                },
              },
            },
          }),
          ctx.db.researcherProfile.count(),
        ]);

        return {
          researchers: profiles.map((profile, index) => ({
            rank: skip + index + 1,
            ...profile,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب تصنيف الباحثين",
        });
      }
    }),

  // الحصول على ملف باحث محدد
  getResearcherProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
          include: {
            researcherProfile: true,
            papers: {
              where: {
                paper: { status: "PUBLISHED" },
              },
              include: {
                paper: {
                  include: {
                    category: true,
                    _count: {
                      select: {
                        likes: true,
                        comments: true,
                        reviews: true,
                        views: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                paper: { publishedAt: "desc" },
              },
            },
            reviews: {
              include: {
                paper: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "الباحث غير موجود",
          });
        }

        // حساب إحصائيات إضافية
        const totalLikes = await ctx.db.like.count({
          where: {
            paper: {
              authors: {
                some: { userId: input.userId },
              },
            },
          },
        });

        const totalViews = await ctx.db.paper.aggregate({
          where: {
            authors: {
              some: { userId: input.userId },
            },
            status: "PUBLISHED",
          },
          _sum: {
            views: true,
          },
        });

        return {
          ...user,
          stats: {
            totalLikes,
            totalViews: totalViews._sum.views || 0,
            followersCount: user._count.followers,
            followingCount: user._count.following,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب ملف الباحث",
        });
      }
    }),

  // تحديث نقاط الباحث (دالة مساعدة للنظام)
  updateResearcherScore: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // حساب الإحصائيات
        const [papersCount, reviewsCount, likesReceived, avgRating] = await Promise.all([
          ctx.db.paperAuthor.count({
            where: {
              userId: input.userId,
              paper: { status: "PUBLISHED" },
            },
          }),
          ctx.db.review.count({
            where: { reviewerId: input.userId },
          }),
          ctx.db.like.count({
            where: {
              paper: {
                authors: {
                  some: { userId: input.userId },
                },
              },
            },
          }),
          ctx.db.review.aggregate({
            where: {
              paper: {
                authors: {
                  some: { userId: input.userId },
                },
              },
            },
            _avg: {
              rating: true,
            },
          }),
        ]);

        // خوارزمية حساب النقاط
        const paperScore = papersCount * 10;
        const reviewScore = reviewsCount * 5;
        const likeScore = likesReceived * 2;
        const ratingScore = (avgRating._avg.rating || 0) * 20;
        const totalScore = paperScore + reviewScore + likeScore + ratingScore;

        // تحديث أو إنشاء ملف الباحث
        const profile = await ctx.db.researcherProfile.upsert({
          where: { userId: input.userId },
          update: {
            totalScore,
            papersCount,
            reviewsCount,
            avgReviewRating: avgRating._avg.rating || 0,
            likesReceived,
          },
          create: {
            userId: input.userId,
            totalScore,
            papersCount,
            reviewsCount,
            avgReviewRating: avgRating._avg.rating || 0,
            likesReceived,
          },
        });

        return profile;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تحديث نقاط الباحث",
        });
      }
    }),

  // البحث في الباحثين
  searchResearchers: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        institution: z.string().optional(),
        department: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, institution, department, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ];
      }

      if (institution) {
        where.institution = { contains: institution, mode: "insensitive" };
      }

      if (department) {
        where.department = { contains: department, mode: "insensitive" };
      }

      try {
        const [users, total] = await Promise.all([
          ctx.db.user.findMany({
            where,
            skip,
            take: limit,
            include: {
              researcherProfile: true,
              _count: {
                select: {
                  papers: true,
                  reviews: true,
                  followers: true,
                },
              },
            },
            orderBy: {
              researcherProfile: {
                totalScore: "desc",
              },
            },
          }),
          ctx.db.user.count({ where }),
        ]);

        return {
          researchers: users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في البحث عن الباحثين",
        });
      }
    }),
});

