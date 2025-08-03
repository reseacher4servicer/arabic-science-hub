import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";

/**
 * دالة للحصول على جلسة المستخدم في Server Components
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * دالة للتحقق من المصادقة وإعادة التوجيه إذا لم يكن المستخدم مسجل الدخول
 */
export async function requireAuth() {
  const session = await getAuthSession();
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return session;
}

/**
 * دالة للتحقق من دور المستخدم
 */
export function hasRole(session: any, role: string): boolean {
  return session?.user?.role === role;
}

/**
 * دالة للتحقق من ملكية المورد
 */
export function isOwner(session: any, resourceUserId: string): boolean {
  return session?.user?.id === resourceUserId;
}

/**
 * دالة للتحقق من الصلاحيات
 */
export function canAccess(session: any, requiredRole?: string, resourceUserId?: string): boolean {
  if (!session) return false;
  
  // التحقق من الدور إذا كان مطلوباً
  if (requiredRole && !hasRole(session, requiredRole)) {
    return false;
  }
  
  // التحقق من الملكية إذا كان معرف المورد مقدماً
  if (resourceUserId && !isOwner(session, resourceUserId)) {
    return false;
  }
  
  return true;
}

