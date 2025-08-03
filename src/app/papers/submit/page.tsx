"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UploadForm from "@/components/features/upload-form";

export default function SubmitPaperPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin?callbackUrl=/papers/submit");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            رفع ورقة بحثية جديدة
          </h1>
          <p className="text-gray-600">
            شارك بحثك مع المجتمع العلمي العربي واحصل على مراجعات من الخبراء
          </p>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            إرشادات رفع الأوراق البحثية
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">متطلبات المحتوى:</h3>
              <ul className="space-y-1">
                <li>• عنوان واضح ومحدد</li>
                <li>• ملخص شامل (150-300 كلمة)</li>
                <li>• تصنيف مناسب للموضوع</li>
                <li>• كلمات مفتاحية ذات صلة</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">متطلبات الملف:</h3>
              <ul className="space-y-1">
                <li>• صيغة PDF فقط</li>
                <li>• حجم أقصى 10 ميجابايت</li>
                <li>• جودة عالية وقابل للقراءة</li>
                <li>• يفضل تضمين المراجع</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <UploadForm />
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ماذا يحدث بعد الرفع؟
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">مراجعة أولية</h4>
              <p>سيتم مراجعة ورقتك للتأكد من مطابقتها للمعايير الأساسية</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">النشر</h4>
              <p>بعد الموافقة، ستصبح ورقتك متاحة للمجتمع العلمي</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">التفاعل</h4>
              <p>ستحصل على مراجعات وتعليقات من الباحثين المهتمين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

