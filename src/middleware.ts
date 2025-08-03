import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // السماح بالوصول للصفحات العامة
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true;
        }
        
        // السماح بالوصول للصفحة الرئيسية
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        
        // السماح بالوصول لصفحات الأوراق العامة
        if (req.nextUrl.pathname === "/papers" || 
            req.nextUrl.pathname.match(/^\/papers\/[^\/]+$/)) {
          return true;
        }
        
        // طلب المصادقة للصفحات المحمية
        if (req.nextUrl.pathname.startsWith("/profile") || 
            req.nextUrl.pathname.startsWith("/dashboard") ||
            req.nextUrl.pathname.startsWith("/papers/create") ||
            req.nextUrl.pathname.startsWith("/papers/submit") ||
            req.nextUrl.pathname.startsWith("/saved") ||
            req.nextUrl.pathname.startsWith("/notifications")) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

