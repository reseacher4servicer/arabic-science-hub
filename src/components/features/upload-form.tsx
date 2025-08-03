"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface UploadFormProps {
  onSuccess?: (paperId: string) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    categoryId: "",
    keywords: "",
    fileUrl: "",
    doi: "",
    arxivId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = api.categories.getAll.useQuery();

  const submitPaper = api.submissions.submitPaper.useMutation({
    onSuccess: (paper) => {
      alert("تم رفع الورقة البحثية بنجاح!");
      if (onSuccess) {
        onSuccess(paper.id);
      } else {
        router.push(`/papers/${paper.id}`);
      }
    },
    onError: (error) => {
      alert(`حدث خطأ: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, file: "يجب أن يكون الملف من نوع PDF" }));
        return;
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "حجم الملف يجب أن يكون أقل من 10 ميجابايت" }));
        return;
      }

      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Simulate file upload - in real implementation, use AWS S3 or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a mock URL
        const mockUrl = `https://example.com/papers/${Date.now()}-${file.name}`;
        resolve(mockUrl);
      }, 2000);
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "العنوان مطلوب";
    }

    if (!formData.abstract.trim()) {
      newErrors.abstract = "الملخص مطلوب";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "التصنيف مطلوب";
    }

    if (!file && !formData.fileUrl) {
      newErrors.file = "يجب رفع ملف PDF أو إدخال رابط الملف";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      let fileUrl = formData.fileUrl;

      // Upload file if provided
      if (file) {
        fileUrl = await uploadFile(file);
      }

      // Submit paper
      await submitPaper.mutateAsync({
        title: formData.title,
        abstract: formData.abstract,
        content: formData.content || undefined,
        categoryId: formData.categoryId,
        keywords: formData.keywords ? formData.keywords.split(",").map(k => k.trim()) : undefined,
        fileUrl: fileUrl || undefined,
        doi: formData.doi || undefined,
        arxivId: formData.arxivId || undefined,
      });
    } catch (error) {
      console.error("Error submitting paper:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          عنوان الورقة البحثية *
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
          placeholder="أدخل عنوان الورقة البحثية"
          disabled={uploading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Abstract */}
      <div>
        <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
          الملخص *
        </label>
        <textarea
          id="abstract"
          name="abstract"
          value={formData.abstract}
          onChange={handleInputChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.abstract ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="أدخل ملخص الورقة البحثية"
          disabled={uploading}
        />
        {errors.abstract && <p className="mt-1 text-sm text-red-600">{errors.abstract}</p>}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          المحتوى الكامل (اختياري)
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل المحتوى الكامل للورقة البحثية"
          disabled={uploading}
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          التصنيف *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.categoryId ? "border-red-500" : "border-gray-300"
          }`}
          disabled={uploading}
        >
          <option value="">اختر التصنيف</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameAr}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
      </div>

      {/* Keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
          الكلمات المفتاحية (مفصولة بفواصل)
        </label>
        <input
          type="text"
          id="keywords"
          name="keywords"
          value={formData.keywords}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="مثال: ذكاء اصطناعي, تعلم آلي, شبكات عصبية"
          disabled={uploading}
        />
      </div>

      {/* File Upload */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
          رفع ملف PDF *
        </label>
        <input
          type="file"
          id="file"
          accept=".pdf"
          onChange={handleFileChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.file ? "border-red-500" : "border-gray-300"
          }`}
          disabled={uploading}
        />
        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
        <p className="mt-1 text-sm text-gray-500">
          الحد الأقصى لحجم الملف: 10 ميجابايت. الصيغة المدعومة: PDF فقط
        </p>
      </div>

      {/* File URL Alternative */}
      <div>
        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-2">
          أو أدخل رابط الملف
        </label>
        <input
          type="url"
          id="fileUrl"
          name="fileUrl"
          value={formData.fileUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/paper.pdf"
          disabled={uploading}
        />
      </div>

      {/* DOI */}
      <div>
        <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
          DOI (اختياري)
        </label>
        <input
          type="text"
          id="doi"
          name="doi"
          value={formData.doi}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10.1000/182"
          disabled={uploading}
        />
      </div>

      {/* ArXiv ID */}
      <div>
        <label htmlFor="arxivId" className="block text-sm font-medium text-gray-700 mb-2">
          ArXiv ID (اختياري)
        </label>
        <input
          type="text"
          id="arxivId"
          name="arxivId"
          value={formData.arxivId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="2301.00001"
          disabled={uploading}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          disabled={uploading}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading}
        >
          {uploading ? "جاري الرفع..." : "رفع الورقة البحثية"}
        </button>
      </div>
    </form>
  );
}

