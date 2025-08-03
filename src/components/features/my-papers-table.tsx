"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface MyPapersTableProps {
  userId?: string;
}

export default function MyPapersTable({ userId }: MyPapersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const limit = 10;

  const { data: papersData, isLoading, refetch } = api.submissions.getMyPapers.useQuery({
    limit,
    page: currentPage,
    status: statusFilter as any || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      SUBMITTED: { label: "مرسلة", color: "bg-blue-100 text-blue-800" },
      UNDER_REVIEW: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800" },
      PUBLISHED: { label: "منشورة", color: "bg-green-100 text-green-800" },
      REJECTED: { label: "مرفوضة", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200">
              <div className="h-16 bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            فلترة حسب الحالة:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="DRAFT">مسودة</option>
            <option value="SUBMITTED">مرسلة</option>
            <option value="UNDER_REVIEW">قيد المراجعة</option>
            <option value="PUBLISHED">منشورة</option>
            <option value="REJECTED">مرفوضة</option>
          </select>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
        >
          تحديث
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {papersData && papersData.papers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التصنيف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {papersData.papers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {paper.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {paper.abstract}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {paper.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(paper.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>إنشاء: {formatDate(paper.createdAt)}</div>
                          {paper.publishedAt && (
                            <div>نشر: {formatDate(paper.publishedAt)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>👁️ {paper.views} مشاهدة</div>
                          <div>❤️ {paper._count.likes} إعجاب</div>
                          <div>💬 {paper._count.comments} تعليق</div>
                          <div>⭐ {paper._count.reviews} مراجعة</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <Link
                            href={`/papers/${paper.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            عرض
                          </Link>
                          {paper.fileUrl && (
                            <a
                              href={paper.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                            >
                              تحميل PDF
                            </a>
                          )}
                          {paper.status === "DRAFT" && (
                            <button className="text-yellow-600 hover:text-yellow-900">
                              تحرير
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {papersData.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, papersData.totalPages))}
                      disabled={currentPage === papersData.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        عرض{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * limit + 1}
                        </span>{" "}
                        إلى{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, papersData.totalCount)}
                        </span>{" "}
                        من{" "}
                        <span className="font-medium">{papersData.totalCount}</span>{" "}
                        ورقة
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          السابق
                        </button>
                        {Array.from({ length: papersData.totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, papersData.totalPages))}
                          disabled={currentPage === papersData.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          التالي
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">لا توجد أوراق بحثية</div>
            <p className="text-gray-400 mb-6">
              لم تقم برفع أي أوراق بحثية بعد
            </p>
            <Link
              href="/papers/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              رفع ورقة بحثية جديدة
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

