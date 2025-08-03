"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ReviewFormProps {
  paperId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ paperId, onSuccess }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitReview = api.submissions.submitReview.useMutation({
    onSuccess: () => {
      alert("تم إرسال المراجعة بنجاح!");
      setFormData({ rating: 0, title: "", content: "" });
      onSuccess?.();
    },
    onError: (error) => {
      alert(`حدث خطأ: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = "التقييم مطلوب";
    }

    if (!formData.title.trim()) {
      newErrors.title = "عنوان المراجعة مطلوب";
    }

    if (!formData.content.trim()) {
      newErrors.content = "محتوى المراجعة مطلوب";
    }

    if (formData.content.trim().length < 50) {
      newErrors.content = "محتوى المراجعة يجب أن يكون 50 حرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await submitReview.mutateAsync({
      paperId,
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
    });
  };

  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className={`text-2xl transition-colors ${
              star <= formData.rating
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          >
            ★
          </button>
        ))}
        <span className="mr-2 text-sm text-gray-600">
          ({formData.rating}/5)
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        إضافة مراجعة
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التقييم *
          </label>
          <StarRating />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            عنوان المراجعة *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="أدخل عنوان المراجعة"
            disabled={submitReview.isLoading}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            محتوى المراجعة *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="اكتب مراجعتك للورقة البحثية هنا..."
            disabled={submitReview.isLoading}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
            <p className="text-sm text-gray-500">
              {formData.content.length}/500 حرف (الحد الأدنى: 50)
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            إرشادات المراجعة:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• قيّم جودة المحتوى العلمي والمنهجية</li>
            <li>• اذكر نقاط القوة والضعف بوضوح</li>
            <li>• قدم اقتراحات بناءة للتحسين</li>
            <li>• حافظ على الطابع الأكاديمي والمهني</li>
            <li>• تجنب التعليقات الشخصية أو المسيئة</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitReview.isLoading}
          >
            {submitReview.isLoading ? "جاري الإرسال..." : "إرسال المراجعة"}
          </button>
        </div>
      </form>
    </div>
  );
}

