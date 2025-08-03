"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import Link from "next/link";
import LikeButton from "@/components/features/like-button";
import BookmarkButton from "@/components/features/bookmark-button";
import CommentList from "@/components/features/comment-list";
import ReviewForm from "@/components/features/review-form";
import ReviewList from "@/components/features/review-list";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  content: string;
  authorName: string;
  categoryName: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  tags?: string[];
}

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "reviews" | "comments">("content");

  useEffect(() => {
    const fetchPaper = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const result = await api.papers.getById.query({ id: params.id as string });
        setPaper(result);
      } catch (error) {
        console.error("Error fetching paper:", error);
        setError("حدث خطأ في تحميل الورقة البحثية");
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [params.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: paper?.title,
        text: paper?.abstract,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ الرابط إلى الحافظة");
    }
  };

  const canReview = session?.user && ["REVIEWER", "EDITOR", "ADMIN"].includes((session.user as any).role);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "الورقة البحثية غير موجودة"}
            </h1>
            <Link 
              href="/papers"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              العودة إلى الأوراق البحثية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <nav className="mb-6">
          <Link 
            href="/papers"
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            ← العودة إلى الأوراق البحثية
          </Link>
        </nav>

        {/* Paper Content */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                {paper.categoryName}
              </span>
              <span className="text-gray-500 text-sm">
                {paper.viewCount} مشاهدة
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {paper.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
              <span className="ml-6">بواسطة: <strong>{paper.authorName}</strong></span>
              <span className="ml-6">تاريخ النشر: {new Date(paper.createdAt).toLocaleDateString('ar-SA')}</span>
              {paper.updatedAt !== paper.createdAt && (
                <span>آخر تحديث: {new Date(paper.updatedAt).toLocaleDateString('ar-SA')}</span>
              )}
            </div>

            {/* Abstract */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">الملخص</h2>
              <p className="text-gray-700 leading-relaxed">
                {paper.abstract}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-4">
              <LikeButton paperId={paper.id} />
              <BookmarkButton paperId={paper.id} />
              <button 
                onClick={handleShare}
                className="flex items-center space-x-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
              >
                <span>📤</span>
                <span>مشاركة</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "content"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                المحتوى
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                المراجعات
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "comments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                التعليقات
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "content" && (
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: paper.content }}
                />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Review Form for Reviewers */}
                {canReview && (
                  <ReviewForm 
                    paperId={paper.id} 
                    onSuccess={() => {
                      // Refresh reviews list
                      window.location.reload();
                    }}
                  />
                )}

                {/* Reviews List */}
                <ReviewList paperId={paper.id} />
              </div>
            )}

            {activeTab === "comments" && (
              <CommentList paperId={paper.id} />
            )}
          </div>
        </article>

        {/* Related Papers Section (Placeholder) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">أوراق ذات صلة</h2>
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            سيتم إضافة الأوراق ذات الصلة قريباً
          </div>
        </div>
      </div>
    </div>
  );
}

