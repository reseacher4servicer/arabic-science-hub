"use client";

import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Award,
  Loader2,
  Star,
  Target
} from "lucide-react";

export function PointsSummary() {
  const { data: userPoints, isLoading: pointsLoading } = api.points.getUserPoints.useQuery();
  const { data: pointsStats, isLoading: statsLoading } = api.points.getPointsStats.useQuery();
  const { data: recentHistory } = api.points.getPointsHistory.useQuery({ limit: 5 });

  if (pointsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل النقاط...</span>
      </div>
    );
  }

  const getRankBadge = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 10) return { label: "متميز", color: "bg-yellow-500" };
    if (percentage <= 25) return { label: "ممتاز", color: "bg-blue-500" };
    if (percentage <= 50) return { label: "جيد جداً", color: "bg-green-500" };
    if (percentage <= 75) return { label: "جيد", color: "bg-orange-500" };
    return { label: "مبتدئ", color: "bg-gray-500" };
  };

  const rankInfo = pointsStats ? getRankBadge(pointsStats.userRank, pointsStats.totalUsers) : null;

  return (
    <div className="space-y-6">
      {/* النقاط الإجمالية */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Trophy className="h-6 w-6" />
            نقاطك الإجمالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {userPoints?.totalPoints || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">نقطة</div>
            </div>
            {rankInfo && (
              <Badge className={`${rankInfo.color} text-white px-3 py-1`}>
                {rankInfo.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      {pointsStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                #{pointsStats.userRank}
              </div>
              <div className="text-sm text-gray-600">ترتيبك</div>
              <div className="text-xs text-gray-500 mt-1">
                من أصل {pointsStats.totalUsers} باحث
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {pointsStats.averagePoints}
              </div>
              <div className="text-sm text-gray-600">المتوسط العام</div>
              <div className="text-xs text-gray-500 mt-1">
                {userPoints?.totalPoints && userPoints.totalPoints > pointsStats.averagePoints 
                  ? "أعلى من المتوسط" 
                  : "أقل من المتوسط"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {pointsStats.achievementsCount}
              </div>
              <div className="text-sm text-gray-600">إنجاز محقق</div>
              <div className="text-xs text-gray-500 mt-1">
                شارات مفتوحة
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* النشاطات الأخيرة */}
      {recentHistory && recentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              النشاطات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentHistory.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.reason}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold">+{activity.points}</span>
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* رسالة تحفيزية */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-green-800 font-semibold mb-2">
            استمر في التميز! 🌟
          </div>
          <div className="text-sm text-green-700">
            كل نشاط علمي يقربك من الإنجاز التالي. انشر، راجع، وتفاعل لتحصل على المزيد من النقاط!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

