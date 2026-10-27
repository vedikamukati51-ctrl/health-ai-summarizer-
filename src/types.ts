export interface DashboardData {
  summary: string;
  keyFindings: string[];
  attentionNeeded: string[];
}

export interface Report {
  id: string;
  fileName: string;
  reportDate: string;
  createdAt?: string;
  fileSize?: number;
}

export interface Parameter {
  name: string;
  value: string | number;
  unit?: string;
  status?: string;
}

export interface ReportDetailData extends Report {
  extractedText?: string;
  parameters: Parameter[];
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface CompareRow {
  param: string;
  before: string | number;
  latest: string | number;
  diff?: string | number;
  status?: string;
}

export interface CompareData {
  before?: Report;
  latest?: Report;
  rows: CompareRow[];
  explanation?: string;
}

export interface DietaryAdvice {
  foodsToEat: string[];
  foodsToAvoid?: string[];
  absorptionTip?: string;
  keyNutrients?: string[];
}

export interface AnomalyGlossaryItem {
  id: string;
  paramName: string;
  patientValue: string | number;
  unit?: string;
  status: "LOW" | "HIGH" | "BORDERLINE" | "ATTENTION" | "NORMAL";
  standardRange: string;
  explanation: string;
  clinicalImpact?: string;
  dietaryAdvice: DietaryAdvice;
  doctorTip?: string;
  reportName?: string;
}

export interface GlossaryData {
  definition: string;
  whyItMatters?: string;
  standardRange?: string;
  dietaryAdvice?: DietaryAdvice;
  status?: string;
  doctorTip?: string;
}

export interface PrepQuestion { question: string; reason?: string; }
export interface Specialist { name: string; specialty: string; distance: string; address: string; }

export interface PatientProfile {
  id?: string;
  relation?: string;
  fullName: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  height?: string;
  weight?: string;
  allergies?: string;
  conditions?: string;
  emergencyContact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

