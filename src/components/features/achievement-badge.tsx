"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Lock, CheckCircle, Target } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon?: string;
  category: string;
}

interface UserAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  currentPoints: number;
  size?: "sm" | "md" | "lg";
}

export function AchievementBadge({ 
  achievement, 
  userAchievement, 
  currentPoints,
  size = "md" 
}: AchievementBadgeProps) {
  const isUnlocked = !!userAchievement;
  const progress = Math.min((currentPoints / achievement.threshold) * 100, 100);
  const remainingPoints = Math.max(achievement.threshold - currentPoints, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "نشر": return "bg-blue-100 text-blue-800 border-blue-200";
      case "مراجعة": return "bg-green-100 text-green-800 border-green-200";
      case "تفاعل": return "bg-purple-100 text-purple-800 border-purple-200";
      case "عام": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const iconSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isUnlocked 
        ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200" 
        : "bg-gray-50 border-gray-200"
    }`}>
      <CardContent className={sizeClasses[size]}>
        {/* أيقونة الحالة */}
        <div className="absolute top-2 left-2">
          {isUnlocked ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* فئة الإنجاز */}
        <div className="mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${getCategoryColor(achievement.category)}`}
          >
            {achievement.category}
          </Badge>
        </div>

        {/* أيقونة الإنجاز */}
        <div className="text-center mb-3">
          <div className={`${iconSizes[size]} ${isUnlocked ? "" : "grayscale opacity-50"}`}>
            {achievement.icon || "🏆"}
          </div>
        </div>

        {/* عنوان ووصف الإنجاز */}
        <div className="text-center mb-3">
          <h3 className={`font-bold ${isUnlocked ? "text-yellow-800" : "text-gray-700"} ${
            size === "lg" ? "text-lg" : "text-base"
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${isUnlocked ? "text-yellow-700" : "text-gray-600"} mt-1`}>
            {achievement.description}
          </p>
        </div>

        {/* معلومات النقاط */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-1 text-sm">
            <Target className="h-4 w-4" />
            <span className="font-medium">{achievement.threshold} نقطة</span>
          </div>
        </div>

        {/* شريط التقدم (للإنجازات غير المحققة) */}
        {!isUnlocked && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-center text-xs text-gray-600">
              {remainingPoints > 0 ? (
                <span>تحتاج {remainingPoints} نقطة إضافية</span>
              ) : (
                <span className="text-green-600 font-medium">جاهز للفتح!</span>
              )}
            </div>
          </div>
        )}

        {/* تاريخ الفتح (للإنجازات المحققة) */}
        {isUnlocked && userAchievement && (
          <div className="text-center text-xs text-yellow-700 mt-2">
            تم الفتح في {new Date(userAchievement.unlockedAt).toLocaleDateString("ar-SA", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

