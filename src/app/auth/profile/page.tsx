"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">جاري التحميل...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="صورة المستخدم"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{session.user?.name}</h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">معلومات الجلسة</h3>
              <p className="text-sm text-gray-600">
                <strong>معرف المستخدم:</strong> {session.user?.id || "غير متوفر"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>الدور:</strong> {(session.user as any)?.role || "باحث"}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">إحصائيات سريعة</h3>
              <p className="text-sm text-gray-600">الأوراق المنشورة: 0</p>
              <p className="text-sm text-gray-600">المتابعون: 0</p>
              <p className="text-sm text-gray-600">المتابَعون: 0</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              تسجيل الخروج
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

