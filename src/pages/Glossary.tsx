import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { GlossaryData } from "../types";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";
import DemoPatient from "../components/DemoPatient";

const QUICK_TAGS = [
  "Hemoglobin",
  "Fasting Glucose",
  "Creatinine",
  "Vitamin D3",
  "LDL Cholesterol",
  "Platelets",
  "WBC Count",
];

export default function Glossary() {
  const { anomalies, hasReports, loading: loadingAnomalies, activePatientName } = useHealthData();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<"ALL" | "LOW" | "BORDERLINE" | "ATTENTION">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<GlossaryData | null>(null);
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  async function handleSearch(termToExplain?: string) {
    const query = (termToExplain || searchTerm).trim();
    if (!query) return;
    setSearchLoading(true);
    setSearchedKeyword(query);
    try {
      const data = await api.explainTerm(query);
      setSearchResult(data);
    } catch {
      setSearchResult({
        definition: "The live explanation service is unavailable. Please check your backend connection.",
        whyItMatters: "Explanations help patients understand clinical metrics without anxiety.",
      });
    } finally {
      setSearchLoading(false);
    }
  }

  const filteredAnomalies = anomalies.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">{t("Glossary")}</span>
        <h2>{t("Report Anomalies & Medical Glossary")}</h2>
        <p>
          {t("Immediate breakdown of parameters flagged in your medical reports—including standard normal limits, plain-language explanations, and targeted dietary food intake recommendations to address deficiencies.")}
        </p>
      </div>

      {/* Immediate Report Anomaly Alert Banner */}
      <div className="anomaly-banner">
        <div>
          <strong>⚠️ {t("Active Report Anomaly & Deficiency Detection")}</strong>
          <p>
            {anomalies.length > 0
              ? `${anomalies.length} ${t("parameters were identified as low, borderline, or requiring attention across your latest processed reports.")}`
              : t("Scanning your uploaded reports for out-of-range parameters…")}
          </p>
        </div>
        <span className="badge-attention">LIVE REPORT AUDIT</span>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          {t("All Flagged Anomalies")} ({anomalies.length})
        </button>
        <button
          className={`filter-tab ${filter === "LOW" ? "active" : ""}`}
          onClick={() => setFilter("LOW")}
        >
          🔻 {t("LOW")} ({anomalies.filter((a) => a.status === "LOW").length})
        </button>
        <button
          className={`filter-tab ${filter === "BORDERLINE" ? "active" : ""}`}
          onClick={() => setFilter("BORDERLINE")}
        >
          ⚡ {t("BORDERLINE")} ({anomalies.filter((a) => a.status === "BORDERLINE").length})
        </button>
        <button
          className={`filter-tab ${filter === "ATTENTION" ? "active" : ""}`}
          onClick={() => setFilter("ATTENTION")}
        >
          ⚠️ {t("ATTENTION")} ({anomalies.filter((a) => a.status === "ATTENTION").length})
        </button>
      </div>

      {/* Flagged Anomalies Cards Grid */}
      <div className="anomaly-list">
        {loadingAnomalies ? (
          <div className="card empty">Auditing report parameters and preparing dietary advice…</div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="card empty">
            <strong>✓ All parameters healthy or no report anomalies detected.</strong>
            <p style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
              Upload your latest blood report to identify anomalies, or use the Medical Term Search below to explore any clinical biomarker.
            </p>
          </div>
        ) : (
          filteredAnomalies.map((item) => (
            <article
              key={item.id}
              className={`anomaly-card status-${item.status.toLowerCase()}`}
            >
              {/* Card Header: Parameter, Measured Value, Badge */}
              <div className="anomaly-card-header">
                <div className="anomaly-title-area">
                  <h3>{item.paramName}</h3>
                  {item.reportName && (
                    <span className="anomaly-meta">📄 Detected in: {item.reportName}</span>
                  )}
                </div>

                <div className="anomaly-value-badge-group">
                  <div className="patient-val-pill">
                    Measured: <strong>{item.patientValue}</strong>
                  </div>
                  <span className={`badge-${item.status.toLowerCase()}`}>
                    {item.status === "LOW" ? "🔻 LOW / DEFICIENCY" : item.status === "BORDERLINE" ? "⚡ BORDERLINE" : "⚠️ ATTENTION"}
                  </span>
                </div>
              </div>

              {/* Standard Reference Limits */}
              <div className="limits-box">
                <strong>Standard Normal Range:</strong>
                <span>{item.standardRange}</span>
              </div>

              {/* Plain-Language Explanation */}
              <div className="clinical-explanation">
                <span className="card-label">EXPLAINED IN SIMPLE WORDS</span>
                <p>{item.explanation}</p>
                {item.clinicalImpact && (
                  <p className="clinical-impact">
                    <strong>Clinical Significance:</strong> {item.clinicalImpact}
                  </p>
                )}
              </div>

              {/* Targeted Food Intake Suggestions */}
              {item.dietaryAdvice && (
                <div className="dietary-section">
                  <div className="dietary-title">
                    <h4>🥗 Food Intake & Nutrition Recovery Plan</h4>
                    {item.dietaryAdvice.keyNutrients && (
                      <div className="dietary-pills">
                        {item.dietaryAdvice.keyNutrients.map((n, i) => (
                          <span key={i} className="nutrient-pill">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="diet-grid">
                    {/* Foods to Eat */}
                    <div className="diet-col eat">
                      <h5>🟢 Recommended Foods to Eat</h5>
                      <ul>
                        {item.dietaryAdvice.foodsToEat.map((food, i) => (
                          <li key={i}>{food}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Foods to Avoid / Moderate */}
                    {item.dietaryAdvice.foodsToAvoid && item.dietaryAdvice.foodsToAvoid.length > 0 && (
                      <div className="diet-col avoid">
                        <h5>🔴 Foods to Moderate or Avoid</h5>
                        <ul>
                          {item.dietaryAdvice.foodsToAvoid.map((avoid, i) => (
                            <li key={i}>{avoid}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Nutrient Synergy & Absorption Tip */}
                  {item.dietaryAdvice.absorptionTip && (
                    <div className="synergy-tip">
                      <strong>💡 Bioavailability & Absorption Tip:</strong> {item.dietaryAdvice.absorptionTip}
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Consultation Tip */}
              {item.doctorTip && (
                <div className="doctor-tip-box">
                  <strong>🩺 Questions for your Doctor:</strong> {item.doctorTip}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Manual Search & Custom Term Lookup */}
      <div className="card" style={{ marginTop: "36px" }}>
        <span className="card-label">CUSTOM MEDICAL TERM LOOKUP</span>
        <h3>Look up any other test or medical term</h3>
        <p>Want to check limits and nutrition tips for another test parameter not listed above?</p>

        <div className="glossary-search">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search e.g. Vitamin D, Platelets, Ferritin, Thyroid..."
          />
          <button
            className="primary-button"
            onClick={() => handleSearch()}
            disabled={searchLoading}
          >
            {searchLoading ? "Explaining…" : "Explain & Guide"}
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="quick-tags">
          <span className="quick-tag-label">Quick check:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="quick-tag"
              onClick={() => {
                setSearchTerm(tag);
                handleSearch(tag);
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Result Card */}
        {searchResult && (
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #eef2f6" }}>
            <div className="anomaly-card-header">
              <div className="anomaly-title-area">
                <span className="card-label">LOOKUP RESULT</span>
                <h3>{searchedKeyword}</h3>
              </div>
              {searchResult.status && (
                <span className={`badge-${searchResult.status.toLowerCase()}`}>
                  {searchResult.status}
                </span>
              )}
            </div>

            {searchResult.standardRange && (
              <div className="limits-box">
                <strong>Standard Normal Range:</strong>
                <span>{searchResult.standardRange}</span>
              </div>
            )}

            <div className="clinical-explanation">
              <p>{searchResult.definition}</p>
              {searchResult.whyItMatters && (
                <p className="clinical-impact">
                  <strong>Why it matters:</strong> {searchResult.whyItMatters}
                </p>
              )}
            </div>

            {searchResult.dietaryAdvice && (
              <div className="dietary-section">
                <div className="dietary-title">
                  <h4>🥗 Nutritional & Food Suggestions</h4>
                  {searchResult.dietaryAdvice.keyNutrients && (
                    <div className="dietary-pills">
                      {searchResult.dietaryAdvice.keyNutrients.map((n, i) => (
                        <span key={i} className="nutrient-pill">{n}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="diet-grid">
                  <div className="diet-col eat">
                    <h5>🟢 Foods to Include</h5>
                    <ul>
                      {searchResult.dietaryAdvice.foodsToEat.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>

                  {searchResult.dietaryAdvice.foodsToAvoid && searchResult.dietaryAdvice.foodsToAvoid.length > 0 && (
                    <div className="diet-col avoid">
                      <h5>🔴 Foods to Avoid or Moderate</h5>
                      <ul>
                        {searchResult.dietaryAdvice.foodsToAvoid.map((avoid, i) => (
                          <li key={i}>{avoid}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {searchResult.dietaryAdvice.absorptionTip && (
                  <div className="synergy-tip">
                    <strong>💡 Absorption Tip:</strong> {searchResult.dietaryAdvice.absorptionTip}
                  </div>
                )}
              </div>
            )}

            {searchResult.doctorTip && (
              <div className="doctor-tip-box">
                <strong>🩺 Physician Tip:</strong> {searchResult.doctorTip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card disclaimer" style={{ marginTop: "24px" }}>
        <strong>Medical Disclaimer:</strong> Standard reference ranges and dietary food intake suggestions are informational. Nutritional adjustments should complement, not substitute, clinical recommendations from your qualified physician.
      </div>
    </section>
  );
}