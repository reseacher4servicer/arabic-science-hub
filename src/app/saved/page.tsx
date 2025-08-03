"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import Link from "next/link";
import PaperCard from "@/components/features/paper-card";
import Pagination from "@/components/ui/pagination";

export default function SavedPapersPage() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: bookmarksData, isLoading } = api.interactions.getUserBookmarks.useQuery(
    {
      limit,
      page: currentPage,
    },
    {
      enabled: !!session,
    }
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              يجب تسجيل الدخول لعرض المحفوظات
            </h1>
            <p className="text-gray-600 mb-6">
              قم بتسجيل الدخول لعرض الأوراق البحثية التي حفظتها
            </p>
            <Link 
              href="/auth/signin"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الأوراق المحفوظة
          </h1>
          <p className="text-gray-600">
            الأوراق البحثية التي حفظتها للقراءة لاحقاً
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarksData && bookmarksData.bookmarks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {bookmarksData.bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="relative">
                  <PaperCard
                    id={bookmark.id}
                    title={bookmark.title}
                    abstract={bookmark.abstract}
                    authorName={bookmark.authorName}
                    categoryName={bookmark.categoryName}
                    createdAt={bookmark.createdAt}
                    viewCount={bookmark.viewCount}
                  />
                  <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    محفوظة في {new Date(bookmark.bookmarkedAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {bookmarksData.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={bookmarksData.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">لا توجد أوراق محفوظة</div>
            <p className="text-gray-400 mb-6">
              لم تقم بحفظ أي أوراق بحثية بعد. ابدأ بتصفح الأوراق وحفظ ما يهمك
            </p>
            <Link 
              href="/papers"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              تصفح الأوراق البحثية
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

