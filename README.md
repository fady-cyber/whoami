# whoami academy 🛡️

أكاديمية لتعليم الأمن السيبراني من الصفر وحتى الاحتراف، بمنهج بنظام **CS50** (أسابيع متراكمة: محاضرة + ملاحظات + تمرين عملي).
التصميم: سماء حالمة + Glassmorphism (نفس ستايل الصورة المرجعية) ، واجهة عربية RTL بالكامل.

## 🏗️ الفصل بين الفرونت إند والباك إند

```
src/
├── app/                        ← FRONTEND (واجهات المستخدم — App Router)
│   ├── page.tsx                ← الصفحة الرئيسية (Hero + مسارات + منهج + تواصل)
│   ├── login|register/         ← صفحات الدخول/التسجيل (كارت زجاجي)
│   ├── courses/                ← استعراض المسارات وتفاصيلها
│   ├── learn/[slug]/           ← مشغل المحاضرات + إتمام الأسابيع
│   ├── dashboard/              ← لوحة الطالب (تقدم + إحصائيات)
│   ├── api/                    ← BACKEND API (REST endpoints)
│   │   ├── auth/               ← register · login · logout · me
│   │   ├── courses/            ← GET list · GET :slug · POST :slug/enroll
│   │   ├── progress/           ← toggle إتمام أسبوع
│   │   ├── dashboard/          ← بيانات لوحة الطالب
│   │   └── contact/            ← استقبال الرسائل
│   └── layout.tsx
├── components/                 ← مكونات واجهة مشتركة (Client/Server)
├── db/                         ← طبقة البيانات (Drizzle ORM + PostgreSQL)
│   ├── schema.ts               ← السكيما الكاملة
│   └── index.ts                ← اتصال PostgreSQL
├── lib/auth.ts                 ← JWT + bcrypt + كوكيز الجلسات
├── lib/admin.ts                ← استعلامات لوحة الإدارة المشتركة
└── proxy.ts                    ← حماية /dashboard و /learn و /admin (Next.js 16 Proxy)
```

- الباك إند: `app/api/*` (REST) + طبقة `db/` + `lib/auth` + `lib/admin` — كله Server-Side، الأسرار في `process.env` فقط.
- الفرونت إند: صفحات `app/*` + مكونات `components/` — Client Components فقط حيث يلزم التفاعل.
- لوحة إدارة كاملة: `/admin` (للأدمن فقط) فيها إحصائيات المنصة، أحدث المستخدمين، رسائل التواصل، وترتيب الطلاب.
- SEO والنشر: `src/app/robots.ts` + `src/app/sitemap.ts` + `.env.example` لتسهيل الربط على الدومين.

## 🗄️ قاعدة البيانات (PostgreSQL)

```bash
# 1) إنشاء الجداول من السكيما (تطوير)
npx drizzle-kit push

# 2) البيانات الأساسية + الكويريات الكاملة للرفع على الدومين
psql "$DATABASE_URL" -f database/deploy.sql
```

ملف **`database/deploy.sql`** يحتوي كل شيء جاهز للإنتاج:
DDL للجداول + الفهارس + بيانات البذرة (6 مسارات + ~46 أسبوعًا + حساب أدمن) + أمثلة كويريات التطبيق.

حسابات تجريبية جاهزة (غيّرها فورًا):
| البريد | كلمة المرور | الدور |
|---|---|---|
| admin@whoami.academy | admin123 | admin |
| student@whoami.academy | student123 | student |

## 🚀 الرفع على الدومين

1. **استضافة Node.js**: Vercel / Railway / Render / VPS — ثبّت Next.js بمتغيرات البيئة:
   ```
   DATABASE_URL=postgres://user:pass@host:5432/whoami_db
   AUTH_SECRET=<سلسلة عشوائية طويلة — أمر: openssl rand -base64 48>
   NEXT_PUBLIC_SITE_URL=https://whoami-academy.com
   ```
2. **قاعدة البيانات**: PostgreSQL (Supabase / Neon / Railway / VPS) ثم شغّل:
   `psql "$DATABASE_URL" -f database/deploy.sql`
3. **الدومين**: اربط الدومين بالمزود + شهادة SSL مجانية (Caddy/Let's Encrypt أو من لوحة المزود).
4. غيّر كلمة مرور الأدمن فور أول دخول.

## 🔐 أمان

- كلمات المرور: bcrypt (10 rounds)
- الجلسات: JWT موقّع HS256 في كوكي httpOnly + SameSite=Lax (7 أيام)
- Middleware يحمي المسارات الخاصة على مستوى Edge
- تحقق كامل من المدخلات في كل API
