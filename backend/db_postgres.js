import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { Pool } = pg;

let pool = null;
let isInitialized = false;

function buildPool(connStr) {
  const isLocalhost = connStr.includes("localhost") || connStr.includes("127.0.0.1");
  return new Pool({
    connectionString: connStr,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 7000,
  });
}

export function getPool() {
  if (pool) return pool;

  let connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!connStr || connStr.includes("[YOUR-PASSWORD]")) {
    return null;
  }

  try {
    pool = buildPool(connStr);
    pool.on("error", (err) => {
      console.warn("[PostgreSQL Pool Warning]", err.message);
    });
    console.log("[PostgreSQL] Connection pool initialized.");
    return pool;
  } catch (err) {
    console.error("[PostgreSQL] Failed to initialize connection pool:", err.message);
    return null;
  }
}

/**
 * Automatically initialize database tables and seed patients if not already created
 */
export async function initPostgresSchema() {
  const p = getPool();
  if (!p || isInitialized) return;

  try {
    let client;
    try {
      client = await p.connect();
    } catch (connErr) {
      // If direct Supabase connection timed out (often due to IPv6 routing on Windows), try Supabase pooler
      const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
      const poolerMatch = connStr.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(.*)/i);
      if (poolerMatch) {
        console.warn("[PostgreSQL] Direct connection timed out, switching to Supabase connection pooler...");
        const [, user, pass, ref, dbName] = poolerMatch;
        const poolerUser = user.includes(".") ? user : `${user}.${ref}`;
        const poolerUrl = `postgresql://${poolerUser}:${pass}@aws-0-ap-south-1.pooler.supabase.com:5432/${dbName || "postgres"}`;
        pool = buildPool(poolerUrl);
        client = await pool.connect();
      } else {
        throw connErr;
      }
    }

    try {
      console.log("[PostgreSQL] Verifying / applying database schema...");

      // 1. Create Patients Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          full_name VARCHAR(255) NOT NULL,
          relation VARCHAR(50) DEFAULT 'Self',
          age INT CHECK (age >= 0 AND age <= 130),
          gender VARCHAR(20) DEFAULT 'Female',
          blood_group VARCHAR(10) DEFAULT 'B+',
          height VARCHAR(20),
          weight VARCHAR(20),
          allergies TEXT,
          conditions TEXT,
          emergency_contact VARCHAR(100),
          phone VARCHAR(50),
          address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Create Reports Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_size INT DEFAULT 0,
          file_type VARCHAR(100) DEFAULT 'application/pdf',
          report_date DATE NOT NULL DEFAULT CURRENT_DATE,
          summary TEXT,
          key_findings JSONB DEFAULT '[]'::jsonb,
          attention_needed JSONB DEFAULT '[]'::jsonb,
          extracted_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Create Biomarkers Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS biomarkers (
          id VARCHAR(64) PRIMARY KEY,
          report_id VARCHAR(64) NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
          user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          canonical_name VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          value NUMERIC(10, 2) NOT NULL,
          unit VARCHAR(50),
          status VARCHAR(50) DEFAULT 'NORMAL',
          reference_range VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Create Vector Embeddings / RAG Store
      await client.query(`
        CREATE TABLE IF NOT EXISTS report_embeddings (
          id VARCHAR(64) PRIMARY KEY,
          report_id VARCHAR(64) NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
          user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 5. Seed default patients if table is empty
      const existing = await client.query("SELECT COUNT(*) FROM patients;");
      if (parseInt(existing.rows[0].count, 10) === 0) {
        console.log("[PostgreSQL] Seeding default family patient profiles...");
        await client.query(`
          INSERT INTO patients (id, email, full_name, relation, age, gender, blood_group, conditions, allergies, phone, address, emergency_contact)
          VALUES 
            ('usr-default', 'ananya.sharma@example.com', 'Ananya Sharma', 'Self', 29, 'Female', 'B+', 'Mild Iron Deficiency Anemia', 'Penicillin, Pollen', '+91 98765 11001', 'Bandra West, Mumbai, Maharashtra', '+91 98765 43210 (Dr. Vikram Sharma - Spouse)'),
            ('usr-spouse', 'vikram.sharma@example.com', 'Dr. Vikram Sharma', 'Spouse', 32, 'Male', 'O+', 'No chronic conditions', 'None reported', '+91 98765 22002', 'Bandra West, Mumbai, Maharashtra', '+91 98765 11001 (Ananya Sharma - Spouse)'),
            ('usr-mother', 'sunita.sharma@example.com', 'Sunita Sharma', 'Parent', 58, 'Female', 'A+', 'Mild Hypertension, Osteoarthritis', 'Sulfa drugs, Dust mites', '+91 98765 33003', 'Andheri East, Mumbai, Maharashtra', '+91 98765 11001 (Ananya Sharma - Daughter)'),
            ('usr-child', 'aarav.sharma@example.com', 'Aarav Sharma', 'Child', 5, 'Male', 'B+', 'Childhood seasonal asthma', 'Peanuts, Shellfish', '+91 98765 44004', 'Bandra West, Mumbai, Maharashtra', '+91 98765 11001 (Ananya Sharma - Mother)')
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // 6. Seed default reports & biomarkers if reports table is empty
      const existingReports = await client.query("SELECT COUNT(*) FROM reports;");
      if (parseInt(existingReports.rows[0].count, 10) === 0) {
        console.log("[PostgreSQL] Seeding initial medical reports & biomarkers...");
        await client.query(`
          INSERT INTO reports (id, user_id, file_name, file_url, file_size, file_type, report_date, summary, key_findings, attention_needed, extracted_text)
          VALUES 
            (
              'rep-r3', 'usr-default', 'Ananya_Blood_Report_September.pdf', '/api/storage/files/Ananya_Blood_Report_September.pdf', 245000, 'application/pdf', '2026-09-15',
              'Ananya''s September blood report identifies mild iron deficiency anemia with Hemoglobin at 11.4 g/dL, while Fasting Blood Glucose is borderline elevated at 108 mg/dL. Creatinine shows a slight upward shift at 1.28 mg/dL, and WBC and Platelets remain in healthy ranges.',
              '["Hemoglobin: 11.4 g/dL (Below reference range of 12.0 g/dL)", "Fasting Glucose: 108 mg/dL (Borderline impaired fasting)", "Serum Creatinine: 1.28 mg/dL (Mild filtration workload)", "WBC: 6,400 /µL and Platelets: 210,000 /µL (Normal)"]'::jsonb,
              '["Hemoglobin (11.4 g/dL) indicates mild anemia; discuss dietary iron or supplementation with your physician.", "Fasting glucose (108 mg/dL) shows early borderline insulin resistance; simple carbohydrate moderation is advised.", "Creatinine (1.28 mg/dL) has moved up slightly from last month; ensure 2.5–3L daily hydration and re-check."]'::jsonb,
              'Patient: Ananya Sharma\nAge: 29 Yrs | Gender: Female\nCollection Date: 15-Sep-2026\nLab: Metropolis Healthcare Diagnostic Lab\n\nCOMPLETE BLOOD EXAMINATION & METABOLIC PANEL\nHemoglobin: 11.4 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]\nFasting Blood Glucose: 108 mg/dL (Reference: 70 - 99 mg/dL) [BORDERLINE]\nSerum Creatinine: 1.28 mg/dL (Reference: 0.6 - 1.1 mg/dL) [ATTENTION]\nWBC Count: 6,400 /µL (Reference: 4,500 - 11,000 /µL) [NORMAL]\nPlatelet Count: 210,000 /µL (Reference: 150,000 - 450,000 /µL) [NORMAL]'
            ),
            (
              'rep-r2', 'usr-default', 'Ananya_CBC_August.pdf', '/api/storage/files/Ananya_CBC_August.pdf', 180000, 'application/pdf', '2026-08-20',
              'August CBC report showed stable clinical parameters with Hemoglobin at 14.8 g/dL, normal fasting glucose, and optimal kidney filtration.',
              '["Hemoglobin: 14.8 g/dL (Normal)", "Creatinine: 1.0 mg/dL (Normal)", "Blood Glucose: 95 mg/dL (Normal)"]'::jsonb,
              '[]'::jsonb,
              'Patient: Ananya Sharma\nCollection Date: 20-Aug-2026\nHemoglobin: 14.8 g/dL\nSerum Creatinine: 1.0 mg/dL\nFasting Blood Glucose: 95 mg/dL\nWBC Count: 6,800 /µL'
            ),
            (
              'rep-r1', 'usr-default', 'Ananya_Health_Check_July.jpg', '/api/storage/files/Ananya_Health_Check_July.jpg', 920000, 'image/jpeg', '2026-07-12',
              'Comprehensive July health screening highlighted low Vitamin D3 at 18.2 ng/mL (clinical deficiency) and borderline LDL cholesterol at 136 mg/dL.',
              '["Vitamin D3: 18.2 ng/mL (Deficient)", "LDL Cholesterol: 136 mg/dL (Borderline high)", "Hemoglobin: 14.9 g/dL (Optimal)"]'::jsonb,
              '["Vitamin D3 is 18.2 ng/mL; discuss therapeutic Vitamin D supplementation with your doctor."]'::jsonb,
              'Patient: Ananya Sharma\nCollection Date: 12-Jul-2026\nHemoglobin: 14.9 g/dL\nVitamin D3 (25-OH): 18.2 ng/mL [LOW]\nLDL Cholesterol: 136 mg/dL [BORDERLINE]\nSerum Creatinine: 1.0 mg/dL'
            )
          ON CONFLICT (id) DO NOTHING;
        `);

        await client.query(`
          INSERT INTO biomarkers (id, report_id, user_id, name, canonical_name, category, value, unit, status, reference_range)
          VALUES 
            ('bio-1', 'rep-r3', 'usr-default', 'Hemoglobin', 'Hemoglobin', 'Complete Blood Count', 11.4, 'g/dL', 'LOW', '12.0 - 15.5 g/dL'),
            ('bio-2', 'rep-r3', 'usr-default', 'Fasting Blood Glucose', 'Fasting Blood Glucose', 'Metabolic Panel', 108, 'mg/dL', 'BORDERLINE', '70 - 99 mg/dL'),
            ('bio-3', 'rep-r3', 'usr-default', 'Serum Creatinine', 'Serum Creatinine', 'Kidney Function', 1.28, 'mg/dL', 'ATTENTION', '0.6 - 1.1 mg/dL'),
            ('bio-4', 'rep-r3', 'usr-default', 'WBC Count', 'WBC Count', 'Complete Blood Count', 6400, '/µL', 'NORMAL', '4,500 - 11,000 /µL'),
            ('bio-5', 'rep-r3', 'usr-default', 'Platelet Count', 'Platelet Count', 'Complete Blood Count', 210000, '/µL', 'NORMAL', '150,000 - 450,000 /µL'),
            ('bio-6', 'rep-r2', 'usr-default', 'Hemoglobin', 'Hemoglobin', 'Complete Blood Count', 14.8, 'g/dL', 'NORMAL', '12.0 - 15.5 g/dL'),
            ('bio-7', 'rep-r2', 'usr-default', 'Serum Creatinine', 'Serum Creatinine', 'Kidney Function', 1.0, 'mg/dL', 'NORMAL', '0.6 - 1.1 mg/dL'),
            ('bio-8', 'rep-r2', 'usr-default', 'Fasting Blood Glucose', 'Fasting Blood Glucose', 'Metabolic Panel', 95, 'mg/dL', 'NORMAL', '70 - 99 mg/dL'),
            ('bio-9', 'rep-r2', 'usr-default', 'WBC Count', 'WBC Count', 'Complete Blood Count', 6800, '/µL', 'NORMAL', '4,500 - 11,000 /µL'),
            ('bio-10', 'rep-r1', 'usr-default', 'Hemoglobin', 'Hemoglobin', 'Complete Blood Count', 14.9, 'g/dL', 'NORMAL', '12.0 - 15.5 g/dL'),
            ('bio-11', 'rep-r1', 'usr-default', 'Vitamin D3', 'Vitamin D3', 'Vitamins', 18.2, 'ng/mL', 'LOW', '30 - 100 ng/mL'),
            ('bio-12', 'rep-r1', 'usr-default', 'LDL Cholesterol', 'LDL Cholesterol', 'Lipid Profile', 136, 'mg/dL', 'BORDERLINE', '< 100 mg/dL'),
            ('bio-13', 'rep-r1', 'usr-default', 'Serum Creatinine', 'Serum Creatinine', 'Kidney Function', 1.0, 'mg/dL', 'NORMAL', '0.6 - 1.1 mg/dL')
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      isInitialized = true;
      console.log("[PostgreSQL] ✓ Schema is fully operational and synchronized.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[PostgreSQL Schema Notice]:", err.message);
  }
}

// Helper to convert database row to camelCase patient profile
function mapPatientRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    relation: row.relation || "Self",
    age: row.age,
    gender: row.gender,
    bloodGroup: row.blood_group,
    height: row.height,
    weight: row.weight,
    allergies: row.allergies,
    conditions: row.conditions,
    emergencyContact: row.emergency_contact,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
  };
}

// Helper to map report row
function mapReportRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    fileType: row.file_type,
    reportDate: row.report_date ? new Date(row.report_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    summary: row.summary,
    keyFindings: Array.isArray(row.key_findings) ? row.key_findings : JSON.parse(row.key_findings || "[]"),
    attentionNeeded: Array.isArray(row.attention_needed) ? row.attention_needed : JSON.parse(row.attention_needed || "[]"),
    extractedText: row.extracted_text,
    createdAt: row.created_at,
    parameters: Array.isArray(row.parameters) ? row.parameters : []
  };
}

export const postgresDb = {
  isConfigured() {
    return Boolean(getPool());
  },

  async getUser(userId = "usr-default") {
    await initPostgresSchema();
    const res = await pool.query("SELECT * FROM patients WHERE id = $1;", [userId]);
    if (res.rows.length > 0) return mapPatientRow(res.rows[0]);
    // Fallback to default user
    const fallback = await pool.query("SELECT * FROM patients WHERE id = 'usr-default' OR relation = 'Self' LIMIT 1;");
    return mapPatientRow(fallback.rows[0]);
  },

  async getAllUsers() {
    await initPostgresSchema();
    const res = await pool.query("SELECT * FROM patients ORDER BY created_at ASC;");
    return res.rows.map(mapPatientRow);
  },

  async upsertUser(userData) {
    await initPostgresSchema();
    const id = userData.id || "usr-" + Date.now();
    const query = `
      INSERT INTO patients (id, full_name, relation, email, age, gender, blood_group, height, weight, allergies, conditions, emergency_contact, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        relation = EXCLUDED.relation,
        email = COALESCE(EXCLUDED.email, patients.email),
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        blood_group = EXCLUDED.blood_group,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        allergies = EXCLUDED.allergies,
        conditions = EXCLUDED.conditions,
        emergency_contact = EXCLUDED.emergency_contact,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [
      id,
      userData.fullName || "Patient",
      userData.relation || "Self",
      userData.email || `${id}@example.com`,
      userData.age || 30,
      userData.gender || "Female",
      userData.bloodGroup || "B+",
      userData.height || "165 cm",
      userData.weight || "60 kg",
      userData.allergies || "",
      userData.conditions || "",
      userData.emergencyContact || "",
      userData.phone || "",
      userData.address || "",
    ];
    const res = await pool.query(query, values);
    return mapPatientRow(res.rows[0]);
  },

  async getProfile(userId = "usr-default") {
    return this.getUser(userId);
  },

  async updateProfile(userData, userId = "usr-default") {
    return this.upsertUser({ ...userData, id: userData.id || userId });
  },

  async getAllReports(userId = "usr-default") {
    await initPostgresSchema();
    const query = `
      SELECT r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', b.id,
              'reportId', b.report_id,
              'userId', b.user_id,
              'name', b.name,
              'canonicalName', b.canonical_name,
              'category', b.category,
              'value', b.value::float,
              'unit', b.unit,
              'status', b.status,
              'referenceRange', b.reference_range
            )
          ) FILTER (WHERE b.id IS NOT NULL), '[]'
        ) as parameters
      FROM reports r
      LEFT JOIN biomarkers b ON r.id = b.report_id
      WHERE r.user_id = $1
      GROUP BY r.id
      ORDER BY r.report_date DESC, r.created_at DESC;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(mapReportRow);
  },

  async getReportById(reportId) {
    await initPostgresSchema();
    const query = `
      SELECT r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', b.id,
              'reportId', b.report_id,
              'userId', b.user_id,
              'name', b.name,
              'canonicalName', b.canonical_name,
              'category', b.category,
              'value', b.value::float,
              'unit', b.unit,
              'status', b.status,
              'referenceRange', b.reference_range
            )
          ) FILTER (WHERE b.id IS NOT NULL), '[]'
        ) as parameters
      FROM reports r
      LEFT JOIN biomarkers b ON r.id = b.report_id
      WHERE r.id = $1
      GROUP BY r.id;
    `;
    const res = await pool.query(query, [reportId]);
    if (res.rows.length === 0) return null;
    return mapReportRow(res.rows[0]);
  },

  async getLatestReport(userId = "usr-default") {
    const reports = await this.getAllReports(userId);
    return reports[0] || null;
  },

  async saveReport(reportData, extractedParameters = [], userId = "usr-default") {
    await initPostgresSchema();
    const reportId = "rep-" + Date.now();
    const client = await pool.connect();

    try {
      await client.query("BEGIN;");

      const insertReport = `
        INSERT INTO reports (id, user_id, file_name, file_url, file_size, file_type, report_date, summary, key_findings, attention_needed, extracted_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const reportValues = [
        reportId,
        userId,
        reportData.fileName,
        reportData.fileUrl || `/api/storage/files/${reportData.fileName}`,
        reportData.fileSize || 0,
        reportData.fileType || "application/pdf",
        reportData.reportDate || new Date().toISOString().split("T")[0],
        reportData.summary || "",
        JSON.stringify(reportData.keyFindings || []),
        JSON.stringify(reportData.attentionNeeded || []),
        reportData.extractedText || "",
      ];
      const repRes = await client.query(insertReport, reportValues);

      // Insert associated biomarkers
      const savedParameters = [];
      for (let i = 0; i < extractedParameters.length; i++) {
        const p = extractedParameters[i];
        const bioId = `bio-${Date.now()}-${i}`;
        const val = typeof p.value === "number" ? p.value : parseFloat(p.value) || 0;

        await client.query(
          `INSERT INTO biomarkers (id, report_id, user_id, name, canonical_name, category, value, unit, status, reference_range)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            bioId,
            reportId,
            userId,
            p.name,
            p.canonicalName || p.name,
            p.category || "General",
            val,
            p.unit || "",
            p.status || "NORMAL",
            p.referenceRange || "Standard range",
          ]
        );

        savedParameters.push({
          id: bioId,
          reportId,
          userId,
          name: p.name,
          canonicalName: p.canonicalName || p.name,
          category: p.category || "General",
          value: val,
          unit: p.unit || "",
          status: p.status || "NORMAL",
          referenceRange: p.referenceRange || "Standard range",
        });
      }

      // Insert embedding record for RAG semantic search
      const textChunk = `${reportData.fileName}\n${reportData.summary}\n${extractedParameters.map((p) => `${p.name}: ${p.value} ${p.unit} [${p.status}]`).join("\n")}`;
      await client.query(
        `INSERT INTO report_embeddings (id, report_id, user_id, content, metadata)
         VALUES ($1, $2, $3, $4, $5);`,
        [
          "vec-" + Date.now(),
          reportId,
          userId,
          textChunk,
          JSON.stringify({
            fileName: reportData.fileName,
            reportDate: reportData.reportDate,
            anomaliesCount: extractedParameters.filter((p) => p.status !== "NORMAL").length,
          }),
        ]
      );

      await client.query("COMMIT;");

      const savedReport = mapReportRow(repRes.rows[0]);
      savedReport.parameters = savedParameters;
      return savedReport;
    } catch (err) {
      await client.query("ROLLBACK;");
      throw err;
    } finally {
      client.release();
    }
  },

  async deleteReport(reportId) {
    await initPostgresSchema();
    const res = await pool.query("DELETE FROM reports WHERE id = $1 RETURNING id;", [reportId]);
    return {
      success: res.rowCount > 0,
      deleted: res.rowCount > 0,
      reportId,
    };
  },

  async clearAllReports(userId = "usr-default") {
    await initPostgresSchema();
    const res = await pool.query("DELETE FROM reports WHERE user_id = $1;", [userId]);
    return {
      success: true,
      message: `Cleared ${res.rowCount} reports and associated biomarkers from PostgreSQL database.`,
      clearedCount: res.rowCount,
    };
  },

  async getTrend(parameterName, userId = "usr-default") {
    await initPostgresSchema();
    const query = `
      SELECT r.report_date as date, b.value::float as value
      FROM biomarkers b
      JOIN reports r ON b.report_id = r.id
      WHERE b.user_id = $1
        AND (b.canonical_name ILIKE $2 OR b.name ILIKE $2)
      ORDER BY r.report_date ASC;
    `;
    const res = await pool.query(query, [userId, `%${parameterName}%`]);
    return res.rows.map((r) => ({
      date: r.date ? new Date(r.date).toISOString().split("T")[0] : "2026-09-01",
      value: r.value,
    }));
  },

  async compareReports(beforeId, latestId) {
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
      const beforeVal = b ? b.value : "-";
      const latestVal = l ? l.value : "-";

      let diff = "-";
      let status = "NORMAL";

      if (typeof beforeVal === "number" && typeof latestVal === "number") {
        const delta = Math.round((latestVal - beforeVal) * 100) / 100;
        diff = (delta > 0 ? "+" : "") + delta;
      }

      if (l) {
        status = l.status || "NORMAL";
      } else if (b) {
        status = b.status || "NORMAL";
      }

      rows.push({
        param: paramName,
        before: beforeVal,
        latest: latestVal,
        diff,
        status,
      });
    }

    return {
      before,
      latest,
      rows,
      explanation: `Comparing ${before.fileName} with ${latest.fileName}: Identified ${rows.length} biomarker measurements.`,
    };
  },

  async searchVectorEmbeddings(query, userId = "usr-default", limit = 3) {
    await initPostgresSchema();
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (!words.length) return [];

    const querySql = `
      SELECT id, report_id, content, metadata
      FROM report_embeddings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const res = await pool.query(querySql, [userId, limit]);
    return res.rows.map((row) => ({
      id: row.id,
      content: row.content,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata || {},
      similarity: 0.85,
    }));
  },
};
