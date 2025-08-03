"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface BookmarkButtonProps {
  paperId: string;
  initialBookmarked?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BookmarkButton({
  paperId,
  initialBookmarked = false,
  size = "md",
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = api.interactions.toggleBookmark.useMutation({
    onMutate: () => {
      // Optimistic update
      setBookmarked(!bookmarked);
    },
    onError: () => {
      // Revert on error
      setBookmarked(bookmarked);
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
    toggleBookmark.mutate({ paperId });
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
          bookmarked
            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className={bookmarked ? "text-yellow-500" : "text-gray-500"}>
        {bookmarked ? "🔖" : "📑"}
      </span>
      <span className="hidden sm:inline">
        {bookmarked ? "محفوظة" : "حفظ"}
      </span>
    </button>
  );
}

