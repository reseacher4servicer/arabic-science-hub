"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface CommentFormProps {
  paperId: string;
  parentId?: string;
  onCommentAdded?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  paperId,
  parentId,
  onCommentAdded,
  placeholder = "اكتب تعليقك هنا...",
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const createComment = api.interactions.createComment.useMutation({
    onSuccess: () => {
      setContent("");
      setLoading(false);
      onCommentAdded?.();
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }

    if (!content.trim()) return;

    setLoading(true);
    createComment.mutate({
      content: content.trim(),
      paperId,
      parentId,
    });
  };

  if (!session) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-3">يجب تسجيل الدخول لإضافة تعليق</p>
        <a
          href="/auth/signin"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start space-x-3">
        <img
          src={session.user?.image || "/default-avatar.png"}
          alt={session.user?.name || ""}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/1000 حرف
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim() || content.length > 1000}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري النشر..." : "نشر التعليق"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

