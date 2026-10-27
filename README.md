# 🩺 AarogyaSaathi — Health AI Summarizer

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-orange.svg)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AarogyaSaathi** is an enterprise-grade Clinical Health AI platform that transforms complex medical reports (PDFs, lab printout scans, and text) into clear, patient-friendly health insights, longitudinal biomarker tracking, and AI-assisted care navigation.

---

## 🏗️ Architecture: The 7 Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AarogyaSaathi Frontend (React + Vite)                │
│  [Dashboard] [Timeline] [Trends] [Compare] [Glossary] [Visit Prep]     │
│  [Chatbot RAG] [Specialist GPS] [3D Anatomy] [Multilingual]            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Express.js Backend API (Node.js LTS)                  │
├──────────────────┬───────────────────┬─────────────────────────────────┤
│ Pillar 1: API    │ Pillar 2: DBMS    │ Pillar 3: Object Storage        │
│ Express REST     │ PostgreSQL 15+    │ Local & Cloudinary Adapters     │
│ Routes & CORS    │ (Supabase/Neon)   │ Direct Stream Streaming         │
├──────────────────┼───────────────────┼─────────────────────────────────┤
│ Pillar 4: OCR    │ Pillar 5: AI/LLM  │ Pillar 6: Multi-Patient Privacy │
│ Pure WebAssembly │ Google Gemini RAG │ Family Roster & Session Auth    │
│ Tesseract.js     │ Clinical NLP      │ Row-Level Security (RLS)        │
├──────────────────┴───────────────────┴─────────────────────────────────┤
│ Pillar 7: Third-Party Integrations (GPS Specialist Clinic Locator)    │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Pillar 1: Backend API Engine** — Express REST API with input validation, CORS, and memory-buffered file uploads.
2. **Pillar 2: Relational DBMS & Vector RAG** — PostgreSQL (Supabase/Neon) with automatic DDL migrations, relational normalization (`patients`, `reports`, `biomarkers`), and vector embeddings. Features an automatic fallback to local JSON for zero-config offline development.
3. **Pillar 3: Cloud & Local Object Storage** — File storage adapter supporting both secure local disk storage and Cloudinary cloud CDN streaming.
4. **Pillar 4: Pure WebAssembly OCR & Clinical Parser** — Client/server WASM OCR powered by `tesseract.js` and `pdf-parse`, paired with fuzzy regex matching for robust biomarker extraction across noisy lab reports.
5. **Pillar 5: Clinical AI & Gemini RAG** — Retrieval-Augmented Generation (RAG) powered by Google Gemini 2.5 Flash, translating clinical jargon into accessible health guidance with actionable dietary advice.
6. **Pillar 6: Multi-Patient Privacy & Accounts** — Full family member account support (`usr-default`, `usr-spouse`, `usr-mother`, `usr-child`) with separate clinical histories.
7. **Pillar 7: Regional Integrations** — Live specialist clinic locator with interactive maps and multilingual support across major Indian languages (Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali).

---

## ✨ Features

- 📑 **Instant Report Summarization**: Upload medical lab reports in PDF, JPG, PNG, or TXT format and receive structured summaries in seconds.
- 🩸 **Biomarker Extraction**: Automatically extracts Hemoglobin, Fasting Blood Glucose, Serum Creatinine, Platelet Count, WBC, Vitamin D3, LDL Cholesterol, and flags them as `NORMAL`, `LOW`, `HIGH`, `BORDERLINE`, or `ATTENTION`.
- 📈 **Longitudinal Trend Graphs**: Interactive Recharts visualizations plotting clinical metrics over time to spot health changes early.
- ⚖️ **Multi-Report Comparison**: Side-by-side comparison of past and present test results highlighting improvements or regressions.
- 💬 **Gemini AI Medical Chatbot**: Ask natural questions like *"What does my low hemoglobin mean?"* or *"What foods should I eat?"* grounded in your actual report history.
- 📋 **Doctor Visit Prep Kit**: Generates tailored questions and talking points for your next physician consultation based on your active report anomalies.
- 🗺️ **Specialist Locator**: Locates vetted local clinics and specialists with direct contact info and distance calculation.
- 🫀 **3D Interactive Anatomy**: Visual map exploring bodily systems, common symptoms, and associated diagnostic tests.
- 🌐 **Multilingual Translation**: Seamless translation into Hindi, Marathi, Gujarati, Tamil, Telugu, and Bengali.

---

## 📁 Repository Structure

```
HealthAI_Summarizer/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow (Build & Test)
├── backend/
│   ├── data/                  # Local DBMS fallback & .gitkeep
│   ├── uploads/               # Seed reports & upload storage
│   ├── .env.example           # Backend environment template
│   ├── database.js            # Key-value persistent store
│   ├── db_postgres.js         # Production PostgreSQL adapter (Supabase/Neon)
│   ├── db_relational.js       # Dual-mode DBMS router
│   ├── llm.js                 # Google Gemini RAG & Clinical NLP
│   ├── package.json           # Backend dependencies
│   ├── parser.js              # Pure WebAssembly OCR & regex biomarker parser
│   ├── schema.sql             # PostgreSQL production schema with RLS
│   ├── server.js              # Express API server entry point
│   └── storage.js             # Local & Cloudinary object store adapter
├── sample_reports/            # Ready-to-use sample lab reports for testing
│   ├── Ananya_Blood_Report_September.pdf
│   ├── Ananya_CBC_August.pdf
│   ├── Ananya_Health_Check_July.jpg
│   └── Sample_Lab_Report.txt
├── src/                       # Frontend React 18 + TypeScript application
│   ├── components/            # Reusable UI components
│   ├── context/               # Auth, Language, and Profile React Contexts
│   ├── pages/                 # Dashboard, Reports, Trends, Chatbot, etc.
│   └── services/              # API client and response normalizers
├── .env.example               # Frontend environment template
├── .gitattributes             # Line ending normalization rules
├── .gitignore                 # Secure Git ignore rules (secrets protected)
├── LICENSE                    # MIT Open Source License
├── package.json               # Frontend dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite bundler configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- *(Optional)* Free [Supabase](https://supabase.com/) account for cloud PostgreSQL
- *(Optional)* Free [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/vedikamukati51-ctrl/health-ai-summarizer-.git
cd health-ai-summarizer-
```

---

### Step 2: Configure Environment Variables

1. **Frontend Configuration:**
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `VITE_API_BASE_URL=http://localhost:5000`)*

2. **Backend Configuration:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Open `backend/.env` and configure your credentials:
   ```env
   PORT=5000

   # PostgreSQL Database (e.g. Supabase Session Pooler)
   DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > 💡 **Tip:** If `DATABASE_URL` is left empty, the server automatically uses the local JSON database so you can start developing offline immediately.

---

### Step 3: Install Dependencies & Run

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm run start
   ```
   The backend starts at `http://localhost:5000`.

2. **Start the Frontend Application:**
   Open a new terminal window at the project root:
   ```bash
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Settings (⚙️)** → **Database**.
3. Under **Connection string**, select **URI** and choose **Session Pooler (Port 5432)** or **Transaction Pooler (Port 6543)**.
4. Paste the connection string into `DATABASE_URL` in `backend/.env`.
5. **No manual migrations needed!** When the server starts, `db_postgres.js` automatically creates all tables, indexes, and seed patients.

---

## 🌐 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and 7-pillar operational status |
| `GET` | `/api/dashboard` | Latest analyzed report, key findings, and attention alerts |
| `GET` | `/api/reports` | List all historical reports for a patient |
| `POST` | `/api/reports/upload` | Upload report files (PDF / Images / Text) with OCR & parsing |
| `GET` | `/api/reports/:id` | Get details, extracted text, and biomarkers of a report |
| `DELETE` | `/api/reports/:id` | Delete a report and its associated biomarkers and physical file |
| `GET` | `/api/trends?parameter=...` | Longitudinal time-series data for a specific biomarker |
| `GET` | `/api/compare` | Compare two reports side-by-side |
| `GET` | `/api/users` | List all family patient profiles |
| `POST` | `/api/users` | Create or update a patient profile |
| `POST` | `/api/chat` | Clinical RAG chatbot powered by Gemini AI |
| `POST` | `/api/visit-prep/generate` | Generate questions for doctor consultation |

---

## 🚢 Cloud Deployment

### Backend (Render or Railway)
1. Link your GitHub repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables:
   - `PORT=5000`
   - `DATABASE_URL=your_supabase_connection_string`
   - `GEMINI_API_KEY=your_gemini_api_key`

### Frontend (Vercel or Netlify)
1. Link your GitHub repository.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL=https://your-backend-app.onrender.com`

---

## ⚠️ Medical Safety & Disclaimer

This platform is designed for educational, organizational, and informational purposes only. The summaries and insights generated by the AI do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical condition or laboratory results.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
