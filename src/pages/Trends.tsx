import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendPoint } from "../types";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";
import DemoPatient from "../components/DemoPatient";

export default function Trends() {
  const { trendAnomalies, hasReports, activePatientName, loading: dataLoading } = useHealthData();
  const { t } = useLanguage();
  const [parameter, setParameter] = useState<string>("");
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Automatically select the first anomaly when anomalies load or change
  useEffect(() => {
    if (trendAnomalies.length > 0) {
      const exists = trendAnomalies.some((a) => a.key === parameter);
      if (!exists) {
        setParameter(trendAnomalies[0].key);
      }
    } else {
      setParameter("");
      setData([]);
    }
  }, [trendAnomalies]);

  // Fetch trend points for the selected anomalous biomarker
  useEffect(() => {
    if (!parameter) {
      setData([]);
      return;
    }
    setLoading(true);
    api.getTrends(parameter)
      .then((d) => {
        setData(d || []);
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [parameter]);

  const hasData = data && data.length > 0;
  const currentAnomaly = trendAnomalies.find((a) => a.key === parameter);

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">{t("Biomarker Trends")}</span>
        <h2>{t("Health & Biomarker Trends for")} {activePatientName}</h2>
        <p>
          {t("Dynamic monitoring for biomarkers that require clinical attention. Only anomalous values present in your uploaded reports are displayed below.")}
        </p>
      </div>

      <div className="card">
        <div className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <label className="select-label" style={{ minWidth: 280 }}>
            {t("Select Biomarker")} ({trendAnomalies.length} {t("tracked")})
            {trendAnomalies.length > 0 ? (
              <select value={parameter} onChange={(e) => setParameter(e.target.value)}>
                {trendAnomalies.map((item) => (
                  <option key={item.key} value={item.key}>
                    {t(item.label)}
                  </option>
                ))}
              </select>
            ) : (
              <select disabled>
                <option>{t("No anomalies detected in current reports")}</option>
              </select>
            )}
          </label>
          <span className="badge" style={{ alignSelf: "center", backgroundColor: trendAnomalies.length > 0 ? "rgba(239, 68, 68, 0.12)" : "#e2e8f0", color: trendAnomalies.length > 0 ? "#b91c1c" : "#64748b" }}>
            {trendAnomalies.length > 0 ? `⚠️ ${trendAnomalies.length} ${t("ATTENTION")}` : `✓ 0 ${t("ATTENTION")}`}
          </span>
        </div>

        {trendAnomalies.length > 0 ? (
          hasData ? (
            <div className="chart" style={{ marginTop: 20 }}>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#dc2626"
                    strokeWidth={3}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            !loading && (
              <div className="empty-state" style={{ margin: "24px 0", padding: "36px 16px" }}>
                <div className="empty-icon">📈</div>
                <h3>{t("No data points recorded for this parameter")}</h3>
                <p>{t("Upload more historical reports to compare progression over time.")}</p>
              </div>
            )
          )
        ) : (
          !dataLoading && (
            <div className="empty-state" style={{ margin: "28px 0", padding: "36px 16px" }}>
              <div className="empty-icon">📈</div>
              <h3>{t("No anomalous biomarkers to track")}</h3>
              <p style={{ maxWidth: 500, margin: "0 auto 16px auto" }}>
                {hasReports
                  ? t("All checked parameters are within standard reference ranges!")
                  : `${t("No reports uploaded yet for")} ${activePatientName}. ${t("Upload your lab reports (PDF, JPG scan, or text) or update your personal health profile to generate your personalized clinical summary.")}`}
              </p>
              <Link to="/upload" className="primary-button">
                + {t("Upload report")}
              </Link>
            </div>
          )
        )}
      </div>

      {hasData && currentAnomaly && (
        <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
          <span className="card-label">{t("ANOMALY PROGRESSION INSIGHT")}</span>
          <p style={{ margin: "6px 0 0 0" }}>
            {t("Tracking")} <strong>{data.length}</strong> {t("recorded point(s) for")}{" "}
            <strong>{t(currentAnomaly.name)}</strong>. {t("Latest reading is")}{" "}
            <strong>{data[data.length - 1]?.value} {currentAnomaly.unit || ""}</strong> [{t(currentAnomaly.status || "ATTENTION")}] on {data[data.length - 1]?.date}.
          </p>
        </div>
      )}
    </section>
  );
}