import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";

interface SpecialistClinic {
  id: string;
  name: string;
  doctor: string;
  qualification: string;
  specialty: string;
  anomalyTag: string;
  distance: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  timing: string;
  city?: string;
}

const ALL_SPECIALISTS: SpecialistClinic[] = [
  // Mumbai Clinics (Matching patient home: Bandra West, Mumbai)
  {
    id: "spec-m1",
    name: "Bandra Kidney & Renal Care Clinic",
    doctor: "Dr. Arvind Mehta",
    qualification: "MBBS, MD, DM (Nephrology)",
    specialty: "Nephrologist",
    anomalyTag: "Elevated Creatinine",
    distance: "1.2 km",
    address: "Hill Road, Bandra West, Mumbai, Maharashtra",
    city: "Mumbai",
    lat: 19.0544,
    lng: 72.8276,
    rating: 4.9,
    phone: "+91 98201 12345",
    timing: "10:00 AM - 6:30 PM",
  },
  {
    id: "spec-m2",
    name: "Mumbai Blood Health & Anemia Center",
    doctor: "Dr. Shalini Roy",
    qualification: "MBBS, MD (Internal Med), Clinical Hematology",
    specialty: "Hematologist",
    anomalyTag: "Low Hemoglobin",
    distance: "1.6 km",
    address: "Linking Road, Bandra West, Mumbai, Maharashtra",
    city: "Mumbai",
    lat: 19.0607,
    lng: 72.8335,
    rating: 4.9,
    phone: "+91 98202 33445",
    timing: "09:30 AM - 5:00 PM",
  },
  {
    id: "spec-m3",
    name: "Suburban Diabetes & Endocrine Speciality",
    doctor: "Dr. Rajiv Singhal",
    qualification: "MBBS, MD, DM (Endocrinology)",
    specialty: "Endocrinologist",
    anomalyTag: "Fasting Glucose",
    distance: "2.1 km",
    address: "Turner Road, Bandra West, Mumbai, Maharashtra",
    city: "Mumbai",
    lat: 19.0581,
    lng: 72.8299,
    rating: 4.9,
    phone: "+91 98203 44556",
    timing: "09:00 AM - 7:00 PM",
  },
  {
    id: "spec-m4",
    name: "Apex Bone & Joint Health Clinic",
    doctor: "Dr. Pradeep Sharma",
    qualification: "MBBS, MS (Orthopedics), Joint & Bone Specialist",
    specialty: "Orthopedist",
    anomalyTag: "Vitamin D3",
    distance: "1.4 km",
    address: "Pali Hill, Bandra West, Mumbai, Maharashtra",
    city: "Mumbai",
    lat: 19.0645,
    lng: 72.8267,
    rating: 4.8,
    phone: "+91 98204 77889",
    timing: "10:00 AM - 8:00 PM",
  },
  {
    id: "spec-m5",
    name: "Lilavati Preventive Cardiovascular Care",
    doctor: "Dr. Alok Khandelwal",
    qualification: "MBBS, MD, DM (Cardiology)",
    specialty: "Cardiologist",
    anomalyTag: "LDL Cholesterol",
    distance: "1.7 km",
    address: "Near Lilavati Hospital, Bandra Reclamation, Mumbai",
    city: "Mumbai",
    lat: 19.0515,
    lng: 72.8288,
    rating: 5.0,
    phone: "+91 98205 66778",
    timing: "09:00 AM - 6:00 PM",
  },

  // Nephrology (Creatinine) - Jaipur
  {
    id: "spec-1",
    name: "Apex Kidney Care & Renal Institute",
    doctor: "Dr. Arvind Mehta",
    qualification: "MBBS, MD, DM (Nephrology)",
    specialty: "Nephrologist",
    anomalyTag: "Elevated Creatinine",
    distance: "1.4 km",
    address: "B-14, JLN Marg, Near Fortis Circle, Jaipur",
    city: "Jaipur",
    lat: 26.8521,
    lng: 75.8052,
    rating: 4.9,
    phone: "+91 98290 12345",
    timing: "10:00 AM - 6:30 PM",
  },
  {
    id: "spec-2",
    name: "Jaipur Renal & Dialysis Clinic",
    doctor: "Dr. Neha Pareek",
    qualification: "MBBS, DNB (Nephrology)",
    specialty: "Nephrologist",
    anomalyTag: "Elevated Creatinine",
    distance: "2.8 km",
    address: "Plot 22, Tonk Road, Bapu Nagar, Jaipur",
    lat: 26.8856,
    lng: 75.8094,
    rating: 4.8,
    phone: "+91 94140 56789",
    timing: "11:00 AM - 7:00 PM",
  },

  // Hematology (Hemoglobin)
  {
    id: "spec-3",
    name: "Center for Blood Disorders & Anemia",
    doctor: "Dr. Shalini Roy",
    qualification: "MBBS, MD (Internal Med), Clinical Hematology",
    specialty: "Hematologist",
    anomalyTag: "Low Hemoglobin",
    distance: "1.9 km",
    address: "C-Scheme, Ashok Nagar, Jaipur",
    lat: 26.9084,
    lng: 75.7997,
    rating: 4.9,
    phone: "+91 98281 33445",
    timing: "09:30 AM - 5:00 PM",
  },
  {
    id: "spec-4",
    name: "City Comprehensive Hematology Care",
    doctor: "Dr. Vikramaditya Rathore",
    qualification: "MBBS, MD, DM (Hematology)",
    specialty: "Hematologist",
    anomalyTag: "Low Hemoglobin",
    distance: "3.2 km",
    address: "Near SMS Hospital Medical Enclave, Jaipur",
    lat: 26.8972,
    lng: 75.8175,
    rating: 4.7,
    phone: "+91 97840 98765",
    timing: "10:00 AM - 6:00 PM",
  },

  // Endocrinology (Glucose)
  {
    id: "spec-5",
    name: "Metabolic & Diabetes Speciality Center",
    doctor: "Dr. Rajiv Singhal",
    qualification: "MBBS, MD, DM (Endocrinology)",
    specialty: "Endocrinologist",
    anomalyTag: "Fasting Glucose",
    distance: "2.1 km",
    address: "Malviya Nagar Sector 4, Calgiri Marg, Jaipur",
    lat: 26.8542,
    lng: 75.8239,
    rating: 4.9,
    phone: "+91 98292 44556",
    timing: "09:00 AM - 7:00 PM",
  },
  {
    id: "spec-6",
    name: "Aarogyam Hormone & Thyroid Clinic",
    doctor: "Dr. Sunita Bansal",
    qualification: "MBBS, MD, Fellowship in Diabetology",
    specialty: "Endocrinologist",
    anomalyTag: "Fasting Glucose",
    distance: "3.6 km",
    address: "Raja Park Main Market, Jaipur",
    lat: 26.8932,
    lng: 75.8312,
    rating: 4.8,
    phone: "+91 94142 88990",
    timing: "10:30 AM - 6:30 PM",
  },

  // Orthopedics (Vitamin D)
  {
    id: "spec-7",
    name: "Care Ortho & Bone Mineral Clinic",
    doctor: "Dr. Pradeep Sharma",
    qualification: "MBBS, MS (Orthopedics), Joint & Bone Specialist",
    specialty: "Orthopedist",
    anomalyTag: "Vitamin D3",
    distance: "1.6 km",
    address: "MI Road, Near Panch Batti, Jaipur",
    lat: 26.9189,
    lng: 75.8112,
    rating: 4.8,
    phone: "+91 98291 77889",
    timing: "10:00 AM - 8:00 PM",
  },

  // Cardiology (Cholesterol)
  {
    id: "spec-8",
    name: "Heart & Vascular Preventive Care",
    doctor: "Dr. Alok Khandelwal",
    qualification: "MBBS, MD, DM (Cardiology)",
    specialty: "Cardiologist",
    anomalyTag: "LDL Cholesterol",
    distance: "2.4 km",
    address: "Bhawani Singh Road, Rambagh Circle, Jaipur",
    lat: 26.8951,
    lng: 75.8081,
    rating: 5.0,
    phone: "+91 98280 66778",
    timing: "09:00 AM - 6:00 PM",
  },
];

export default function SpecialistLocator() {
  const [params, setSearchParams] = useSearchParams();
  const { anomalies, trendAnomalies, hasReports, reports, activePatientName } = useHealthData();
  const { t } = useLanguage();

  // 1. Analyze anomalies strictly from active patient's uploaded reports
  const activeReportAnomalies = useMemo(() => {
    if (!hasReports || reports.length === 0) return [];

    const strings = [
      ...anomalies.map((a) => `${a.paramName} ${a.explanation || ""}`.toLowerCase()),
      ...trendAnomalies.map((t) => `${t.name} ${t.key} ${t.label}`.toLowerCase()),
    ];

    const detected: { key: string; label: string; specialty: string }[] = [];

    if (strings.some((s) => s.includes("creatinine") || s.includes("kidney") || s.includes("renal"))) {
      detected.push({ key: "creatinine", label: "Elevated Creatinine", specialty: "Nephrologist" });
    }
    if (strings.some((s) => s.includes("hemoglobin") || s.includes("anemia") || s.includes("iron") || s.includes("rbc"))) {
      detected.push({ key: "hemoglobin", label: "Low Hemoglobin", specialty: "Hematologist" });
    }
    if (strings.some((s) => s.includes("glucose") || s.includes("sugar") || s.includes("hba1c") || s.includes("diabetes"))) {
      detected.push({ key: "glucose", label: "Fasting Glucose", specialty: "Endocrinologist" });
    }
    if (strings.some((s) => s.includes("cholesterol") || s.includes("lipid") || s.includes("ldl") || s.includes("triglyceride"))) {
      detected.push({ key: "cholesterol", label: "LDL Cholesterol", specialty: "Cardiologist" });
    }
    if (strings.some((s) => s.includes("vitamin") || s.includes("vit d") || s.includes("calcium") || s.includes("bone"))) {
      detected.push({ key: "vitamind", label: "Vitamin D3", specialty: "Orthopedist" });
    }

    return detected;
  }, [hasReports, reports, anomalies, trendAnomalies]);

  // 2. Filter available specialists: ONLY specialists matching uploaded report anomalies are suggested!
  const reportMatchedSpecialists = useMemo(() => {
    if (activeReportAnomalies.length === 0) return [];

    const matchingSpecialties = new Set(activeReportAnomalies.map((a) => a.specialty.toLowerCase()));

    return ALL_SPECIALISTS.filter((s) => matchingSpecialties.has(s.specialty.toLowerCase()));
  }, [activeReportAnomalies]);

  const [selectedAnomaly, setSelectedAnomaly] = useState<string>(params.get("problem") || "ALL");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [customSearch, setCustomSearch] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Synchronize selection when available report specialists change
  useEffect(() => {
    if (reportMatchedSpecialists.length > 0) {
      if (!reportMatchedSpecialists.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(reportMatchedSpecialists[0].id);
      }
    } else {
      setSelectedDoctorId("");
    }
  }, [reportMatchedSpecialists, selectedDoctorId]);

  // Filter based on user selection pill or search term
  const filteredSpecialists = useMemo(() => {
    let list = reportMatchedSpecialists;

    if (selectedAnomaly !== "ALL") {
      const q = selectedAnomaly.toLowerCase();
      list = list.filter(
        (s) =>
          s.anomalyTag.toLowerCase().includes(q) ||
          s.specialty.toLowerCase().includes(q) ||
          q.includes(s.anomalyTag.toLowerCase()) ||
          q.includes(s.specialty.toLowerCase())
      );
      if (list.length === 0) list = reportMatchedSpecialists;
    }

    if (customSearch.trim()) {
      const s = customSearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.doctor.toLowerCase().includes(s) ||
          item.name.toLowerCase().includes(s) ||
          item.specialty.toLowerCase().includes(s) ||
          item.address.toLowerCase().includes(s)
      );
    }

    return list;
  }, [reportMatchedSpecialists, selectedAnomaly, customSearch]);

  const activeDoctor = useMemo(() => {
    return (
      filteredSpecialists.find((d) => d.id === selectedDoctorId) ||
      filteredSpecialists[0] ||
      reportMatchedSpecialists[0]
    );
  }, [filteredSpecialists, selectedDoctorId, reportMatchedSpecialists]);

  // Generate interactive Leaflet HTML with RED location pin icons
  const mapHtml = useMemo(() => {
    if (!activeDoctor || filteredSpecialists.length === 0) return "";

    const markersJson = JSON.stringify(
      filteredSpecialists.map((d) => ({
        id: d.id,
        name: d.name,
        doctor: d.doctor,
        specialty: d.specialty,
        address: d.address,
        distance: d.distance,
        lat: d.lat,
        lng: d.lng,
        isSelected: d.id === activeDoctor.id,
      }))
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin:0; padding:0; height:100%; width:100%; font-family: Inter, sans-serif; }
          #map { height: 100%; width: 100%; }
          .red-pin-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .red-pin-svg {
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
            transition: transform 0.2s ease;
          }
          .red-pin-svg.active {
            transform: scale(1.3) translateY(-4px);
            filter: drop-shadow(0 6px 12px rgba(180,35,24,0.6));
          }
          .pin-radar {
            position: absolute;
            top: 2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(217, 45, 32, 0.4);
            animation: radar 2s infinite ease-out;
            pointer-events: none;
          }
          @keyframes radar {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 4px 6px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }
          .map-popup-title { font-weight: 800; font-size: 14px; color: #1d2939; margin-bottom: 2px; }
          .map-popup-spec { font-size: 11px; font-weight: 700; color: #b42318; text-transform: uppercase; }
          .map-popup-addr { font-size: 11px; color: #475467; margin-top: 4px; }
          .map-popup-dist { display: inline-block; margin-top: 6px; background: #fee4e2; color: #b42318; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const specialists = ${markersJson};
          const centerLat = ${activeDoctor.lat};
          const centerLng = ${activeDoctor.lng};

          const map = L.map('map', { zoomControl: true }).setView([centerLat, centerLng], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const redSvg = (isActive) => \`
            <div class="red-pin-container">
              <div class="pin-radar"></div>
              <svg class="red-pin-svg \${isActive ? 'active' : ''}" width="34" height="42" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#D92D20"/>
                <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
                <circle cx="12" cy="11" r="2.5" fill="#D92D20"/>
              </svg>
            </div>
          \`;

          specialists.forEach(s => {
            const icon = L.divIcon({
              className: 'custom-pin-marker',
              html: redSvg(s.isSelected),
              iconSize: [34, 42],
              iconAnchor: [17, 42],
              popupAnchor: [0, -42]
            });

            const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
            
            const popupContent = \`
              <div>
                <div class="map-popup-spec">\${s.specialty}</div>
                <div class="map-popup-title">\${s.doctor}</div>
                <div style="font-size:12px; color:#344054;">\${s.name}</div>
                <div class="map-popup-addr">\${s.address}</div>
                <span class="map-popup-dist">📍 \${s.distance} away</span>
              </div>
            \`;
            marker.bindPopup(popupContent);

            if (s.isSelected) {
              marker.openPopup();
            }

            marker.on('click', () => {
              window.parent.postMessage({ type: 'SELECT_DOCTOR', id: s.id }, '*');
            });
          });
        </script>
      </body>
      </html>
    `;
  }, [filteredSpecialists, activeDoctor]);

  useEffect(() => {
    function handleMsg(e: MessageEvent) {
      if (e.data && e.data.type === "SELECT_DOCTOR") {
        setSelectedDoctorId(e.data.id);
      }
    }
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  return (
    <section className="page">
      <DemoPatient compact />

      <div className="page-heading">
        <span className="eyebrow">{t("FEATURE · SPECIALIST LOCATOR")}</span>
        <h2>{t("Specialists Recommended for Your Reports")} ({activePatientName})</h2>
        <p>
          {t("Specialists are dynamically recommended only for abnormal lab parameters identified in your medical diagnostic reports. Upload a report to see tailored doctor recommendations.")}
        </p>
      </div>

      {reportMatchedSpecialists.length === 0 ? (
        <div className="card large" style={{ textAlign: "center", padding: "44px 20px", marginTop: 16 }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🩺</div>
          <h3>{t("No clinical anomalies detected in your uploaded reports.")}</h3>
          <p style={{ color: "var(--text-muted, #64748b)", maxWidth: 540, margin: "0 auto 20px auto" }}>
            {t("Specialists are dynamically recommended only for abnormal lab parameters identified in your medical diagnostic reports. Upload a report to see tailored doctor recommendations.")}
          </p>
          <Link to="/upload" className="primary-button">
            + {t("Upload Report to Find Specialists")}
          </Link>
        </div>
      ) : (
        <>
          {/* Anomaly Detection Match Banner */}
          <div className="anomaly-match-banner">
            <strong>📋 {t("Specialists Recommended for Your Reports")}:</strong>
            <p>{t("Click any parameter below to immediately pinpoint doctors specializing in that exact condition:")}</p>

            <div className="anomaly-pill-grid">
              <button
                className={`anomaly-pill-btn ${selectedAnomaly === "ALL" ? "active" : ""}`}
                onClick={() => {
                  setSelectedAnomaly("ALL");
                  setSearchParams({});
                }}
              >
                {t("All Recommended Specialists")} ({reportMatchedSpecialists.length})
              </button>

              {activeReportAnomalies.map((anom) => (
                <button
                  key={anom.key}
                  className={`anomaly-pill-btn ${selectedAnomaly.toLowerCase().includes(anom.key) ? "active" : ""}`}
                  onClick={() => {
                    setSelectedAnomaly(anom.key);
                    setSearchParams({ problem: anom.key });
                  }}
                >
                  ⚠️ {t(anom.label)} ({t(anom.specialty)})
                </button>
              ))}
            </div>
          </div>

          {bookingSuccess && (
            <div className="booking-modal-overlay" onClick={() => setBookingSuccess(null)}>
              <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>✅</div>
                <h3>{t("Consultation Confirmed!")}</h3>
                <p>{bookingSuccess}</p>
                <div style={{ margin: "16px 0", fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>
                  {t("A reminder notification and appointment token have been issued for")} {activePatientName}.
                </div>
                <button className="primary-button" onClick={() => setBookingSuccess(null)}>
                  {t("Done")}
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
            <input
              type="text"
              placeholder={t("Search doctors, clinics or locations...")}
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div className="specialist-grid">
            {/* Left: Interactive Map */}
            <div className="card map-card" style={{ padding: 0, overflow: "hidden", minHeight: "520px" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>📍 {t("Live Map & Real Clinic Coordinates")}</strong>
                <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
                  {filteredSpecialists.length} {t("Verified Specialists")}
                </span>
              </div>
              <iframe
                title="Specialist Map"
                srcDoc={mapHtml}
                style={{ width: "100%", height: "460px", border: "none" }}
              />
            </div>

            {/* Right: Specialist List */}
            <div className="specialist-list">
              {filteredSpecialists.map((spec) => (
                <div
                  key={spec.id}
                  className={`specialist-card ${activeDoctor?.id === spec.id ? "active" : ""}`}
                  onClick={() => setSelectedDoctorId(spec.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="specialty-badge">{t(spec.specialty)}</span>
                      <h3 style={{ margin: "6px 0 2px 0" }}>{spec.doctor}</h3>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)" }}>{spec.qualification}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 800, color: "#eab308" }}>★ {spec.rating}</span>
                      <div style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: 700, marginTop: 4 }}>
                        📍 {spec.distance}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: "0.85rem", color: "#334155" }}>
                    <strong>{spec.name}</strong>
                    <div>{spec.address}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>🕒 {spec.timing}</div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button
                      className="primary-button"
                      style={{ fontSize: "0.82rem", padding: "6px 12px", flex: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingSuccess(`Your consultation with ${spec.doctor} at ${spec.name} has been confirmed for tomorrow at 11:30 AM.`);
                      }}
                    >
                      📅 {t("Book Consultation")}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spec.name} ${spec.address}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-button"
                      style={{ fontSize: "0.82rem", padding: "6px 10px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🧭 {t("Directions")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
