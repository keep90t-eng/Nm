#!/bin/bash
set -e

echo "Creating exports/store-app..."
rm -rf exports/store-app
mkdir -p exports/store-app/src/components exports/store-app/src/data exports/store-app/src/lib exports/store-app/src/utils

# Copy shared configs and assets
cp -r public exports/store-app/
cp tsconfig.json exports/store-app/
cp vite.config.ts exports/store-app/
cp firebase-applet-config.json exports/store-app/
cp .env.example exports/store-app/
cp .gitignore exports/store-app/

# Copy store components (all except admin)
for f in src/components/*.tsx; do
  cp "$f" exports/store-app/src/components/
done

# Copy shared utils, data, lib
cp src/data/products.ts exports/store-app/src/data/
cp src/lib/*.ts exports/store-app/src/lib/
cp src/utils/*.ts exports/store-app/src/utils/
cp src/types.ts exports/store-app/src/
cp src/index.css exports/store-app/src/
cp src/main.tsx exports/store-app/src/

# Package.json for store
cat << 'PKG' > exports/store-app/package.json
{
  "name": "mazarie-storefront",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "firebase": "^12.18.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "tailwindcss": "^4.1.14",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2"
  }
}
PKG

# index.html for store
cat << 'HTML' > exports/store-app/index.html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/images/mazarie/nfc2.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>مزارع ومناحل الثنيان الكويتية | متجر المنتجات الطازجة</title>
    <meta name="description" content="الموقع الرسمي لمزارع ومناحل الثنيان - توصيل فوري ومبرد لكافة مناطق الكويت" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#025380] selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

echo "Creating exports/admin-app..."
rm -rf exports/admin-app
mkdir -p exports/admin-app/src/components/admin exports/admin-app/src/data exports/admin-app/src/lib exports/admin-app/src/utils

# Copy shared configs and assets
cp -r public exports/admin-app/
cp tsconfig.json exports/admin-app/
cp vite.config.ts exports/admin-app/
cp firebase-applet-config.json exports/admin-app/
cp .env.example exports/admin-app/
cp .gitignore exports/admin-app/

# Copy admin components
cp -r src/components/admin/* exports/admin-app/src/components/admin/

# Copy shared utils, data, lib
cp src/data/products.ts exports/admin-app/src/data/
cp src/lib/*.ts exports/admin-app/src/lib/
cp src/utils/*.ts exports/admin-app/src/utils/
cp src/types.ts exports/admin-app/src/
cp src/index.css exports/admin-app/src/
cp src/main.tsx exports/admin-app/src/

# Package.json for admin
cat << 'PKG' > exports/admin-app/package.json
{
  "name": "mazarie-admin-portal",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "firebase": "^12.18.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "tailwindcss": "^4.1.14",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2"
  }
}
PKG

# index.html for admin
cat << 'HTML' > exports/admin-app/index.html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/images/mazarie/nfc2.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>لوحة التحكم المركزية | مزارع ومناحل الثنيان</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-white font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

echo "Exports populated successfully!"
