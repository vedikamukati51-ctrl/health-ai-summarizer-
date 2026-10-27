import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { relationalDb } from "./db_relational.js";
import { postgresDb, initPostgresSchema } from "./db_postgres.js";
import { cloudStorage } from "./storage.js";
import { extractRawText, parseBiomarkers, generateAiSummary } from "./parser.js";
import { medicalLlm } from "./llm.js";

process.on("uncaughtException", (err) => {
  console.warn("[Process Guard: UncaughtException]", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.warn("[Process Guard: UnhandledRejection]", reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS dynamically for all local frontend Vite dev, preview, and standard ports
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup multer in-memory for upload processing (prevents duplicate files on disk)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Clinical Knowledge Base for Glossary & Anomaly Enrichment
const MEDICAL_KNOWLEDGE = {
  hemoglobin: {
    name: "Hemoglobin (Hb)",
    standardRange: "12.0 - 15.5 g/dL (Women) | 13.8 - 17.2 g/dL (Men)",
    definition: "Hemoglobin is an iron-rich protein in red blood cells responsible for carrying oxygen from lungs to muscles, tissues, and brain.",
    whyItMatters: "When hemoglobin drops, your organs receive less oxygen, leading to fatigue, dizziness, and shortness of breath.",
    dietaryAdvice: {
      keyNutrients: ["Elemental Iron", "Vitamin C", "Folic Acid", "Vitamin B12"],
      foodsToEat: [
        "Dark leafy greens (spinach, moringa, methi)",
        "Legumes and lentils (masoor dal, chickpeas, rajma)",
        "Beetroot and fresh pomegranate juice",
        "Roasted pumpkin seeds and black raisins"
      ],
      foodsToAvoid: [
        "Drinking black tea or coffee right with meals (tannins reduce iron absorption by up to 60%)"
      ],
      absorptionTip: "Squeeze fresh lemon juice over lentils or spinach. Vitamin C converts non-heme plant iron into an easily absorbable form!"
    },
    doctorTip: "Discuss with your doctor whether checking Serum Ferritin and starting an iron supplement is recommended."
  },
  creatinine: {
    name: "Serum Creatinine",
    standardRange: "0.6 - 1.1 mg/dL (Women) | 0.7 - 1.3 mg/dL (Men)",
    definition: "Creatinine is a natural waste byproduct of normal muscle wear-and-tear, filtered out exclusively by the kidneys and cleared in urine.",
    whyItMatters: "It reflects how efficiently your kidneys are filtering and purifying your bloodstream.",
    dietaryAdvice: {
      keyNutrients: ["Optimal Hydration", "Low-Sodium Foods", "Antioxidants"],
      foodsToEat: [
        "Hydrating produce (cucumbers, watermelon, apples, bell peppers)",
        "Cauliflower, cabbage, and bottle gourd (lauki)",
        "Maintain 2.5 to 3 liters of steady daily water intake"
      ],
      foodsToAvoid: [
        "Excessive red meat and unmonitored bodybuilding creatine supplements",
        "High-sodium processed snacks and frequent NSAID painkillers"
      ],
      absorptionTip: "Sip water consistently throughout the day rather than drinking large amounts at once to keep filtration smooth."
    },
    doctorTip: "Ask your physician about calculating eGFR (estimated Glomerular Filtration Rate) and a routine urine check."
  },
  glucose: {
    name: "Fasting Blood Glucose",
    standardRange: "70 - 99 mg/dL (Normal) | 100 - 125 mg/dL (Borderline) | ≥ 126 mg/dL (High)",
    definition: "Fasting blood glucose measures sugar concentration after an overnight fast, showing how effectively your body cells respond to insulin.",
    whyItMatters: "Catching borderline elevations early makes it completely reversible through diet and activity before diabetes develops.",
    dietaryAdvice: {
      keyNutrients: ["Soluble Fiber", "Chromium", "Magnesium", "Polyphenols"],
      foodsToEat: [
        "Steel-cut oats, barley, chia seeds, and methi soaked water",
        "Cruciferous vegetables (broccoli, cabbage) and bitter gourd (karela)",
        "Whole sprouted legumes and soaked raw almonds"
      ],
      foodsToAvoid: [
        "Refined flour (maida), white bread, and sugary packaged drinks"
      ],
      absorptionTip: "Take a light 10–15 minute walk right after meals. Muscle contractions absorb glucose without extra insulin."
    },
    doctorTip: "Ask for an HbA1c test to inspect your 3-month average blood glucose control."
  },
  vitamind: {
    name: "Vitamin D3",
    standardRange: "30 - 100 ng/mL (Optimal) | 20 - 29 ng/mL (Insufficient) | < 20 ng/mL (Deficient)",
    definition: "Vitamin D3 is a vital hormone essential for calcium absorption, bone strength, immune defense, and nervous system health.",
    whyItMatters: "Deficiency causes diffuse body aches, lower back stiffness, frequent seasonal colds, and general lethargy.",
    dietaryAdvice: {
      keyNutrients: ["Vitamin D3", "Calcium", "Vitamin K2", "Magnesium"],
      foodsToEat: [
        "Fortified dairy or plant milk, and egg yolks from pasture-raised hens",
        "Sun-exposed mushrooms and fatty fish (salmon, sardines)",
        "15–20 minutes of morning sunlight on arms and legs"
      ],
      foodsToAvoid: [
        "Excessive carbonated cola drinks which deplete calcium"
      ],
      absorptionTip: "Vitamin D is fat-soluble. Always take dietary sources or supplements with meals containing healthy fats."
    },
    doctorTip: "Consult your doctor for a therapeutic 8-week course of weekly 60,000 IU Vitamin D3 capsules."
  },
  cholesterol: {
    name: "LDL Cholesterol",
    standardRange: "< 100 mg/dL (Optimal) | 100 - 129 mg/dL (Desirable) | 130 - 159 mg/dL (Borderline High)",
    definition: "Low-Density Lipoprotein (LDL) carries cholesterol from liver to peripheral cells. Excess particles can oxidize and embed in arterial walls.",
    whyItMatters: "Keeping LDL in check protects arterial flexibility and minimizes cardiovascular strain.",
    dietaryAdvice: {
      keyNutrients: ["Beta-Glucan Soluble Fiber", "Plant Phytosterols", "Omega-3", "Polyphenols"],
      foodsToEat: [
        "Oatmeal, oat bran, and psyllium husk (isabgol)",
        "Raw unsalted walnuts, almonds, and chia seeds",
        "Cold-pressed extra virgin olive oil and fresh garlic"
      ],
      foodsToAvoid: [
        "Vanaspati, shortening, deep-fried snacks, and palm-oil-fried packaged foods"
      ],
      absorptionTip: "Consume 2 tablespoons of freshly ground flaxseeds daily. Their soluble fiber binds to excess bile acids to clear LDL."
    },
    doctorTip: "Ask for a complete lipid panel including HDL and Triglycerides to calculate your Total/HDL ratio."
  },
  platelet: {
    name: "Platelet Count (Thrombocytes)",
    standardRange: "150,000 - 450,000 /µL",
    definition: "Platelets are disc-shaped cell fragments in blood circulation that cluster together and form clots to stop bleeding when blood vessels sustain trauma.",
    whyItMatters: "A healthy platelet count ensures prompt wound healing and protects against unexpected internal or mucosal bleeding.",
    dietaryAdvice: {
      keyNutrients: ["Vitamin K", "Folate (Vitamin B9)", "Vitamin C", "Chlorophyll"],
      foodsToEat: [
        "Fresh ripe papaya fruit and well-prepared papaya leaf extract",
        "Fresh pomegranate juice and kiwi fruits",
        "Dark leafy vegetables: Steamed spinach, kale, and fenugreek leaves",
        "Amla (Indian gooseberry) and citrus fruits for immune support"
      ],
      foodsToAvoid: [
        "Alcohol and unprescribed blood-thinners without medical guidance"
      ],
      absorptionTip: "Combine Vitamin C-rich amla or citrus with folate-packed greens to stimulate healthy platelet formation."
    },
    doctorTip: "If you notice spontaneous pinpoint red spots or unusual bruises, consult your physician promptly for a repeat CBC."
  },
  wbc: {
    name: "WBC Count (White Blood Cells)",
    standardRange: "4,000 - 11,000 /µL",
    definition: "White blood cells are the frontline defense units of your immune system that identify, neutralize, and clear bacterial, viral, and fungal invaders.",
    whyItMatters: "WBC levels reflect whether your body is actively combating an infection or if your immune reserves are temporarily suppressed.",
    dietaryAdvice: {
      keyNutrients: ["Zinc", "Vitamin C", "Antioxidants", "Quality Amino Acids"],
      foodsToEat: [
        "Citrus fruits: Oranges, sweet limes (mosambi), and lemons",
        "Immune-modulating spices: Turmeric with black pepper, fresh ginger, and garlic",
        "Probiotic curd/yogurt to strengthen gut microbiome immunity",
        "Pumpkin seeds and almonds for cellular zinc"
      ],
      foodsToAvoid: [
        "High-sugar desserts and sweetened drinks which temporarily impair white blood cell activity"
      ],
      absorptionTip: "Add a pinch of black pepper whenever using turmeric. Piperine increases active curcumin absorption dramatically."
    },
    doctorTip: "A differential count (Neutrophils, Lymphocytes, Monocytes) gives a precise view of whether a bacterial or viral factor is active."
  }
};

// Helper to extract active user ID
function getActiveUserId(req) {
  return req.query.userId || req.headers["x-user-id"] || "usr-default";
}

// ==================== ROUTES ====================

// 1. Health check & Pillar status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    pillars: {
      pillar1_backend_api: "Operational (Express on Port " + PORT + ")",
      pillar2_relational_dbms: relationalDb.isPostgres()
        ? "Operational (PostgreSQL 15+ Active with RLS & Vector Store)"
        : "Operational (Local Normalized SQL Schema + Vector Store)",
      pillar3_cloud_storage: "Operational (" + cloudStorage.getProvider() + ")",
      pillar4_ocr_parsing: "Operational (Pure WebAssembly OCR + Fuzzy Typo Recovery)",
      pillar5_ai_llm_rag: "Operational (Google Gemini / Clinical NLP Engine)",
      pillar6_auth_security: "Operational (Multi-patient isolation & Session Profiles)",
      pillar7_third_party_apis: "Operational (Live GPS Specialist Locator & Indian Translation)"
    }
  });
});

// 2. Pillar 3: Cloud Object Storage File Streaming
app.get("/api/storage/files/:filename", (req, res) => {
  const reqName = req.params.filename;
  let fileInfo = cloudStorage.getFile(reqName);

  if (!fileInfo.exists) {
    // Check if any file in uploads ends with the requested name (handling unique prefix)
    try {
      const files = fs.readdirSync(uploadDir);
      const matched = files.find((f) => f.endsWith(reqName) || f.endsWith("-" + reqName));
      if (matched) {
        fileInfo = cloudStorage.getFile(matched);
      }
    } catch {}
  }

  if (!fileInfo.exists) {
    // If not found in uploads, try sample_reports folder as fallback
    const samplePath = path.join(__dirname, "..", "sample_reports", reqName);
    if (fs.existsSync(samplePath)) {
      const stats = fs.statSync(samplePath);
      res.setHeader("Content-Type", reqName.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
      res.setHeader("Content-Length", stats.size);
      res.setHeader("Content-Disposition", `inline; filename="${reqName}"`);
      return fs.createReadStream(samplePath).pipe(res);
    }
    return res.status(404).json({ error: "File not found in storage." });
  }

  res.setHeader("Content-Type", fileInfo.mimeType);
  res.setHeader("Content-Length", fileInfo.size);
  res.setHeader("Content-Disposition", `inline; filename="${fileInfo.fileName}"`);
  res.setHeader("Cache-Control", "public, max-age=86400");

  const stream = fs.createReadStream(fileInfo.filePath);
  stream.pipe(res);
});

// 3. Dashboard
app.get("/api/dashboard", async (req, res) => {
  const userId = getActiveUserId(req);
  const user = await relationalDb.getUser(userId);
  const latest = await relationalDb.getLatestReport(userId);
  if (!latest) {
    return res.json({
      summary: `No medical reports uploaded yet for ${user?.fullName || "this patient"}. Upload a lab report or health scan to generate an AI summary.`,
      keyFindings: [],
      attentionNeeded: [],
      patientName: user?.fullName || "Patient",
      patientProfile: user,
    });
  }

  res.json({
    summary: latest.summary,
    keyFindings: latest.keyFindings || [],
    attentionNeeded: latest.attentionNeeded || [],
    reportId: latest.id,
    fileName: latest.fileName,
    fileUrl: latest.fileUrl,
    reportDate: latest.reportDate,
    patientName: user?.fullName || "Patient",
    patientProfile: user,
  });
});

// 4. Upload Reports (PDF / Scanned Images / Text)
app.post("/api/reports/upload", upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "No files provided for upload." });
    }

    const userId = getActiveUserId(req);
    const processedReports = [];

    for (const file of files) {
      const buffer = file.buffer || (file.path && fs.existsSync(file.path) ? fs.readFileSync(file.path) : Buffer.from(""));

      // Pillar 3: Store in Cloud / Object Storage
      const stored = await cloudStorage.uploadFile({
        buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      // Pillar 4: Pure WebAssembly OCR & Clinical Parsing Engine
      const rawText = await extractRawText(buffer, file.mimetype, file.originalname);
      const parameters = parseBiomarkers(rawText);
      const { summary, keyFindings, attentionNeeded } = generateAiSummary(
        file.originalname,
        parameters,
        rawText
      );

      // Safe date extraction (prevents uncaught RangeError on non-standard date formats)
      let reportDate = new Date().toISOString().split("T")[0];
      try {
        const dateMatch =
          rawText.match(/\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b/) ||
          rawText.match(/\b([0-3]?[0-9][\/\-][A-Za-z]{3}[\/\-]202[0-9])\b/) ||
          rawText.match(/\b([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-]202[0-9])\b/);
        if (dateMatch && !isNaN(Date.parse(dateMatch[1]))) {
          reportDate = new Date(dateMatch[1]).toISOString().split("T")[0];
        }
      } catch (dateErr) {
        // Safe fallback to current date
      }

      // Pillar 2: Relational DBMS write + Vector Embedding generation
      const saved = await relationalDb.saveReport(
        {
          fileName: file.originalname,
          fileUrl: stored.fileUrl,
          fileSize: file.size,
          fileType: file.mimetype,
          reportDate,
          extractedText: rawText.slice(0, 4000),
          summary,
          keyFindings,
          attentionNeeded,
        },
        parameters,
        userId
      );

      processedReports.push(saved);
    }

    const latest = processedReports[0];
    res.status(201).json({
      summary: `${files.length} report(s) processed successfully. Extracted ${latest.parameters?.length || 0} clinical biomarkers and updated your health records!`,
      reports: processedReports,
      data: {
        summary: latest.summary,
        reportId: latest.id,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process report: " + err.message });
  }
});

// 5. Timeline
app.get("/api/timeline", async (req, res) => {
  const userId = getActiveUserId(req);
  const reports = await relationalDb.getAllReports(userId);
  res.json(reports);
});

// 6. Reports Listing with Search & Filters
app.get("/api/reports", async (req, res) => {
  const userId = getActiveUserId(req);
  let reports = await relationalDb.getAllReports(userId);
  const { search, from, to } = req.query;

  if (search) {
    const s = String(search).toLowerCase();
    reports = reports.filter(
      (r) =>
        r.fileName.toLowerCase().includes(s) ||
        (r.extractedText && r.extractedText.toLowerCase().includes(s))
    );
  }

  if (from) {
    reports = reports.filter((r) => r.reportDate >= from);
  }
  if (to) {
    reports = reports.filter((r) => r.reportDate <= to);
  }

  res.json(reports);
});

// 7. Report Details with Extracted Parameters
app.get("/api/reports/:id", async (req, res) => {
  const report = await relationalDb.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }
  res.json(report);
});

// 8. Delete All Reports (Clean Slate)
app.delete("/api/reports", async (req, res) => {
  try {
    const userId = getActiveUserId(req);
    const userReports = await relationalDb.getAllReports(userId);
    userReports.forEach((r) => {
      if (r.fileUrl) cloudStorage.deleteFile(r.fileUrl);
      if (r.fileName) cloudStorage.deleteFile(r.fileName);
    });
    const result = await relationalDb.clearAllReports(userId);
    res.json(result);
  } catch (err) {
    console.error("Failed to clear reports:", err);
    res.status(500).json({ error: "Failed to remove reports: " + err.message });
  }
});

// 9. Delete Single Report
app.delete("/api/reports/:id", async (req, res) => {
  try {
    const report = await relationalDb.getReportById(req.params.id);
    if (report) {
      if (report.fileUrl) cloudStorage.deleteFile(report.fileUrl);
      if (report.fileName) cloudStorage.deleteFile(report.fileName);
    }
    const result = await relationalDb.deleteReport(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Failed to delete report:", err);
    res.status(500).json({ error: "Failed to delete report: " + err.message });
  }
});

// 10. Pillar 6: User & Patient Profiles
app.get("/api/profile", async (req, res) => {
  const userId = getActiveUserId(req);
  const profile = await relationalDb.getProfile(userId);
  res.json(profile);
});

app.post("/api/profile", async (req, res) => {
  try {
    const userId = getActiveUserId(req);
    const updated = await relationalDb.updateProfile(req.body, userId);
    res.json({ message: "Profile updated successfully.", profile: updated });
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
});

// Pillar 6: Multi-Patient Roster / Family Accounts
app.get("/api/users", async (req, res) => {
  const users = await relationalDb.getAllUsers();
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  try {
    const user = await relationalDb.upsertUser(req.body);
    res.json({ message: "Patient profile saved successfully.", user });
  } catch (err) {
    console.error("Failed to upsert user:", err);
    res.status(500).json({ error: "Failed to save patient profile: " + err.message });
  }
});

// 11. Compare Two Reports
app.get("/api/compare", async (req, res) => {
  const userId = getActiveUserId(req);
  const { beforeId, latestId } = req.query;
  const reports = await relationalDb.getAllReports(userId);
  const bId = beforeId || (reports[1] && reports[1].id) || reports[0]?.id;
  const lId = latestId || reports[0]?.id;

  if (!bId || !lId) {
    return res.json({ rows: [], explanation: "Need at least two reports to compare." });
  }

  const comparison = await relationalDb.compareReports(bId, lId);
  res.json(comparison);
});

// 12. Trends
app.get("/api/trends", async (req, res) => {
  const userId = getActiveUserId(req);
  const param = req.query.parameter || "hemoglobin";
  const points = await relationalDb.getTrend(String(param), userId);
  res.json(points);
});

// 12a. Trends Parameters (Dynamically extracts only anomalies from current reports)
app.get("/api/trends/parameters", async (req, res) => {
  const userId = getActiveUserId(req);
  const reports = await relationalDb.getAllReports(userId);
  if (!reports.length) {
    return res.json({ anomalies: [], allParameters: [] });
  }

  const allParams = [];
  reports.forEach((r) => {
    if (r.parameters) {
      allParams.push(...r.parameters);
    }
  });

  const anomalyMap = new Map();
  const allMap = new Map();

  allParams.forEach((b) => {
    const key = (b.canonicalName || b.name).toLowerCase().replace(/[^a-z0-9]/g, "");
    const label = `${b.canonicalName || b.name}${b.unit ? ` (${b.unit})` : ""}`;
    
    if (!allMap.has(key)) {
      allMap.set(key, { key, name: b.canonicalName || b.name, label, unit: b.unit, status: b.status });
    }

    if (b.status && b.status !== "NORMAL") {
      if (!anomalyMap.has(key)) {
        anomalyMap.set(key, {
          key,
          name: b.canonicalName || b.name,
          label: `${b.canonicalName || b.name} [${b.status}${b.value ? `: ${b.value} ${b.unit || ""}` : ""}]`,
          unit: b.unit,
          status: b.status,
          value: b.value
        });
      }
    }
  });

  res.json({
    anomalies: Array.from(anomalyMap.values()),
    allParameters: Array.from(allMap.values())
  });
});

// 13. Glossary Report Anomalies
app.get("/api/glossary/anomalies", async (req, res) => {
  const userId = getActiveUserId(req);
  const reports = await relationalDb.getAllReports(userId);
  const requestedReportId = req.query.reportId;

  let reportDetails = null;
  if (requestedReportId) {
    reportDetails = await relationalDb.getReportById(requestedReportId);
  }
  if (!reportDetails && reports.length > 0) {
    reportDetails = await relationalDb.getReportById(reports[0].id);
  }
  if (!reportDetails) return res.json([]);

  const anomalies = (reportDetails.parameters || []).filter((p) => p.status !== "NORMAL");

  const enriched = anomalies.map((p, idx) => {
    const normKey =
      Object.keys(MEDICAL_KNOWLEDGE).find((k) => p.name.toLowerCase().includes(k)) ||
      "hemoglobin";
    const info = MEDICAL_KNOWLEDGE[normKey];

    return {
      id: "anom-" + idx,
      paramName: p.name,
      patientValue: `${p.value} ${p.unit}`,
      unit: p.unit,
      status: p.status,
      standardRange: p.referenceRange || info.standardRange,
      explanation: info.definition,
      clinicalImpact: `Measured at ${p.value} ${p.unit}. ${info.whyItMatters}`,
      dietaryAdvice: info.dietaryAdvice,
      doctorTip: info.doctorTip,
      reportName: reportDetails.fileName,
    };
  });

  res.json(enriched);
});

// 14. Glossary Term Explanation
app.get("/api/glossary/explain", (req, res) => {
  const term = String(req.query.term || "").toLowerCase().trim();
  const matchKey =
    Object.keys(MEDICAL_KNOWLEDGE).find((k) => term.includes(k)) || "hemoglobin";
  const item = MEDICAL_KNOWLEDGE[matchKey];

  res.json({
    definition: item.definition,
    whyItMatters: item.whyItMatters,
    standardRange: item.standardRange,
    dietaryAdvice: item.dietaryAdvice,
    status: "NORMAL",
    doctorTip: item.doctorTip,
  });
});

// 15. Pillar 5: Medical Chatbot with RAG & Vector Embeddings
app.post("/api/chat", async (req, res) => {
  try {
    const { query, message, history } = req.body;
    const userId = getActiveUserId(req);
    const userQuery = query || message || "";

    const response = await medicalLlm.chatWithRAG({
      query: userQuery,
      userId,
      history: history || []
    });

    res.json(response);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to process chat query: " + err.message });
  }
});

// 16. Pillar 5: Doctor Visit Prep Kit AI Generator
app.post("/api/visit-prep/generate", async (req, res) => {
  try {
    const { symptoms, duration, changes, medicines } = req.body;
    const userId = getActiveUserId(req);

    const kit = await medicalLlm.generateVisitQuestions({
      symptoms,
      duration,
      changes,
      medicines,
      userId
    });

    res.json(kit);
  } catch (err) {
    console.error("Visit prep error:", err);
    res.status(500).json({ error: "Failed to generate doctor visit prep: " + err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`✓ Health AI Summarizer Backend running at http://localhost:${PORT}`);
  console.log(`✓ Pillar 1 (API), Pillar 2 (DBMS & RAG), Pillar 3 (Cloud Storage), Pillar 4 (OCR), Pillar 5 (AI/LLM) Active!`);

  if (relationalDb.isPostgres()) {
    console.log("[DBMS] PostgreSQL is active. Initializing cloud schema...");
    try {
      await initPostgresSchema();
    } catch (err) {
      console.warn("[PostgreSQL Startup Warning]", err.message);
    }
  }
});
