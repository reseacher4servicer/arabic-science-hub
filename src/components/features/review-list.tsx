"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import LikeButton from "./like-button";

interface ReviewListProps {
  paperId: string;
}

export default function ReviewList({ paperId }: ReviewListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const { data: reviewsData, isLoading } = api.submissions.getReviewsByPaper.useQuery({
    paperId,
    limit,
    page: currentPage,
  });

  const StarDisplay = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
        <span className="mr-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">لا توجد مراجعات بعد</div>
        <p className="text-gray-400">كن أول من يراجع هذه الورقة البحثية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          المراجعات ({reviewsData.totalCount})
        </h3>
        
        {/* Average Rating */}
        {reviewsData.reviews.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">التقييم العام:</span>
            <StarDisplay 
              rating={Math.round(
                reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0) / 
                reviewsData.reviews.length
              )}
            />
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsData.reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-4">
              {/* Reviewer Avatar */}
              <img
                src={review.reviewer.avatar || "/default-avatar.png"}
                alt={review.reviewer.name}
                className="w-12 h-12 rounded-full"
              />
              
              <div className="flex-1">
                {/* Reviewer Info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {review.reviewer.name}
                    </span>
                    {review.reviewer.verified && (
                      <span className="text-blue-500 text-sm">✓</span>
                    )}
                    <span className="text-sm text-gray-500">
                      @{review.reviewer.username}
                    </span>
                    {review.reviewer.institution && (
                      <span className="text-sm text-gray-500">
                        • {review.reviewer.institution}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <StarDisplay rating={review.rating} />
                </div>

                {/* Review Title */}
                <h4 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h4>

                {/* Review Content */}
                <p className="text-gray-700 leading-relaxed mb-4">
                  {review.content}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <LikeButton
                    reviewId={review.id}
                    initialCount={review._count.likes}
                    size="sm"
                  />
                  <span className="text-sm text-gray-500">
                    {review._count.comments} تعليق
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {reviewsData.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            السابق
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: reviewsData.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, reviewsData.totalPages))}
            disabled={currentPage === reviewsData.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

