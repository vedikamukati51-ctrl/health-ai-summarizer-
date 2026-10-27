import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const {
    user,
    familyPatients,
    activePatientId,
    isAuthModalOpen,
    closeAuthModal,
    switchPatient,
    logoutMember,
    loginMember,
    addFamilyMember,
    isMemberLoggedIn,
    pendingLoginMember,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"switch" | "add" | "account">("switch");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // New member form
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState<"Self" | "Spouse" | "Parent" | "Child" | "Other">("Parent");
  const [newAge, setNewAge] = useState<number>(60);
  const [newGender, setNewGender] = useState("Female");
  const [newBloodGroup, setNewBloodGroup] = useState("O+");
  const [newConditions, setNewConditions] = useState("");

  if (!isAuthModalOpen) return null;

  function handleUnlockMember(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingLoginMember) return;
    if (!pinInput.trim()) {
      setPinError("Please enter your PIN / Password");
      return;
    }
    loginMember(pendingLoginMember.id, pinInput);
    setPinInput("");
    setPinError("");
    closeAuthModal();
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await addFamilyMember({
      fullName: newName.trim(),
      relation: newRelation,
      age: Number(newAge) || 30,
      gender: newGender,
      bloodGroup: newBloodGroup,
      conditions: newConditions.trim(),
    });
    setNewName("");
    setNewConditions("");
    setActiveTab("switch");
    closeAuthModal();
  }

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <span className="eyebrow" style={{ color: "var(--accent-primary, #0ea5e9)" }}>
              INSTAGRAM-STYLE ACCOUNT SWITCHER
            </span>
            <h3 style={{ margin: "4px 0 0 0" }}>Family Health Profiles & Accounts</h3>
          </div>
          <button className="modal-close-button" onClick={closeAuthModal}>
            ✕
          </button>
        </div>

        {/* Credentials Prompt for Logged-Out Member */}
        {pendingLoginMember ? (
          <form onSubmit={handleUnlockMember} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, backgroundColor: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.2)" }}>
              <strong>🔒 Enter Credentials for {pendingLoginMember.fullName}</strong>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", marginTop: 4 }}>
                This account was logged out. Enter your password or PIN to unlock and restore previous health reports.
              </div>
            </div>

            {pinError && (
              <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.85rem" }}>
                {pinError}
              </div>
            )}

            <label className="form-field">
              Password or 4-Digit Health PIN
              <input
                type="password"
                autoFocus
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                placeholder="Enter password or PIN (e.g. 1234)"
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="primary-button" type="submit" style={{ flex: 1 }}>
                Unlock & Switch Account
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  // Cancel unlock prompt
                  closeAuthModal();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0", borderBottom: "1px solid var(--border, #e2e8f0)", paddingBottom: 10 }}>
              <button
                className={`secondary-button ${activeTab === "switch" ? "primary-button" : ""}`}
                style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                onClick={() => setActiveTab("switch")}
              >
                👥 Switch User
              </button>
              <button
                className={`secondary-button ${activeTab === "add" ? "primary-button" : ""}`}
                style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                onClick={() => setActiveTab("add")}
              >
                + Add Member
              </button>
              <button
                className={`secondary-button ${activeTab === "account" ? "primary-button" : ""}`}
                style={{ fontSize: "0.85rem", padding: "6px 14px" }}
                onClick={() => setActiveTab("account")}
              >
                🔐 Security
              </button>
            </div>

            {/* Tab 1: Instagram-Style Account List */}
            {activeTab === "switch" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", margin: "0 0 4px 0" }}>
                  Accounts remain logged in on this device until manually logged out. Tap any profile to switch:
                </p>
                {familyPatients.map((p) => {
                  const isCurrent = p.id === activePatientId;
                  const loggedIn = isMemberLoggedIn(p.id);
                  const initials = p.fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((w) => w[0].toUpperCase())
                    .slice(0, 2)
                    .join("");

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        const switched = switchPatient(p.id);
                        if (switched) closeAuthModal();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: isCurrent ? "2px solid #0ea5e9" : "1px solid var(--border, #e2e8f0)",
                        backgroundColor: isCurrent ? "rgba(14, 165, 233, 0.06)" : "var(--card-bg, #fff)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: isCurrent ? "#0ea5e9" : loggedIn ? "#64748b" : "#cbd5e1",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
                            {p.fullName} <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>({p.relation})</span>
                            {!loggedIn && (
                              <span style={{ fontSize: "0.7rem", padding: "1px 6px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#991b1b" }}>
                                Logged Out
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>
                            {p.age} yrs · {p.gender} · Blood: {p.bloodGroup}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isCurrent ? (
                          <span className="badge" style={{ backgroundColor: "#0ea5e9", color: "#fff" }}>
                            Active
                          </span>
                        ) : (
                          <button
                            className="secondary-button"
                            style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const switched = switchPatient(p.id);
                              if (switched) closeAuthModal();
                            }}
                          >
                            {loggedIn ? "Switch" : "🔑 Log In"}
                          </button>
                        )}

                        {loggedIn && (
                          <button
                            className="secondary-button"
                            title="Log out of this account on this device"
                            style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#ef4444", borderColor: "#fecaca" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Log out of ${p.fullName}'s account on this device? Next time, credentials will be required.`)) {
                                logoutMember(p.id);
                              }
                            }}
                          >
                            Log Out
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Add Family Member */}
            {activeTab === "add" && (
              <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label className="form-field">
                  Full Name
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label className="form-field">
                    Relationship
                    <select
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value as any)}
                    >
                      <option value="Self">Self</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="form-field">
                    Age
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label className="form-field">
                    Gender
                    <select value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="form-field">
                    Blood Group
                    <select value={newBloodGroup} onChange={(e) => setNewBloodGroup(e.target.value)}>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </label>
                </div>
                <label className="form-field">
                  Known Conditions (Optional)
                  <input
                    value={newConditions}
                    onChange={(e) => setNewConditions(e.target.value)}
                    placeholder="e.g. Mild Hypertension, Diabetes Type 2"
                  />
                </label>
                <button className="primary-button" type="submit" style={{ marginTop: 8 }}>
                  Save Family Member & Switch
                </button>
              </form>
            )}

            {/* Tab 3: Security & Session Policy */}
            {activeTab === "account" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 8, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <strong style={{ color: "#059669" }}>✓ Multi-Account Vault Active</strong>
                  <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: 4 }}>
                    Active Patient: <strong>{familyPatients.find((p) => p.id === activePatientId)?.fullName}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
                    Persistent Isolation: <code>Tenant ID: {activePatientId}</code>
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)", lineHeight: 1.5 }}>
                  <strong>Instagram-Style Account Behavior:</strong>
                  <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                    <li>Accounts remain active and saved on this browser between sessions.</li>
                    <li>Uploaded reports are permanently remembered under each member's record until changed.</li>
                    <li>If an account is manually logged out, password/PIN credentials are requested to regain access.</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
