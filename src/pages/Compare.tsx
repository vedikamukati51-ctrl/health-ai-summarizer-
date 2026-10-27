import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, demo } from "../services/api";
import type { CompareData } from "../types";
import StatusMessage from "../components/StatusMessage";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";

export default function Compare() {
  const { activePatientName } = useHealthData();
  const [params] = useSearchParams();
  const beforeId = params.get("beforeId") || "";
  const latestId = params.get("latestId") || "";
  const [data, setData] = useState<CompareData>({ rows: [], explanation: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.compareReports(beforeId, latestId)
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not compare reports.");
      })
      .finally(() => setLoading(false));
  }, [beforeId, latestId, activePatientName]);

  const hasRows = data.rows && data.rows.length > 0;

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">BIOMARKER PROGRESSION & DELTAS</span>
        <h2>What Changed Between Reports for {activePatientName}?</h2>
        <p>Side-by-side delta comparison of laboratory parameters across two reports.</p>
      </div>

      {error && <StatusMessage type="info">{error}</StatusMessage>}
      {loading && <StatusMessage type="info">Calculating biomarker variances…</StatusMessage>}

      {hasRows ? (
        <>
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Before</th>
                  <th>Latest</th>
                  <th>Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.param}</strong></td>
                    <td>{row.before}</td>
                    <td>{row.latest}</td>
                    <td>{row.diff ?? "—"}</td>
                    <td><span className="badge">{row.status ?? "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.explanation && (
            <div className="card">
              <span className="card-label">AI EXPLANATION</span>
              <p>{data.explanation}</p>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="empty-state card">
            <div className="empty-icon">⚖️</div>
            <h3>Need at least two reports to compare</h3>
            <p>
              Upload at least two medical reports or lab results to observe biomarker changes,
              progression deltas, and recovery trajectories.
            </p>
            <Link to="/upload" className="primary-button">
              + Upload a report
            </Link>
          </div>
        )
      )}
    </section>
  );
}