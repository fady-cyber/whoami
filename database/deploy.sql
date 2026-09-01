-- =====================================================================
--  whoami academy — Full Deployment SQL
--  PostgreSQL 14+
--  شغّل هذا الملف كاملًا على أي سيرفر PostgreSQL (VPS / Railway / Render
--  / Supabase / Neon) قبل رفع الموقع على الدومين:
--      psql "$DATABASE_URL" -f database/deploy.sql
--  الملف آمن لإعادة التشغيل (idempotent): CREATE ... IF NOT EXISTS
--  و INSERT ... ON CONFLICT DO NOTHING
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1) TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(160) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  tagline     VARCHAR(300) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  level       VARCHAR(30) NOT NULL DEFAULT 'مبتدئ',
  icon        VARCHAR(10) NOT NULL DEFAULT '🛡️',
  color       VARCHAR(40) NOT NULL DEFAULT 'from-sky-400 to-fuchsia-400',
  duration    VARCHAR(60) NOT NULL DEFAULT '10 أسابيع',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weeks (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title       VARCHAR(200) NOT NULL,
  summary     VARCHAR(400) NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  video_url   VARCHAR(500) NOT NULL DEFAULT '',
  duration    VARCHAR(40) NOT NULL DEFAULT '45 دقيقة',
  is_free     BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT weeks_course_week_uq UNIQUE (course_id, week_number)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT enrollments_user_course_uq UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS progress (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_id      INTEGER NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT progress_user_week_uq UNIQUE (user_id, week_id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 2) INDEXES (أداء الاستعلامات الأكثر تكرارًا)
-- =====================================================================

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx        ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_idx        ON courses (slug);
CREATE INDEX        IF NOT EXISTS weeks_course_idx        ON weeks (course_id);
CREATE INDEX        IF NOT EXISTS enrollments_user_idx    ON enrollments (user_id);
CREATE INDEX        IF NOT EXISTS enrollments_course_idx  ON enrollments (course_id);
CREATE INDEX        IF NOT EXISTS progress_user_idx       ON progress (user_id);
CREATE INDEX        IF NOT EXISTS progress_week_idx       ON progress (week_id);
CREATE INDEX        IF NOT EXISTS contacts_created_idx    ON contacts (created_at DESC);

-- =====================================================================
-- 3) SEED — المستخدمون (كلمة مرور الأدمن: admin123 / الطالب: student123)
--    غيّر كلمة المرور فور أول تسجيل دخول!
-- =====================================================================

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Whoami Admin', 'admin@whoami.academy', '$2b$10$ud82Ie3P9Iq7DjaJxiPz7ORayd01Yhh7RWMtam6E7t2Doib7NFFPO', 'admin'),
  ('Student Demo', 'student@whoami.academy', '$2b$10$duCcmvO7cYF6DPXLBtfvBeuby8RFRRDI1.TovcCWtEE/SbI3nmi86', 'student')
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 4) SEED — الكورسات (المسارات)
-- =====================================================================

INSERT INTO courses (slug, title, tagline, description, level, icon, color, duration, is_featured, sort_order) VALUES
('cyber-basics',
 'الأمن السيبراني من الصفر — بنظام CS50',
 'من أول أمر whoami حتى أول ثغرة تجدها بنفسك',
 'مسار شامل بنظام جامعة هارفارد CS50: عشرة أسابيع متراكمة، من مفاهيم الأمن الأساسية والشبكات والتشفير، مرورًا بأمن الويب واختبار الاختراق، وصولًا إلى التحقيق الجنائي والدفاع، وتتوج بمشروع تخرج حقيقي. كل أسبوع يحتوي محاضرة فيديو + ملاحظات + تمرين عملي.',
 'مبتدئ',
 '🛡️',
 'from-sky-400 to-fuchsia-400',
 '10 أسابيع',
 TRUE,
 1),

('network-security',
 'أمن الشبكات',
 'افهم كيف تسافر البايتات… وكيف تُخترق',
 'مسار متخصص يشرح بنية الشبكات من طبقة الفيزياء حتى التطبيق، وبروتوكولات TCP/IP و DNS و HTTP، مع هجمات الشبكات الشائعة (MITM, ARP Spoofing, Sniffing) وطرق الدفاع عنها باستخدام الجدران النارية وأنظمة كشف التسلل.',
 'متوسط',
 '🌐',
 'from-indigo-400 to-sky-400',
 '6 أسابيع',
 FALSE,
 2),

('web-security',
 'أمن الويب — OWASP',
 'من رفع الملفات إلى حقن SQL: حوّل ثغرات الويب لصالحك',
 'مسار تطبيقي عميق في أمن تطبيقات الويب وفق قائمة OWASP Top 10: الحقن، XSS، CSRF، IDOR، كسر المصادقة، وغيرها، مع تمارين على بيئات مخترقة آمنة وكتابة تقارير ثغرات احترافية.',
 'متوسط',
 '💉',
 'from-fuchsia-400 to-rose-400',
 '6 أسابيع',
 FALSE,
 3),

('ethical-hacking',
 'اختبار الاختراق الأخلاقي',
 'فكر مثل المهاجم لتحمي مثل المحترف',
 'مسار تدريبي على منهجية اختبار الاختراق الكاملة: الاستطلاع، المسح، التعداد، الاستغلال، التصعيد، والتوثيق، باستخدام أدوات Kali Linux و Metasploit و Nmap، داخل مختبرات قانونية وآمنة بالكامل.',
 'متقدم',
 '🥷',
 'from-purple-400 to-indigo-400',
 '6 أسابيع',
 FALSE,
 4),

('digital-forensics',
 'التحقيق الجنائي الرقمي',
 'كل بايت يترك أثرًا — تعلّم قراءة القصة',
 'مسار في علم التحقيق الرقمي: جمع الأدلة، نسخ الصور الجنائية، تحليل الأنظمة والذاكرة، استعادة الملفات المحذوفة، وكتابة تقارير قانونية مقبولة أمام المحاكم.',
 'متقدم',
 '🔍',
 'from-amber-400 to-orange-400',
 '6 أسابيع',
 FALSE,
 5),

('blue-team',
 'الدفاع والاستجابة للحوادث',
 'بناء خطوط الدفاع والرد على الاختراقات',
 'مسار الفريق الأزرق: رصد التهديدات، بناء SIEM مبسّط، تحليل السجلات، الاستجابة للحوادث خطوة بخطوة، وإدارة نقاط الضعف في البنية التحتية للمؤسسات.',
 'متوسط',
 '🚨',
 'from-emerald-400 to-teal-400',
 '6 أسابيع',
 FALSE,
 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- 5) SEED — أسابيع المسار الرئيسي (0..9 مثل CS50 تمامًا)
-- =====================================================================

INSERT INTO weeks (course_id, week_number, title, summary, content, video_url, duration) VALUES
((SELECT id FROM courses WHERE slug='cyber-basics'), 0,
 'مقدمة إلى الأمن السيبراني — whoami؟',
 'ما هو الأمن السيبراني؟ أنواع المهاجمين، القبعات الثلاث، ومفاهيم CIA.',
 E'مرحبًا بك في عالم الأمن السيبراني! في هذا الأسبوع نتعرف على ماهية الأمن السيبراني ولماذا هو من أسرع المجالات نموًا في العالم.\n\nنتناول الثلاثية الذهبية CIA: السرية (Confidentiality) والسلامة (Integrity) والتوافر (Availability)، وكيف تنساب كل قراراتنا الأمنية منها.\n\nنفرّق بين القبعة البيضاء والقبعة الرمادية والقبعة السوداء، ونناقش القوانين والأخلاقيات: ما هو الاختراق الأخلاقي؟ ومتى تتحول المهارة إلى جريمة؟\n\nفي نهاية الأسبوع تكتب أول ملاحظاتك في ملف notes.md وتنشئ حسابك على منصة TryHackMe للتطبيق العملي.',
 'https://www.youtube.com/embed/5MgBikgcWnY', '45 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 1,
 'أساسيات الشبكات',
 'من الكابلات إلى البروتوكولات: كيف يتحدث جهازان؟',
 E'كل هجوم يبدأ من فهم الشبكة. في هذا الأسبوع نغطي نموذج OSI بطبقاته السبعة ونموذج TCP/IP عمليًا.\n\nنتعلم كيف تعمل عناوين IP (IPv4 و IPv6)، وكيف يترجم DNS الأسماء إلى عناوين، وكيف تتم المصافحة الثلاثية TCP.\n\nنطبّق بأدوات مثل ping و traceroute و netstat ونقرأ حزم الشبكة باستخدام Wireshark.\n\nالتمرين: التقط حزمًا من متصفحك وحلل رحلة طلب واحد من جهازك إلى جوجل والعودة.',
 'https://www.youtube.com/embed/P10e5sWWHHU', '55 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 2,
 'لينكس وسطر الأوامر',
 'سلاح الأمن السيبراني الأول — التيرمينال',
 E'لينكس هو نظام التشغيل الذي يعمل عليه 90% من الخوادم في العالم، وكل أدوات الاختراق تعمل عليه.\n\nنتعلم بنية الملفات، وصلاحيات chmod، وأهم الأوامر: ls, cd, grep, cat, find, nano, و pipes.\n\nنتعلم أساسيات Bash scripting: المتغيرات والحلقات والشروط، ونكتب أول سكريبت أتمتة.\n\nالتمرين: ثبّت Kali Linux في VirtualBox أو WSL، وأنشئ مستخدمًا جديدًا بصلاحيات محددة واكتب سكريبت يعرض حالة النظام.',
 'https://www.youtube.com/embed/ROjZy1WbCIA', '60 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 3,
 'التشفير والهاش',
 'كيف تُشفَّر أسرارك؟ من قيصر إلى RSA',
 E'التشفير هو قلب الأمن الحديث. نبدأ بالتاريخ: شيفرة قيصر والإيجماتا، ثم ننتقل للتشفير الحديث.\n\nنتعلم الفرق بين التشفير المتماثل (AES) وغير المتماثل (RSA و ECC)، ومتى نستخدم كلًا منهما، وكيف تعمل المفاتيح العامة والخاصة.\n\nنتعلم دوال الهاش SHA-256 و MD5 وأهميتها في تخزين كلمات المرور، وفهمنا لماذا نستخدم Salt.\n\nالتمرين: استخدم OpenSSL لتشفير ملف وفك تشفيره، واكسر هاش MD5 ضعيف باستخدام أداة hashcat (على كلمة مرور تدريبية فقط!).',
 'https://www.youtube.com/embed/6TlVqD3r19w', '65 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 4,
 'أمن الويب — OWASP Top 10',
 'نافذة الإنترنت إلى العالم... وأكبر سطح هجوم',
 E'تطبيقات الويب هي الهدف الأول للمهاجمين اليوم. نتعرف على أبرز 10 ثغرات وفق مشروع OWASP.\n\nنتعمق في حقن SQL (SQLi) والبرمجة النصية عبر المواقع (XSS)، ونفهم الفرق بين XSS المخزنة والمعكوسة.\n\nنتعلم ثغرات كسر المصادقة (Broken Authentication) و IDOR وسوء الإعدادات الأمنية.\n\nالتمرين: طبّق ما تعلمته على منصة OWASP Juice Shop أو PortSwigger Web Security Academy وحل أول 5 تحديات.',
 'https://www.youtube.com/embed/4XrPWL2n6YY', '60 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 5,
 'الاستخبارات مفتوحة المصدر OSINT',
 'افتح أي ملف شخصي... بالمعلومات المتاحة للعموم',
 E'أقوى أداة للمهاجم (والمدافع) هي المعلومات المتاحة للعموم. في هذا الأسبوع نتعلم فن جمع المعلومات.\n\nنتدرب على أدوات مثل Maltego و theHarvester و Shodan و Google Dorks للبحث المتقدم.\n\nنتعلم تحليل البريد الإلكتروني والصور (Exif) والبيانات الوصفية، وقواعد البيانات المُسرّبة.\n\nالتمرين: اجمع ملف معلومات (Dossier) عن شركة تدريبية وهمية وأعد تقريرًا بكل المعلومات التي وجدتها وقيمتها الأمنية.',
 'https://www.youtube.com/embed/lMH1VvF5fLo', '50 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 6,
 'اختبار الاختراق: الاستطلاع والمسح',
 'منطقة العمليات: اعرف هدفك قبل أي خطوة',
 E'ندخل قلب اختبار الاختراق بمنهجية واضحة ومراحل قابلة للتوثيق.\n\nنتعلم مراحل الاستطلاع (Reconnaissance) السلبي والنشط، وفحص المنافذ باستخدام Nmap بمختلف تقنياته.\n\nنتعلم تعداد الخدمات والإصدارات (Fingerprinting) وتحديد نقاط الدخول المحتملة.\n\nالتمرين: افحص جهازك أو جهاز متصفحك في مختبرك المحلي، ووثّق كل منفذ مفتوح وخدمة تعمل عليه في تقرير.',
 'https://www.youtube.com/embed/XjQwE-JlyeM', '70 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 7,
 'الاستغلال والتصعيد',
 'من ثغرة إلى وصول كامل — بمسؤولية',
 E'هنا يبدأ الجزء الممتع: تحويل الثغرات التي اكتشفناها إلى وصول فعلي.\n\nنتعلم استخدام Metasploit، وثغرات الحقن عبر الأوامر، ورفع الصلاحيات على لينكس وويندوز.\n\nنتعلم نسخ الملفات (Meterpreter)، والحفاظ على الوصول، وتغطية الآثار — بمفاهيم نظرية في مختبر آمن.\n\nتنبيه قانوني مهم: كل التمارين داخل مختبر شخصي آمن فقط. اختبار أي نظام لا تملك إذنًا كتابيًا باختباره هو جريمة يعاقب عليها القانون في كل الدول.',
 'https://www.youtube.com/embed/LbOsZ2W7lIw', '75 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 8,
 'التحقيق الجنائي الرقمي',
 'بعد الاختراق: احفظ الأدلة واقرأ القصة',
 E'المحقق الجنائي هو من يقرأ قصة الحادثة من آثارها الرقمية.\n\nنتعلم أصول التعامل مع الأدلة: عدم التعديل (Chain of Custody)، ونسخ الصور الجنائية بأدوات مثل dd و FTK Imager.\n\nنتدرب على تحليل سجلات النظام، واستعادة الملفات المحذوفة، وقراءة بيانات المتصفح.\n\nالتمرين: استرجع 3 ملفات محذوفة من صورة جنائية وثبّت خطواتك في تقرير بالتفصيل.',
 'https://www.youtube.com/embed/HXv8_1PAY7s', '60 دقيقة'),

((SELECT id FROM courses WHERE slug='cyber-basics'), 9,
 'مشروع التخرج — ثغرة من اختيارك',
 'التخرج: من متعلم إلى مختبر حقيقي',
 E'حان وقت إثبات ما تعلمته. المشروع: اختر مجالًا واحدًا مما درسناه (ويب، شبكات، OSINT، جنائي...).\n\nالمطلوب: إعداد مختبر آمن، تنفيذ اختبار كامل بمنهجية، وتوثيق كل خطوة في تقرير احترافي يشمل: نطاق العمل، الأدوات، الثغرات المكتشفة، خطوات الاستغلال، التوصيات، وكيفية الإصلاح.\n\nسنراجع المشاريع في جلسة مباشرة ونناقشها، وسيحصل الخريجون على شهادة إتمام المسار.\n\nبالتوفيق! هذا أول مشروع في مسيرتك في عالم الأمن السيبراني.',
 'https://www.youtube.com/embed/VZqgMdVPpYU', '90 دقيقة')
ON CONFLICT (course_id, week_number) DO NOTHING;

-- =====================================================================
-- 6) SEED — أسابيع المسارات الأخرى
-- =====================================================================

INSERT INTO weeks (course_id, week_number, title, summary, content, video_url, duration) VALUES
-- Network Security
((SELECT id FROM courses WHERE slug='network-security'), 1, 'أساسيات الشبكات والموديلات', 'OSI و TCP/IP وطبقاتهما', E'نراجع نموذج OSI و TCP/IP بمقارنة عملية، ونفهم دور كل طبقة في رحلة الحزمة.\n\nالتمرين: حلّل حزمة HTTP كاملة في Wireshark وتتبّعها عبر الطبقات.', 'https://www.youtube.com/embed/Q0JcQKs80jk', '50 دقيقة'),
((SELECT id FROM courses WHERE slug='network-security'), 2, 'بروتوكولات DNS و DHCP و ARP', 'كيف يعمل النظام قبل أن تفتح المتصفح', E'نتعلم كيف يتحول اسم الدومين إلى عنوان IP، وكيف تُوزّع العناوين، ولماذا تتعرض هذه البروتوكولات للهجمات.\n\nالتمرين: نفّذ هجوم ARP Spoofing في مختبرك وراقب النتيجة في Wireshark.', 'https://www.youtube.com/embed/7k7x3cH6KKQ', '55 دقيقة'),
((SELECT id FROM courses WHERE slug='network-security'), 3, 'هجمات الرجل في المنتصف (MITM)', 'التنصت على حركة البيانات', E'نتعلم كيف يعترض المهاجم الاتصالات بين طرفين، وأدوات مثل Bettercap و Ettercap.\n\nالتمرين: اعترض جلسة HTTP داخل مختبرك واقرأ البيانات المتبادلة، ثم طبّق الحماية.', 'https://www.youtube.com/embed/1z5U4Q6Tj2w', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='network-security'), 4, 'الجدران النارية و IDS/IPS', 'بناء خط الدفاع الأول', E'نتعلم قواعد جدار الحماية باستخدام iptables و pfSense، وأنظمة كشف ومنع التسلل.\n\nالتمرين: اكتب قواعد تمنع منفذًا وتسمح بآخر، وراقب التنبيهات في Snort.', 'https://www.youtube.com/embed/8hVTx8eBJdw', '55 دقيقة'),
((SELECT id FROM courses WHERE slug='network-security'), 5, 'شبكات VPN و الأمان اللاسلكي', 'تأمين الاتصالات في كل مكان', E'نتعلم كيف تعمل بروتوكولات VPN والأنفاق، وأمن شبكات Wi-Fi وهجمات WPA2/3.\n\nالتمرين: افحص شبكة لاسلكية بمختبرك وحلل المصافحة الأربعية.', 'https://www.youtube.com/embed/Y5j1x8VqGBE', '50 دقيقة'),
((SELECT id FROM courses WHERE slug='network-security'), 6, 'مشروع: شبكة محمية متكاملة', 'من الصفر إلى شبكة آمنة', E'مشروع ختامي: ابنِ شبكة صغيرة بجدار ناري، قسّمها إلى مناطق (Segmentation)، وأمّن الخدمات، ووثّق التصميم في تقرير أمني كامل.', '', '90 دقيقة'),

-- Web Security
((SELECT id FROM courses WHERE slug='web-security'), 1, 'كيف يعمل الويب', 'HTTP, Cookies, Sessions, CORS', E'نفهم بنية طلبات HTTP بدقة: الحالات، الترويسات، الكوكيز، والجلسات، ودور CORS و Same-Origin Policy.\n\nالتمرين: استخدم Burp Suite و DevTools لقراءة الطلبات وتعديلها.', 'https://www.youtube.com/embed/7dK_3m7iTzY', '50 دقيقة'),
((SELECT id FROM courses WHERE slug='web-security'), 2, 'حقن SQL (SQLi)', 'الثغرة الأشهر في التاريخ', E'نتعلم أنواع حقن SQL: القائم على الأخطاء، الأعمى القائم على الزمن، والموحّد.\n\nالتمرين: حلّ تحديات SQLi على PortSwigger حتى المستوى المتقدم.', 'https://www.youtube.com/embed/ci1P3k5cY1s', '65 دقيقة'),
((SELECT id FROM courses WHERE slug='web-security'), 3, 'XSS و CSRF', 'هجمات المتصفح الخفية', E'نتعلم الثغرات التي تعمل داخل متصفح الضحية: XSS بأنواعها و CSRF وخطفة الجلسات.\n\nالتمرين: اكتب XSS مخزنة تعرض كلمة سر جلسة وهمية في بيئة تدريب.', 'https://www.youtube.com/embed/nsT2g4H9Y1w', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='web-security'), 4, 'كسر المصادقة والتفويض', 'IDOR و JWT والجلسات', E'نتعلم ثغرات المصادقة: تجاوز تسجيل الدخول، سرقة JWT، وتلاعب الأدوار (Privilege Escalation).\n\nالتمرين: اكتشف ثغرة IDOR في تطبيق تدريبي وغيّر دور مستخدمك.', 'https://www.youtube.com/embed/7I2_5q6cJ4s', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='web-security'), 5, 'أدوات الفحص الآلي للويب', 'Burp Suite و Nuclei و OWASP ZAP', E'نتعلم أتمتة فحص الثغرات وتقليل الضوضاء، وكتابة قواعد API مخصصة.\n\nالتمرين: افحص تطبيق تدريبي ووثّق النتائج في تقرير.', 'https://www.youtube.com/embed/3wJ3c2l7sE0', '55 دقيقة'),
((SELECT id FROM courses WHERE slug='web-security'), 6, 'مشروع: اختبار تطبيق ويب كامل', 'من الاستطلاع إلى التقرير', E'اختبار اختراق كامل لتطبيق ويب تدريبي: 6 ثغرات على الأقل موثقة بتقارير احترافية مع خطوات الإصلاح.', '', '90 دقيقة'),

-- Ethical Hacking
((SELECT id FROM courses WHERE slug='ethical-hacking'), 1, 'منهجية الاختبار وبناء المختبر', 'أنشئ ملعبك الآمن وقواعد اللعبة', E'نتعرف على منهجيات PTES و OWASP، ونبني مختبرًا بجهازين افتراضيين على الأقل.\n\nالتمرين: جهّز مختبرك وأوجد جهاز التدريب Metasploitable.', 'https://www.youtube.com/embed/5J8l6uUzE2A', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='ethical-hacking'), 2, 'الاستطلاع والتعداد', 'Nmap و Gobuster و Enum4linux', E'نتعمق في استطلاع الشبكات والخدمات: فحص المنافذ، تعداد SMB و HTTP والدلائل المخفية.\n\nالتمرين: نفّذ تعدادًا شاملاً على جهاز مختبرك.', 'https://www.youtube.com/embed/7Fq1k4tR9Ds', '70 دقيقة'),
((SELECT id FROM courses WHERE slug='ethical-hacking'), 3, 'الاستغلال و Metasploit', 'من ثغرة معروفة إلى شل', E'نتعلم أتمتة الاستغلال بـ Metasploit، وكتابة Payloads، والتحكم في الجلسات (Meterpreter).\n\nالتمرين: استغل جهاز تدريب واحصل على شل داخل مختبرك.', 'https://www.youtube.com/embed/X6sL9yW3kQ8', '75 دقيقة'),
((SELECT id FROM courses WHERE slug='ethical-hacking'), 4, 'تصعيد الصلاحيات', 'من مستخدم عادي إلى root', E'نتعلم تصعيد الصلاحيات على لينكس (SUID، Cron، Kernel) وويندوز، وكيف نفحص النظام يدويًا.\n\nالتمرين: صعّد صلاحياتك على جهاز تدريب باستخدام 3 طرق مختلفة.', 'https://www.youtube.com/embed/2v7M4kQ9zT0', '70 دقيقة'),
((SELECT id FROM courses WHERE slug='ethical-hacking'), 5, 'اختراق كلمة المرور', 'Hashcat و John the Ripper', E'نتعلم استخراج الهاشات وهجوم القاموس والقوة الغاشمة بعقلانية، وبناء قوائم كلمات ذكية.\n\nالتمرين: اكسر هاشات من أنواع مختلفة في مختبرك.', 'https://www.youtube.com/embed/4kS8mJ0rW5E', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='ethical-hacking'), 6, 'مشروع: اختراق HTB كامل', 'جهاز كامل من الصفر إلى root', E'اخترق جهازًا من منصة HackTheBox أو TryHackMe بمستوى سهل-متوسط، ووثّق كل خطوة بتقرير يشرح كيف ولماذا.', '', '120 دقيقة'),

-- Digital Forensics
((SELECT id FROM courses WHERE slug='digital-forensics'), 1, 'أساسيات التحقيق الرقمي', 'الأدلة وسلسلة الحفظ', E'نتعلم مفاهيم الاستجابة للحوادث رقميًا: أي بيانات نجمع أولًا؟ وكيف نضمن عدم تلوث الأدلة؟\n\nالتمرين: وثّق سلسلة حفظ وهمية لحادثة.', 'https://www.youtube.com/embed/3k8fL0uW2nQ', '50 دقيقة'),
((SELECT id FROM courses WHERE slug='digital-forensics'), 2, 'الصور الجنائية والاستنساخ', 'dd و FTK Imager و Autopsy', E'نتعلم نسخ الأقراص بتقنيات الفورنسك وتجنب الكتابة فوق الأدلة، وبدء التحليل في Autopsy.\n\nالتمرين: أنشئ صورة جنائية لقرص تدريبي.', 'https://www.youtube.com/embed/8tW9mE0vQ5A', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='digital-forensics'), 3, 'تحليل الأنظمة والسجلات', 'Windows Event Logs و Linux Logs', E'نقرأ سجلات الأحداث لنتتبع المهاجم: تسجيلات الدخول، المهام المجدولة، والأوامر المنفذة.\n\nالتمرين: حدد وقت وتفاصيل تسجيل دخول مشبوه من سجلات تدريبية.', 'https://www.youtube.com/embed/0sY7hK2j8Qc', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='digital-forensics'), 4, 'تحليل الذاكرة', 'Volatility والبرامج الخفية', E'نتعلم التقاط صور الذاكرة وتحليل العمليات والشبكات والمخلفات، واكتشاف البرمجيات الخبيثة.\n\nالتمرين: اكتشف عملية خبيثة مدفونة في صورة ذاكرة تدريبية.', 'https://www.youtube.com/embed/9uW3fJ5vR6k', '70 دقيقة'),
((SELECT id FROM courses WHERE slug='digital-forensics'), 5, 'استعادة الملفات وتحليل البريد', 'منسوخات في كل مكان', E'نتعلم استعادة الملفات المحذوفة من أنظمة الملفات، وتحليل رؤوس الملفات المزيفة، وقراءة رسائل البريد.\n\nالتمرين: استرجع ملفات من صورة تدريبية واكشف التلاعب.', 'https://www.youtube.com/embed/2dR8tK4wN1m', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='digital-forensics'), 6, 'مشروع: تقرير تحليل حادثة', 'من الأدلة إلى المحكمة', E'تحليل كامل لحادثة تدريبية: حافظ على الأدلة، حلل، واستنتج، واكتب تقريرًا جنائيًا احترافيًا بصيغة مقبولة قانونيًا.', '', '90 دقيقة'),

-- Blue Team
((SELECT id FROM courses WHERE slug='blue-team'), 1, 'مدخل الدفاع السيبراني', 'فكر كمدافع: النماذج والاستراتيجيات', E'نتعرف على نموذج Cyber Kill Chain و MITRE ATT&CK، وكيف نبني دفاعًا على طبقات.\n\nالتمرين: خريطة ATT&CK لسيناريو هجوم معروف.', 'https://www.youtube.com/embed/5aV0tJ8k3Wc', '50 دقيقة'),
((SELECT id FROM courses WHERE slug='blue-team'), 2, 'بناء SIEM مصغر', 'جمع السجلات في مكان واحد', E'نتعلم جمع السجلات من مصادر مختلفة وتطبيعها، وبناء لوحات مراقبة أساسية.\n\nالتمرين: اجمع سجلات من 3 مصادر في أدوات مفتوحة المصدر.', 'https://www.youtube.com/embed/6bN9vT4s0Xf', '60 دقيقة'),
((SELECT id FROM courses WHERE slug='blue-team'), 3, 'الصيد التهديدي (Threat Hunting)', 'ابحث عن المهاجم قبل أن يضرب', E'نتعلم بناء فرضيات هجوم والبحث عنها في السجلات: تسجيلات الدخول الغريبة، الأوامر المشبوهة.\n\nالتمرين: نفّذ عملية صيد تهديدي على سجلات تدريبية.', 'https://www.youtube.com/embed/7cW2uQ8pL1d', '65 دقيقة'),
((SELECT id FROM courses WHERE slug='blue-team'), 4, 'الاستجابة للحوادث', 'خطة الـ 6 خطوات: من الاحتواء إلى الدروس المستفادة', E'نتعلم مراحل الاستجابة: التحضير، التحديد، الاحتواء، الاستئصال، التعافي، والدروس.\n\nالتمرين: نفّذ سيناريو استجابة كامل لحادثة تدريبية.', 'https://www.youtube.com/embed/8dX3rE9sA2k', '70 دقيقة'),
((SELECT id FROM courses WHERE slug='blue-team'), 5, 'إدارة الثغرات والتصحيح', 'أغلق الأبواب قبل أن تُطرق', E'نتعلم بناء برنامج إدارة ثغرات: الفحص، التقييم، الأولوية، والتصحيح مع إدارة المخاطر.\n\nالتمرين: قيّم وأولوية 10 ثغرات على أصول افتراضية.', 'https://www.youtube.com/embed/9eY4tU7bC3p', '55 دقيقة'),
((SELECT id FROM courses WHERE slug='blue-team'), 6, 'مشروع: مركز عمليات أمنية مصغر', 'SOC على ميزانية صفر', E'ابنِ مركز عمليات أمنية مصغرًا: سجلات، تنبيهات، لوحة مراقبة، وخطة استجابة موثقة وجاهزة للعرض.', '', '90 دقيقة')
ON CONFLICT (course_id, week_number) DO NOTHING;

-- =====================================================================
-- 7) أمثلة كويريات التطبيق (Application Queries)
--    نفس الاستعلامات التي يستخدمها الباك إند — جاهزة للاستخدام
-- =====================================================================

-- أ) تسجيل مستخدم جديد (نفّذها من الكود مع hash لكلمة المرور)
-- INSERT INTO users (name, email, password_hash, role) VALUES ('Ali', 'ali@mail.com', '<bcrypt_hash>', 'student');

-- ب) التحقق من تسجيل الدخول
-- SELECT id, name, role FROM users WHERE email = 'ali@mail.com' AND is_active = TRUE;

-- ج) الكورسات مع عدد الأسابيع وعدد الطلاب
-- SELECT c.slug, c.title, c.level, c.icon,
--        COUNT(DISTINCT w.id)  AS weeks_count,
--        COUNT(DISTINCT e.id)  AS students_count
-- FROM courses c
-- LEFT JOIN weeks w       ON w.course_id = c.id
-- LEFT JOIN enrollments e ON e.course_id = c.id
-- GROUP BY c.id ORDER BY c.sort_order;

-- د) تسجيل طالب في كورس
-- INSERT INTO enrollments (user_id, course_id)
-- VALUES (1, (SELECT id FROM courses WHERE slug = 'cyber-basics'))
-- ON CONFLICT DO NOTHING;

-- هـ) إتمام أسبوع (التبديل: إن وُجد يُحذف، وإلا يُضاف)
-- DELETE FROM progress WHERE user_id = 1 AND week_id = 3 RETURNING id;
-- INSERT INTO progress (user_id, week_id) VALUES (1, 3) ON CONFLICT DO NOTHING;

-- و) تقدم الطالب في كل كورساتها
-- SELECT c.title,
--        COUNT(DISTINCT w.id)                    AS total_weeks,
--        COUNT(DISTINCT p.id)                    AS completed_weeks,
--        ROUND(100.0 * COUNT(DISTINCT p.id) / NULLIF(COUNT(DISTINCT w.id), 0)) AS percent
-- FROM enrollments e
-- JOIN courses c ON c.id = e.course_id
-- LEFT JOIN weeks w ON w.course_id = c.id
-- LEFT JOIN progress p ON p.week_id = w.id AND p.user_id = e.user_id
-- WHERE e.user_id = 1
-- GROUP BY c.id;

-- ز) إجمالي إحصائيات الطالب
-- SELECT COUNT(DISTINCT course_id) AS enrolled_courses,
--        (SELECT COUNT(*) FROM progress WHERE user_id = 1) AS completed_weeks
-- FROM enrollments WHERE user_id = 1;

-- ح) رسائل التواصل الأحدث
-- SELECT name, email, message, created_at FROM contacts ORDER BY created_at DESC LIMIT 50;

-- ط) أعلى الطلاب إنجازًا (لوحة المتصدرين)
-- SELECT u.name, COUNT(p.id) AS completed_weeks
-- FROM users u LEFT JOIN progress p ON p.user_id = u.id
-- GROUP BY u.id ORDER BY completed_weeks DESC LIMIT 10;

COMMIT;
