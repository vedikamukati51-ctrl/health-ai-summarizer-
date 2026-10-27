import React, { createContext, useContext, useEffect, useState } from "react";
import type { PatientProfile } from "../types";
import { api } from "../services/api";

const DEFAULT_PROFILE: PatientProfile = {
  fullName: "Ananya Sharma",
  age: 29,
  gender: "Female",
  bloodGroup: "B+",
  height: "165 cm",
  weight: "58 kg",
  allergies: "Penicillin, Pollen",
  conditions: "Mild Iron Deficiency Anemia",
  emergencyContact: "+91 98765 43210 (Dr. Sharma - Spouse)",
  address: "Mumbai, Maharashtra"
};

interface ProfileContextType {
  profile: PatientProfile;
  loading: boolean;
  isCustomized: boolean;
  updateProfile: (data: PatientProfile) => Promise<PatientProfile>;
  resetProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  loading: false,
  isCustomized: false,
  updateProfile: async (data) => data,
  resetProfile: async () => {},
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem("patient_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_PROFILE;
  });

  const [loading, setLoading] = useState(false);

  const isCustomized =
    profile.fullName !== DEFAULT_PROFILE.fullName ||
    profile.bloodGroup !== DEFAULT_PROFILE.bloodGroup ||
    profile.age !== DEFAULT_PROFILE.age;

  async function loadProfile() {
    try {
      setLoading(true);
      const remote = await api.getProfile();
      if (remote && remote.fullName) {
        setProfile(remote);
        localStorage.setItem("patient_profile", JSON.stringify(remote));
      }
    } catch {
      // Keep existing cached profile
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();

    function handleSwitch() {
      const saved = localStorage.getItem("patient_profile");
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch {}
      }
      loadProfile();
    }

    window.addEventListener("patient_switched", handleSwitch);
    return () => window.removeEventListener("patient_switched", handleSwitch);
  }, []);

  async function update(data: PatientProfile): Promise<PatientProfile> {
    setProfile(data);
    localStorage.setItem("patient_profile", JSON.stringify(data));

    // Also update in family_patients for active user
    try {
      const activeId = localStorage.getItem("active_user_id") || "usr-default";
      const familyRaw = localStorage.getItem("family_patients");
      if (familyRaw) {
        const familyList = JSON.parse(familyRaw);
        if (Array.isArray(familyList)) {
          const nextFamily = familyList.map((m: any) =>
            m.id === activeId ? { ...m, ...data } : m
          );
          localStorage.setItem("family_patients", JSON.stringify(nextFamily));
        }
      }
    } catch {}

    try {
      const saved = await api.updateProfile(data);
      if (saved) setProfile(saved);
      window.dispatchEvent(new Event("patient_switched"));
      return saved || data;
    } catch {
      window.dispatchEvent(new Event("patient_switched"));
      return data;
    }
  }

  async function reset(): Promise<void> {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem("patient_profile");
    try {
      await api.updateProfile(DEFAULT_PROFILE);
    } catch {}
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        isCustomized,
        updateProfile: update,
        resetProfile: reset,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
