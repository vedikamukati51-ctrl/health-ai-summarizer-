import { useState, useEffect, useMemo } from "react";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";

export default function VisitPrep() {
  const { activePatientName, hasReports, anomalies, trendAnomalies, reports } = useHealthData();
  const { t } = useLanguage();

  // Dynamically compute light gray suggestions based on the active patient's uploaded reports & anomalies
  const suggestions = useMemo(() => {
    if (!hasReports || reports.length === 0) {
      return {
        symptoms: "Routine annual wellness checkup, general health evaluation, mild fatigue.",
        duration: "Past 1 to 2 weeks.",
        changes: "Increased screen time, irregular sleep schedule, and work stress.",
        medicines: "Daily multivitamin, hydration fluids.",
      };
    }

    const anomalyStrings = [
      ...anomalies.map((a) => `${a.paramName} ${a.explanation || ""}`.toLowerCase()),
      ...trendAnomalies.map((t) => `${t.name} ${t.key} ${t.label}`.toLowerCase()),
    ];

    const hasKidney = anomalyStrings.some(
      (s) => s.includes("creatinine") || s.includes("kidney") || s.includes("renal")
    );
    const hasAnemia = anomalyStrings.some(
      (s) => s.includes("hemoglobin") || s.includes("anemia") || s.includes("iron") || s.includes("rbc")
    );
    const hasMetabolic = anomalyStrings.some(
      (s) => s.includes("glucose") || s.includes("sugar") || s.includes("hba1c") || s.includes("diabetes")
    );
    const hasLipid = anomalyStrings.some(
      (s) => s.includes("cholesterol") || s.includes("lipid") || s.includes("ldl") || s.includes("triglyceride")
    );
    const hasBone = anomalyStrings.some(
      (s) => s.includes("vitamin") || s.includes("vit d") || s.includes("calcium") || s.includes("bone")
    );

    if (hasKidney) {
      return {
        symptoms: "Mild lower back / flank heaviness, morning puffiness around eyes, and slightly darker urine.",
        duration: "Noticed over the past 2 to 3 weeks following recent blood filtration report.",
        changes: "Lower daily fluid consumption, increased protein intake, or post-workout muscle soreness.",
        medicines: "Occasional ibuprofen (NSAIDs), daily multivitamin, blood pressure medication.",
      };
    }
    if (hasAnemia) {
      return {
        symptoms: "Easily fatigued when climbing stairs, cold hands and feet, occasional dizzy spells when standing.",
        duration: "Ongoing for about 3 to 4 weeks, feeling progressively more sluggish in late afternoons.",
        changes: "Struggling to sustain mental energy throughout the day, pale complexion noticed by family.",
        medicines: "Daily multivitamin, iron supplement (ferrous ascorbate), Vitamin C.",
      };
    }
    if (hasMetabolic) {
      return {
        symptoms: "Frequent thirst, dry mouth, increased urination frequency, and sudden energy crashes after lunch.",
        duration: "Past 1 month, particularly noticeable after heavy carbohydrate or sweet meals.",
        changes: "Craving sweets and refined carbohydrates, feeling lethargic after eating.",
        medicines: "Metformin (if prescribed), digestive enzymes, daily multivitamin.",
      };
    }
    if (hasLipid) {
      return {
        symptoms: "Mild chest heaviness during brisk walking, shortness of breath during rapid physical exertion.",
        duration: "Identified during recent cardiovascular blood panel, noticed exertional shortness of breath for 1 month.",
        changes: "Dietary shift with higher saturated takeout foods and dairy fats, reduced cardiovascular exercise.",
        medicines: "Omega-3 fish oil, daily multivitamin, statins (atorvastatin if prescribed).",
      };
    }
    if (hasBone) {
      return {
        symptoms: "Generalized aching in weight-bearing knee joints, morning lower back stiffness, weak hand grip.",
        duration: "Over the last 2 to 3 months, worse during overcast or rainy weeks.",
        changes: "Working long desk hours indoors with minimal direct sunlight exposure.",
        medicines: "Calcium citrate, Vitamin D3 60,000 IU weekly sachet, multivitamin.",
      };
    }

    return {
      symptoms: "Routine annual checkup, general health evaluation, mild fatigue.",
      duration: "Past 1 to 2 weeks.",
      changes: "Increased work stress and irregular sleeping hours.",
      medicines: "Daily multivitamin, hydration fluids.",
    };
  }, [hasReports, reports, anomalies, trendAnomalies]);

  // Input states
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [changes, setChanges] = useState("");
  const [medicines, setMedicines] = useState("");

  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<{
    patientName: string;
    reportName: string;
    recommendedSpecialist: string;
    anomaliesCount: number;
    questions: string[];
    discussionPoints: string[];
  } | null>(null);

  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

  // Reset inputs when active patient changes
  useEffect(() => {
    setSymptoms("");
    setDuration("");
    setChanges("");
    setMedicines("");
  }, [activePatientName]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await api.generateVisitPrep({
        symptoms: symptoms.trim() || suggestions.symptoms,
        duration: duration.trim() || suggestions.duration,
        changes: changes.trim() || suggestions.changes,
        medicines: medicines.trim() || suggestions.medicines,
      });
      setKit(res);
      setCheckedQuestions({});
    } catch (err) {
      console.error("Visit prep generation error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Generate when patient or health data changes
  useEffect(() => {
    handleGenerate();
  }, [activePatientName, hasReports, reports.length]);

  function toggleCheck(idx: number) {
    setCheckedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">{t("PILLAR 5 · DOCTOR VISIT PREP KIT")}</span>
        <h2>{t("Doctor Visit Prep Kit")}</h2>
        <p>
          {t("Convert your symptoms and anomalous lab findings into an actionable, tailored consultation sheet for your physician. Prepare intelligent questions before your appointment!")}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>{t("Your Symptoms & Health Notes")}</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", margin: "4px 0 16px 0" }}>
          {t("Fill in what you are experiencing. Our clinical AI combines this with your latest lab anomalies to draft your appointment questionnaire.")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label className="form-field">
            {t("What symptoms or discomfort have you noticed?")}
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={suggestions.symptoms}
              style={{ color: symptoms ? "inherit" : "#64748b" }}
            />
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                💡 {t("Suggested for your report:")} <em style={{ color: "#64748b" }}>"{suggestions.symptoms.slice(0, 60)}..."</em>
              </span>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: "0.72rem", padding: "2px 8px", borderColor: "#cbd5e1" }}
                onClick={() => setSymptoms(suggestions.symptoms)}
              >
                + {t("Use Suggestion")}
              </button>
            </div>
          </label>

          <label className="form-field">
            {t("How long has this been happening?")}
            <textarea
              rows={2}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={suggestions.duration}
              style={{ color: duration ? "inherit" : "#64748b" }}
            />
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                💡 {t("Suggested for your report:")} <em style={{ color: "#64748b" }}>"{suggestions.duration}"</em>
              </span>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: "0.72rem", padding: "2px 8px", borderColor: "#cbd5e1" }}
                onClick={() => setDuration(suggestions.duration)}
              >
                + {t("Use Suggestion")}
              </button>
            </div>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 10 }}>
          <label className="form-field">
            {t("What recent changes have you noticed?")}
            <textarea
              rows={2}
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder={suggestions.changes}
              style={{ color: changes ? "inherit" : "#64748b" }}
            />
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                💡 {t("Suggested for your report:")} <em style={{ color: "#64748b" }}>"{suggestions.changes.slice(0, 60)}..."</em>
              </span>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: "0.72rem", padding: "2px 8px", borderColor: "#cbd5e1" }}
                onClick={() => setChanges(suggestions.changes)}
              >
                + {t("Use Suggestion")}
              </button>
            </div>
          </label>

          <label className="form-field">
            {t("Which medicines or supplements are you currently taking?")}
            <textarea
              rows={2}
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
              placeholder={suggestions.medicines}
              style={{ color: medicines ? "inherit" : "#64748b" }}
            />
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                💡 {t("Suggested for your report:")} <em style={{ color: "#64748b" }}>"{suggestions.medicines.slice(0, 60)}..."</em>
              </span>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: "0.72rem", padding: "2px 8px", borderColor: "#cbd5e1" }}
                onClick={() => setMedicines(suggestions.medicines)}
              >
                + {t("Use Suggestion")}
              </button>
            </div>
          </label>
        </div>

        <button
          className="primary-button"
          style={{ marginTop: 16 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? t("Generating questions...") : `⚡ ${t("Generate Doctor Consultation Sheet")}`}
        </button>
      </div>

      {kit && (
        <div className="card" style={{ borderTop: "4px solid #0ea5e9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="card-label">{t("PERSONALIZED CONSULTATION SHEET")}</span>
              <h3 style={{ margin: "4px 0" }}>{t("Questions to Ask Your Doctor")} ({kit.patientName})</h3>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>
                {t("Recommended Specialist")}: <strong>{t(kit.recommendedSpecialist)}</strong> · {kit.reportName} ({kit.anomaliesCount} {t("anomalies evaluated")})
              </div>
            </div>
            <button className="secondary-button" onClick={() => window.print()}>
              🖨️ {t("Print Prep Sheet")}
            </button>
          </div>

          <div style={{ margin: "16px 0", padding: "12px 16px", borderRadius: 8, backgroundColor: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.2)" }}>
            <strong style={{ color: "#0369a1" }}>{t("Key Discussion Points")}:</strong>
            <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.85rem" }}>
              {kit.discussionPoints.map((dp, i) => (
                <li key={i}>{dp}</li>
              ))}
            </ul>
          </div>

          <span className="card-label" style={{ marginTop: 16 }}>{t("Questions to Ask Your Doctor")}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {kit.questions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: checkedQuestions[idx] ? "rgba(16, 185, 129, 0.08)" : "var(--bg-card, #f8fafc)",
                  border: checkedQuestions[idx] ? "1px solid #10b981" : "1px solid var(--border, #e2e8f0)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checkedQuestions[idx]}
                  onChange={() => toggleCheck(idx)}
                  style={{ marginTop: 4, cursor: "pointer" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.95rem", textDecoration: checkedQuestions[idx] ? "line-through" : "none", color: checkedQuestions[idx] ? "#64748b" : "inherit" }}>
                    {q}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}