import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { HealthDataProvider, useHealthData } from "./context/HealthDataContext";
import AuthModal from "./components/AuthModal";
import Dashboard from "./pages/Dashboard";
import UploadArea from "./pages/UploadArea";
import Timeline from "./pages/Timeline";
import Compare from "./pages/Compare";
import ReportList from "./pages/ReportList";
import ReportDetail from "./pages/ReportDetail";
import Trends from "./pages/Trends";
import Glossary from "./pages/Glossary";
import VisitPrep from "./pages/VisitPrep";
import Language from "./pages/Language";
import Chatbot from "./pages/Chatbot";
import SpecialistLocator from "./pages/SpecialistLocator";
import Anatomy from "./pages/Anatomy";
import Profile from "./pages/Profile";

const navItems = [
  ["Dashboard", "/"],
  ["Upload", "/upload"],
  ["Timeline", "/timeline"],
  ["Reports", "/reports"],
  ["Trends", "/trends"],
  ["Glossary", "/glossary"],
  ["Visit Prep", "/visit-prep"],
  ["Languages", "/language"],
  ["Health Assistant", "/chatbot"],
  ["Specialist Locator", "/specialists"],
  ["3D Anatomy", "/anatomy"],
  ["👤 Personal Profile", "/profile"],
];

function AppContent() {
  const { profile, isCustomized } = useProfile();
  const { activePatient, openAuthModal } = useAuth();
  const { t, language } = useLanguage();
  const { hasReports, clearAllReports } = useHealthData();

  const initials = (activePatient?.fullName || profile.fullName || "PT")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("") || "PT";

  const firstName = (activePatient?.fullName || profile.fullName || "Patient").split(" ")[0];

  async function handleClearAll() {
    const memberName = activePatient?.fullName || profile.fullName || "this patient";
    if (
      !window.confirm(
        `⚠️ Clear all reports for ${memberName}?\n\nThis will immediately remove all reports, biomarkers, and anomalies across Dashboard, Timeline, Trends, History, Glossary, Visit Prep, Health Assistant, Specialist Locator, and 3D Anatomy so you can start fresh.`
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
    <div className="app-shell">
      <AuthModal />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">H</div>
          <div>
            <strong>Health AI Summarizer</strong>
            <span>{t("Medical Records")}</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <div className="sidebar-patient-badge" onClick={openAuthModal} style={{ cursor: "pointer" }}>
            <span className="patient-avatar-mini">{initials}</span>
            <div className="sidebar-patient-meta">
              <strong>{activePatient?.fullName || profile.fullName || "Patient"}</strong>
              <small>
                {activePatient ? `${t(activePatient.relation)} · ${t("Click to Switch")}` : isCustomized ? `✓ ${t("Profile Active")}` : t("Demo Mode")}
              </small>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button
              className="secondary-button"
              style={{ fontSize: "0.75rem", padding: "4px 8px", width: "100%" }}
              onClick={openAuthModal}
            >
              👥 {t("Switch Family Member")}
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              {(activePatient?.fullName || profile.fullName || "PATIENT").toUpperCase()} · {t("CLINICAL SUMMARY")}
            </span>
            <h1>{t("Understand your reports, simply.")}</h1>
          </div>
          <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {language !== "English" && (
              <NavLink to="/language" className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#047857", textDecoration: "none" }}>
                🌐 {t(language)}
              </NavLink>
            )}
            <button className="secondary-button" onClick={openAuthModal} title={t("Switch family member profile")}>
              👥 {firstName} ({t(activePatient?.relation || "Self")})
            </button>
            <NavLink className="secondary-button" to="/profile">
              👤 {t("Profile")}
            </NavLink>
            {hasReports && (
              <button
                className="secondary-button"
                onClick={handleClearAll}
                title={t("Clear all reports for current patient")}
                style={{ color: "#ef4444", borderColor: "#fca5a5" }}
              >
                🗑️ {t("Clear All Reports")}
              </button>
            )}
            <NavLink className="primary-button" to="/upload">
              + {t("Upload report")}
            </NavLink>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadArea />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/visit-prep" element={<VisitPrep />} />
          <Route path="/language" element={<Language />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/specialists" element={<SpecialistLocator />} />
          <Route path="/anatomy" element={<Anatomy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <ProfileProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </ProfileProvider>
      </HealthDataProvider>
    </AuthProvider>
  );
}