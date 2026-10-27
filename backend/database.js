/**
 * LEGACY / REFERENCE MODULE
 * Note: The active production database manager is `db_relational.js` (using `data/relational_db.json`).
 * This file is retained for reference and backwards compatibility.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "data", "database.json");

const INITIAL_SEED = {
  reports: [
    {
      id: "r3",
      fileName: "Ananya_Blood_Report_September.pdf",
      fileSize: 245000,
      fileType: "application/pdf",
      reportDate: "2026-09-15",
      createdAt: "2026-09-15T10:30:00.000Z",
      extractedText: "Patient: Ananya Sharma\nAge: 29 Yrs | Gender: Female\nCollection Date: 15-Sep-2026\nLab: Metropolis Healthcare Diagnostic Lab\n\nCOMPLETE BLOOD EXAMINATION & METABOLIC PANEL\n------------------------------------------------------------\nHemoglobin: 11.4 g/dL  (Reference: 12.0 - 15.5 g/dL) [LOW]\nFasting Blood Glucose: 108 mg/dL (Reference: 70 - 99 mg/dL) [BORDERLINE]\nSerum Creatinine: 1.28 mg/dL (Reference: 0.6 - 1.1 mg/dL) [ATTENTION]\nWBC Count: 6,400 /µL (Reference: 4,500 - 11,000 /µL) [NORMAL]\nPlatelet Count: 210,000 /µL (Reference: 150,000 - 450,000 /µL) [NORMAL]",
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
      ]
    },
    {
      id: "r2",
      fileName: "Ananya_CBC_August.pdf",
      fileSize: 180000,
      fileType: "application/pdf",
      reportDate: "2026-08-20",
      createdAt: "2026-08-20T11:15:00.000Z",
      extractedText: "Patient: Ananya Sharma\nCollection Date: 20-Aug-2026\nHemoglobin: 14.8 g/dL\nSerum Creatinine: 1.0 mg/dL\nFasting Blood Glucose: 95 mg/dL\nWBC Count: 6,800 /µL",
      summary: "August CBC report showed stable clinical parameters with Hemoglobin at 14.8 g/dL, normal fasting glucose, and optimal kidney filtration.",
      keyFindings: [
        "Hemoglobin: 14.8 g/dL (Normal)",
        "Creatinine: 1.0 mg/dL (Normal)",
        "Blood Glucose: 95 mg/dL (Normal)"
      ],
      attentionNeeded: []
    },
    {
      id: "r1",
      fileName: "Ananya_Health_Check_July.jpg",
      fileSize: 920000,
      fileType: "image/jpeg",
      reportDate: "2026-07-12",
      createdAt: "2026-07-12T09:00:00.000Z",
      extractedText: "Patient: Ananya Sharma\nCollection Date: 12-Jul-2026\nHemoglobin: 14.9 g/dL\nVitamin D3 (25-OH): 18.2 ng/mL [LOW]\nLDL Cholesterol: 136 mg/dL [BORDERLINE]\nSerum Creatinine: 1.0 mg/dL",
      summary: "Comprehensive July health screening highlighted low Vitamin D3 at 18.2 ng/mL (clinical deficiency) and borderline LDL cholesterol at 136 mg/dL.",
      keyFindings: [
        "Vitamin D3: 18.2 ng/mL (Deficient)",
        "LDL Cholesterol: 136 mg/dL (Borderline high)",
        "Hemoglobin: 14.9 g/dL (Optimal)"
      ],
      attentionNeeded: [
        "Vitamin D3 is 18.2 ng/mL; discuss therapeutic Vitamin D supplementation with your doctor.",
        "LDL Cholesterol is 136 mg/dL; consider dietary fiber increase."
      ]
    }
  ],
  parameters: [
    // r3 parameters
    { id: "p1", reportId: "r3", name: "Hemoglobin", value: 11.4, unit: "g/dL", status: "LOW", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "p2", reportId: "r3", name: "Fasting Blood Glucose", value: 108, unit: "mg/dL", status: "BORDERLINE", referenceRange: "70 - 99 mg/dL" },
    { id: "p3", reportId: "r3", name: "Serum Creatinine", value: 1.28, unit: "mg/dL", status: "ATTENTION", referenceRange: "0.6 - 1.1 mg/dL" },
    { id: "p4", reportId: "r3", name: "WBC Count", value: 6400, unit: "/µL", status: "NORMAL", referenceRange: "4,500 - 11,000 /µL" },
    { id: "p5", reportId: "r3", name: "Platelet Count", value: 210000, unit: "/µL", status: "NORMAL", referenceRange: "150,000 - 450,000 /µL" },

    // r2 parameters
    { id: "p6", reportId: "r2", name: "Hemoglobin", value: 14.8, unit: "g/dL", status: "NORMAL", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "p7", reportId: "r2", name: "Serum Creatinine", value: 1.0, unit: "mg/dL", status: "NORMAL", referenceRange: "0.6 - 1.1 mg/dL" },
    { id: "p8", reportId: "r2", name: "Fasting Blood Glucose", value: 95, unit: "mg/dL", status: "NORMAL", referenceRange: "70 - 99 mg/dL" },
    { id: "p9", reportId: "r2", name: "WBC Count", value: 6800, unit: "/µL", status: "NORMAL", referenceRange: "4,500 - 11,000 /µL" },

    // r1 parameters
    { id: "p10", reportId: "r1", name: "Hemoglobin", value: 14.9, unit: "g/dL", status: "NORMAL", referenceRange: "12.0 - 15.5 g/dL" },
    { id: "p11", reportId: "r1", name: "Vitamin D3", value: 18.2, unit: "ng/mL", status: "LOW", referenceRange: "30 - 100 ng/mL" },
    { id: "p12", reportId: "r1", name: "LDL Cholesterol", value: 136, unit: "mg/dL", status: "BORDERLINE", referenceRange: "< 100 mg/dL" },
    { id: "p13", reportId: "r1", name: "Serum Creatinine", value: 1.0, unit: "mg/dL", status: "NORMAL", referenceRange: "0.6 - 1.1 mg/dL" }
  ],
  profile: {
    fullName: "Ananya Sharma",
    age: 29,
    gender: "Female",
    bloodGroup: "B+",
    height: "165 cm",
    weight: "58 kg",
    allergies: "Penicillin, Pollen",
    conditions: "Mild Iron Deficiency Anemia",
    emergencyContact: "+91 98765 43210 (Dr. Sharma - Spouse)",
    address: "Mumbai, Maharashtra"
  }
};

export const DEFAULT_PROFILE = INITIAL_SEED.profile;

// Ensure database directory and file exist
function initDb() {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED, null, 2), "utf-8");
  }
}

export function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!data.profile) {
      data.profile = { ...DEFAULT_PROFILE };
    }
    if (!Array.isArray(data.reports)) data.reports = [];
    if (!Array.isArray(data.parameters)) data.parameters = [];
    return data;
  } catch (err) {
    console.error("Error reading database file, reinitializing:", err);
    initDb();
    return INITIAL_SEED;
  }
}

export function writeDb(data) {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const db = {
  // Reports
  getAllReports() {
    const { reports } = readDb();
    return [...reports].sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
  },

  getReportById(id) {
    const { reports, parameters } = readDb();
    const report = reports.find((r) => r.id === id);
    if (!report) return null;
    const reportParams = parameters.filter((p) => p.reportId === id);
    return { ...report, parameters: reportParams };
  },

  getLatestReport() {
    const reports = this.getAllReports();
    return reports[0] || null;
  },

  saveReport(reportData, extractedParameters) {
    const data = readDb();
    const reportId = "rep-" + Date.now();
    const newReport = {
      id: reportId,
      ...reportData,
      createdAt: new Date().toISOString()
    };

    data.reports.unshift(newReport);

    const newParams = (extractedParameters || []).map((p, idx) => ({
      id: "param-" + Date.now() + "-" + idx,
      reportId: reportId,
      ...p
    }));

    data.parameters.push(...newParams);
    writeDb(data);

    return { ...newReport, parameters: newParams };
  },

  // Parameters
  getParametersByReportId(reportId) {
    const { parameters } = readDb();
    return parameters.filter((p) => p.reportId === reportId);
  },

  // Trends
  getTrend(parameterName) {
    const { reports, parameters } = readDb();
    const normalizedTarget = parameterName.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matchingParams = parameters.filter((p) => {
      const norm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return norm.includes(normalizedTarget) || normalizedTarget.includes(norm);
    });

    const reportDateMap = new Map(reports.map((r) => [r.id, r.reportDate]));

    const trendPoints = matchingParams
      .map((p) => ({
        date: reportDateMap.get(p.reportId) || p.createdAt || "2026-09-01",
        value: typeof p.value === "number" ? p.value : parseFloat(p.value) || 0
      }))
      .filter((pt) => !isNaN(pt.value))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return trendPoints;
  },

  // Compare
  compareReports(beforeId, latestId) {
    const beforeReport = this.getReportById(beforeId);
    const latestReport = this.getReportById(latestId);

    if (!beforeReport || !latestReport) {
      return { rows: [], explanation: "Could not locate specified reports for comparison." };
    }

    const beforeMap = new Map(beforeReport.parameters.map((p) => [p.name.toLowerCase(), p]));
    const latestMap = new Map(latestReport.parameters.map((p) => [p.name.toLowerCase(), p]));

    const allNames = new Set([...beforeMap.keys(), ...latestMap.keys()]);
    const rows = [];

    for (const key of allNames) {
      const b = beforeMap.get(key);
      const l = latestMap.get(key);
      const paramName = (l || b).name;
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

    const explanation = `Comparing ${latestReport.fileName} with ${beforeReport.fileName}: Identified ${rows.length} biomarker measurements. Parameters with observed variations are flagged for clinical review.`;

    return {
      before: beforeReport,
      latest: latestReport,
      rows,
      explanation
    };
  },

  // Patient Profile
  getProfile() {
    const data = readDb();
    return data.profile || DEFAULT_PROFILE;
  },

  updateProfile(profileData) {
    const data = readDb();
    data.profile = { ...(data.profile || DEFAULT_PROFILE), ...profileData };
    writeDb(data);
    return data.profile;
  },

  // Report Deletion
  deleteReport(id) {
    const data = readDb();
    const prevCount = (data.reports || []).length;
    data.reports = (data.reports || []).filter((r) => r.id !== id);
    data.parameters = (data.parameters || []).filter((p) => p.reportId !== id);
    writeDb(data);
    return {
      success: true,
      deleted: prevCount !== data.reports.length,
      id,
      remainingCount: data.reports.length
    };
  },

  // Clear All Reports
  clearAllReports() {
    const data = readDb();
    const count = (data.reports || []).length;
    data.reports = [];
    data.parameters = [];
    writeDb(data);
    return {
      success: true,
      message: `Successfully removed all ${count} reports and cleared clinical data.`,
      clearedCount: count
    };
  }
};

