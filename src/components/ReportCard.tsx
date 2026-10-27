import { Link } from "react-router-dom";
import type { Report } from "../types";

export default function ReportCard({
  report,
  onDelete,
}: {
  report: Report;
  onDelete?: (id: string, fileName: string) => void;
}) {
  return (
    <article className="report-card">
      {onDelete && (
        <button
          type="button"
          className="report-delete-cross"
          title={`Delete ${report.fileName}`}
          aria-label={`Delete ${report.fileName}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(report.id, report.fileName);
          }}
        >
          ✕
        </button>
      )}
      <div className="file-icon">PDF</div>
      <div className="report-main">
        <strong>{report.fileName}</strong>
        <span>{new Date(report.reportDate).toLocaleDateString()}</span>
      </div>
      <Link className="secondary-button" to={`/reports/${report.id}`}>
        View
      </Link>
    </article>
  );
}