import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";

export default function Dashboard() {
  const { dashboard, hasReports, loading, activePatientName, clearAllReports } = useHealthData();
  const { t } = useLanguage();

  async function handleClearAll() {
    if (
      !window.confirm(
        `⚠️ ${t("Clear All Reports")} (${activePatientName})?\n\n${t("This will immediately remove all reports, biomarkers, and anomalies across Dashboard, Timeline, Trends, History, Glossary, Visit Prep, Health Assistant, Specialist Locator, and 3D Anatomy so you can start fresh.")}`
      )
    ) {
      return;
    }
    try {
      await clearAllReports();
    } catch (err: any) {
      alert("Failed to clear reports: " + err.message);
    }
  }

  return (
    <section className="page">
      <div className="page-heading row-between">
        <div>
          <span className="eyebrow">{t("PATIENT · HEALTH AI SUMMARIZER")}</span>
          <h2>{activePatientName ? `${activePatientName} - ${t("Health Summary")}` : t("Your latest health summary")}</h2>
          <p>{t("A simple, real-time view of your latest processed clinical report.")}</p>
        </div>
        {hasReports && (
          <div>
            <button
              className="secondary-button"
              onClick={handleClearAll}
              title={t("Clear all reports for current patient")}
              style={{ color: "#ef4444", borderColor: "#fca5a5", fontSize: "0.85rem" }}
            >
              🗑️ {t("Clear All Reports")}
            </button>
          </div>
        )}
      </div>

      <DemoPatient />

      {loading && <StatusMessage type="info">{t("Updating clinical analysis…")}</StatusMessage>}

      {hasReports ? (
        <div className="grid three">
          <div className="card large">
            <span className="card-label">{t("AI HEALTH SUMMARY")}</span>
            <h3>{t("In simple words")}</h3>
            <p>{dashboard.summary || t("Summary generated from your latest medical report.")}</p>
          </div>

          <div className="card">
            <span className="card-label">{t("KEY FINDINGS")}</span>
            {dashboard.keyFindings && dashboard.keyFindings.length > 0 ? (
              <ul className="clean-list">
                {dashboard.keyFindings.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="field-hint" style={{ marginTop: "0.5rem" }}>
                {t("No biomarkers extracted yet. Upload a report to analyze blood parameters.")}
              </p>
            )}
          </div>

          <div className="card attention">
            <span className="card-label">{t("ATTENTION NEEDED")}</span>
            {dashboard.attentionNeeded && dashboard.attentionNeeded.length > 0 ? (
              <ul className="clean-list">
                {dashboard.attentionNeeded.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="field-hint" style={{ marginTop: "0.5rem", color: "#059669" }}>
                ✓ {t("All checked parameters are within standard reference ranges!")}
              </p>
            )}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="card large" style={{ textAlign: "center", padding: "40px 20px", marginTop: 12 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📁</div>
            <h3 style={{ margin: "0 0 8px 0" }}>{t("No reports uploaded yet for")} {activePatientName}</h3>
            <p style={{ color: "var(--text-muted, #64748b)", maxWidth: 520, margin: "0 auto 20px auto" }}>
              {t("Upload your lab reports (PDF, JPG scan, or text) or update your personal health profile to generate your personalized clinical summary.")}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/upload" className="primary-button">
                + {t("Upload First Report for")} {activePatientName.split(" ")[0]}
              </Link>
              <Link to="/profile" className="secondary-button">
                ✎ {t("Update Health Profile")}
              </Link>
            </div>
          </div>
        )
      )}

      <div className="card disclaimer" style={{ marginTop: 20 }}>
        <strong>{t("Important Medical Notice:")}</strong> {t("This summary is informational and educational. It does not provide a definitive clinical diagnosis or replace a qualified healthcare professional.")}
      </div>
    </section>
  );
}