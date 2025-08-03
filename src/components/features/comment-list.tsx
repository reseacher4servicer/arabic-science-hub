"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";

interface CommentListProps {
  paperId: string;
}

export default function CommentList({ paperId }: CommentListProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: comments, isLoading, refetch } = api.interactions.getCommentsByPaper.useQuery(
    { paperId },
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleCommentAdded = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-lg p-3">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          التعليقات ({comments?.length || 0})
        </h3>
        <CommentForm paperId={paperId} onCommentAdded={handleCommentAdded} />
      </div>

      {comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              paperId={paperId}
              onReplyAdded={handleCommentAdded}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">لا توجد تعليقات بعد</div>
          <p className="text-gray-400">كن أول من يعلق على هذه الورقة البحثية</p>
        </div>
      )}
    </div>
  );
}

