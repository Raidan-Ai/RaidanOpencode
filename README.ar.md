# رايدان أوبنكود (RaidanOpencode)

> **نظام تشغيل هندسة وكلاء الذكاء الاصطناعي الموحّد لـ OpenCode**
> منسّق واحد (Orchestrator) · محرّك مهام واحد · محرّك سياسات واحد · بوابة نماذج واحدة — حول تثبيت OpenCode الحالي لديك.

[![CI](https://github.com/Raidan-Ai/RaidanOpencode/actions/workflows/ci.yml/badge.svg)](https://github.com/Raidan-Ai/RaidanOpencode/actions/workflows/ci.yml)
![الرخصة](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ما هو هذا المشروع؟

يحوّل RaidanOpencode أي تثبيت قائم لـ [OpenCode](https://opencode.ai) إلى منصة هندسة وكلاء مُحكَمة: سجلّات مرجعية (Registries) للوكلاء والمهام والمهارات وخدمات MCP، وتوجيه النماذج حسب القدرة (Capability-based Model Routing)، ونقطة اعتراض سياسات (Policy Choke-point) فوق كل عملية خطرة، وسجلّ رصد (Observability Ledger) — **دون عمل Fork لـ OpenCode** ودون استبدال أي إعدادات أو مهارات لديك.

سبب وجود المشروع: المنظومة مليئة بأكثر من عشرين أداة متداخلة (منسقون، لوحات تحكم، Harnesses) معظمها مربوط ببيئات POSIX أو رخصه لا تسمح بإعادة الاستخدام. لذلك يبني RaidanOpencode نسخة **واحدة فقط من كل نظام فرعي** (انظر [`docs/research/deduplication.md`](docs/research/deduplication.md)) ويعمل على ويندوز كمواطن من الدرجة الأولى.

## المبادئ الأساسية

```
بحث ← معمارية ← إزالة التكرار ← تنفيذ          OpenCode هو بيئة التنفيذ؛ ونحن طبقة التحكم فوقه
الحفاظ على إعدادات المستخدم ومهاراته            تثبيت Idempotent · نسخة احتياطية قبل التعديل · Dry-run افتراضياً
محلي أولاً (لا سحابة إلزامية)                    القياس عن بُعد (Telemetry) مغلق افتراضياً
تكافؤ ويندوز / لينكس / WSL                       الأسرار عبر {env:} و{file:} — أبداً داخل الملفات
```

## البنية (v0.3)

```
OpenCode Runtime ◄──── serve-API + Plugins + المجلدات الأصلية ────► طائرة تحكم رايدان
                                                                 │
   سجل الوكلاء        محرّك المهام       سجل المهارات      محرّك السياسات     ناقل الأحداث
   (Agent Registry)  (دورة حياة +      (فحص التكرار      (أربعة أنماط:    (سجل JSONL)
                      التبعيات)         بين النطاقات)     ALLOW/ASK/DENY)
```

## البداية السريعة

```powershell
# ويندوز
npm install
npm test
node dist\src\cli\index.js doctor
node dist\src\cli\index.js status
```

```bash
# لينكس / ماك
npm install && npm test && node dist/src/cli/index.js doctor
```

## أوامر الواجهة (CLI)

| الأمر | الوظيفة |
|---|---|
| `raidan doctor` | فحص البيئة: PASS/WARN/FAIL (Node/Git/إعداد OpenCode/المهارات) |
| `raidan status` | لقطة حالة: عدد الوكلاء والمهارات والمهام ونمط السياسة |
| `raidan config show` | عرض الإعدادات مدموجة **مع إخفاء الأسرار** (باسم المفتاح وبنمط القيمة) |
| `raidan agent list` / `inspect` | تصفح وكلاء OpenCode لديك كسجلات منظمة |
| `raidan skill duplicates` | كشف المهارات المكرّرة بين النطاق العام والمشروع |
| `raidan task create/list` | دورة حياة المهام الكنسية مع فرض التبعيات |
| `raidan policy check <domain> <action>` | معاينة حكم السياسة قبل التنفيذ |
| `raidan migrate backup` | نسخة احتياطية مؤرخة لإعدادات OpenCode خارج المستودع |

خريطة الطريق الكاملة (معالج الإعداد، موجّه النماذج، طبقة A2A، مشرف وقت التشغيل): مجلد [`docs/adr`](docs/adr).

## الأمان

- كل قرار بوابة قابل للتدقيق؛ الأنماط المدمّرة تُرفض DENY حتى في النمط الذاتي (Autonomous).
- `config show` يخفي القيم الشبيهة بالتوكن (`sk-` / `ghp_` / AWS) أينما كانت — حتى تحت أسماء حقول مضللة.
- CI يفحص المصادر المتتبعة بحثاً عن أنماط التوكنات عند كل دفع.
- انظر [SECURITY.md](SECURITY.md). اكتشفت ثغرة؟ أبلغ سرّياً من فضلك.

## التوثيق

English: [`docs/en`](docs/en) · Research: [`docs/research`](docs/research) (تحليل 21 مستودعاً مصدراً) · القرارات المعمارية: [`docs/adr`](docs/adr) · المصادر والإسناد: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

## الحالة

اكتملت المراحل 2–4 من أصل 13 (البحث ✓ المعمارية ✓ أساس النواة ✓). التالي: معالج الإعداد، موجّه النماذج والمزودين، طبقتا MCP/A2A، محرك الترحيل. المساهمات مرحّب بها.

## المؤلف

**ريدآن أمين (Raidan Ameen)** — [raidan.bio](https://raidan.bio/) · [GitHub @Raidan-Ai](https://github.com/Raidan-Ai) · [LinkedIn](https://www.linkedin.com/in/raidan-ameen/) · [Hugging Face RaidanPro](https://huggingface.co/RaidanPro) · [Yemen-JPT](https://huggingface.co/Yemen-JPT)

## الرخصة والإسناد

MIT — انظر [LICENSE](LICENSE). RaidanOpencode مشروع مستقل مستوحى من أعمال مفتوحة المصدر؛ العلامات التجارية لأصحابها؛ الإشارة إلى مشاريع لا تعني رعاية أو تأييداً. الاعتمادات الكاملة في [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
