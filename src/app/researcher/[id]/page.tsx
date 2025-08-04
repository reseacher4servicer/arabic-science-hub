"use client";

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PaperCard } from "~/components/features/paper-card";
import { api } from "~/lib/api";
import {
  User,
  Building,
  MapPin,
  Calendar,
  FileText,
  Star,
  ThumbsUp,
  Eye,
  Users,
  CheckCircle,
  Trophy,
  MessageSquare,
  Award,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ResearcherProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { 
    data: researcher, 
    isLoading, 
    error 
  } = api.discovery.getResearcherProfile.useQuery(
    { userId },
    { enabled: !!userId }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600">جاري تحميل ملف الباحث...</span>
        </div>
      </div>
    );
  }

  if (error || !researcher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            الباحث غير موجود
          </h3>
          <p className="text-gray-600">
            {error?.message || "لم يتم العثور على الباحث المطلوب"}
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* معلومات الباحث الأساسية */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* الصورة الشخصية */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 mx-auto md:mx-0">
                <AvatarImage src={researcher.avatar || ""} alt={researcher.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {researcher.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* المعلومات الأساسية */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {researcher.name}
                </h1>
                {researcher.verified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </div>

              <p className="text-gray-600 mb-2">@{researcher.username}</p>

              {researcher.position && (
                <p className="text-lg text-gray-800 font-medium mb-2">
                  {researcher.position}
                </p>
              )}

              {(researcher.institution || researcher.department) && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-4">
                  <Building className="h-4 w-4" />
                  <span>
                    {researcher.department && researcher.institution 
                      ? `${researcher.department} - ${researcher.institution}`
                      : researcher.department || researcher.institution
                    }
                  </span>
                </div>
              )}

              {researcher.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {researcher.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="h-4 w-4" />
                <span>انضم في {formatDate(researcher.createdAt)}</span>
              </div>

              {/* الأدوار */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary">
                  {researcher.role === "RESEARCHER" && "باحث"}
                  {researcher.role === "REVIEWER" && "مراجع"}
                  {researcher.role === "EDITOR" && "محرر"}
                  {researcher.role === "ADMIN" && "مدير"}
                </Badge>
                {researcher.verified && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    موثق
                  </Badge>
                )}
              </div>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {researcher.stats.followersCount}
                  </div>
                  <div className="text-sm text-gray-600">متابع</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {researcher.stats.followingCount}
                  </div>
                  <div className="text-sm text-gray-600">يتابع</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات التفصيلية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {researcher.researcherProfile?.papersCount || 0}
            </div>
            <div className="text-sm text-gray-600">ورقة منشورة</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {researcher.researcherProfile?.reviewsCount || 0}
            </div>
            <div className="text-sm text-gray-600">مراجعة</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ThumbsUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {researcher.stats.totalLikes}
            </div>
            <div className="text-sm text-gray-600">إعجاب</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {researcher.stats.totalViews}
            </div>
            <div className="text-sm text-gray-600">مشاهدة</div>
          </CardContent>
        </Card>
      </div>

      {/* نقاط التصنيف */}
      {researcher.researcherProfile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              نقاط التصنيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {researcher.researcherProfile.totalScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">النقاط الإجمالية</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {researcher.researcherProfile.avgReviewRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">متوسط التقييم</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {researcher.researcherProfile.likesReceived}
                </div>
                <div className="text-sm text-gray-600">إعجابات مستلمة</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {researcher._count?.papers || 0}
                </div>
                <div className="text-sm text-gray-600">إجمالي الأوراق</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* التبويبات */}
      <Tabs defaultValue="papers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="papers">
            الأوراق العلمية ({researcher.papers.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            المراجعات ({researcher.reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* الأوراق العلمية */}
        <TabsContent value="papers" className="space-y-6">
          {researcher.papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researcher.papers.map((paperAuthor) => (
                <PaperCard 
                  key={paperAuthor.paper.id} 
                  paper={{
                    ...paperAuthor.paper,
                    stats: paperAuthor.paper._count,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد أوراق منشورة
              </h3>
              <p className="text-gray-600">
                لم ينشر هذا الباحث أي أوراق علمية بعد
              </p>
            </div>
          )}
        </TabsContent>

        {/* المراجعات */}
        <TabsContent value="reviews" className="space-y-6">
          {researcher.reviews.length > 0 ? (
            <div className="space-y-4">
              {researcher.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {review.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          مراجعة لورقة: 
                          <span className="font-medium text-blue-600 mr-1">
                            {review.paper.title}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {review.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(review.createdAt)}</span>
                      <Badge 
                        variant={review.status === "APPROVED" ? "default" : "secondary"}
                      >
                        {review.status === "APPROVED" && "معتمدة"}
                        {review.status === "PENDING" && "قيد المراجعة"}
                        {review.status === "REJECTED" && "مرفوضة"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد مراجعات
              </h3>
              <p className="text-gray-600">
                لم يقدم هذا الباحث أي مراجعات بعد
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

