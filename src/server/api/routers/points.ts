import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// نظام النقاط
const POINT_VALUES = {
  PUBLISH_PAPER: 50,
  REVIEW_PAPER: 30,
  RECEIVE_POSITIVE_REVIEW: 20,
  RECEIVE_LIKE: 1,
  MAKE_COMMENT: 5,
  BOOKMARK_PAPER: 2,
} as const;

// الإنجازات الافتراضية
const DEFAULT_ACHIEVEMENTS = [
  {
    title: "الباحث المبتدئ",
    description: "نشر أول ورقة علمية",
    threshold: 50,
    icon: "🌟",
    category: "نشر",
  },
  {
    title: "الناشر النشيط",
    description: "نشر 5 أوراق علمية",
    threshold: 250,
    icon: "📚",
    category: "نشر",
  },
  {
    title: "المراجع المتميز",
    description: "مراجعة 10 أوراق علمية",
    threshold: 300,
    icon: "🔍",
    category: "مراجعة",
  },
  {
    title: "النجم الصاعد",
    description: "الحصول على 100 إعجاب",
    threshold: 100,
    icon: "⭐",
    category: "تفاعل",
  },
  {
    title: "الخبير المعترف به",
    description: "الوصول إلى 500 نقطة",
    threshold: 500,
    icon: "🏆",
    category: "عام",
  },
  {
    title: "الأسطورة العلمية",
    description: "الوصول إلى 1000 نقطة",
    threshold: 1000,
    icon: "👑",
    category: "عام",
  },
];

export const pointsRouter = createTRPCRouter({
  // الحصول على نقاط المستخدم
  getUserPoints: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userPoints = await ctx.db.userPoints.findUnique({
          where: { userId: ctx.session.user.id },
        });

        if (!userPoints) {
          // إنشاء سجل نقاط جديد للمستخدم
          const newUserPoints = await ctx.db.userPoints.create({
            data: {
              userId: ctx.session.user.id,
              totalPoints: 0,
              history: [],
            },
          });
          return newUserPoints;
        }

        return userPoints;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب نقاط المستخدم",
        });
      }
    }),

  // إضافة نقاط للمستخدم
  addPoints: protectedProcedure
    .input(z.object({
      points: z.number().min(1),
      reason: z.string(),
      entityId: z.string().optional(),
      entityType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { points, reason, entityId, entityType } = input;
        const userId = ctx.session.user.id;

        // الحصول على نقاط المستخدم الحالية أو إنشاء سجل جديد
        const currentPoints = await ctx.db.userPoints.findUnique({
          where: { userId },
        });

        const newTotal = (currentPoints?.totalPoints || 0) + points;
        const currentHistory = (currentPoints?.history as any[]) || [];
        
        const newHistoryEntry = {
          points,
          reason,
          entityId,
          entityType,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [...currentHistory, newHistoryEntry];

        // تحديث أو إنشاء سجل النقاط
        const updatedPoints = await ctx.db.userPoints.upsert({
          where: { userId },
          update: {
            totalPoints: newTotal,
            history: updatedHistory,
          },
          create: {
            userId,
            totalPoints: newTotal,
            history: updatedHistory,
          },
        });

        // التحقق من الإنجازات الجديدة
        await checkAndUnlockAchievements(ctx, userId, newTotal);

        return updatedPoints;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إضافة النقاط",
        });
      }
    }),

  // الحصول على تاريخ النقاط
  getPointsHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const userPoints = await ctx.db.userPoints.findUnique({
          where: { userId: ctx.session.user.id },
        });

        if (!userPoints) {
          return [];
        }

        const history = (userPoints.history as any[]) || [];
        return history
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, input.limit);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب تاريخ النقاط",
        });
      }
    }),

  // الحصول على جميع الإنجازات
  getAllAchievements: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const achievements = await ctx.db.achievement.findMany({
          orderBy: { threshold: "asc" },
        });

        // إذا لم توجد إنجازات، إنشاء الإنجازات الافتراضية
        if (achievements.length === 0) {
          await ctx.db.achievement.createMany({
            data: DEFAULT_ACHIEVEMENTS,
          });
          return await ctx.db.achievement.findMany({
            orderBy: { threshold: "asc" },
          });
        }

        return achievements;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب الإنجازات",
        });
      }
    }),

  // الحصول على إنجازات المستخدم
  getUserAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userAchievements = await ctx.db.userAchievement.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: "desc" },
        });

        return userAchievements;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب إنجازات المستخدم",
        });
      }
    }),

  // الحصول على إحصائيات النقاط
  getPointsStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const [userPoints, allUsers, userAchievements] = await Promise.all([
          ctx.db.userPoints.findUnique({
            where: { userId: ctx.session.user.id },
          }),
          ctx.db.userPoints.findMany({
            select: { totalPoints: true },
            orderBy: { totalPoints: "desc" },
          }),
          ctx.db.userAchievement.count({
            where: { userId: ctx.session.user.id },
          }),
        ]);

        const totalPoints = userPoints?.totalPoints || 0;
        const userRank = allUsers.findIndex(u => u.totalPoints <= totalPoints) + 1;
        const totalUsers = allUsers.length;
        const averagePoints = allUsers.length > 0 
          ? allUsers.reduce((sum, u) => sum + u.totalPoints, 0) / allUsers.length 
          : 0;

        return {
          totalPoints,
          userRank,
          totalUsers,
          averagePoints: Math.round(averagePoints),
          achievementsCount: userAchievements,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب إحصائيات النقاط",
        });
      }
    }),

  // الحصول على أفضل المستخدمين حسب النقاط
  getTopUsers: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const topUsers = await ctx.db.userPoints.findMany({
          take: input.limit,
          orderBy: { totalPoints: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                verified: true,
              },
            },
          },
        });

        return topUsers.map((userPoints, index) => ({
          rank: index + 1,
          ...userPoints,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب أفضل المستخدمين",
        });
      }
    }),
});

// دالة مساعدة للتحقق من الإنجازات الجديدة
async function checkAndUnlockAchievements(ctx: any, userId: string, totalPoints: number) {
  try {
    // الحصول على جميع الإنجازات
    const allAchievements = await ctx.db.achievement.findMany();
    
    // الحصول على الإنجازات المحققة بالفعل
    const unlockedAchievements = await ctx.db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    
    const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);
    
    // العثور على الإنجازات الجديدة التي يمكن فتحها
    const newAchievements = allAchievements.filter(
      achievement => 
        !unlockedIds.includes(achievement.id) && 
        totalPoints >= achievement.threshold
    );
    
    // فتح الإنجازات الجديدة
    if (newAchievements.length > 0) {
      await ctx.db.userAchievement.createMany({
        data: newAchievements.map(achievement => ({
          userId,
          achievementId: achievement.id,
        })),
      });
    }
    
    return newAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

// دوال مساعدة لإضافة النقاط تلقائياً
export const addPointsForAction = async (
  ctx: any,
  userId: string,
  action: keyof typeof POINT_VALUES,
  entityId?: string,
  entityType?: string
) => {
  const points = POINT_VALUES[action];
  const reason = getReasonForAction(action);
  
  try {
    const currentPoints = await ctx.db.userPoints.findUnique({
      where: { userId },
    });

    const newTotal = (currentPoints?.totalPoints || 0) + points;
    const currentHistory = (currentPoints?.history as any[]) || [];
    
    const newHistoryEntry = {
      points,
      reason,
      entityId,
      entityType,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...currentHistory, newHistoryEntry];

    await ctx.db.userPoints.upsert({
      where: { userId },
      update: {
        totalPoints: newTotal,
        history: updatedHistory,
      },
      create: {
        userId,
        totalPoints: newTotal,
        history: updatedHistory,
      },
    });

    await checkAndUnlockAchievements(ctx, userId, newTotal);
  } catch (error) {
    console.error("Error adding points:", error);
  }
};

function getReasonForAction(action: keyof typeof POINT_VALUES): string {
  switch (action) {
    case "PUBLISH_PAPER":
      return "نشر ورقة علمية";
    case "REVIEW_PAPER":
      return "مراجعة ورقة علمية";
    case "RECEIVE_POSITIVE_REVIEW":
      return "تلقي مراجعة إيجابية";
    case "RECEIVE_LIKE":
      return "تلقي إعجاب";
    case "MAKE_COMMENT":
      return "إضافة تعليق";
    case "BOOKMARK_PAPER":
      return "حفظ ورقة";
    default:
      return "نشاط عام";
  }
}

