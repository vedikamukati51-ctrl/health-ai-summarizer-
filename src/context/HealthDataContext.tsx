import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
import type { DashboardData, Report, AnomalyGlossaryItem } from "../types";

export interface TrendAnomalyItem {
  key: string;
  name: string;
  label: string;
  unit?: string;
  status?: string;
  value?: number;
}

interface HealthDataContextType {
  reports: Report[];
  dashboard: DashboardData;
  anomalies: AnomalyGlossaryItem[];
  trendAnomalies: TrendAnomalyItem[];
  hasReports: boolean;
  loading: boolean;
  activePatientName: string;
  refreshHealthData: () => Promise<void>;
  clearAllReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

const EMPTY_DASHBOARD: DashboardData = {
  summary: "No medical reports uploaded yet. Upload your first blood report to analyze your medical records.",
  keyFindings: [],
  attentionNeeded: [],
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const { activePatientId, activePatient } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [anomalies, setAnomalies] = useState<AnomalyGlossaryItem[]>([]);
  const [trendAnomalies, setTrendAnomalies] = useState<TrendAnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const activePatientName = activePatient?.fullName || "Patient";

  const refreshHealthData = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch for active patient
      const [reportsData, dashboardData, anomaliesData, trendsParamData] = await Promise.all([
        api.getReports(),
        api.getDashboard(),
        api.getReportAnomalies(),
        api.getTrendParameters(),
      ]);

      const repList = Array.isArray(reportsData) ? reportsData : [];
      setReports(repList);

      if (repList.length === 0) {
        setDashboard({
          summary: `No medical reports uploaded yet for ${activePatientName}. Upload a blood report or health scan to generate an AI summary.`,
          keyFindings: [],
          attentionNeeded: [],
        });
        setAnomalies([]);
        setTrendAnomalies([]);
      } else {
        setDashboard(dashboardData || EMPTY_DASHBOARD);
        setAnomalies(Array.isArray(anomaliesData) ? anomaliesData : []);
        setTrendAnomalies(trendsParamData?.anomalies || []);
      }
    } catch (err) {
      console.warn("Health data refresh notice:", err);
    } finally {
      setLoading(false);
    }
  }, [activePatientId, activePatientName]);

  // Load whenever active patient changes
  useEffect(() => {
    refreshHealthData();
  }, [refreshHealthData]);

  // Listen for cross-component updates
  useEffect(() => {
    function handleUpdate() {
      refreshHealthData();
    }
    window.addEventListener("health_data_updated", handleUpdate);
    window.addEventListener("patient_switched", handleUpdate);
    return () => {
      window.removeEventListener("health_data_updated", handleUpdate);
      window.removeEventListener("patient_switched", handleUpdate);
    };
  }, [refreshHealthData]);

  async function clearAllReports() {
    try {
      await api.clearAllReports();
      setReports([]);
      setDashboard({
        summary: `All reports have been removed for ${activePatientName}. Upload a new blood report or health scan to analyze clinical data.`,
        keyFindings: [],
        attentionNeeded: [],
      });
      setAnomalies([]);
      setTrendAnomalies([]);
      window.dispatchEvent(new Event("health_data_updated"));
    } catch (err) {
      console.error("Failed to clear reports:", err);
      throw err;
    }
  }

  async function deleteReport(id: string) {
    try {
      await api.deleteReport(id);
      await refreshHealthData();
      window.dispatchEvent(new Event("health_data_updated"));
    } catch (err) {
      console.error("Failed to delete report:", err);
      throw err;
    }
  }

  const hasReports = reports.length > 0;

  return (
    <HealthDataContext.Provider
      value={{
        reports,
        dashboard,
        anomalies,
        trendAnomalies,
        hasReports,
        loading,
        activePatientName,
        refreshHealthData,
        clearAllReports,
        deleteReport,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error("useHealthData must be used within a HealthDataProvider");
  }
  return context;
}
