# متجر مزارع ومناحل الثنيان الكويتية (Storefront) 🌿🛒

هذا هو مستودع **متجر الزبائن المستقل** لمزارع ومناحل الثنيان الكويتية.
تم فصله بالكامل عن لوحة التحكم لضمان أعلى مستويات الأمان والسرية وسرعة التصفح للعملاء.

---

## 🚀 طريقة رفع هذا المشروع على GitHub في مستودع مستقل

### 1. أنشئ مستودعاً جديداً على GitHub:
1. توجه إلى [GitHub.com/new](https://github.com/new).
2. قم بتسمية المستودع مثلاً: `mazarie-store`.
3. اختر نوع المستودع: **Public** أو **Private**.
4. اضغط **Create repository**.

### 2. افتح مجلد المشروع ونفّذ الأوامر التالية:
```bash
# 1. الدخول لمجلد المتجر
cd exports/store-app

# 2. تهيئة Git
git init

# 3. إضافة جميع الملفات
git add .

# 4. حفظ التغييرات
git commit -m "Initial commit: Complete Storefront with K-NET & Firebase integration"

# 5. تعيين الفرع الرئيسي
git branch -M main

# 6. ربط المستودع بحسابك على GitHub (استبدل YOUR_USERNAME باسم مستخدمك)
git remote add origin https://github.com/YOUR_USERNAME/mazarie-store.git

# 7. رفع الكود إلى GitHub
git push -u origin main
```

---

## 🌐 النشر المباشر (Deployment):
يمكنك ربط هذا المستودع مباشرة مع منصات الاستضافة المجانية السريعة:
- **Vercel** (بنقرة واحدة عبر استيراد مستودع `mazarie-store`)
- **Netlify**
- **Cloudflare Pages**
- **Firebase Hosting** (`npm run build` ثم `firebase deploy`)

أمر التشغيل محلياً:
```bash
npm install
npm run dev
```

أمر البناء للإنتاج:
```bash
npm run build
```
