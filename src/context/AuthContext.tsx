import React, { createContext, useContext, useEffect, useState } from "react";
import type { PatientProfile } from "../types";
import { api } from "../services/api";

export interface FamilyPatient {
  id: string;
  fullName: string;
  relation: "Self" | "Spouse" | "Parent" | "Child" | "Other";
  age: number;
  gender: string;
  bloodGroup: string;
  height?: string;
  weight?: string;
  conditions?: string;
  allergies?: string;
  emergencyContact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  token: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: AuthUser;
  activePatientId: string;
  familyPatients: FamilyPatient[];
  activePatient: FamilyPatient;
  memberSessions: Record<string, boolean>;
  isAuthModalOpen: boolean;
  pendingLoginMember: FamilyPatient | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchPatient: (patientId: string) => boolean;
  logoutMember: (patientId: string) => void;
  loginMember: (patientId: string, passOrPin: string) => boolean;
  addFamilyMember: (member: Omit<FamilyPatient, "id">) => Promise<FamilyPatient>;
  updateActivePatient: (data: Partial<FamilyPatient>) => Promise<void>;
  isMemberLoggedIn: (patientId: string) => boolean;
}

const DEFAULT_FAMILY: FamilyPatient[] = [
  {
    id: "usr-default",
    fullName: "Ananya Sharma",
    relation: "Self",
    age: 29,
    gender: "Female",
    bloodGroup: "B+",
    height: "165 cm",
    weight: "58 kg",
    allergies: "Penicillin, Pollen",
    conditions: "Mild Iron Deficiency Anemia",
    emergencyContact: "+91 98765 43210 (Dr. Vikram Sharma - Spouse)",
    phone: "+91 98765 11001",
    email: "ananya.sharma@example.com",
    address: "Bandra West, Mumbai, Maharashtra",
  },
  {
    id: "usr-spouse",
    fullName: "Dr. Vikram Sharma",
    relation: "Spouse",
    age: 32,
    gender: "Male",
    bloodGroup: "O+",
    height: "178 cm",
    weight: "74 kg",
    allergies: "None reported",
    conditions: "No chronic conditions",
    emergencyContact: "+91 98765 11001 (Ananya Sharma - Spouse)",
    phone: "+91 98765 22002",
    email: "vikram.sharma@example.com",
    address: "Bandra West, Mumbai, Maharashtra",
  },
  {
    id: "usr-mother",
    fullName: "Sunita Sharma",
    relation: "Parent",
    age: 58,
    gender: "Female",
    bloodGroup: "A+",
    height: "158 cm",
    weight: "63 kg",
    allergies: "Sulfa drugs, Dust mites",
    conditions: "Mild Hypertension, Osteoarthritis",
    emergencyContact: "+91 98765 11001 (Ananya Sharma - Daughter)",
    phone: "+91 98765 33003",
    email: "sunita.sharma@example.com",
    address: "Andheri East, Mumbai, Maharashtra",
  },
  {
    id: "usr-child",
    fullName: "Aarav Sharma",
    relation: "Child",
    age: 5,
    gender: "Male",
    bloodGroup: "B+",
    height: "110 cm",
    weight: "19 kg",
    allergies: "Peanuts, Shellfish",
    conditions: "Childhood seasonal asthma",
    emergencyContact: "+91 98765 11001 (Ananya Sharma - Mother)",
    phone: "+91 98765 44004",
    email: "aarav.sharma@example.com",
    address: "Bandra West, Mumbai, Maharashtra",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return localStorage.getItem("active_user_id") || "usr-default";
  });

  const [familyPatients, setFamilyPatients] = useState<FamilyPatient[]>(() => {
    const saved = localStorage.getItem("family_patients");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return DEFAULT_FAMILY.map((def) => {
            const found = parsed.find((p) => p.id === def.id);
            return found ? { ...def, ...found } : def;
          }).concat(parsed.filter((p: FamilyPatient) => !DEFAULT_FAMILY.some((d) => d.id === p.id)));
        }
      } catch {}
    }
    return DEFAULT_FAMILY;
  });

  // Instagram-like saved session map: each account stays logged in on this browser until manually logged out
  const [memberSessions, setMemberSessions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("member_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default: Ananya, Vikram, Sunita, Aarav are all saved/logged in on this device
    return {
      "usr-default": true,
      "usr-spouse": true,
      "usr-mother": true,
      "usr-child": true,
    };
  });

  const [user, setUser] = useState<AuthUser>(() => {
    const saved = localStorage.getItem("auth_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: "usr-default",
      email: "ananya.sharma@example.com",
      fullName: "Ananya Sharma",
      token: "session-jwt-token-active",
      isLoggedIn: true,
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingLoginMember, setPendingLoginMember] = useState<FamilyPatient | null>(null);

  const activePatient =
    familyPatients.find((p) => p.id === activePatientId) || familyPatients[0];

  useEffect(() => {
    localStorage.setItem("active_user_id", activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem("family_patients", JSON.stringify(familyPatients));
  }, [familyPatients]);

  useEffect(() => {
    localStorage.setItem("member_sessions", JSON.stringify(memberSessions));
  }, [memberSessions]);

  function isMemberLoggedIn(patientId: string): boolean {
    return memberSessions[patientId] !== false;
  }

  function applySwitch(patientId: string) {
    setActivePatientId(patientId);
    localStorage.setItem("active_user_id", patientId);
    const target = familyPatients.find((p) => p.id === patientId);
    if (target) {
      localStorage.setItem(
        "patient_profile",
        JSON.stringify({
          id: target.id,
          fullName: target.fullName,
          relation: target.relation,
          age: target.age,
          gender: target.gender,
          bloodGroup: target.bloodGroup,
          height: target.height || "165 cm",
          weight: target.weight || "58 kg",
          conditions: target.conditions || "",
          allergies: target.allergies || "",
          emergencyContact: target.emergencyContact || "",
          phone: target.phone || "",
          email: target.email || "",
          address: target.address || "Mumbai, Maharashtra",
        })
      );
    }
    window.dispatchEvent(new Event("patient_switched"));
    window.dispatchEvent(new Event("health_data_updated"));
  }

  async function updateActivePatient(data: Partial<FamilyPatient>) {
    setFamilyPatients((prev) => {
      const next = prev.map((p) => (p.id === activePatientId ? { ...p, ...data } : p));
      localStorage.setItem("family_patients", JSON.stringify(next));
      return next;
    });

    const current = familyPatients.find((p) => p.id === activePatientId);
    const merged = { ...(current || {}), ...data, id: activePatientId };
    localStorage.setItem("patient_profile", JSON.stringify(merged));

    try {
      await api.updateProfile(merged as any);
    } catch (e) {
      console.warn("Backend profile update note:", e);
    }

    window.dispatchEvent(new Event("patient_switched"));
    window.dispatchEvent(new Event("health_data_updated"));
  }

  function switchPatient(patientId: string): boolean {
    // If member is not logged in, require credentials
    if (!isMemberLoggedIn(patientId)) {
      const target = familyPatients.find((p) => p.id === patientId);
      if (target) {
        setPendingLoginMember(target);
        setIsAuthModalOpen(true);
      }
      return false;
    }

    applySwitch(patientId);
    return true;
  }

  function loginMember(patientId: string, passOrPin: string): boolean {
    // Save as logged in on this browser
    setMemberSessions((prev) => ({ ...prev, [patientId]: true }));
    setPendingLoginMember(null);
    applySwitch(patientId);
    return true;
  }

  function logoutMember(patientId: string) {
    // Mark specifically as logged out
    setMemberSessions((prev) => ({ ...prev, [patientId]: false }));

    // If logging out the currently active patient, switch to first available logged-in member
    if (patientId === activePatientId) {
      const nextActive = familyPatients.find(
        (p) => p.id !== patientId && memberSessions[p.id] !== false
      );
      if (nextActive) {
        applySwitch(nextActive.id);
      }
    }
    window.dispatchEvent(new Event("patient_switched"));
    window.dispatchEvent(new Event("health_data_updated"));
  }

  async function login(email: string, pass: string): Promise<boolean> {
    const loggedInUser: AuthUser = {
      id: "usr-default",
      email: email || "ananya.sharma@example.com",
      fullName: email.split("@")[0] || "Ananya Sharma",
      token: "jwt-token-" + Date.now(),
      isLoggedIn: true,
    };
    setUser(loggedInUser);
    localStorage.setItem("auth_session", JSON.stringify(loggedInUser));
    return true;
  }

  function logout() {
    logoutMember(activePatientId);
  }

  async function addFamilyMember(member: Omit<FamilyPatient, "id">): Promise<FamilyPatient> {
    const newMember: FamilyPatient = {
      ...member,
      id: "usr-" + Date.now(),
    };
    const updated = [...familyPatients, newMember];
    setFamilyPatients(updated);
    localStorage.setItem("family_patients", JSON.stringify(updated));

    // Mark as logged in immediately upon adding
    setMemberSessions((prev) => ({ ...prev, [newMember.id]: true }));

    // Register in backend DBMS
    try {
      await api.upsertUser({
        id: newMember.id,
        fullName: newMember.fullName,
        age: newMember.age,
        gender: newMember.gender,
        bloodGroup: newMember.bloodGroup,
        conditions: newMember.conditions,
        allergies: newMember.allergies,
      });
    } catch (err) {
      console.warn("Failed to sync new patient to backend DBMS:", err);
    }

    applySwitch(newMember.id);
    return newMember;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        activePatientId,
        familyPatients,
        activePatient,
        memberSessions,
        isAuthModalOpen,
        pendingLoginMember,
        openAuthModal: () => {
          setPendingLoginMember(null);
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => {
          setPendingLoginMember(null);
          setIsAuthModalOpen(false);
        },
        login,
        logout,
        switchPatient,
        logoutMember,
        loginMember,
        addFamilyMember,
        updateActivePatient,
        isMemberLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
