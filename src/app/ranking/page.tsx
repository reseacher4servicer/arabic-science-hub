"use client";

import { useState } from "react";
import { ResearcherCard } from "~/components/features/researcher-card";
import { Pagination } from "~/components/ui/pagination";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/lib/api";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Award,
  Loader2,
  Crown,
  Medal,
  Star
} from "lucide-react";

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"totalScore" | "papersCount" | "reviewsCount" | "avgReviewRating">("totalScore");
  const limit = 12;

  const { 
    data: rankingData, 
    isLoading, 
    error 
  } = api.discovery.getResearcherRanking.useQuery({
    page: currentPage,
    limit,
    sortBy,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as typeof sortBy);
    setCurrentPage(1);
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "totalScore": return "النقاط الإجمالية";
      case "papersCount": return "عدد الأوراق";
      case "reviewsCount": return "عدد المراجعات";
      case "avgReviewRating": return "متوسط التقييم";
      default: return "النقاط الإجمالية";
    }
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case "totalScore": return <Trophy className="h-4 w-4" />;
      case "papersCount": return <Award className="h-4 w-4" />;
      case "reviewsCount": return <Star className="h-4 w-4" />;
      case "avgReviewRating": return <Medal className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* العنوان والوصف */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            تصنيف الباحثين
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          تصنيف الباحثين العرب حسب مساهماتهم العلمية وتفاعلهم مع المجتمع الأكاديمي
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-800">
                {rankingData?.pagination.total || 0}
              </div>
              <div className="text-sm text-yellow-700">باحث مسجل</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-800">نشط</div>
              <div className="text-sm text-blue-700">نظام التصنيف</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-800">مجتمع</div>
              <div className="text-sm text-green-700">علمي متفاعل</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-800">جودة</div>
              <div className="text-sm text-purple-700">عالية المستوى</div>
            </div>
          </div>
        </div>
      </div>

      {/* أدوات التحكم */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">ترتيب حسب:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                {getSortIcon(sortBy)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalScore">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  النقاط الإجمالية
                </div>
              </SelectItem>
              <SelectItem value="papersCount">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  عدد الأوراق
                </div>
              </SelectItem>
              <SelectItem value="reviewsCount">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  عدد المراجعات
                </div>
              </SelectItem>
              <SelectItem value="avgReviewRating">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  متوسط التقييم
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rankingData && (
          <div className="text-sm text-gray-600">
            عرض {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, rankingData.pagination.total)} 
            من {rankingData.pagination.total} باحث
          </div>
        )}
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600">جاري تحميل التصنيف...</span>
        </div>
      )}

      {/* حالة الخطأ */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">حدث خطأ أثناء تحميل التصنيف</div>
          <div className="text-gray-600 text-sm">{error.message}</div>
        </div>
      )}

      {/* قائمة الباحثين */}
      {rankingData && rankingData.researchers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {rankingData.researchers.map((researcher) => (
              <ResearcherCard 
                key={researcher.user.id} 
                researcher={researcher}
                showRank={true}
              />
            ))}
          </div>

          {/* الترقيم */}
          {rankingData.pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={rankingData.pagination.page}
                totalPages={rankingData.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* لا توجد بيانات */}
      {rankingData && rankingData.researchers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا توجد بيانات تصنيف
          </h3>
          <p className="text-gray-600">
            لم يتم العثور على باحثين في النظام حالياً
          </p>
        </div>
      )}

      {/* معلومات حول نظام التصنيف */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          كيف يعمل نظام التصنيف؟
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">معايير التصنيف:</h4>
            <ul className="space-y-1">
              <li>• عدد الأوراق المنشورة (10 نقاط لكل ورقة)</li>
              <li>• عدد المراجعات المقدمة (5 نقاط لكل مراجعة)</li>
              <li>• الإعجابات المستلمة (2 نقطة لكل إعجاب)</li>
              <li>• متوسط تقييم الأوراق (20 نقطة × المتوسط)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">ملاحظات مهمة:</h4>
            <ul className="space-y-1">
              <li>• يتم تحديث التصنيف بشكل دوري</li>
              <li>• تحتسب الأوراق المنشورة فقط</li>
              <li>• المراجعات المعتمدة تحصل على نقاط إضافية</li>
              <li>• التفاعل المجتمعي يؤثر على النقاط</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

