# Galina Smart Export AI - Agro-Export Intelligence Platform
### منصة الذكاء التصديري الزراعي والربط التجاري الدولي لشركة جالينا

[![CI Build & Lint](https://github.com/aaelshamy/galina-export-ai/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌍 Overview | نظرة عامة
**Galina Smart Export AI** is a state-of-the-art enterprise B2B intelligence and CRM platform engineered for agricultural exporters (specializing in IQF Frozen Fruits, Vegetables, and Fresh Produce from Egypt). It equips export directors, sales executives, and commercial teams with autonomous market prospecting, sourcing intent detection, verified buyer dossiers, multichannel communications, and bilingual reporting.

منصة متطورة لإدارة الذكاء التصديري وربط مصدري الحاصلات الزراعية والخضار والفواكه المجمدة (IQF) بكبرى سلاسل التوريد والمستوردين والموزعين الدوليين في أوروبا، بريطانيا، أمريكا الشمالية، والخليج العربي.

---

## ✨ Key Capabilities & Features | المزايا والخصائص الرئيسية

- 🔍 **AI Market Finder (كاشف الأسواق الذكي)**:
  - Deep buyer discovery across major target markets (Germany, UK, USA, France, Canada, Saudi Arabia, UAE, Netherlands, Poland, Spain).
  - Identification of Importer Types: Large Supermarket Chains, Food Processors, Foodservice (HoReCa), Private Label Packers, Cold Storage Hubs.
  - Agro Sourcing Intent Score (`⚡ Agro Intent %`) detecting immediate buying signals, supply chain shortages, and tender deadlines.

- 🏢 **100% Authentic Business Data (بيانات تجارية موثقة)**:
  - Verified Procurement Directors & Category Purchasing Managers.
  - Official procurement emails and direct corporate contact channels.
  - Real international phone numbers with direct WhatsApp chat integration (`💬 Direct WhatsApp`).
  - Physical headquarters addresses and official corporate websites (`🌐 Official Website`).

- 📑 **Comprehensive B2B Intelligence Dossier (الملف التجاري المتكامل)**:
  - Required crop profiles (IQF Strawberry, IQF Mango, Broccoli florets, Artichoke bottoms, Pomegranate arils).
  - Food safety compliance certifications required (BRCGS AA, IFS v8, GlobalG.A.P, Organic EU, Sedex SMETA).
  - Container volume estimations (Reefers/Year), Incoterms (CFR, CIF, FOB, DDP), and payment terms (LC at sight, CAD, OA).

- 📊 **Interactive B2B CRM Pipeline (مسار إدارة الصفقات والمبيعات)**:
  - Pipeline stages: `New Lead`, `Contacted`, `Negotiation`, `Quotation`, `Sample Sent`, `Won`, `Lost`.
  - Activity logs, internal deal notes, and one-click contact handoff.

- ✉️ **Gemini AI B2B Pitch Pitcher & Translator (منشئ ومترجم الإيميلات التصديرية)**:
  - Tailored cold pitch generator customized per buyer profile and target produce lot.
  - Multilingual AI translation into the buyer's native language (German, French, Italian, Spanish, Arabic, English).

- 📥 **Export to PDF & Excel CSV (تصدير التقارير)**:
  - One-click branded PDF Export with full tabular formatting and confidentiality seals.
  - Comprehensive CSV Export featuring UTF-8 BOM encoding for perfect Arabic & English compatibility in Microsoft Excel.

- 🌐 **Instant Bilingual Toggle (التبديل بين العربية والإنجليزية)**:
  - Seamless header toggle between English (`🇬🇧 English` - LTR) and Arabic (`🇪🇬 العربية` - RTL).
  - Full interface mirroring with localized terminology.

---

## 🛠️ Tech Stack | التقنيات المستخدمة

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Recharts
- **Backend / Server**: Node.js, Express, tsx, esbuild
- **AI Engine**: `@google/genai` (Google Gemini 2.5 / 2.0 SDK)
- **Document Generation**: jsPDF, jsPDF-AutoTable
- **CI / CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## 🚀 How to Connect to GitHub | طريقة الربط والرفع على GitHub

To push this codebase to your own GitHub repository (`github.com`):

### 1. Create a New Repository on GitHub
Go to [github.com/new](https://github.com/new) and create a repository (e.g. `galina-export-ai`). Do **not** initialize with README or .gitignore since they are already included here.

### 2. Connect Your Local / Cloned Repository
Open your terminal in this project's root folder and run:

```bash
# Initialize git (if not already initialized)
git init

# Set the default branch to main
git branch -M main

# Add your GitHub repository as the remote origin
# (Replace USERNAME and REPO with your actual GitHub username and repository name)
git remote add origin https://github.com/USERNAME/REPO.git

# Stage all files
git add .

# Commit your changes
git commit -m "feat: complete Galina Smart Export AI platform"

# Push to GitHub
git push -u origin main
```

---

## 💻 Local Development Setup | التشغيل المحلي

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** or **yarn**
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Installation
```bash
# Clone your repository
git clone https://github.com/USERNAME/REPO.git
cd REPO

# Install dependencies
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Open `.env` and set your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="your-actual-gemini-api-key"
PORT=3000
APP_URL="http://localhost:3000"
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts | الأوامر المتاحة

| Command | Description |
|---|---|
| `npm run dev` | Starts dev server on port 3000 with live compilation via `tsx server.ts` |
| `npm run build` | Builds production bundle with Vite and bundles server with esbuild into `dist/` |
| `npm run start` | Runs the production-built bundle via `node dist/server.cjs` |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) to verify code integrity |
| `npm run clean` | Cleans up `dist/` build directory |

---

## 🚢 Deployment Guide | دليل النشر السحابي

### Option A: Vercel / Railway / Render
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Render](https://render.com) or [Railway](https://railway.app).
2. Set Build Command: `npm run build`
3. Set Start Command: `npm run start`
4. Add Environment Variable: `GEMINI_API_KEY`

### Option B: Hostinger (استضافة هوستينجر)

#### 1. Hostinger Cloud / Web Hosting (مع ميزة Node.js):
- من لوحة التحكم **hPanel**، توجه إلى قسم **Advanced** -> **Node.js**.
- اضغط على **Create Application**.
- اختر إصدار Node: `Node.js 18.x` أو `20.x`.
- حدد مسار التطبيق: مجلد المشروع (Root Directory).
- عيّن ملف التشغيل الأساسي (**Application Startup File**): `dist/server.cjs`.
- أضف المتغير البيئي: `GEMINI_API_KEY`.
- قم بتشغيل أوامر التثبيت والبناء:
  ```bash
  npm install
  npm run build
  ```
- اضغط **Start Application**.

#### 2. Hostinger VPS (الخيار الأفضل عبر PM2):
- اتصل بالسيرفر عبر SSH:
  ```bash
  git clone https://github.com/USERNAME/REPO.git
  cd REPO
  npm install
  npm run build
  # تشغيل التطبيق بالخلفية عبر PM2
  pm2 start ecosystem.config.cjs
  pm2 save
  pm2 startup
  ```

### Option C: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
