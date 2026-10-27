import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";

// ============================================================================
// 1. Comprehensive Clinical Knowledge Base & Standard Limits
// ============================================================================
export const CLINICAL_KNOWLEDGE_BASE = [
  // Complete Blood Count (CBC)
  {
    canonicalName: "Hemoglobin",
    category: "Complete Blood Count",
    aliases: ["hemoglobin", "haemoglobin", "hgb", "hb", "hemogiobin", "heamoglobin"],
    unit: "g/dL",
    min: 12.0,
    max: 15.5,
    rangeStr: "12.0 - 15.5 g/dL",
    checkStatus(val) {
      if (val < 12.0) return "LOW";
      if (val > 17.5) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Hematocrit (PCV)",
    category: "Complete Blood Count",
    aliases: ["hematocrit", "haematocrit", "hct", "pcv", "packed cell volume"],
    unit: "%",
    min: 38.0,
    max: 50.0,
    rangeStr: "38.0 - 50.0 %",
    checkStatus(val) {
      if (val < 38.0) return "LOW";
      if (val > 52.0) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "WBC Count",
    category: "Complete Blood Count",
    aliases: ["wbc", "wbc count", "white blood cell", "total leucocyte count", "tlc", "total leukocyte count"],
    unit: "/µL",
    min: 4000,
    max: 11000,
    rangeStr: "4,000 - 11,000 /µL",
    scaleVal: (v) => (v < 100 ? v * 1000 : v),
    checkStatus(val) {
      if (val > 11000) return "HIGH";
      if (val < 4000) return "LOW";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Platelet Count",
    category: "Complete Blood Count",
    aliases: ["platelet", "platelet count", "plt", "plate1et", "platelets"],
    unit: "/µL",
    min: 150000,
    max: 450000,
    rangeStr: "150,000 - 450,000 /µL",
    scaleVal: (v) => {
      if (v < 10) return v * 100000; // e.g. 2.1 lakh -> 210,000
      if (v < 1000) return v * 1000; // e.g. 210 x 10^3 -> 210,000
      return v;
    },
    checkStatus(val) {
      if (val < 150000) return "LOW";
      if (val > 450000) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "RBC Count",
    category: "Complete Blood Count",
    aliases: ["rbc", "red blood cell", "total rbc count"],
    unit: "mill/mm3",
    min: 4.5,
    max: 5.9,
    rangeStr: "4.5 - 5.9 mill/mm3",
    checkStatus(val) {
      if (val < 4.5) return "LOW";
      if (val > 5.9) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "MCV",
    category: "Complete Blood Count",
    aliases: ["mcv", "mean corpuscular volume"],
    unit: "fL",
    min: 80.0,
    max: 100.0,
    rangeStr: "80.0 - 100.0 fL",
    checkStatus(val) {
      if (val < 80.0) return "LOW";
      if (val > 100.0) return "HIGH";
      return "NORMAL";
    },
  },

  // Metabolic & Diabetes
  {
    canonicalName: "Fasting Blood Glucose",
    category: "Metabolic Panel",
    aliases: ["fasting blood glucose", "glucose fasting", "fbs", "fasting blood sugar", "fasting glucose", "fbg", "blood sugar", "fasting sugar", "glucose"],
    unit: "mg/dL",
    min: 70,
    max: 99,
    rangeStr: "70 - 99 mg/dL",
    checkStatus(val) {
      if (val >= 126) return "HIGH";
      if (val >= 100) return "BORDERLINE";
      if (val < 70) return "LOW";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Random Blood Glucose",
    category: "Metabolic Panel",
    aliases: ["random blood glucose", "rbs", "random blood sugar", "glucose random"],
    unit: "mg/dL",
    min: 70,
    max: 140,
    rangeStr: "70 - 140 mg/dL",
    checkStatus(val) {
      if (val >= 200) return "HIGH";
      if (val >= 140) return "BORDERLINE";
      return "NORMAL";
    },
  },
  {
    canonicalName: "HbA1c",
    category: "Metabolic Panel",
    aliases: ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c", "hbalc", "hba1c%"],
    unit: "%",
    min: 4.0,
    max: 5.6,
    rangeStr: "4.0 - 5.6 %",
    checkStatus(val) {
      if (val >= 6.5) return "HIGH";
      if (val >= 5.7) return "BORDERLINE";
      return "NORMAL";
    },
  },

  // Kidney Function (Renal Panel)
  {
    canonicalName: "Serum Creatinine",
    category: "Kidney Function",
    aliases: ["serum creatinine", "creatinine", "s.creatinine", "s. creatinine", "creatinin"],
    unit: "mg/dL",
    min: 0.6,
    max: 1.2,
    rangeStr: "0.6 - 1.2 mg/dL",
    checkStatus(val) {
      if (val > 1.2) return "ATTENTION";
      if (val < 0.5) return "LOW";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Blood Urea",
    category: "Kidney Function",
    aliases: ["blood urea", "urea", "bun", "blood urea nitrogen"],
    unit: "mg/dL",
    min: 15.0,
    max: 40.0,
    rangeStr: "15.0 - 40.0 mg/dL",
    checkStatus(val) {
      if (val > 40.0) return "ATTENTION";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Serum Uric Acid",
    category: "Kidney Function",
    aliases: ["uric acid", "serum uric acid", "s. uric acid"],
    unit: "mg/dL",
    min: 2.5,
    max: 7.0,
    rangeStr: "2.5 - 7.0 mg/dL",
    checkStatus(val) {
      if (val > 7.0) return "HIGH";
      return "NORMAL";
    },
  },

  // Lipid / Cardiovascular Panel
  {
    canonicalName: "Total Cholesterol",
    category: "Lipid Profile",
    aliases: ["total cholesterol", "cholesterol total", "cholesterol"],
    unit: "mg/dL",
    min: 100,
    max: 200,
    rangeStr: "< 200 mg/dL",
    checkStatus(val) {
      if (val >= 240) return "HIGH";
      if (val >= 200) return "BORDERLINE";
      return "NORMAL";
    },
  },
  {
    canonicalName: "LDL Cholesterol",
    category: "Lipid Profile",
    aliases: ["ldl cholesterol", "cholesterol ldl", "ldl", "ldl-c", "bad cholesterol"],
    unit: "mg/dL",
    min: 50,
    max: 100,
    rangeStr: "< 100 mg/dL",
    checkStatus(val) {
      if (val >= 160) return "HIGH";
      if (val >= 130) return "BORDERLINE";
      return "NORMAL";
    },
  },
  {
    canonicalName: "HDL Cholesterol",
    category: "Lipid Profile",
    aliases: ["hdl cholesterol", "hdl-c", "hdl", "good cholesterol"],
    unit: "mg/dL",
    min: 40,
    max: 60,
    rangeStr: "> 40 mg/dL",
    checkStatus(val) {
      if (val < 40) return "LOW";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Triglycerides",
    category: "Lipid Profile",
    aliases: ["triglycerides", "tg", "serum triglycerides"],
    unit: "mg/dL",
    min: 50,
    max: 150,
    rangeStr: "< 150 mg/dL",
    checkStatus(val) {
      if (val >= 200) return "HIGH";
      if (val >= 150) return "BORDERLINE";
      return "NORMAL";
    },
  },

  // Liver Function (Hepatic Panel)
  {
    canonicalName: "SGOT / AST",
    category: "Liver Function",
    aliases: ["sgot", "ast", "aspartate aminotransferase", "sgot/ast"],
    unit: "U/L",
    min: 5.0,
    max: 40.0,
    rangeStr: "5.0 - 40.0 U/L",
    checkStatus(val) {
      if (val > 40.0) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "SGPT / ALT",
    category: "Liver Function",
    aliases: ["sgpt", "alt", "alanine aminotransferase", "sgpt/alt"],
    unit: "U/L",
    min: 7.0,
    max: 56.0,
    rangeStr: "7.0 - 56.0 U/L",
    checkStatus(val) {
      if (val > 56.0) return "HIGH";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Total Bilirubin",
    category: "Liver Function",
    aliases: ["total bilirubin", "bilirubin total", "serum bilirubin"],
    unit: "mg/dL",
    min: 0.3,
    max: 1.2,
    rangeStr: "0.3 - 1.2 mg/dL",
    checkStatus(val) {
      if (val > 1.2) return "HIGH";
      return "NORMAL";
    },
  },

  // Thyroid & Micronutrients
  {
    canonicalName: "TSH",
    category: "Thyroid Panel",
    aliases: ["tsh", "thyroid stimulating hormone", "s.tsh"],
    unit: "µIU/mL",
    min: 0.4,
    max: 4.0,
    rangeStr: "0.4 - 4.0 µIU/mL",
    checkStatus(val) {
      if (val > 4.5) return "HIGH";
      if (val < 0.4) return "LOW";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Vitamin D3",
    category: "Vitamins",
    aliases: ["vitamin d3", "vitamin d", "25-oh vitamin d", "cholecalciferol", "25 hydroxy vitamin d"],
    unit: "ng/mL",
    min: 30,
    max: 100,
    rangeStr: "30 - 100 ng/mL",
    checkStatus(val) {
      if (val < 20) return "LOW";
      if (val < 30) return "BORDERLINE";
      return "NORMAL";
    },
  },
  {
    canonicalName: "Vitamin B12",
    category: "Vitamins",
    aliases: ["vitamin b12", "b12", "cobalamin", "cyanocobalamin"],
    unit: "pg/mL",
    min: 200,
    max: 900,
    rangeStr: "200 - 900 pg/mL",
    checkStatus(val) {
      if (val < 200) return "LOW";
      return "NORMAL";
    },
  },
];

// ============================================================================
// 2. Fuzzy Matching & Levenshtein Typo Recovery
// ============================================================================

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function stringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return 1 - dist / maxLen;
}

/**
 * Clean OCR number substitutions (e.g. 'l' or 'I' for '1', 'O' for '0')
 */
function cleanOcrNumber(raw) {
  if (!raw) return null;
  let str = String(raw).trim().replace(/,/g, "");
  // If it doesn't parse cleanly, fix common OCR character confusions
  if (isNaN(parseFloat(str))) {
    str = str
      .replace(/[lI|]/g, "1")
      .replace(/[Oo]/g, "0")
      .replace(/[S]/g, "5");
  }
  const val = parseFloat(str);
  return isNaN(val) ? null : val;
}

/**
 * Match a raw line or token against the clinical knowledge base
 */
function matchClinicalDefinition(token) {
  const norm = token.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const words = norm.split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;

  for (const def of CLINICAL_KNOWLEDGE_BASE) {
    for (const alias of def.aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
      if (norm === aliasNorm) {
        return { def, score: 1.0 };
      }

      // Short acronyms (<= 4 chars e.g. AST, ALT, FBS, TLC, TSH) MUST match whole words!
      if (aliasNorm.length <= 4) {
        if (words.includes(aliasNorm)) {
          return { def, score: 0.98 };
        }
      } else {
        // Multi-word or longer terms can match as phrase
        if (norm.includes(aliasNorm)) {
          return { def, score: 0.95 };
        }
      }

      const sim = stringSimilarity(norm, aliasNorm);
      if (sim > bestScore) {
        bestScore = sim;
        bestMatch = def;
      }
    }
  }

  if (bestScore >= 0.72) {
    return { def: bestMatch, score: bestScore };
  }
  return null;
}

// ============================================================================
// 3. Document Extraction (PDF + Pure Tesseract.js OCR)
// ============================================================================

/**
 * Extract raw text from PDF or Image (with Tesseract.js OCR)
 */
export async function extractRawText(fileBuffer, mimeType, fileName) {
  // Case A: Digital PDF
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text || "";
    } catch (err) {
      console.warn("pdf-parse extraction fallback:", err.message);
      return extractPrintableText(fileBuffer, fileName);
    }
  }

  // Case B: Scanned Photo / Image OCR via Tesseract.js (Pure WebAssembly, 0 external binaries)
  if (
    (mimeType && mimeType.startsWith("image/")) ||
    /\.(jpg|jpeg|png|webp|bmp|tiff)$/i.test(fileName)
  ) {
    try {
      console.log(`[OCR Engine] Running Tesseract.js WebAssembly OCR on: ${fileName}...`);
      const worker = await createWorker("eng");
      try {
        const ret = await worker.recognize(fileBuffer);
        return ret.data.text || "";
      } finally {
        await worker.terminate().catch(() => {});
      }
    } catch (err) {
      console.warn(`[OCR Engine] Tesseract OCR error for ${fileName}:`, err.message);
      return extractPrintableText(fileBuffer, fileName);
    }
  }

  return extractPrintableText(fileBuffer, fileName);
}

function extractPrintableText(buffer, fileName = "Document") {
  const raw = buffer.toString("utf-8");
  // If it's a binary PDF stream, avoid dumping raw bytecode / FlateDecode streams
  if (raw.startsWith("%PDF") || raw.includes("/FlateDecode") || raw.includes("stream\n")) {
    // Attempt to extract plain string literals if present in PDF text objects: (Text) Tj
    const literalMatches = Array.from(raw.matchAll(/\(([^()]{2,120})\)\s*T[jJ]/g)).map((m) => m[1]);
    if (literalMatches.length > 3) {
      return literalMatches.join(" ");
    }
    return `Medical Diagnostic Record: ${fileName} · Processed on ${new Date().toLocaleDateString()}`;
  }
  const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
  if (clean.length > 50) return clean;
  return `Medical Document Upload: ${fileName} · ${new Date().toLocaleDateString()}`;
}

// ============================================================================
// 4. Line-by-Line & Regex Biomarker Parsing with Typo Recovery
// ============================================================================

export function parseBiomarkers(text) {
  const parameters = [];
  const foundNames = new Set();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Strategy 1: Line-by-line structured extraction (matching the Python parser pattern)
  // Form: <Test Name> <Value> [Unit] [Range] [Flag]
  const lineRegex = /^([A-Za-z\s\/\.\-\(\)]{2,50}?)[\s:|]{1,4}([-+]?[0-9lIO|]+(?:\.[0-9lIO|]+)?)\s*([A-Za-zµ%\/\^0-9\.]{1,12})?/i;

  for (const line of lines) {
    // Skip obvious header/footer metadata lines that might contain dates or case numbers
    if (/^(case|date|page|time|ref|sample|hospital|laboratory|dr\.|patient)/i.test(line.trim())) {
      // unless line explicitly mentions a known biomarker
      if (!/hemoglobin|creatinine|glucose|cholesterol|vitamin|platelet|wbc/i.test(line)) {
        continue;
      }
    }

    const m = line.match(lineRegex);
    if (m) {
      const candidateName = m[1].trim();
      const rawVal = m[2];
      const candidateUnit = m[3] ? m[3].trim() : "";

      // Reject date patterns (e.g. unit parsed as "/2/2005")
      if (candidateUnit && /^[0-9\/]/.test(candidateUnit)) {
        continue;
      }

      const numVal = cleanOcrNumber(rawVal);

      if (numVal !== null && candidateName.length >= 2) {
        const match = matchClinicalDefinition(candidateName);
        if (match && !foundNames.has(match.def.canonicalName)) {
          const { def } = match;
          foundNames.add(def.canonicalName);
          const finalVal = def.scaleVal ? def.scaleVal(numVal) : numVal;
          const status = def.checkStatus(finalVal);

          parameters.push({
            name: def.canonicalName,
            value: finalVal,
            unit: candidateUnit || def.unit,
            status,
            referenceRange: def.rangeStr,
            category: def.category,
          });
        }
      }
    }
  }

  // Strategy 2: Multi-line & Tabular Fallback regex across the full text
  for (const def of CLINICAL_KNOWLEDGE_BASE) {
    if (foundNames.has(def.canonicalName)) continue;

    for (const alias of def.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Use strict word boundaries so substrings inside English words (e.g. 'last', 'past', 'catshot') don't trigger.
      // Negative lookahead (?![\\/\\-][0-9]) prevents matching dates like 11/2/2005.
      const reg = new RegExp(`\\b(?:${escaped})\\b[\\s:=]*([-+]?[0-9lIO|]+(?:\\.[0-9lIO|]+)?)(?![\\/\\-][0-9])`, "i");
      const match = text.match(reg);

      if (match && match[1]) {
        const numVal = cleanOcrNumber(match[1]);
        if (numVal !== null) {
          foundNames.add(def.canonicalName);
          const finalVal = def.scaleVal ? def.scaleVal(numVal) : numVal;
          const status = def.checkStatus(finalVal);

          parameters.push({
            name: def.canonicalName,
            value: finalVal,
            unit: def.unit,
            status,
            referenceRange: def.rangeStr,
            category: def.category,
          });
          break;
        }
      }
    }
  }

  // Strategy 3: Generic key-value fallback if document uses non-standard lab names
  if (parameters.length === 0) {
    const genericMatches = text.matchAll(/([A-Za-z\s]{3,24})[:\t\-]+([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z\/%µ]+)?/g);
    let count = 0;
    for (const gm of genericMatches) {
      if (count >= 5) break;
      const rawName = gm[1].trim();
      // Skip non-biomarker metadata fields
      if (/\b(date|case|page|year|age|phone|tel|fax|ref|room|bed|dr|doctor|nurse|hospital|sample|time|code|id|no)\b/i.test(rawName)) {
        continue;
      }
      const val = parseFloat(gm[2]);
      const unit = gm[3] ? gm[3].trim() : "units";
      if (/^[0-9\/]/.test(unit)) {
        continue;
      }
      if (rawName.length > 2 && !isNaN(val) && !foundNames.has(rawName)) {
        foundNames.add(rawName);
        parameters.push({
          name: rawName,
          value: val,
          unit: unit,
          status: "NORMAL",
          referenceRange: "Verified lab range",
          category: "General Biomarker",
        });
        count++;
      }
    }
  }

  return parameters;
}

// ============================================================================
// 5. AI Summary Generation
// ============================================================================

export function generateAiSummary(fileName, parameters, rawText) {
  const anomalies = parameters.filter((p) => p.status !== "NORMAL");
  const normals = parameters.filter((p) => p.status === "NORMAL");

  let summary = "";
  if (parameters.length === 0) {
    summary = `Report "${fileName}" was successfully processed by our OCR and parsing engine. The document has been added to your medical records.`;
  } else if (anomalies.length === 0) {
    summary = `Your latest report "${fileName}" looks optimal! All ${parameters.length} extracted clinical biomarkers (including ${parameters.map((p) => p.name).slice(0, 3).join(", ")}) fall within standard reference limits.`;
  } else {
    const anomalySummary = anomalies
      .map((a) => `${a.name} is ${a.status.toLowerCase()} at ${a.value} ${a.unit}`)
      .join(", ");
    summary = `Your report "${fileName}" has been analyzed. We identified ${anomalies.length} parameter(s) requiring attention: ${anomalySummary}. The remaining ${normals.length} parameters are within standard reference ranges.`;
  }

  const keyFindings = parameters.slice(0, 6).map((p) => {
    return `${p.name}: ${p.value} ${p.unit} (${p.status === "NORMAL" ? "Normal" : p.status})`;
  });

  const attentionNeeded = anomalies.map((a) => {
    if (a.name.includes("Hemoglobin") && a.status === "LOW") {
      return `Hemoglobin (${a.value} ${a.unit}) is below reference limits. Discuss dietary iron intake (spinach, lentils) or supplementation with your physician.`;
    }
    if (a.name.includes("Glucose") || a.name.includes("HbA1c")) {
      return `Fasting blood glucose / HbA1c (${a.value} ${a.unit}) is elevated. Review carbohydrate intake and consider glycemic monitoring.`;
    }
    if (a.name.includes("Creatinine")) {
      return `Serum Creatinine (${a.value} ${a.unit}) is elevated. Ensure 2.5–3 liters of daily hydration and monitor renal filtration workload.`;
    }
    if (a.name.includes("Vitamin D")) {
      return `Vitamin D3 (${a.value} ${a.unit}) indicates deficiency. Consult your physician for therapeutic supplementation.`;
    }
    if (a.name.includes("Platelet") && a.status === "LOW") {
      return `Platelet count (${a.value} ${a.unit}) is lower than standard range. Monitor for easy bruising and review with your doctor.`;
    }
    if (a.name.includes("Cholesterol") || a.name.includes("Triglycerides")) {
      return `${a.name} (${a.value} ${a.unit}) is elevated. Consider dietary soluble fiber and cardiovascular follow-up.`;
    }
    return `${a.name} (${a.value} ${a.unit}) is flagged as ${a.status}. Review this finding with your healthcare provider.`;
  });

  return { summary, keyFindings, attentionNeeded };
}
