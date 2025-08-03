"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface LikeButtonProps {
  paperId?: string;
  commentId?: string;
  reviewId?: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
}

export default function LikeButton({
  paperId,
  commentId,
  reviewId,
  initialLiked = false,
  initialCount = 0,
  size = "md",
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = api.interactions.toggleLike.useMutation({
    onMutate: () => {
      // Optimistic update
      setLiked(!liked);
      setCount(liked ? count - 1 : count + 1);
    },
    onError: () => {
      // Revert on error
      setLiked(liked);
      setCount(count);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleClick = async () => {
    if (!session) {
      // Redirect to login or show login modal
      window.location.href = "/auth/signin";
      return;
    }

    setLoading(true);
    toggleLike.mutate({
      paperId,
      commentId,
      reviewId,
    });
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        flex items-center space-x-1 rounded-md transition-colors
        ${sizeClasses[size]}
        ${
          liked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className={liked ? "text-red-500" : "text-gray-500"}>
        {liked ? "❤️" : "🤍"}
      </span>
      <span className="font-medium">{count}</span>
      <span className="hidden sm:inline">إعجاب</span>
    </button>
  );
}

