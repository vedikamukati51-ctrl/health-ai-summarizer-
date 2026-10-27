import { useState } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";

export default function Timeline() {
  const { reports, loading, deleteReport, activePatientName } = useHealthData();
  const { t } = useLanguage();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleDelete(id: string, fileName: string) {
    if (!window.confirm(`Delete "${fileName}" from ${activePatientName}'s timeline?`)) return;
    try {
      await deleteReport(id);
      setStatusMsg({ type: "success", text: `✓ Removed "${fileName}" from timeline.` });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg({ type: "error", text: "Failed to delete report." });
    }
  }

  const sortedReports = [...reports].sort((a, b) => a.reportDate.localeCompare(b.reportDate));

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">{t("CHRONOLOGICAL MEDICAL TIMELINE")}</span>
        <h2>{t("Medical Timeline for")} {activePatientName} ({reports.length})</h2>
        <p>{t("See reports from oldest to newest and compare your biomarkers over time.")}</p>
      </div>

      {statusMsg && <StatusMessage type={statusMsg.type}>{statusMsg.text}</StatusMessage>}
      {loading && <StatusMessage type="info">{t("Loading medical timeline…")}</StatusMessage>}

      {sortedReports.length > 0 ? (
        <div className="timeline">
          {sortedReports.map((report) => (
            <div className="timeline-item" key={report.id}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="row-between">
                  <span className="date">{new Date(report.reportDate).toLocaleDateString()}</span>
                  <button
                    type="button"
                    className="timeline-delete-btn"
                    title={`Delete ${report.fileName}`}
                    onClick={() => handleDelete(report.id, report.fileName)}
                  >
                    ✕
                  </button>
                </div>
                <h3>{report.fileName}</h3>
                <div className="actions">
                  <Link className="secondary-button" to={`/reports/${report.id}`}>
                    {t("View report")}
                  </Link>
                  {reports.length > 1 && (
                    <Link
                      className="secondary-button"
                      to={`/compare?beforeId=${report.id}&latestId=${reports[0]?.id}`}
                    >
                      {t("Compare")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="empty-state card" style={{ textAlign: "center", padding: "36px 16px" }}>
            <div className="empty-icon">⏳</div>
            <h3>{t("No timeline events yet for")} {activePatientName}</h3>
            <p>{t("Upload a lab report or health checkup to begin charting this patient's medical timeline.")}</p>
            <Link to="/upload" className="primary-button" style={{ marginTop: 12 }}>
              + {t("Upload first report")}
            </Link>
          </div>
        )
      )}
    </section>
  );
}