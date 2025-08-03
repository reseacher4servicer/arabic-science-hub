# ملف التسليم - Arabic Science Hub
**التاريخ:** 8 يناير 2025  
**الحالة:** جاهز للمرحلة التالية  
**المطور التالي:** فريق التطوير  

## 🎯 نظرة عامة على المشروع

**Arabic Science Hub** هو منصة علمية عربية مبتكرة تهدف إلى تعزيز البحث العلمي والتعاون الأكاديمي في العالم العربي. تم إعداد البيئة التقنية بالكامل وهي جاهزة لبدء تطوير الميزات الأساسية.

## 📁 بنية المشروع

```
arabic-science-hub/
├── src/
│   ├── app/                    # Next.js App Router (صفحات التطبيق)
│   ├── components/             # مكونات React
│   │   ├── ui/                # مكونات UI أساسية (فارغة - تحتاج تطوير)
│   │   └── features/          # مكونات الميزات (فارغة - تحتاج تطوير)
│   ├── server/                # كود الخادم
│   │   ├── api/               # tRPC routers (مكتملة)
│   │   │   ├── root.ts        # Router رئيسي
│   │   │   └── routers/       # Routers فرعية
│   │   │       ├── papers.ts  # إدارة الأوراق البحثية
│   │   │       ├── users.ts   # إدارة المستخدمين
│   │   │       └── categories.ts # إدارة التصنيفات
│   │   ├── auth.ts            # إعداد NextAuth.js
│   │   └── db/                # إعداد قاعدة البيانات
│   ├── lib/                   # مكتبات مساعدة
│   │   └── api.ts             # إعداد tRPC client
│   ├── hooks/                 # React hooks مخصصة (فارغة)
│   ├── types/                 # تعريفات TypeScript (فارغة)
│   └── utils/                 # دوال مساعدة (فارغة)
├── prisma/                    # قاعدة البيانات
│   ├── schema.prisma          # مخطط قاعدة البيانات (مكتمل)
│   └── seed.ts                # البيانات الأولية (مكتملة)
├── tests/                     # ملفات الاختبارات (فارغة)
├── docs/                      # الوثائق
│   ├── architecture_log.md    # سجل القرارات المعمارية
│   ├── project_status_*.md    # تقارير التقدم
│   └── handoff_prompt_*.md    # ملفات التسليم
└── [ملفات التكوين]           # جميع ملفات التكوين جاهزة
```

## 🚀 كيفية البدء

### 1. إعداد البيئة المحلية
```bash
# الانتقال لمجلد المشروع
cd /home/ubuntu/arabic-science-hub

# تثبيت التبعيات
pnpm install

# تشغيل قاعدة البيانات
sudo systemctl start postgresql

# إعداد قاعدة البيانات
pnpm db:push
pnpm db:seed

# تشغيل التطبيق
pnpm dev
```

### 2. التحقق من الإعداد
- التطبيق يعمل على: `http://localhost:3000`
- قاعدة البيانات: PostgreSQL على المنفذ 5432
- Prisma Studio: `pnpm db:studio`

### 3. الأوامر المفيدة
```bash
# التطوير
pnpm dev                 # تشغيل التطبيق
pnpm build              # بناء الإنتاج
pnpm start              # تشغيل الإنتاج

# قاعدة البيانات
pnpm db:generate        # توليد عميل Prisma
pnpm db:push            # دفع المخطط
pnpm db:migrate         # إنشاء migration
pnpm db:studio          # فتح Prisma Studio
pnpm db:seed            # إضافة البيانات الأولية

# الاختبارات
pnpm test               # اختبارات الوحدة
pnpm test:e2e           # اختبارات شاملة
pnpm test:ui            # واجهة الاختبارات

# جودة الكود
pnpm lint               # فحص الكود
pnpm lint:fix           # إصلاح الأخطاء
pnpm format             # تنسيق الكود
pnpm type-check         # فحص الأنواع
```

## 🛠️ المهام الأولوية العالية

### 1. تطوير الواجهة الأمامية الأساسية
**الهدف**: إنشاء الصفحات والمكونات الأساسية

**المهام المطلوبة:**
- [ ] إنشاء Layout أساسي مع Header و Footer
- [ ] تطوير صفحة الرئيسية مع عرض الأوراق المميزة
- [ ] إنشاء نظام التنقل مع دعم اللغة العربية
- [ ] تطوير مكونات UI أساسية (Button, Card, Input, etc.)
- [ ] إعداد نظام الألوان والخطوط للغة العربية

**الملفات المطلوبة:**
```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── navigation.tsx
└── layout.tsx

src/app/
├── layout.tsx (تحديث)
├── page.tsx (تحديث)
└── globals.css (تحديث)
```

### 2. نظام المصادقة والتفويض
**الهدف**: تفعيل نظام تسجيل الدخول والحسابات

**المهام المطلوبة:**
- [ ] إنشاء صفحات تسجيل الدخول والتسجيل
- [ ] تكامل NextAuth.js مع قاعدة البيانات
- [ ] إعداد جلسات المستخدمين
- [ ] تطوير middleware للحماية
- [ ] إنشاء صفحة الملف الشخصي

**الملفات المطلوبة:**
```
src/app/auth/
├── signin/page.tsx
├── signup/page.tsx
└── profile/page.tsx

src/middleware.ts
src/lib/auth.ts
```

### 3. صفحات الأوراق البحثية
**الهدف**: عرض وتصفح الأوراق البحثية

**المهام المطلوبة:**
- [ ] صفحة تصفح جميع الأوراق مع فلترة
- [ ] صفحة تفاصيل الورقة البحثية
- [ ] نظام البحث الأساسي
- [ ] عرض التصنيفات والفلاتر
- [ ] نظام الترقيم (Pagination)

**الملفات المطلوبة:**
```
src/app/papers/
├── page.tsx
├── [id]/page.tsx
└── search/page.tsx

src/components/features/
├── paper-card.tsx
├── paper-list.tsx
├── search-bar.tsx
└── category-filter.tsx
```

## 🔧 التقنيات والأدوات الجاهزة

### Backend APIs (tRPC)
جميع APIs جاهزة ومختبرة:

**Papers Router** (`src/server/api/routers/papers.ts`):
- `getAll()` - جلب جميع الأوراق مع فلترة وبحث
- `getById()` - جلب ورقة محددة بالتفاصيل
- `create()` - إنشاء ورقة جديدة
- `like()` - إعجاب/إلغاء إعجاب
- `bookmark()` - حفظ/إلغاء حفظ

**Users Router** (`src/server/api/routers/users.ts`):
- `getProfile()` - جلب ملف المستخدم
- `updateProfile()` - تحديث الملف الشخصي
- `follow()` - متابعة/إلغاء متابعة
- `getFollowers()` - جلب المتابعين
- `getFollowing()` - جلب المتابَعين
- `search()` - البحث في المستخدمين

**Categories Router** (`src/server/api/routers/categories.ts`):
- `getAll()` - جلب جميع التصنيفات
- `getById()` - جلب تصنيف محدد
- `create()` - إنشاء تصنيف (للإدارة)
- `update()` - تحديث تصنيف (للإدارة)
- `delete()` - حذف تصنيف (للإدارة)

### قاعدة البيانات
مخطط شامل مع البيانات الأولية:
- **8 تصنيفات علمية** جاهزة
- **3 مستخدمين نموذجيين** للاختبار
- **3 أوراق بحثية** نموذجية
- **جميع العلاقات** محددة ومختبرة

### أدوات التطوير
- **TypeScript**: Type safety كاملة
- **ESLint + Prettier**: جودة الكود
- **Vitest + Playwright**: بيئة اختبار جاهزة
- **Git**: مستودع مع فرعي main و dev

## 📋 إرشادات التطوير

### 1. معايير الكود
- استخدم TypeScript لجميع الملفات
- اتبع معايير ESLint المحددة
- استخدم Prettier للتنسيق
- اكتب اختبارات للميزات الجديدة

### 2. تسمية الملفات
- استخدم kebab-case للمجلدات: `user-profile`
- استخدم PascalCase للمكونات: `UserProfile.tsx`
- استخدم camelCase للدوال: `getUserProfile`

### 3. بنية المكونات
```typescript
// مثال على مكون React
import { type FC } from 'react';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
};
```

### 4. استخدام tRPC
```typescript
// مثال على استخدام tRPC في المكونات
import { api } from '@/lib/api';

export const PapersList = () => {
  const { data: papers, isLoading } = api.papers.getAll.useQuery({
    limit: 10,
    search: '',
  });

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {papers?.papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
};
```

### 5. دعم اللغة العربية
- استخدم `dir="rtl"` للنصوص العربية
- استخدم فئات TailwindCSS المناسبة: `text-right`, `mr-*`, `ml-*`
- تأكد من دعم الخطوط العربية في `globals.css`

## 🎨 التصميم والواجهة

### نظام الألوان المقترح
```css
:root {
  --primary: #2563eb;      /* أزرق أساسي */
  --secondary: #10b981;    /* أخضر ثانوي */
  --accent: #f59e0b;       /* برتقالي للتمييز */
  --background: #ffffff;   /* خلفية بيضاء */
  --surface: #f8fafc;      /* سطح رمادي فاتح */
  --text: #1f2937;         /* نص رمادي داكن */
  --text-muted: #6b7280;   /* نص رمادي متوسط */
}
```

### الخطوط المقترحة
- **العربية**: Cairo, Tajawal, أو Amiri
- **الإنجليزية**: Inter, Roboto, أو system fonts

### مكونات UI مطلوبة
1. **Button**: أزرار بأحجام وألوان مختلفة
2. **Card**: بطاقات لعرض المحتوى
3. **Input**: حقول الإدخال مع دعم العربية
4. **Modal**: نوافذ منبثقة
5. **Navigation**: قائمة التنقل الرئيسية
6. **Pagination**: ترقيم الصفحات
7. **Loading**: مؤشرات التحميل
8. **Alert**: رسائل التنبيه

## 🧪 الاختبارات

### اختبارات الوحدة (Vitest)
```typescript
// مثال على اختبار مكون
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

test('renders user information', () => {
  const user = {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
  };

  render(<UserCard user={user} />);
  
  expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
  expect(screen.getByText('ahmed@example.com')).toBeInTheDocument();
});
```

### اختبارات شاملة (Playwright)
```typescript
// مثال على اختبار شامل
import { test, expect } from '@playwright/test';

test('user can browse papers', async ({ page }) => {
  await page.goto('/papers');
  
  await expect(page.getByText('الأوراق البحثية')).toBeVisible();
  await expect(page.locator('[data-testid="paper-card"]')).toHaveCount(3);
});
```

## 🔒 الأمان

### إرشادات الأمان
1. **التحقق من المدخلات**: استخدم Zod لجميع المدخلات
2. **المصادقة**: تحقق من الجلسات في جميع الصفحات المحمية
3. **التفويض**: تحقق من الأذونات قبل العمليات الحساسة
4. **CSRF Protection**: مفعل تلقائياً مع NextAuth.js
5. **XSS Protection**: تجنب dangerouslySetInnerHTML

### متغيرات البيئة المطلوبة
```env
# قاعدة البيانات
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arabic_science_hub"

# المصادقة
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# اختياري للإنتاج
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## 📚 الموارد والمراجع

### الوثائق التقنية
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### ملفات المشروع المهمة
- `architecture_log.md` - سجل القرارات التقنية
- `README.md` - دليل المشروع الشامل
- `todo.md` - قائمة المهام المفصلة
- `project_status_*.md` - تقارير التقدم

### أمثلة الكود
جميع APIs جاهزة في `src/server/api/routers/` مع أمثلة شاملة لاستخدام:
- Prisma queries
- tRPC procedures
- Zod validation
- Error handling

## ⚠️ نقاط مهمة للانتباه

### 1. قاعدة البيانات
- PostgreSQL يعمل محلياً (ليس Docker)
- تأكد من تشغيل الخدمة: `sudo systemctl start postgresql`
- البيانات الأولية متوفرة: `pnpm db:seed`

### 2. TypeScript
- تحذيرات peer dependencies موجودة لكن لا تؤثر على العمل
- تأكد من تشغيل `pnpm type-check` قبل الـ commit

### 3. Git Workflow
- الفرع الرئيسي: `main`
- فرع التطوير: `dev`
- استخدم Conventional Commits للرسائل

### 4. الأداء
- تم تفعيل Turbopack للتطوير السريع
- TailwindCSS محسن للإنتاج
- تأكد من تحسين الصور والخطوط

## 🎯 الأهداف قصيرة المدى

### الأسبوع الأول
- [ ] إنشاء Layout أساسي وصفحة الرئيسية
- [ ] تطوير مكونات UI الأساسية
- [ ] تفعيل نظام المصادقة الأساسي

### الأسبوع الثاني
- [ ] صفحات الأوراق البحثية (تصفح وتفاصيل)
- [ ] نظام البحث والفلترة
- [ ] الملفات الشخصية للمستخدمين

### الأسبوع الثالث
- [ ] نظام التفاعل (إعجابات، تعليقات)
- [ ] رفع الملفات والمرفقات
- [ ] تحسينات الأداء والتصميم

## 📞 الدعم والمساعدة

### في حالة المشاكل التقنية
1. تحقق من ملف `architecture_log.md` للقرارات السابقة
2. راجع `README.md` للإرشادات التفصيلية
3. استخدم `pnpm db:studio` لفحص قاعدة البيانات
4. تحقق من logs التطبيق في وحدة التحكم

### الموارد المفيدة
- جميع APIs موثقة في ملفات الـ routers
- أمثلة الاستخدام متوفرة في ملف seed
- مخطط قاعدة البيانات موثق في `prisma/schema.prisma`

---

**ملاحظة مهمة**: هذا المشروع جاهز بالكامل للبدء في التطوير. جميع الأسس التقنية موضوعة والبيئة مهيأة. التركيز الآن يجب أن يكون على تطوير الواجهة الأمامية وتجربة المستخدم.

**نجاح المشروع**: تم إنجاز 100% من مرحلة الإعداد الأولي. المشروع في وضع ممتاز للانتقال لمرحلة التطوير الفعلي.

---

**إعداد:** فريق التطوير - Arabic Science Hub  
**التسليم:** جاهز للفريق التالي  
**التاريخ:** 8 يناير 2025

