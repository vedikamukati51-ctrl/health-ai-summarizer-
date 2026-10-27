import type {
  AnomalyGlossaryItem,
  CompareData,
  DashboardData,
  DietaryAdvice,
  GlossaryData,
  PatientProfile,
  Report,
  ReportDetailData,
  TrendPoint,
} from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const UPLOAD_FIELD = import.meta.env.VITE_UPLOAD_FIELD || "files";
// Default to live backend server (http://localhost:5000); fallback gracefully if offline
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
  const headers = new Headers(options?.headers || {});
  if (!headers.has("x-user-id")) {
    headers.set("x-user-id", activeUserId);
  }

  // Ensure GET query string carries userId for robust cross-environment persistence
  let finalPath = path;
  if (!options?.method || options.method === "GET") {
    if (!finalPath.includes("userId=")) {
      const sep = finalPath.includes("?") ? "&" : "?";
      finalPath = `${finalPath}${sep}userId=${encodeURIComponent(activeUserId)}`;
    }
  }

  const response = await fetch(`${API_BASE}${finalPath}`, { ...options, headers });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `API request failed (${response.status})`);
  }
  return response.json();
}

export const medicalKnowledge: Record<string, {
  name: string;
  definition: string;
  whyItMatters: string;
  standardRange: string;
  status: "LOW" | "HIGH" | "BORDERLINE" | "ATTENTION" | "NORMAL";
  clinicalImpact: string;
  dietaryAdvice: DietaryAdvice;
  doctorTip: string;
}> = {
  hemoglobin: {
    name: "Hemoglobin (Hb)",
    definition: "Hemoglobin is an iron-rich protein in red blood cells responsible for carrying life-sustaining oxygen from your lungs to tissues and organs across your body.",
    whyItMatters: "When hemoglobin drops, your organs and tissues receive less oxygen, leading to persistent fatigue, weakness, dizziness, and pale complexion.",
    standardRange: "12.0 – 15.5 g/dL (Women) | 13.8 – 17.2 g/dL (Men)",
    status: "LOW",
    clinicalImpact: "Mild anemia or downward trend can affect physical stamina, cognitive sharpness, and exercise tolerance.",
    dietaryAdvice: {
      keyNutrients: ["Elemental Iron (Heme & Non-Heme)", "Vitamin C (Absorption Booster)", "Folate / Folic Acid", "Vitamin B12"],
      foodsToEat: [
        "Dark leafy greens: Spinach (palak), fenugreek (methi), and moringa (drumstick leaves)",
        "Legumes & Pulses: Red lentils (masoor), chickpeas, and rajma",
        "Fruits: Fresh beetroot juice, pomegranate, apples, and dates",
        "Nuts & Seeds: Roasted pumpkin seeds, black sesame seeds, and soaked black raisins",
        "Animal sources (if non-veg): Eggs, lean chicken, and fish"
      ],
      foodsToAvoid: [
        "Drinking black tea, coffee, or milk right with or after meals (tannins and calcium bind to iron and drastically lower absorption)",
        "Overly processed refined flour items devoid of natural micronutrients"
      ],
      absorptionTip: "Always squeeze fresh lemon juice over your cooked lentils, beans, or spinach. Vitamin C converts non-heme plant iron into an easily absorbable form, boosting absorption by up to 300%!"
    },
    doctorTip: "Discuss with your doctor whether checking Serum Ferritin (stored iron reserves) and taking an oral iron supplement is advisable."
  },
  glucose: {
    name: "Fasting Blood Glucose",
    definition: "Fasting blood glucose measures the concentration of sugar in your bloodstream after an overnight fast (typically 8–10 hours), reflecting how efficiently your cells respond to insulin.",
    whyItMatters: "Detecting mild or borderline elevations early allows you to reverse insulin resistance through diet and lifestyle before diabetes develops.",
    standardRange: "70 – 99 mg/dL (Normal) | 100 – 125 mg/dL (Impaired / Borderline Prediabetes) | ≥ 126 mg/dL (Elevated)",
    status: "BORDERLINE",
    clinicalImpact: "Borderline readings indicate early metabolic strain where body cells require higher amounts of insulin to clear glucose from the bloodstream.",
    dietaryAdvice: {
      keyNutrients: ["Soluble Dietary Fiber", "Chromium", "Magnesium", "Antioxidant Polyphenols"],
      foodsToEat: [
        "High-fiber whole grains: Steel-cut oats, barley, quinoa, and brown/wild rice",
        "Spices & seeds: 1 tsp fenugreek (methi) seeds soaked overnight, and Ceylon cinnamon",
        "Vegetables: Bitter gourd (karela), broccoli, okra (bhindi), and leafy salads",
        "Legumes: Sprouted moong, black chana, and beans for slow, steady carbohydrate release",
        "Healthy fats: Raw almonds, chia seeds, and avocados to blunt blood sugar spikes"
      ],
      foodsToAvoid: [
        "Refined carbohydrates: Maida, white bread, naan, and sweetened bakery pastries",
        "Sugary drinks: Commercial fruit juices, sodas, sweetened iced teas, and sports drinks",
        "Late-night high-carb snacking within 2 hours of bedtime"
      ],
      absorptionTip: "Take a light 10–15 minute walk immediately after lunch and dinner. Muscle contractions activate GLUT4 receptors to absorb glucose without needing extra insulin."
    },
    doctorTip: "Ask your healthcare provider to test your HbA1c level (glycated hemoglobin) to see your 3-month average glucose trend."
  },
  creatinine: {
    name: "Serum Creatinine",
    definition: "Creatinine is a natural chemical waste byproduct generated from routine muscle breakdown and energy metabolism, filtered out of the blood exclusively by the kidneys and excreted in urine.",
    whyItMatters: "It provides a clear indicator of how efficiently your kidneys are filtering and purifying your bloodstream.",
    standardRange: "0.6 – 1.1 mg/dL (Women) | 0.7 – 1.3 mg/dL (Men)",
    status: "ATTENTION",
    clinicalImpact: "An upward shift or borderline value is commonly caused by temporary dehydration, intense muscular workouts, high protein intake, or mild renal filtration strain.",
    dietaryAdvice: {
      keyNutrients: ["Optimal Hydration (2.5 – 3L daily)", "Low-Sodium Natural Electrolytes", "Kidney-friendly Antioxidants"],
      foodsToEat: [
        "Hydrating produce: Fresh cucumber, watermelon, apples, blueberries, and bell peppers",
        "Renal-friendly vegetables: Cabbage, cauliflower, carrots, and bottle gourd (lauki)",
        "Adequate fluid intake: Pure water, light herbal teas, and fresh coconut water (in moderation)",
        "Anti-inflammatory herbs: Fresh parsley, turmeric, and garlic in culinary amounts"
      ],
      foodsToAvoid: [
        "Heavy consumption of red meat (beef, mutton) and charred grilled meats",
        "Unmonitored creatine bodybuilding supplements or excessive concentrated protein powders",
        "High-sodium processed snacks, packaged soups, and fast foods",
        "Frequent use of NSAID pain relievers (like ibuprofen or diclofenac) which stress renal blood flow"
      ],
      absorptionTip: "Sip water continuously throughout the day rather than chugging large amounts at once. Stable hydration keeps glomerular filtration smooth."
    },
    doctorTip: "Discuss with your physician whether calculating eGFR (estimated Glomerular Filtration Rate) and a routine urine microalbumin test is recommended."
  },
  vitamind: {
    name: "Vitamin D3 (25-OH Cholecalciferol)",
    definition: "Vitamin D3 is a fat-soluble hormone precursor synthesised in the skin upon sunlight exposure, vital for calcium absorption, bone mineralization, and immune modulation.",
    whyItMatters: "Deficiency is exceptionally common in modern lifestyles and is linked to chronic fatigue, recurring infections, weak bones, muscle aches, and low mood.",
    standardRange: "30 – 100 ng/mL (Sufficient) | 20 – 29 ng/mL (Insufficient) | < 20 ng/mL (Deficient)",
    status: "LOW",
    clinicalImpact: "Suboptimal levels weaken calcium assimilation in the gut and hinder white blood cell defense against viral and bacterial pathogens.",
    dietaryAdvice: {
      keyNutrients: ["Vitamin D3", "Bioavailable Calcium", "Vitamin K2", "Magnesium"],
      foodsToEat: [
        "Fortified dairy milk, fortified almond/soy milk, and organic yogurt",
        "Egg yolks from pasture-raised hens",
        "Mushrooms grown or exposed to ultraviolet sunlight",
        "Fatty cold-water fish: Salmon, sardines, mackerel, or pure cod liver oil"
      ],
      foodsToAvoid: [
        "Excessive caffeine and phosphoric acid (cola drinks), which promote urinary calcium excretion",
        "Ultra-low-fat diets, which starve the gut of the healthy lipids needed to absorb fat-soluble vitamins"
      ],
      absorptionTip: "Vitamin D is fat-soluble! Always take your dietary Vitamin D sources or prescribed supplements alongside a meal containing healthy fats (like nuts, avocado, yogurt, or olive oil)."
    },
    doctorTip: "Because food sources provide modest amounts, ask your doctor if a standard therapeutic dose (e.g. 60,000 IU weekly for 8 weeks) is indicated."
  },
  cholesterol: {
    name: "LDL Cholesterol ('Bad' Cholesterol)",
    definition: "Low-Density Lipoprotein (LDL) carries cholesterol from the liver to peripheral cells. Excess particles can oxidize and embed inside arterial walls forming plaques.",
    whyItMatters: "Keeping LDL within target limits keeps blood vessels flexible, clear, and reduces long-term cardiovascular strain.",
    standardRange: "< 100 mg/dL (Optimal) | 100 – 129 mg/dL (Desirable) | 130 – 159 mg/dL (Borderline High) | ≥ 160 mg/dL (High)",
    status: "BORDERLINE",
    clinicalImpact: "Mild elevation prompts arterial endothelium inflammation and gradual plaque buildup if left unmanaged over months and years.",
    dietaryAdvice: {
      keyNutrients: ["Beta-Glucan Soluble Fiber", "Plant Phytosterols", "Omega-3 Fatty Acids (ALA)", "Polyphenols"],
      foodsToEat: [
        "Oatmeal, oat bran, and psyllium husk (isabgol) to physically trap cholesterol in the gut",
        "Raw unsalted walnuts, almonds, and chia seeds",
        "Cold-pressed extra virgin olive oil as your primary culinary oil",
        "Fresh crushed garlic, onions, and steamed green beans",
        "Antioxidant-rich berries, apples (rich in pectin fiber), and green tea"
      ],
      foodsToAvoid: [
        "Vanaspati, shortening, and bakery foods loaded with trans fats (cookies, puffs, pastries)",
        "Deep-fried snacks, processed meats, and palm-oil-fried packaged foods",
        "Heavy cream, full-fat processed cheese, and excess butter"
      ],
      absorptionTip: "Consume 2 tablespoons of freshly ground flaxseeds daily. Their soluble mucilage fiber binds to bile acids in the digestive tract, forcing your liver to use up circulating LDL to create new bile."
    },
    doctorTip: "Ask your physician to evaluate your complete lipid panel, including HDL and Triglycerides, to determine your Total Cholesterol to HDL ratio."
  },
  platelets: {
    name: "Platelet Count (Thrombocytes)",
    definition: "Platelets are disk-shaped cell fragments in blood circulation that cluster together and form clots to stop bleeding when blood vessels sustain trauma.",
    whyItMatters: "A healthy platelet count ensures prompt wound healing and protects against unexpected internal or mucosal bleeding.",
    standardRange: "150,000 – 450,000 /µL (Normal Range)",
    status: "LOW",
    clinicalImpact: "Mildly low platelets (thrombocytopenia) can cause slower clotting, minor skin bruising, or bleeding gums, frequently following viral episodes.",
    dietaryAdvice: {
      keyNutrients: ["Vitamin K", "Folate (Vitamin B9)", "Vitamin C", "Chlorophyll"],
      foodsToEat: [
        "Fresh ripe papaya fruit and well-prepared papaya leaf extract",
        "Fresh pomegranate juice and kiwi fruits",
        "Dark leafy vegetables: Steamed spinach, kale, and fenugreek leaves",
        "Amla (Indian gooseberry) and citrus fruits for immune support",
        "Pumpkin seeds and soaked almonds"
      ],
      foodsToAvoid: [
        "Alcohol and tonic water containing quinine",
        "Over-the-counter NSAIDs or unprescribed blood-thinners without medical guidance"
      ],
      absorptionTip: "Combine Vitamin C-rich amla or oranges with folate-packed greens to stimulate healthy platelet formation in your bone marrow."
    },
    doctorTip: "If you notice spontaneous pinpoint red spots (petechiae) or sudden unusual bruises, consult your physician promptly for a repeat CBC."
  },
  wbc: {
    name: "WBC Count (White Blood Cells)",
    definition: "White blood cells are the frontline defense units of your immune system that identify, neutralize, and clear bacterial, viral, and fungal invaders.",
    whyItMatters: "WBC levels reflect whether your body is actively combating an infection or if your immune reserves are temporarily suppressed.",
    standardRange: "4,500 – 11,000 /µL (Normal Range)",
    status: "NORMAL",
    clinicalImpact: "Slight fluctuations are normal; values rise during acute fighting of colds or inflammation and stabilize as recovery progresses.",
    dietaryAdvice: {
      keyNutrients: ["Zinc", "Vitamin C", "Antioxidants", "Quality Amino Acids"],
      foodsToEat: [
        "Citrus fruits: Oranges, sweet limes (mosambi), and lemons",
        "Immune-modulating spices: Turmeric with black pepper, fresh ginger, and garlic",
        "Probiotic curd/yogurt to strengthen gut microbiome immunity",
        "Pumpkin seeds, sunflower seeds, and almonds for cellular zinc"
      ],
      foodsToAvoid: [
        "High-sugar desserts and sweetened drinks, which temporarily impair white blood cell phagocytic activity"
      ],
      absorptionTip: "Add a pinch of black pepper whenever using turmeric. Piperine increases turmeric's active curcumin absorption by 2,000%."
    },
    doctorTip: "A differential count (Neutrophils, Lymphocytes, Monocytes) gives a precise view of whether a bacterial or viral factor is active."
  }
};

export const api = {
  getDashboard: async () => {
    if (DEMO_MODE) return demo.dashboard;
    try {
      return await request<DashboardData>("/api/dashboard");
    } catch {
      return demo.dashboard;
    }
  },
  uploadReports: async (files: File[]) => {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 700));
      return { summary: `${files.length} demo report${files.length > 1 ? "s" : ""} processed successfully. Sample patient data has been used for this presentation.` };
    }
    const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
    const formData = new FormData();
    files.forEach((file) => formData.append(UPLOAD_FIELD, file));
    formData.append("userId", activeUserId);
    return request<any>(`/api/reports/upload?userId=${encodeURIComponent(activeUserId)}`, { method: "POST", body: formData });
  },
  getTimeline: async () => {
    if (DEMO_MODE) return demo.reports;
    try {
      return await request<Report[]>("/api/timeline");
    } catch {
      return demo.reports;
    }
  },
  getReports: async (params: { search?: string; from?: string; to?: string } = {}) => {
    if (DEMO_MODE) {
      const term = (params.search || "").toLowerCase();
      return demo.reports.filter((r) => !term || r.fileName.toLowerCase().includes(term));
    }
    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.from) query.set("from", params.from);
      if (params.to) query.set("to", params.to);
      return await request<Report[]>(`/api/reports?${query.toString()}`);
    } catch {
      const term = (params.search || "").toLowerCase();
      return demo.reports.filter((r) => !term || r.fileName.toLowerCase().includes(term));
    }
  },
  getReport: async (id: string) => {
    if (DEMO_MODE) return demo.detail;
    try {
      return await request<ReportDetailData>(`/api/reports/${encodeURIComponent(id)}`);
    } catch {
      return demo.detail;
    }
  },
  deleteReport: async (id: string) => {
    return request<{ success: boolean; id: string; remainingCount?: number }>(`/api/reports/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
  clearAllReports: async () => {
    return request<{ success: boolean; message: string; clearedCount?: number }>("/api/reports", {
      method: "DELETE",
    });
  },
  getProfile: async (): Promise<PatientProfile> => {
    const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
    try {
      return await request<PatientProfile>(`/api/profile?userId=${encodeURIComponent(activeUserId)}`);
    } catch {
      const cached = localStorage.getItem("patient_profile");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id === activeUserId || parsed.fullName)) return parsed;
        } catch {}
      }
      const familyRaw = localStorage.getItem("family_patients");
      if (familyRaw) {
        try {
          const family = JSON.parse(familyRaw);
          const matched = family.find((f: any) => f.id === activeUserId);
          if (matched) return matched;
        } catch {}
      }
      return {
        fullName: "Patient Profile",
        age: 30,
        gender: "Female",
        bloodGroup: "B+",
        allergies: "None reported",
        conditions: "None",
        emergencyContact: "Not set",
        phone: "+91 98765 11001",
        address: "Mumbai, Maharashtra",
      };
    }
  },
  updateProfile: async (data: PatientProfile): Promise<PatientProfile> => {
    const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
    try {
      const res = await request<{ message: string; profile: PatientProfile }>(`/api/profile?userId=${encodeURIComponent(activeUserId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: activeUserId }),
      });
      return res.profile || data;
    } catch {
      localStorage.setItem("patient_profile", JSON.stringify({ ...data, id: activeUserId }));
      return data;
    }
  },
  chat: async (query: string, history: any[] = []) => {
    const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
    try {
      return await request<{ reply: string; sources: any[]; provider: string }>(`/api/chat?userId=${encodeURIComponent(activeUserId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history, userId: activeUserId }),
      });
    } catch (err: any) {
      return {
        reply: "I am ready to assist you with your health records. Please ensure your query is clear or try asking about specific parameters like Hemoglobin, Fasting Glucose, or Creatinine.",
        sources: [],
        provider: "Local AI Fallback"
      };
    }
  },
  generateVisitPrep: async (data: { symptoms: string; duration: string; changes: string; medicines: string }) => {
    const activeUserId = localStorage.getItem("active_user_id") || "usr-default";
    try {
      return await request<{
        patientName: string;
        reportName: string;
        recommendedSpecialist: string;
        anomaliesCount: number;
        questions: string[];
        discussionPoints: string[];
      }>(`/api/visit-prep/generate?userId=${encodeURIComponent(activeUserId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: activeUserId }),
      });
    } catch {
      return {
        patientName: "Patient",
        reportName: "Recent Lab Report",
        recommendedSpecialist: "General Physician",
        anomaliesCount: 0,
        questions: [
          "What are the most important findings in my recent report?",
          "How do my current symptoms align with my lab parameters?",
          "When should I schedule a follow-up test?"
        ],
        discussionPoints: ["Review lifestyle and diet", "Check current medications"]
      };
    }
  },
  getUsers: async () => {
    try {
      return await request<PatientProfile[]>("/api/users");
    } catch {
      return [];
    }
  },
  upsertUser: async (userData: Partial<PatientProfile>) => {
    return request<{ message: string; user: PatientProfile }>("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },
  compareReports: (beforeId: string, latestId: string) => DEMO_MODE ? Promise.resolve(demo.compare) : request<CompareData>(`/api/compare?beforeId=${encodeURIComponent(beforeId)}&latestId=${encodeURIComponent(latestId)}`),
  getTrends: (parameter: string) => DEMO_MODE ? Promise.resolve(demo.trends[parameter] || demo.trends.hemoglobin) : request<TrendPoint[]>(`/api/trends?parameter=${encodeURIComponent(parameter)}`),
  getTrendParameters: async () => {
    try {
      return await request<{
        anomalies: Array<{ key: string; name: string; label: string; unit?: string; status?: string; value?: number }>;
        allParameters: Array<{ key: string; name: string; label: string; unit?: string; status?: string }>;
      }>("/api/trends/parameters");
    } catch {
      return { anomalies: [], allParameters: [] };
    }
  },
  getReportAnomalies: (reportId?: string) => {
    if (DEMO_MODE) {
      if (!reportId || reportId === "r3") {
        return Promise.resolve(demo.reportAnomalies);
      }
      return Promise.resolve(demo.reportAnomalies.filter((a) => !a.reportName || a.reportName.includes(reportId)));
    }
    return request<AnomalyGlossaryItem[]>(`/api/glossary/anomalies?reportId=${encodeURIComponent(reportId || "")}`);
  },
  explainTerm: (term: string) => {
    if (DEMO_MODE) {
      const t = term.toLowerCase().trim();
      let matchKey = Object.keys(medicalKnowledge).find(k => t.includes(k) || k.includes(t));
      if (!matchKey) {
        if (t.includes("sugar") || t.includes("diabet")) matchKey = "glucose";
        else if (t.includes("kidney")) matchKey = "creatinine";
        else if (t.includes("blood") || t.includes("iron") || t.includes("anemia") || t.includes("hb")) matchKey = "hemoglobin";
        else if (t.includes("fat") || t.includes("lipid") || t.includes("ldl")) matchKey = "cholesterol";
        else if (t.includes("sun") || t.includes("bone") || t.includes("vit d") || t.includes("d3")) matchKey = "vitamind";
        else if (t.includes("clot") || t.includes("dengue") || t.includes("platelet")) matchKey = "platelets";
        else if (t.includes("immune") || t.includes("white") || t.includes("infection")) matchKey = "wbc";
      }

      if (matchKey && medicalKnowledge[matchKey]) {
        const item = medicalKnowledge[matchKey];
        return Promise.resolve({
          definition: item.definition,
          whyItMatters: item.whyItMatters,
          standardRange: item.standardRange,
          dietaryAdvice: item.dietaryAdvice,
          status: item.status,
          doctorTip: item.doctorTip,
        });
      }

      return Promise.resolve({
        definition: `"${term}" is a clinical health parameter evaluated to understand specific physiological health and organ function.`,
        whyItMatters: "Individual parameter interpretations depend on standard clinical reference thresholds, age, biological gender, and overall symptom history.",
        standardRange: "Check the reference range column on your verified laboratory report.",
        dietaryAdvice: {
          keyNutrients: ["Balanced Micronutrients", "Antioxidants", "Dietary Fiber"],
          foodsToEat: [
            "Colorful vegetables (leafy greens, carrots, beets, bell peppers)",
            "Whole grains (oats, brown rice, quinoa)",
            "Plant-based or clean animal proteins (lentils, paneer, eggs, fish)"
          ],
          foodsToAvoid: [
            "Deep-fried foods, ultra-processed ready meals, and refined sugary snacks"
          ],
          absorptionTip: "Maintain steady daily hydration (2.5L) and prioritize balanced, home-cooked whole food meals."
        },
        doctorTip: "Always review test results in consultation with your primary physician or specialist."
      });
    }
    return request<GlossaryData>(`/api/glossary/explain?term=${encodeURIComponent(term)}`);
  },
};

export const demo = {
  dashboard: {
    summary: "Ananya's latest blood report is mostly within the expected range. Hemoglobin is shown as slightly lower than the previous sample, while creatinine and glucose are within the report's reference range.",
    keyFindings: ["Hemoglobin: 14.2 g/dL", "Creatinine: 1.1 mg/dL", "Blood glucose: 92 mg/dL"],
    attentionNeeded: ["Hemoglobin has moved down slightly compared with the previous sample; discuss any concern at the next visit."],
  } satisfies DashboardData,
  reports: [
    { id: "r3", fileName: "Ananya_Blood_Report_September.pdf", reportDate: "2026-09-15", fileSize: 240000 },
    { id: "r2", fileName: "Ananya_CBC_August.pdf", reportDate: "2026-08-20", fileSize: 180000 },
    { id: "r1", fileName: "Ananya_Health_Check_July.jpg", reportDate: "2026-07-12", fileSize: 920000 },
  ] satisfies Report[],
  detail: {
    id: "r3", fileName: "Ananya_Blood_Report_September.pdf", reportDate: "2026-09-15", fileSize: 240000,
    extractedText: "Patient: Ananya Sharma\nHemoglobin: 14.2 g/dL\nCreatinine: 1.1 mg/dL\nBlood glucose: 92 mg/dL\nWBC Count: 6,400 /µL",
    parameters: [
      { name: "Hemoglobin", value: 14.2, unit: "g/dL", status: "NORMAL" },
      { name: "Creatinine", value: 1.1, unit: "mg/dL", status: "NORMAL" },
      { name: "Blood glucose", value: 92, unit: "mg/dL", status: "NORMAL" },
      { name: "WBC Count", value: 6400, unit: "/µL", status: "NORMAL" },
    ],
  } satisfies ReportDetailData,
  compare: {
    rows: [
      { param: "Hemoglobin", before: 14.8, latest: 14.2, diff: -0.6, status: "DECREASED" },
      { param: "Creatinine", before: 1.0, latest: 1.1, diff: 0.1, status: "INCREASED" },
      { param: "Blood glucose", before: 95, latest: 92, diff: -3, status: "DECREASED" },
    ],
    explanation: "The demo comparison highlights how Health AI Summarizer can make changes between two reports easier to notice. It is informational and not a diagnosis.",
  } satisfies CompareData,
  trends: {
    hemoglobin: [{ date: "2026-06-15", value: 15.1 }, { date: "2026-07-15", value: 14.9 }, { date: "2026-08-20", value: 14.8 }, { date: "2026-09-15", value: 14.2 }],
    creatinine: [{ date: "2026-06-15", value: 1.0 }, { date: "2026-07-15", value: 1.0 }, { date: "2026-08-20", value: 1.0 }, { date: "2026-09-15", value: 1.1 }],
    glucose: [{ date: "2026-06-15", value: 98 }, { date: "2026-07-15", value: 96 }, { date: "2026-08-20", value: 95 }, { date: "2026-09-15", value: 92 }],
  } as Record<string, TrendPoint[]>,
  reportAnomalies: [
    {
      id: "anom-1",
      paramName: "Hemoglobin (Hb)",
      patientValue: "11.4 g/dL",
      unit: "g/dL",
      status: "LOW",
      standardRange: "12.0 – 15.5 g/dL (Women) | 13.8 – 17.2 g/dL (Men)",
      explanation: "Hemoglobin is an iron-rich protein in red blood cells that transports vital oxygen from your lungs to tissues, muscles, and brain.",
      clinicalImpact: "Measured at 11.4 g/dL (below 12.0 g/dL reference range). Mild iron deficiency causes persistent daytime tiredness, brain fog, and shortness of breath when climbing stairs.",
      dietaryAdvice: {
        keyNutrients: ["Elemental Iron (Heme & Non-Heme)", "Vitamin C", "Folate (B9)", "Vitamin B12"],
        foodsToEat: [
          "Dark leafy vegetables: Spinach (palak), moringa leaves, and methi",
          "Legumes & Pulses: Red lentils (masoor), chickpeas (chana), and kidney beans (rajma)",
          "Fruits & roots: Fresh beetroot juice, pomegranate, dates, and black raisins soaked overnight",
          "Seeds & nuts: Roasted pumpkin seeds, sesame (til), and soaked almonds",
          "Non-veg sources (optional): Eggs, lean chicken breast, and grilled fish"
        ],
        foodsToAvoid: [
          "Black tea, coffee, or calcium-rich milk within 1 hour of meals (tannins and calcium bind with iron and cut absorption by over 50%)",
          "Ultra-processed refined flour items lacking natural minerals"
        ],
        absorptionTip: "Always squeeze fresh lemon juice over your cooked lentils, beans, or spinach. Vitamin C converts non-heme plant iron into an easily absorbable form, boosting absorption by up to 300%!"
      },
      doctorTip: "Ask your doctor if checking Serum Ferritin (stored iron reserves) and taking an oral iron supplement is advisable.",
      reportName: "Ananya_Blood_Report_September.pdf"
    },
    {
      id: "anom-2",
      paramName: "Fasting Blood Glucose",
      patientValue: "108 mg/dL",
      unit: "mg/dL",
      status: "BORDERLINE",
      standardRange: "70 – 99 mg/dL (Normal Fasting) | 100 – 125 mg/dL (Impaired / Borderline Prediabetes)",
      explanation: "Fasting blood glucose measures the concentration of sugar in your bloodstream after an overnight fast, showing how effectively your body's cells respond to insulin.",
      clinicalImpact: "Measured at 108 mg/dL. Values between 100–125 mg/dL indicate early borderline insulin resistance. Catching this early makes it completely reversible through diet and activity.",
      dietaryAdvice: {
        keyNutrients: ["Soluble Dietary Fiber", "Chromium", "Magnesium", "Antioxidant Polyphenols"],
        foodsToEat: [
          "Soluble fiber grains: Steel-cut oats, barley, quinoa, and brown/wild rice",
          "Spices & seeds: 1 tsp fenugreek (methi) seeds soaked overnight, and Ceylon cinnamon",
          "Vegetables: Bitter gourd (karela), broccoli, okra (bhindi), and leafy salads",
          "Legumes: Sprouted moong, black chana, and beans for slow, steady carbohydrate release",
          "Healthy fats: Raw almonds, chia seeds, and avocados to blunt blood sugar spikes"
        ],
        foodsToAvoid: [
          "Refined carbohydrates: Maida, white bread, naan, and sweetened bakery pastries",
          "Sugary drinks: Commercial fruit juices, sodas, sweetened iced teas, and sports drinks",
          "Late-night high-carb snacking within 2 hours of bedtime"
        ],
        absorptionTip: "Take a light 10–15 minute walk immediately after lunch and dinner. Muscle contractions activate GLUT4 receptors to absorb glucose without needing extra insulin."
      },
      doctorTip: "Ask your healthcare provider to test your HbA1c level (glycated hemoglobin) to see your 3-month average glucose trend.",
      reportName: "Ananya_Blood_Report_September.pdf"
    },
    {
      id: "anom-3",
      paramName: "Serum Creatinine",
      patientValue: "1.28 mg/dL",
      unit: "mg/dL",
      status: "ATTENTION",
      standardRange: "0.6 – 1.1 mg/dL (Women) | 0.7 – 1.3 mg/dL (Men)",
      explanation: "Creatinine is a natural chemical waste byproduct generated from routine muscle breakdown, filtered exclusively by the kidneys and excreted in urine.",
      clinicalImpact: "Measured at 1.28 mg/dL (trending upward from 1.0 mg/dL). Often reflects mild dehydration, recent heavy exercise, or temporary filtration workload on kidneys.",
      dietaryAdvice: {
        keyNutrients: ["Optimal Hydration (2.5 – 3L daily)", "Low-Sodium Natural Electrolytes", "Kidney-friendly Antioxidants"],
        foodsToEat: [
          "Hydrating produce: Fresh cucumber, watermelon, apples, blueberries, and bell peppers",
          "Renal-friendly vegetables: Cabbage, cauliflower, carrots, and bottle gourd (lauki)",
          "Adequate fluid intake: Pure water, light herbal teas, and fresh coconut water (in moderation)",
          "Anti-inflammatory herbs: Fresh parsley, turmeric, and garlic in culinary amounts"
        ],
        foodsToAvoid: [
          "Heavy consumption of red meat (beef, mutton) and charred grilled meats",
          "Unmonitored creatine bodybuilding supplements or excessive concentrated protein powders",
          "High-sodium processed snacks, packaged soups, and fast foods",
          "Frequent use of NSAID pain relievers (like ibuprofen or diclofenac) which stress renal blood flow"
        ],
        absorptionTip: "Sip water continuously throughout the day rather than chugging large amounts at once. Stable hydration keeps glomerular filtration smooth."
      },
      doctorTip: "Discuss with your physician whether calculating eGFR (estimated Glomerular Filtration Rate) and a routine urine microalbumin test is recommended.",
      reportName: "Ananya_Blood_Report_September.pdf"
    },
    {
      id: "anom-4",
      paramName: "Vitamin D3 (25-OH Cholecalciferol)",
      patientValue: "18.2 ng/mL",
      unit: "ng/mL",
      status: "LOW",
      standardRange: "30 – 100 ng/mL (Sufficient) | 20 – 29 ng/mL (Insufficient) | < 20 ng/mL (Deficient)",
      explanation: "Vitamin D3 is a fat-soluble hormone precursor vital for calcium absorption, bone mineralization, and immune modulation.",
      clinicalImpact: "Measured at 18.2 ng/mL (Deficient). Low levels cause chronic daytime fatigue, lower back aches, poor bone density, and frequent viral colds.",
      dietaryAdvice: {
        keyNutrients: ["Vitamin D3", "Bioavailable Calcium", "Vitamin K2", "Magnesium"],
        foodsToEat: [
          "Fortified dairy milk, fortified almond/soy milk, and organic yogurt",
          "Egg yolks from pasture-raised hens",
          "Mushrooms grown or exposed to ultraviolet sunlight",
          "Fatty cold-water fish: Salmon, sardines, mackerel, or pure cod liver oil"
        ],
        foodsToAvoid: [
          "Excessive caffeine and phosphoric acid (cola drinks), which promote urinary calcium excretion",
          "Ultra-low-fat diets, which starve the gut of the healthy lipids needed to absorb fat-soluble vitamins"
        ],
        absorptionTip: "Vitamin D is fat-soluble! Always take your dietary Vitamin D sources or prescribed supplements alongside a meal containing healthy fats (like nuts, avocado, yogurt, or olive oil)."
      },
      doctorTip: "Because food sources provide modest amounts, ask your doctor if a standard therapeutic dose (e.g. 60,000 IU weekly for 8 weeks) is indicated.",
      reportName: "Ananya_Health_Check_July.jpg"
    },
    {
      id: "anom-5",
      paramName: "LDL Cholesterol",
      patientValue: "136 mg/dL",
      unit: "mg/dL",
      status: "BORDERLINE",
      standardRange: "< 100 mg/dL (Optimal) | 100 – 129 mg/dL (Desirable) | 130 – 159 mg/dL (Borderline High)",
      explanation: "Low-Density Lipoprotein (LDL) carries cholesterol from the liver to peripheral cells. Excess particles can oxidize and embed inside arterial walls forming plaques.",
      clinicalImpact: "Measured at 136 mg/dL (Borderline High). Keeping LDL in check protects arterial flexibility and minimizes cardiovascular strain.",
      dietaryAdvice: {
        keyNutrients: ["Beta-Glucan Soluble Fiber", "Plant Phytosterols", "Omega-3 Fatty Acids (ALA)", "Polyphenols"],
        foodsToEat: [
          "Oatmeal, oat bran, and psyllium husk (isabgol) to trap cholesterol in the gut",
          "Raw unsalted walnuts, almonds, and chia seeds",
          "Cold-pressed extra virgin olive oil as primary culinary oil",
          "Fresh crushed garlic, onions, and steamed green beans",
          "Antioxidant-rich berries, apples (rich in pectin fiber), and green tea"
        ],
        foodsToAvoid: [
          "Vanaspati, shortening, and bakery foods loaded with trans fats (cookies, puffs, pastries)",
          "Deep-fried snacks, processed meats, and palm-oil-fried packaged foods",
          "Heavy cream, full-fat processed cheese, and excess butter"
        ],
        absorptionTip: "Consume 2 tablespoons of freshly ground flaxseeds daily. Their soluble mucilage fiber binds to bile acids in the digestive tract, naturally clearing circulating LDL."
      },
      doctorTip: "Ask your physician to evaluate your complete lipid panel, including HDL and Triglycerides, to determine your Total Cholesterol to HDL ratio.",
      reportName: "Ananya_Health_Check_July.jpg"
    }
  ] satisfies AnomalyGlossaryItem[],
};
