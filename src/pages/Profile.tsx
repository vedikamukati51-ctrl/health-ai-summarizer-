import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import StatusMessage from "../components/StatusMessage";

export default function Profile() {
  const { profile, updateProfile, resetProfile, isCustomized } = useProfile();
  const { activePatient, openAuthModal, updateActivePatient } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: activePatient?.fullName || profile.fullName || "",
    age: activePatient?.age || profile.age || "",
    gender: activePatient?.gender || profile.gender || "Female",
    bloodGroup: activePatient?.bloodGroup || profile.bloodGroup || "B+",
    height: activePatient?.height || profile.height || "165 cm",
    weight: activePatient?.weight || profile.weight || "58 kg",
    allergies: activePatient?.allergies || profile.allergies || "",
    conditions: activePatient?.conditions || profile.conditions || "",
    emergencyContact: activePatient?.emergencyContact || profile.emergencyContact || "",
    phone: activePatient?.phone || profile.phone || "",
    address: activePatient?.address || profile.address || "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const p = activePatient || profile;
    setFormData({
      fullName: p.fullName || "",
      age: p.age || "",
      gender: p.gender || "Female",
      bloodGroup: p.bloodGroup || "B+",
      height: p.height || "165 cm",
      weight: p.weight || "58 kg",
      allergies: p.allergies || "",
      conditions: p.conditions || "",
      emergencyContact: p.emergencyContact || "",
      phone: p.phone || "",
      address: p.address || "",
    });
  }, [activePatient, profile]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Calculate BMI if height and weight are numbers
  const heightVal = parseFloat(formData.height);
  const weightVal = parseFloat(formData.weight);
  let bmiDisplay = "";
  if (heightVal > 50 && weightVal > 20) {
    const heightM = heightVal > 3 ? heightVal / 100 : heightVal;
    const bmi = (weightVal / (heightM * heightM)).toFixed(1);
    let category = "Normal weight";
    if (parseFloat(bmi) < 18.5) category = "Underweight";
    else if (parseFloat(bmi) >= 25 && parseFloat(bmi) < 30) category = "Overweight";
    else if (parseFloat(bmi) >= 30) category = "Obese";
    bmiDisplay = `BMI: ${bmi} (${category})`;
  }

  const initials = formData.fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("") || "PT";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const ageNum = Number(formData.age);
      const payload = {
        ...formData,
        age: isNaN(ageNum) ? 0 : ageNum,
      };
      await updateActivePatient(payload);
      await updateProfile(payload);
      setSuccessMsg(
        `✓ Profile saved successfully! Records, chatbot, reports, and specialist recommendations are now personalized for ${formData.fullName}.`
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrorMsg("Failed to save profile. Please check that the backend is active.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (window.confirm("Reset profile back to default demo patient (Ananya Sharma)?")) {
      await resetProfile();
      setSuccessMsg("Profile reset to demo defaults.");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }

  return (
    <section className="page profile-page">
      <div className="page-heading">
        <span className="eyebrow">{t("Personal Profile")}</span>
        <h2>{t("Personal Health Profile")}</h2>
        <p>
          {t("Enter your personal data below. The platform will dynamically personalize your report summaries, biomarker evaluations, chatbot assistant, and specialist matches for you.")}
        </p>
      </div>

      {successMsg && <StatusMessage type="success">{successMsg}</StatusMessage>}
      {errorMsg && <StatusMessage type="error">{errorMsg}</StatusMessage>}

      {/* Active Family Member Switcher Banner */}
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          padding: "14px 18px",
          borderRadius: "12px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>👥</span>
          <div>
            <strong style={{ color: "#0369a1", fontSize: "14px", display: "block" }}>
              {t("Active Profile")}: {activePatient?.fullName} ({t(activePatient?.relation || "Self")})
            </strong>
            <span style={{ fontSize: "12px", color: "#0284c7" }}>
              {t("Editing details for this specific family member. All other tabs reflect this member's health records.")}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={openAuthModal}
          style={{
            fontSize: "12px",
            padding: "6px 14px",
            borderColor: "#0284c7",
            color: "#0369a1",
            background: "#ffffff",
          }}
        >
          {t("Switch Family Member")} ↻
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="card profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar">{initials}</div>
          <div>
            <div className="profile-hero-title-row">
              <h3>{formData.fullName || "Your Name"}</h3>
              <span className={`badge ${isCustomized ? "badge-success" : "badge-demo"}`}>
                {isCustomized ? "✓ PERSONALIZED PROFILE" : "DEMO PATIENT MODE"}
              </span>
            </div>
            <p className="profile-hero-sub">
              {formData.age ? `${formData.age} yrs` : "Age not set"} · {formData.gender} · Blood
              Group: <strong>{formData.bloodGroup}</strong>
              {bmiDisplay && ` · ${bmiDisplay}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Section 1: Demographics */}
        <div className="card">
          <span className="card-label">{t("STEP 1: DEMOGRAPHICS")}</span>
          <h3 className="section-title">{t("Basic Information")}</h3>
          <div className="grid two form-grid">
            <label className="form-field">
              <span>{t("Full Name")} *</span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rohan Verma"
                required
              />
            </label>

            <label className="form-field">
              <span>{t("Age")} ({t("yrs")})</span>
              <input
                type="number"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 35"
              />
            </label>

            <label className="form-field">
              <span>{t("Gender")}</span>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Female">{t("Female")}</option>
                <option value="Male">{t("Male")}</option>
                <option value="Other">{t("Other")}</option>
                <option value="Prefer not to say">{t("Prefer not to say")}</option>
              </select>
            </label>

            <label className="form-field">
              <span>{t("Blood Group")}</span>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">{t("Unknown")}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Section 2: Biometrics */}
        <div className="card">
          <span className="card-label">{t("STEP 2: BIOMETRICS")}</span>
          <h3 className="section-title">{t("Height & Weight")}</h3>
          <div className="grid two form-grid">
            <label className="form-field">
              <span>{t("Height")}</span>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 170 cm or 5 ft 8 in"
              />
            </label>

            <label className="form-field">
              <span>{t("Weight")}</span>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 68 kg"
              />
            </label>
          </div>
          {bmiDisplay && (
            <div className="bmi-callout">
              <strong>{t("Calculated Body Mass Index")}:</strong> {bmiDisplay}
            </div>
          )}
        </div>

        {/* Section 3: Health History & Allergies */}
        <div className="card">
          <span className="card-label">{t("STEP 3: CLINICAL BACKGROUND")}</span>
          <h3 className="section-title">{t("Medical History & Allergies")}</h3>
          <div className="stack form-stack">
            <label className="form-field">
              <span>{t("Chronic Conditions")}</span>
              <input
                type="text"
                name="conditions"
                value={formData.conditions}
                onChange={handleChange}
                placeholder="e.g. Mild Iron Deficiency Anemia, Hypothyroidism, Prediabetes"
              />
              <small className="field-hint">
                {t("Helps our AI contextualize borderline glucose or hemoglobin fluctuations.")}
              </small>
            </label>

            <label className="form-field">
              <span>{t("Known Allergies")}</span>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Gluten"
              />
              <small className="field-hint">
                {t("Important for visit preparation and customized dietary guidance.")}
              </small>
            </label>
          </div>
        </div>

        {/* Section 4: Emergency & Location */}
        <div className="card">
          <span className="card-label">{t("STEP 4: CONTACT & EMERGENCY")}</span>
          <h3 className="section-title">{t("Emergency Contact & Location")}</h3>
          <div className="grid two form-grid">
            <label className="form-field">
              <span>{t("Personal Phone Number")}</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 11001"
              />
            </label>

            <label className="form-field">
              <span>{t("Emergency Contact")}</span>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210 (Spouse)"
              />
            </label>

            <label className="form-field">
              <span>{t("Address / City")}</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </label>
          </div>
        </div>

        {/* Action Row */}
        <div className="profile-actions-row">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? t("Saving...") : `💾 ${t("Save Health Profile")}`}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
            disabled={saving}
          >
            ↺ {t("Reset to Demo Defaults")}
          </button>
        </div>
      </form>
    </section>
  );
}
