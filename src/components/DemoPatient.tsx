import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

export default function DemoPatient({ compact = false }: { compact?: boolean }) {
  const { activePatient, openAuthModal } = useAuth();
  const { profile } = useProfile();
  const { t } = useLanguage();

  const fullName = activePatient?.fullName || profile.fullName || "Patient";
  const relation = activePatient?.relation || "Family Member";
  const age = activePatient?.age || profile.age;
  const gender = activePatient?.gender || profile.gender || "Not specified";
  const bloodGroup = activePatient?.bloodGroup || profile.bloodGroup || "Unknown";
  const allergies = activePatient?.allergies || profile.allergies || "None reported";
  const phone = activePatient?.phone || profile.phone || "+91 98765 11001";
  const emergencyContact =
    activePatient?.emergencyContact || profile.emergencyContact || "+91 98765 43210 (Spouse)";
  const conditions = activePatient?.conditions || profile.conditions || "None";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join("") || "PT";

  return (
    <div
      className={`demo-patient ${compact ? "compact" : ""}`}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fbfcfe 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: compact ? "12px 18px" : "18px 22px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Top Row: Avatar, Name, Relation, Switch & Edit actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: compact ? "38px" : "46px",
              height: compact ? "38px" : "46px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: compact ? "14px" : "16px",
              boxShadow: "0 2px 6px rgba(14, 165, 233, 0.25)",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: compact ? "15px" : "18px", color: "#0f172a" }}>
                {fullName}
              </strong>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  border: "1px solid #bae6fd",
                }}
              >
                👤 {t(relation)}
              </span>
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                {age ? `${age} ${t("yrs")}` : "Age N/A"} · {t(gender)} · {t("Blood Group")}: {bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons: Switch user & Edit profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={openAuthModal}
            style={{
              fontSize: "12px",
              padding: "6px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderColor: "#0284c7",
              color: "#0369a1",
              background: "#f0f9ff",
            }}
            title={t("Switch family member profile")}
          >
            <span>👥</span>
            <strong>{t("Switch User")}</strong>
          </button>
          <Link
            to="/profile"
            className="demo-edit-link"
            style={{
              fontSize: "12px",
              padding: "6px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
            title={t("Edit Profile")}
          >
            <span>✎</span> {t("Edit Profile")}
          </Link>
        </div>
      </div>

      {/* Bottom Row: Clinical Highlights (Allergies, Contact Phone, Conditions) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px 20px",
          paddingTop: "8px",
          borderTop: "1px dashed #e2e8f0",
          fontSize: "12px",
          color: "#475569",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 800, color: "#b45309" }}>⚠️ {t("Known Allergies")}:</span>
          <span
            style={{
              background: allergies.toLowerCase().includes("none") ? "#f1f5f9" : "#fef3c7",
              color: allergies.toLowerCase().includes("none") ? "#64748b" : "#92400e",
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            {t(allergies)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 800, color: "#0369a1" }}>📞 {t("Phone")}:</span>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>{phone}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 800, color: "#64748b" }}>🚨 {t("Emergency Contact")}:</span>
          <span style={{ color: "#334155" }}>{emergencyContact}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 800, color: "#475569" }}>🩺 {t("Chronic Conditions")}:</span>
          <span style={{ color: "#0f172a" }}>{t(conditions)}</span>
        </div>
      </div>
    </div>
  );
}
