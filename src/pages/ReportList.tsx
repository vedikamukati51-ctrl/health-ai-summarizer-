import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ReportCard from "../components/ReportCard";
import StatusMessage from "../components/StatusMessage";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";

export default function ReportList() {
  const { reports, loading, deleteReport, clearAllReports, activePatientName } = useHealthData();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.fileName.toLowerCase().includes(s) ||
          ((r as any).extractedText && (r as any).extractedText.toLowerCase().includes(s))
      );
    }
    if (from) {
      list = list.filter((r) => r.reportDate >= from);
    }
    if (to) {
      list = list.filter((r) => r.reportDate <= to);
    }
    return list;
  }, [reports, search, from, to]);

  async function handleDelete(id: string, fileName: string) {
    if (!window.confirm(`Delete "${fileName}" for ${activePatientName}? This will remove associated biomarkers and trends.`)) {
      return;
    }

    try {
      await deleteReport(id);
      setStatusMsg({
        type: "success",
        text: `✓ Report "${fileName}" deleted. All charts and summaries have been updated.`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (e: any) {
      setStatusMsg({
        type: "error",
        text: `Failed to delete report: ${e?.message || "Unknown error"}`,
      });
    }
  }

  async function handleClearAll() {
    if (
      !window.confirm(
        `⚠️ Remove ALL reports for ${activePatientName}?\n\nThis will clear all reports, clinical parameters, and timeline points across all tabs so you can start fresh.`
      )
    ) {
      return;
    }

    try {
      await clearAllReports();
      setStatusMsg({
        type: "success",
        text: `✓ All reports have been removed for ${activePatientName}. Database is clean and ready for new uploads!`,
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (e: any) {
      setStatusMsg({
        type: "error",
        text: `Failed to clear reports: ${e?.message || "Unknown error"}`,
      });
    }
  }

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading row-between">
        <div>
          <span className="eyebrow">{t("Reports")}</span>
          <h2>{t("Medical Records")} ({activePatientName}) ({reports.length})</h2>
          <p>{t("Search, review, delete, or manage your complete clinical history.")}</p>
        </div>
        {reports.length > 0 && (
          <button
            type="button"
            className="danger-button"
            onClick={handleClearAll}
            title={t("Clear all reports for current patient")}
          >
            🗑️ {t("Clear All Reports")}
          </button>
        )}
      </div>

      {statusMsg && <StatusMessage type={statusMsg.type}>{statusMsg.text}</StatusMessage>}

      <div className="card filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search reports by name or parameter (e.g. Hemoglobin, Glucose, CBC)...")}
        />
        <label>
          From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {loading && <StatusMessage type="info">{t("Updating clinical analysis…")}</StatusMessage>}

      <div className="stack">
        {filteredReports.map((r) => (
          <ReportCard key={r.id} report={r} onDelete={handleDelete} />
        ))}

        {!loading && filteredReports.length === 0 && (
          <div className="empty-state card" style={{ textAlign: "center", padding: "36px 16px" }}>
            <div className="empty-icon">📁</div>
            <h3>{t("No reports uploaded yet for")} {activePatientName}</h3>
            <p>
              {reports.length > 0
                ? t("No reports matched your search filters.")
                : `${t("No reports uploaded yet for")} ${activePatientName}. ${t("Upload a report to begin.")}`}
            </p>
            <Link to="/upload" className="primary-button" style={{ marginTop: 12 }}>
              + {t("Upload report")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}