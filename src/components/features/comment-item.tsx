"use client";

import { useState } from "react";
import LikeButton from "./like-button";
import CommentForm from "./comment-form";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  replies?: Comment[];
  _count: {
    likes: number;
  };
}

interface CommentItemProps {
  comment: Comment;
  paperId: string;
  onReplyAdded?: () => void;
}

export default function CommentItem({ comment, paperId, onReplyAdded }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onReplyAdded?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.avatar || "/default-avatar.png"}
          alt={comment.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">
                {comment.author.name}
              </span>
              <span className="text-sm text-gray-500">
                @{comment.author.username}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <p className="text-gray-800 leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <LikeButton
              commentId={comment.id}
              initialCount={comment._count.likes}
              size="sm"
            />
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-500 hover:text-blue-500"
            >
              رد
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                {showReplies ? "إخفاء" : "عرض"} الردود ({comment.replies.length})
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                paperId={paperId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                placeholder="اكتب ردك هنا..."
              />
            </div>
          )}

          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 border-r-2 border-gray-200 pr-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  paperId={paperId}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

