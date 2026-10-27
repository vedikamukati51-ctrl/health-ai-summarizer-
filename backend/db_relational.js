import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { postgresDb } from "./db_postgres.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RELATIONAL_DB_FILE = path.join(__dirname, "data", "relational_db.json");

// Default initial state for relational DBMS
const INITIAL_RELATIONAL_SCHEMA = {
  users: [
    {
      id: "usr-default",
      fullName: "Ananya Sharma",
      relation: "Self",
      email: "ananya.sharma@example.com",
      age: 29,
      gender: "Female",
      bloodGroup: "B+",
      height: "165 cm",
      weight: "58 kg",
      allergies: "Penicillin, Pollen",
      conditions: "Mild Iron Deficiency Anemia",
      emergencyContact: "+91 98765 43210 (Dr. Vikram Sharma - Spouse)",
      phone: "+91 98765 11001",
      address: "Bandra West, Mumbai, Maharashtra",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "usr-spouse",
      fullName: "Dr. Vikram Sharma",
      relation: "Spouse",
      email: "vikram.sharma@example.com",
      age: 32,
      gender: "Male",
      bloodGroup: "O+",
      height: "178 cm",
      weight: "74 kg",
      allergies: "None reported",
      conditions: "No chronic conditions",
      emergencyContact: "+91 98765 11001 (Ananya Sharma - Spouse)",
      phone: "+91 98765 22002",
      address: "Bandra West, Mumbai, Maharashtra",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "usr-mother",
      fullName: "Sunita Sharma",
      relation: "Parent",
      email: "sunita.sharma@example.com",
      age: 58,
      gender: "Female",
      bloodGroup: "A+",
      height: "158 cm",
      weight: "63 kg",
      allergies: "Sulfa drugs, Dust mites",
      conditions: "Mild Hypertension, Osteoarthritis",
      emergencyContact: "+91 98765 11001 (Ananya Sharma - Daughter)",
      phone: "+91 98765 33003",
      address: "Andheri East, Mumbai, Maharashtra",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "usr-child",
      fullName: "Aarav Sharma",
      relation: "Child",
      email: "aarav.sharma@example.com",
      age: 5,
      gender: "Male",
      bloodGroup: "B+",
      height: "110 cm",
      weight: "19 kg",
      allergies: "Peanuts, Shellfish",
      conditions: "Childhood seasonal asthma",
      emergencyContact: "+91 98765 11001 (Ananya Sharma - Mother)",
      phone: "+91 98765 44004",
      address: "Bandra West, Mumbai, Maharashtra",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
  ],
  reports: [
    {
      id: "r3",
      userId: "usr-default",
      fileName: "Ananya_Blood_Report_September.pdf",
      fileUrl: "/api/storage/files/Ananya_Blood_Report_September.pdf",
      fileSize: 245000,
      fileType: "application/pdf",
      reportDate: "2026-09-15",
      summary: "Ananya's September blood report identifies mild iron deficiency anemia with Hemoglobin at 11.4 g/dL, while Fasting Blood Glucose is borderline elevated at 108 mg/dL. Creatinine shows a slight upward shift at 1.28 mg/dL, and WBC and Platelets remain in healthy ranges.",
      keyFindings: [
        "Hemoglobin: 11.4 g/dL (Below reference range of 12.0 g/dL)",
        "Fasting Glucose: 108 mg/dL (Borderline impaired fasting)",
        "Serum Creatinine: 1.28 mg/dL (Mild filtration workload)",
        "WBC: 6,400 /µL and Platelets: 210,000 /µL (Normal)"
      ],
      attentionNeeded: [
        "Hemoglobin (11.4 g/dL) indicates mild anemia; discuss dietary iron or supplementation with your physician.",
        "Fasting glucose (108 mg/dL) shows early borderline insulin resistance; simple carbohydrate moderation is advised.",
        "Creatinine (1.28 mg/dL) has moved up slightly from last month; ensure 2.5–3L daily hydration and re-check."
      ],
      extractedText: "Patient: Ananya Sharma\nAge: 29 Yrs | Gender: Female\nCollection Date: 15-Sep-2026\nLab: Metropolis Healthcare Diagnostic Lab\n\nCOMPLETE BLOOD EXAMINATION & METABOLIC PANEL\nHemoglobin: 11.4 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]\nFasting Blood Glucose: 108 mg/dL (Reference: 70 - 99 mg/dL) [BORDERLINE]\nSerum Creatinine: 1.28 mg/dL (Reference: 0.6 - 1.1 mg/dL) [ATTENTION]\nWBC Count: 6,400 /µL (Reference: 4,500 - 11,000 /µL) [NORMAL]\nPlatelet Count: 210,000 /µL (Reference: 150,000 - 450,000 /µL) [NORMAL]",
      createdAt: "2026-09-15T10:30:00.000Z"
    },
    {
      id: "r2",
      userId: "usr-default",
      fileName: "Ananya_CBC_August.pdf",
      fileUrl: "/api/storage/files/Ananya_CBC_August.pdf",
      fileSize: 180000,
      fileType: "application/pdf",
      reportDate: "2026-08-20",
      summary: "August CBC report showed stable clinical parameters with Hemoglobin at 14.8 g/dL, normal fasting glucose, and optimal kidney filtration.",
      keyFindings: ["Hemoglobin: 14.8 g/dL (Normal)", "Creatinine: 1.0 mg/dL (Normal)", "Blood Glucose: 95 mg/dL (Normal)"],
      attentionNeeded: [],
      extractedText: "Patient: Ananya Sharma\nCollection Date: 20-Aug-2026\nHemoglobin: 14.8 g/dL\nSerum Creatinine: 1.0 mg/dL\nFasting Blood Glucose: 95 mg/dL\nWBC Count: 6,800 /µL",
      createdAt: "2026-08-20T11:15:00.000Z"
    },
    {
      id: "r1",
      userId: "usr-default",
      fileName: "Ananya_Health_Check_July.jpg",
      fileUrl: "/api/storage/files/Ananya_Health_Check_July.jpg",
      fileSize: 920000,
      fileType: "image/jpeg",
      reportDate: "2026-07-12",
      summary: "Comprehensive July health screening highlighted low Vitamin D3 at 18.2 ng/mL (clinical deficiency) and borderline LDL cholesterol at 136 mg/dL.",
      keyFindings: ["Vitamin D3: 18.2 ng/mL (Deficient)", "LDL Cholesterol: 136 mg/dL (Borderline high)", "Hemoglobin: 14.9 g/dL (Optimal)"],
      attentionNeeded: ["Vitamin D3 is 18.2 ng/mL; discuss therapeutic Vitamin D supplementation with your doctor."],
      extractedText: "Patient: Ananya Sharma\nCollection Date: 12-Jul-2026\nHemoglobin: 14.9 g/dL\nVitamin D3 (25-OH): 18.2 ng/mL [LOW]\nLDL Cholesterol: 136 mg/dL [BORDERLINE]\nSerum Creatinine: 1.0 mg/dL",
      createdAt: "2026-07-12T09:00:00.000Z"
    }
  ],
  biomarkers: [
    { id: "b1", reportId: "r3", userId: "usr-default", name: "Hemoglobin", canonicalName: "Hemoglobin", category: "Complete Blood Count", value: 11.4, unit: "g/dL", status: "LOW", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "b2", reportId: "r3", userId: "usr-default", name: "Fasting Blood Glucose", canonicalName: "Fasting Blood Glucose", category: "Metabolic Panel", value: 108, unit: "mg/dL", status: "BORDERLINE", referenceRange: "70 - 99 mg/dL" },
    { id: "b3", reportId: "r3", userId: "usr-default", name: "Serum Creatinine", canonicalName: "Serum Creatinine", category: "Kidney Function", value: 1.28, unit: "mg/dL", status: "ATTENTION", referenceRange: "0.6 - 1.1 mg/dL" },
    { id: "b4", reportId: "r3", userId: "usr-default", name: "WBC Count", canonicalName: "WBC Count", category: "Complete Blood Count", value: 6400, unit: "/µL", status: "NORMAL", referenceRange: "4,500 - 11,000 /µL" },
    { id: "b5", reportId: "r3", userId: "usr-default", name: "Platelet Count", canonicalName: "Platelet Count", category: "Complete Blood Count", value: 210000, unit: "/µL", status: "NORMAL", referenceRange: "150,000 - 450,000 /µL" },
    { id: "b6", reportId: "r2", userId: "usr-default", name: "Hemoglobin", canonicalName: "Hemoglobin", category: "Complete Blood Count", value: 14.8, unit: "g/dL", status: "NORMAL", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "b7", reportId: "r2", userId: "usr-default", name: "Serum Creatinine", canonicalName: "Serum Creatinine", category: "Kidney Function", value: 1.0, unit: "mg/dL", status: "NORMAL", referenceRange: "0.6 - 1.1 mg/dL" },
    { id: "b8", reportId: "r2", userId: "usr-default", name: "Fasting Blood Glucose", canonicalName: "Fasting Blood Glucose", category: "Metabolic Panel", value: 95, unit: "mg/dL", status: "NORMAL", referenceRange: "70 - 99 mg/dL" },
    { id: "b9", reportId: "r2", userId: "usr-default", name: "WBC Count", canonicalName: "WBC Count", category: "Complete Blood Count", value: 6800, unit: "/µL", status: "NORMAL", referenceRange: "4,500 - 11,000 /µL" },
    { id: "b10", reportId: "r1", userId: "usr-default", name: "Hemoglobin", canonicalName: "Hemoglobin", category: "Complete Blood Count", value: 14.9, unit: "g/dL", status: "NORMAL", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "b11", reportId: "r1", userId: "usr-default", name: "Vitamin D3", canonicalName: "Vitamin D3", category: "Vitamins", value: 18.2, unit: "ng/mL", status: "LOW", referenceRange: "30 - 100 ng/mL" },
    { id: "b12", reportId: "r1", userId: "usr-default", name: "LDL Cholesterol", canonicalName: "LDL Cholesterol", category: "Lipid Profile", value: 136, unit: "mg/dL", status: "BORDERLINE", referenceRange: "< 100 mg/dL" },
    { id: "b13", reportId: "r1", userId: "usr-default", name: "Serum Creatinine", canonicalName: "Serum Creatinine", category: "Kidney Function", value: 1.0, unit: "mg/dL", status: "NORMAL", referenceRange: "0.6 - 1.1 mg/dL" }
  ],
  vector_embeddings: []
};

function initDb() {
  const dir = path.dirname(RELATIONAL_DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(RELATIONAL_DB_FILE)) {
    fs.writeFileSync(RELATIONAL_DB_FILE, JSON.stringify(INITIAL_RELATIONAL_SCHEMA, null, 2), "utf-8");
  }
}

export function readRelationalDb() {
  initDb();
  try {
    const raw = fs.readFileSync(RELATIONAL_DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.users)) data.users = INITIAL_RELATIONAL_SCHEMA.users;
    if (!Array.isArray(data.reports)) data.reports = [];
    if (!Array.isArray(data.biomarkers)) data.biomarkers = [];
    if (!Array.isArray(data.vector_embeddings)) data.vector_embeddings = [];
    return data;
  } catch (err) {
    console.error("Relational DB read error, reinitializing:", err);
    initDb();
    return INITIAL_RELATIONAL_SCHEMA;
  }
}

export function writeRelationalDb(data) {
  initDb();
  fs.writeFileSync(RELATIONAL_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ============================================================================
// Vector Embedding & Semantic RAG Engine
// ============================================================================

/**
 * Generate lightweight 64-dimensional semantic embedding vector for a medical text snippet
 */
export function generateTextEmbedding(text) {
  const vocab = [
    "hemoglobin", "glucose", "sugar", "creatinine", "kidney", "renal", "filtration", "anemia", "iron",
    "wbc", "leukocyte", "platelet", "infection", "immune", "cholesterol", "lipid", "ldl", "hdl",
    "triglyceride", "heart", "cardiac", "artery", "liver", "sgot", "sgpt", "alt", "ast", "bilirubin",
    "thyroid", "tsh", "vitamin", "d3", "b12", "deficiency", "fatigue", "tired", "high", "low", "borderline",
    "normal", "blood", "test", "report", "lab", "reference", "unit", "doctor", "medicine", "symptom",
    "pressure", "pulse", "diet", "water", "hydration", "walk", "exercise", "nutrition", "consult", "risk",
    "sample", "metabolism", "insulin", "diabetes"
  ];

  const lower = text.toLowerCase();
  const vector = new Array(vocab.length).fill(0);
  let totalWords = 0;

  for (let i = 0; i < vocab.length; i++) {
    const word = vocab[i];
    const regex = new RegExp(`\\b${word}`, "gi");
    const matches = lower.match(regex);
    if (matches) {
      vector[i] = matches.length;
      totalWords += matches.length;
    }
  }

  // Normalize vector to unit length (L2 norm)
  const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// ============================================================================
// Relational Database Repository Layer
// ============================================================================

export const relationalDb = {
  isPostgres() {
    return postgresDb.isConfigured();
  },

  // --- USERS / PATIENTS TABLE ---
  async getUser(userId = "usr-default") {
    if (postgresDb.isConfigured()) {
      return postgresDb.getUser(userId);
    }
    const { users } = readRelationalDb();
    const found = users.find((u) => u.id === userId);
    if (found) return found;
    const initialMatch = INITIAL_RELATIONAL_SCHEMA.users.find((u) => u.id === userId);
    if (initialMatch) return initialMatch;
    return users.find((u) => u.id === "usr-default") || users[0] || null;
  },

  async getAllUsers() {
    if (postgresDb.isConfigured()) {
      return postgresDb.getAllUsers();
    }
    const { users } = readRelationalDb();
    return users;
  },

  async upsertUser(userData) {
    if (postgresDb.isConfigured()) {
      return postgresDb.upsertUser(userData);
    }
    const db = readRelationalDb();
    const id = userData.id || "usr-" + Date.now();
    const index = db.users.findIndex((u) => u.id === id || (userData.email && u.email === userData.email));

    if (index >= 0) {
      db.users[index] = { ...db.users[index], ...userData };
      writeRelationalDb(db);
      return db.users[index];
    } else {
      const newUser = {
        id,
        fullName: userData.fullName || "New Patient",
        relation: userData.relation || "Family Member",
        email: userData.email || `patient_${Date.now()}@example.com`,
        age: userData.age || 30,
        gender: userData.gender || "Female",
        bloodGroup: userData.bloodGroup || "O+",
        height: userData.height || "165 cm",
        weight: userData.weight || "60 kg",
        allergies: userData.allergies || "",
        conditions: userData.conditions || "",
        emergencyContact: userData.emergencyContact || "",
        phone: userData.phone || "",
        address: userData.address || "",
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeRelationalDb(db);
      return newUser;
    }
  },

  async getProfile(userId = "usr-default") {
    return this.getUser(userId);
  },

  async updateProfile(userData, userId = "usr-default") {
    return this.upsertUser({ ...userData, id: userData.id || userId });
  },

  // --- REPORTS TABLE (WITH RELATIONAL BIOMARKERS JOIN) ---
  async getAllReports(userId = "usr-default") {
    if (postgresDb.isConfigured()) {
      return postgresDb.getAllReports(userId);
    }
    const { reports, biomarkers } = readRelationalDb();
    const userReports = reports.filter((r) => !userId || r.userId === userId);

    return userReports
      .map((report) => {
        const reportParams = biomarkers.filter((b) => b.reportId === report.id);
        return { ...report, parameters: reportParams };
      })
      .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  },

  async getReportById(reportId) {
    if (postgresDb.isConfigured()) {
      return postgresDb.getReportById(reportId);
    }
    const { reports, biomarkers } = readRelationalDb();
    const report = reports.find((r) => r.id === reportId);
    if (!report) return null;
    const reportParams = biomarkers.filter((b) => b.reportId === reportId);
    return { ...report, parameters: reportParams };
  },

  async getLatestReport(userId = "usr-default") {
    const reports = await this.getAllReports(userId);
    return reports[0] || null;
  },

  async saveReport(reportData, extractedParameters = [], userId = "usr-default") {
    if (postgresDb.isConfigured()) {
      return postgresDb.saveReport(reportData, extractedParameters, userId);
    }
    const db = readRelationalDb();
    const reportId = "rep-" + Date.now();

    const newReport = {
      id: reportId,
      userId,
      fileName: reportData.fileName,
      fileUrl: reportData.fileUrl || `/api/storage/files/${reportData.fileName}`,
      fileSize: reportData.fileSize || 0,
      fileType: reportData.fileType || "application/pdf",
      reportDate: reportData.reportDate || new Date().toISOString().split("T")[0],
      summary: reportData.summary || "",
      keyFindings: reportData.keyFindings || [],
      attentionNeeded: reportData.attentionNeeded || [],
      extractedText: reportData.extractedText || "",
      createdAt: new Date().toISOString()
    };

    db.reports.unshift(newReport);

    // Insert relational biomarkers into biomarkers table
    const newBiomarkers = extractedParameters.map((p, idx) => ({
      id: "bio-" + Date.now() + "-" + idx,
      reportId,
      userId,
      name: p.name,
      canonicalName: p.canonicalName || p.name,
      category: p.category || "General",
      value: typeof p.value === "number" ? p.value : parseFloat(p.value) || 0,
      unit: p.unit || "",
      status: p.status || "NORMAL",
      referenceRange: p.referenceRange || "Normal range",
      createdAt: new Date().toISOString()
    }));

    db.biomarkers.push(...newBiomarkers);

    // Store vector embedding for RAG semantic search
    const textChunk = `${newReport.fileName}\n${newReport.summary}\n${extractedParameters.map((p) => `${p.name}: ${p.value} ${p.unit} [${p.status}]`).join("\n")}`;
    const embedding = generateTextEmbedding(textChunk);

    db.vector_embeddings.push({
      id: "vec-" + Date.now(),
      reportId,
      userId,
      content: textChunk,
      vector: embedding,
      metadata: {
        fileName: newReport.fileName,
        reportDate: newReport.reportDate,
        anomaliesCount: extractedParameters.filter((p) => p.status !== "NORMAL").length
      },
      createdAt: new Date().toISOString()
    });

    writeRelationalDb(db);

    return { ...newReport, parameters: newBiomarkers };
  },

  async deleteReport(reportId) {
    if (postgresDb.isConfigured()) {
      return postgresDb.deleteReport(reportId);
    }
    const db = readRelationalDb();
    const prevCount = db.reports.length;

    // Cascade delete across reports, biomarkers, and vector_embeddings tables
    db.reports = db.reports.filter((r) => r.id !== reportId);
    db.biomarkers = db.biomarkers.filter((b) => b.reportId !== reportId);
    db.vector_embeddings = db.vector_embeddings.filter((v) => v.reportId !== reportId);

    writeRelationalDb(db);

    return {
      success: true,
      deleted: prevCount !== db.reports.length,
      reportId,
      remainingReports: db.reports.length
    };
  },

  async clearAllReports(userId = "usr-default") {
    if (postgresDb.isConfigured()) {
      return postgresDb.clearAllReports(userId);
    }
    const db = readRelationalDb();
    const prevCount = db.reports.filter((r) => !userId || r.userId === userId).length;

    if (!userId) {
      db.reports = [];
      db.biomarkers = [];
      db.vector_embeddings = [];
    } else {
      const userReportIds = new Set(db.reports.filter((r) => r.userId === userId).map((r) => r.id));
      db.reports = db.reports.filter((r) => r.userId !== userId);
      db.biomarkers = db.biomarkers.filter((b) => !userReportIds.has(b.reportId));
      db.vector_embeddings = db.vector_embeddings.filter((v) => !userReportIds.has(v.reportId));
    }

    writeRelationalDb(db);

    return {
      success: true,
      message: `Cleared ${prevCount} reports and all associated biomarkers.`,
      clearedCount: prevCount
    };
  },

  // --- BIOMARKER TRENDS ---
  async getTrend(parameterName, userId = "usr-default") {
    if (postgresDb.isConfigured()) {
      return postgresDb.getTrend(parameterName, userId);
    }
    const { reports, biomarkers } = readRelationalDb();
    const target = parameterName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const reportDateMap = new Map(reports.map((r) => [r.id, r.reportDate]));

    const matching = biomarkers.filter((b) => {
      if (userId && b.userId && b.userId !== userId) return false;
      const norm = (b.canonicalName || b.name).toLowerCase().replace(/[^a-z0-9]/g, "");
      return norm.includes(target) || target.includes(norm);
    });

    return matching
      .map((b) => ({
        date: reportDateMap.get(b.reportId) || b.createdAt || "2026-09-01",
        value: typeof b.value === "number" ? b.value : parseFloat(b.value) || 0
      }))
      .filter((pt) => !isNaN(pt.value))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // --- REPORT COMPARISON DELTAS ---
  async compareReports(beforeId, latestId) {
    if (postgresDb.isConfigured()) {
      return postgresDb.compareReports(beforeId, latestId);
    }
    const before = await this.getReportById(beforeId);
    const latest = await this.getReportById(latestId);

    if (!before || !latest) {
      return { rows: [], explanation: "Could not locate reports to compare." };
    }

    const beforeMap = new Map((before.parameters || []).map((p) => [(p.canonicalName || p.name).toLowerCase(), p]));
    const latestMap = new Map((latest.parameters || []).map((p) => [(p.canonicalName || p.name).toLowerCase(), p]));

    const allKeys = new Set([...beforeMap.keys(), ...latestMap.keys()]);
    const rows = [];

    for (const key of allKeys) {
      const b = beforeMap.get(key);
      const l = latestMap.get(key);
      const paramName = (l || b).canonicalName || (l || b).name;
      const beforeVal = b ? b.value : "—";
      const latestVal = l ? l.value : "—";

      let diff = "—";
      let status = "NORMAL";

      if (typeof beforeVal === "number" && typeof latestVal === "number") {
        const delta = Math.round((latestVal - beforeVal) * 100) / 100;
        diff = delta > 0 ? `+${delta}` : `${delta}`;
        if (delta > 0) status = "INCREASED";
        else if (delta < 0) status = "DECREASED";
        else status = "UNCHANGED";
      }

      rows.push({
        param: paramName,
        before: beforeVal,
        latest: latestVal,
        diff,
        status: l?.status || status
      });
    }

    return {
      before,
      latest,
      rows,
      explanation: `Comparing ${latest.fileName} with ${before.fileName}: Identified ${rows.length} biomarker measurements.`
    };
  },

  // --- VECTOR SEARCH / RAG FOR CHATBOT ---
  async searchVectorEmbeddings(queryText, userId = "usr-default", topK = 3) {
    if (postgresDb.isConfigured()) {
      return postgresDb.searchVectorEmbeddings(queryText, userId, topK);
    }
    const { vector_embeddings } = readRelationalDb();
    if (!vector_embeddings.length) return [];

    const queryVec = generateTextEmbedding(queryText);

    const scored = vector_embeddings
      .filter((v) => !userId || v.userId === userId)
      .map((v) => ({
        ...v,
        similarity: cosineSimilarity(queryVec, v.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, topK);
  }
};
