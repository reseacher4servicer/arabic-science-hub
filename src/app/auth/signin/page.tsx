"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="text-4xl font-bold mb-8">تسجيل الدخول إلى Arabic Science Hub</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        ادخل إلى حسابك للوصول إلى أحدث الأبحاث العلمية العربية
      </p>
      <div className="flex flex-col space-y-4">
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded min-w-[250px]"
                onClick={() => signIn(provider.id)}
              >
                تسجيل الدخول باستخدام {provider.name}
              </button>
            </div>
          ))}
      </div>
      <p className="mt-6 text-sm text-gray-500">
        ليس لديك حساب؟{" "}
        <a href="/auth/signup" className="text-blue-500 hover:underline">
          إنشاء حساب جديد
        </a>
      </p>
    </div>
  );
}

