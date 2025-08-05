"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { PointsSummary } from "~/components/features/points-summary";
import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Trophy, 
  TrendingUp, 
  Calendar,
  Activity,
  Loader2
} from "lucide-react";

export default function PointsPage() {
  const { data: session, status } = useSession();
  const { data: topUsers, isLoading: topUsersLoading } = api.points.getTopUsers.useQuery({ limit: 10 });

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* العنوان الرئيسي */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          لوحة النقاط والتحفيز
        </h1>
        <p className="text-gray-600">
          تابع تقدمك العلمي واكسب النقاط من خلال نشاطاتك في المنصة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* العمود الرئيسي - ملخص النقاط */}
        <div className="lg:col-span-2">
          <PointsSummary />
        </div>

        {/* العمود الجانبي - أفضل الباحثين */}
        <div className="space-y-6">
          {/* لوحة الشرف */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
                لوحة الشرف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topUsersLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3">
                  {topUsers?.slice(0, 5).map((userPoints) => (
                    <div key={userPoints.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          userPoints.rank === 1 ? "bg-yellow-500 text-white" :
                          userPoints.rank === 2 ? "bg-gray-400 text-white" :
                          userPoints.rank === 3 ? "bg-amber-600 text-white" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {userPoints.rank}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {userPoints.user.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            @{userPoints.user.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          {userPoints.totalPoints}
                        </div>
                        <div className="text-xs text-gray-500">نقطة</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* نصائح لكسب النقاط */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                <TrendingUp className="h-5 w-5" />
                كيف تكسب النقاط؟
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>نشر ورقة علمية</span>
                  <Badge className="bg-green-100 text-green-800">+50</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>مراجعة ورقة</span>
                  <Badge className="bg-blue-100 text-blue-800">+30</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>تلقي مراجعة إيجابية</span>
                  <Badge className="bg-purple-100 text-purple-800">+20</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>إضافة تعليق</span>
                  <Badge className="bg-orange-100 text-orange-800">+5</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>حفظ ورقة</span>
                  <Badge className="bg-gray-100 text-gray-800">+2</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>تلقي إعجاب</span>
                  <Badge className="bg-red-100 text-red-800">+1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-green-600" />
                إحصائيات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">إجمالي المستخدمين</span>
                  <span className="font-bold">{topUsers?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">أعلى نقاط</span>
                  <span className="font-bold text-yellow-600">
                    {topUsers?.[0]?.totalPoints || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">آخر تحديث</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    الآن
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

