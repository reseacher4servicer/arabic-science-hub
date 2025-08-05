"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AchievementBadge } from "~/components/features/achievement-badge";
import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { 
  Award, 
  Target, 
  Star,
  Trophy,
  Loader2,
  Filter
} from "lucide-react";
import { useState } from "react";

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: allAchievements, isLoading: achievementsLoading } = api.points.getAllAchievements.useQuery();
  const { data: userAchievements, isLoading: userAchievementsLoading } = api.points.getUserAchievements.useQuery();
  const { data: userPoints } = api.points.getUserPoints.useQuery();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  if (achievementsLoading || userAchievementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الإنجازات...</span>
      </div>
    );
  }

  const currentPoints = userPoints?.totalPoints || 0;
  const unlockedAchievements = userAchievements || [];
  const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);
  
  // تصنيف الإنجازات
  const categories = ["all", ...new Set(allAchievements?.map(a => a.category) || [])];
  const filteredAchievements = selectedCategory === "all" 
    ? allAchievements 
    : allAchievements?.filter(a => a.category === selectedCategory);

  // إحصائيات الإنجازات
  const totalAchievements = allAchievements?.length || 0;
  const unlockedCount = unlockedAchievements.length;
  const progressPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  // الإنجاز التالي
  const nextAchievement = allAchievements
    ?.filter(a => !unlockedIds.includes(a.id) && a.threshold > currentPoints)
    ?.sort((a, b) => a.threshold - b.threshold)?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* العنوان الرئيسي */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الإنجازات والشارات
        </h1>
        <p className="text-gray-600">
          اكتشف إنجازاتك واعمل على فتح شارات جديدة
        </p>
      </div>

      {/* إحصائيات الإنجازات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{unlockedCount}</div>
            <div className="text-sm text-blue-700">إنجاز محقق</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{totalAchievements - unlockedCount}</div>
            <div className="text-sm text-green-700">متبقي</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-purple-700">مكتمل</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{currentPoints}</div>
            <div className="text-sm text-yellow-700">نقطة</div>
          </CardContent>
        </Card>
      </div>

      {/* شريط التقدم العام */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            التقدم العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {unlockedCount} من {totalAchievements} إنجاز
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* الإنجاز التالي */}
      {nextAchievement && (
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Star className="h-5 w-5" />
              الإنجاز التالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{nextAchievement.icon || "🎯"}</div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800">{nextAchievement.title}</h3>
                <p className="text-sm text-amber-700 mb-2">{nextAchievement.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>تحتاج {nextAchievement.threshold - currentPoints} نقطة إضافية</span>
                  <Badge className="bg-amber-100 text-amber-800">
                    {nextAchievement.category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* فلتر الفئات */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            تصفية حسب الفئة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category === "all" ? "جميع الفئات" : category}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* شبكة الإنجازات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements?.map(achievement => {
          const userAchievement = unlockedAchievements.find(
            ua => ua.achievementId === achievement.id
          );
          
          return (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              userAchievement={userAchievement}
              currentPoints={currentPoints}
              size="md"
            />
          );
        })}
      </div>

      {/* رسالة تحفيزية */}
      {unlockedCount === 0 && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-blue-800 font-semibold mb-2">
              ابدأ رحلتك العلمية! 🚀
            </div>
            <div className="text-sm text-blue-700">
              انشر أول ورقة علمية أو راجع ورقة لتحصل على أول إنجاز لك
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

