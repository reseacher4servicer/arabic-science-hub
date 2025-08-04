"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SearchAdvanced } from "~/components/features/search-advanced";
import { PaperList } from "~/components/features/paper-list";
import { Pagination } from "~/components/ui/pagination";
import { api } from "~/lib/api";
import { Loader2, Search } from "lucide-react";

interface SearchParams {
  query?: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  page?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<SearchParams>({});

  // استخراج المعاملات من URL
  useEffect(() => {
    const filters: SearchParams = {};
    searchParams.forEach((value, key) => {
      filters[key as keyof SearchParams] = value;
    });
    
    setSearchFilters(filters);
    setCurrentPage(parseInt(filters.page || "1"));
  }, [searchParams]);

  // تحويل المعاملات لـ API
  const apiParams = {
    query: searchFilters.query,
    category: searchFilters.category,
    author: searchFilters.author,
    dateFrom: searchFilters.dateFrom ? new Date(searchFilters.dateFrom) : undefined,
    dateTo: searchFilters.dateTo ? new Date(searchFilters.dateTo) : undefined,
    sortBy: (searchFilters.sortBy as "relevance" | "date" | "likes" | "reviews") || "relevance",
    page: currentPage,
    limit: 10,
  };

  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = api.discovery.searchPapers.useQuery(apiParams, {
    enabled: Object.keys(searchFilters).length > 0,
  });

  const handleSearch = (params: SearchParams) => {
    setSearchFilters(params);
    setCurrentPage(1);
    
    // تحديث URL
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        urlParams.set(key, value);
      }
    });
    
    window.history.pushState({}, "", `?${urlParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // تحديث URL مع رقم الصفحة
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", page.toString());
    window.history.pushState({}, "", `?${urlParams.toString()}`);
  };

  const hasSearchQuery = Object.keys(searchFilters).some(key => 
    key !== "page" && searchFilters[key as keyof SearchParams]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* العنوان */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          البحث في الأوراق العلمية
        </h1>
        <p className="text-gray-600">
          ابحث في مجموعة شاملة من الأوراق العلمية العربية
        </p>
      </div>

      {/* شريط البحث المتقدم */}
      <div className="mb-8">
        <SearchAdvanced 
          initialQuery={searchFilters.query || ""}
          onSearch={handleSearch}
        />
      </div>

      {/* النتائج */}
      <div className="space-y-6">
        {/* حالة التحميل */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-2 text-gray-600">جاري البحث...</span>
          </div>
        )}

        {/* حالة الخطأ */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">حدث خطأ أثناء البحث</div>
            <div className="text-gray-600 text-sm">{error.message}</div>
          </div>
        )}

        {/* عدم وجود استعلام بحث */}
        {!hasSearchQuery && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ابدأ البحث
            </h3>
            <p className="text-gray-600">
              استخدم شريط البحث أعلاه للعثور على الأوراق العلمية
            </p>
          </div>
        )}

        {/* النتائج */}
        {searchResults && searchResults.papers.length > 0 && (
          <>
            {/* عدد النتائج */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="text-gray-600">
                تم العثور على {searchResults.pagination.total} نتيجة
                {searchFilters.query && (
                  <span className="font-semibold"> لـ "{searchFilters.query}"</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                الصفحة {searchResults.pagination.page} من {searchResults.pagination.totalPages}
              </div>
            </div>

            {/* قائمة الأوراق */}
            <PaperList papers={searchResults.papers} />

            {/* الترقيم */}
            {searchResults.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={searchResults.pagination.page}
                  totalPages={searchResults.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* لا توجد نتائج */}
        {searchResults && searchResults.papers.length === 0 && hasSearchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-4">
              لم نتمكن من العثور على أوراق تطابق معايير البحث
            </p>
            <div className="text-sm text-gray-500">
              جرب:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>استخدام كلمات مفتاحية مختلفة</li>
                <li>تقليل عدد الفلاتر المطبقة</li>
                <li>التحقق من الإملاء</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

