import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, demo } from "../services/api";
import type { ReportDetailData } from "../types";
import DemoPatient from "../components/DemoPatient";

export default function ReportDetail() {
  const { id = "r3" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ReportDetailData>(demo.detail);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getReport(id).then(setData).catch(() => {
      if (id === demo.detail.id) setData(demo.detail);
    });
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${data.fileName}"?`)) return;
    setDeleting(true);
    try {
      await api.deleteReport(id);
      window.dispatchEvent(new Event("health_data_updated"));
      navigate("/reports");
    } catch {
      alert("Failed to delete report.");
      setDeleting(false);
    }
  }

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="row-between">
        <div>
          <span className="eyebrow">FEATURE 12</span>
          <h2>{data.fileName}</h2>
          <p>{new Date(data.reportDate).toLocaleDateString()}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "🗑️ Delete report"}
          </button>
          <Link className="secondary-button" to="/reports">
            ← Back
          </Link>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <span className="card-label">EXTRACTED TEXT</span>
          <pre className="extracted">{data.extractedText || "No extracted text returned."}</pre>
        </div>

        <div className="card">
          <span className="card-label">EXTRACTED PARAMETERS</span>
          <table>
            <thead><tr><th>Name</th><th>Value</th><th>Unit</th><th>Status</th></tr></thead>
            <tbody>
              {(data.parameters || []).map((p, i) => (
                <tr key={i}><td>{p.name}</td><td>{p.value}</td><td>{p.unit || "—"}</td><td><span className="badge">{p.status || "—"}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}