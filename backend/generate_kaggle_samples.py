import os
from fpdf import FPDF

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "sample_reports")
os.makedirs(OUT_DIR, exist_ok=True)

class ClinicalLabReport(FPDF):
    def header(self):
        self.set_fill_color(240, 244, 248)
        self.rect(0, 0, 210, 32, "F")
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(180, 35, 24)
        self.cell(0, 10, self.lab_title, ln=True, align="C")
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 110, 120)
        self.cell(0, 5, "Accredited Medical Diagnostics & Pathology Laboratory · ISO 15189 Certified", ln=True, align="C")
        self.ln(10)

    def footer(self):
        self.set_y(-18)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, "Confidential Medical Diagnostic Record · Verified by Senior Pathologist", align="C")

def create_report(filename, lab_title, patient_name, test_date, panel_name, rows, notes):
    pdf = ClinicalLabReport()
    pdf.lab_title = lab_title
    pdf.add_page()
    
    # Patient Meta Box
    pdf.set_fill_color(248, 249, 250)
    pdf.set_draw_color(220, 225, 230)
    pdf.rect(10, 36, 190, 24, "FD")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(30, 40, 50)
    pdf.set_xy(14, 40)
    pdf.cell(90, 6, f"Patient Name: {patient_name}")
    pdf.cell(90, 6, f"Collection Date: {test_date}", ln=True)
    pdf.set_xy(14, 47)
    pdf.cell(90, 6, "Age / Gender: 29 Yrs / Female")
    pdf.cell(90, 6, "Referred By: Dr. S. K. Gupta, MD", ln=True)
    
    pdf.ln(10)
    
    # Panel Title
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(180, 35, 24)
    pdf.cell(0, 8, panel_name, ln=True)
    
    # Table Header
    pdf.set_fill_color(230, 235, 242)
    pdf.set_text_color(30, 40, 50)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(70, 7, "Investigation / Parameter", border=1, fill=True)
    pdf.cell(35, 7, "Observed Value", border=1, fill=True, align="C")
    pdf.cell(30, 7, "Units", border=1, fill=True, align="C")
    pdf.cell(35, 7, "Reference Range", border=1, fill=True, align="C")
    pdf.cell(20, 7, "Flag", border=1, fill=True, align="C", ln=True)
    
    # Table Rows
    pdf.set_font("Helvetica", "", 9)
    for row in rows:
        name, val, unit, ref, flag = row
        is_abnormal = flag in ["LOW", "HIGH", "ATTENTION", "BORDERLINE"]
        
        if is_abnormal:
            pdf.set_text_color(180, 35, 24)
            pdf.set_font("Helvetica", "B", 9)
        else:
            pdf.set_text_color(40, 50, 60)
            pdf.set_font("Helvetica", "", 9)
            
        pdf.cell(70, 7, f" {name}", border=1)
        pdf.cell(35, 7, str(val), border=1, align="C")
        pdf.cell(30, 7, unit, border=1, align="C")
        pdf.cell(35, 7, ref, border=1, align="C")
        
        if is_abnormal:
            pdf.set_fill_color(254, 228, 226)
            pdf.cell(20, 7, flag, border=1, align="C", fill=True, ln=True)
        else:
            pdf.cell(20, 7, flag, border=1, align="C", ln=True)
            
    pdf.ln(8)
    
    # Clinical Pathologist Notes Box
    pdf.set_fill_color(255, 250, 240)
    pdf.set_draw_color(240, 210, 160)
    pdf.rect(10, pdf.get_y(), 190, 22, "FD")
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(140, 70, 0)
    pdf.set_xy(14, pdf.get_y() + 3)
    pdf.cell(0, 5, "Clinical Pathologist Comments:", ln=True)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(80, 50, 20)
    pdf.set_x(14)
    pdf.multi_cell(182, 4, notes)
    
    out_path = os.path.join(OUT_DIR, filename)
    pdf.output(out_path)
    print(f"Generated: {out_path}")

# 1. CBC & Anemia Panel
create_report(
    "Kaggle_Sample1_CBC_Anemia_Panel.pdf",
    "Metropolis Clinical Diagnostics Lab",
    "Ananya Sharma",
    "2026-09-20",
    "COMPLETE BLOOD COUNT (CBC) & HEMATOLOGY PROFILE",
    [
        ("Hemoglobin", 9.4, "g/dL", "12.0 - 15.5", "LOW"),
        ("WBC Count", "5,200", "/µL", "4,500 - 11,000", "NORMAL"),
        ("Platelet Count", "135,000", "/µL", "150,000 - 450,000", "LOW"),
        ("Serum Creatinine", 0.9, "mg/dL", "0.6 - 1.1", "NORMAL"),
        ("Fasting Blood Glucose", 92, "mg/dL", "70 - 99", "NORMAL")
    ],
    "Sample demonstrates microcytic hypochromic picture with low hemoglobin (9.4 g/dL) and borderline low platelets. Advise serum ferritin, iron saturation index, and clinical correlation for iron-deficiency anemia management."
)

# 2. Renal Metabolic Panel
create_report(
    "Kaggle_Sample2_Renal_Metabolic_Report.pdf",
    "Quest Diagnostic Pathology Services",
    "Ananya Sharma",
    "2026-09-21",
    "RENAL FUNCTION & ELECTROLYTE EVALUATION PANEL",
    [
        ("Serum Creatinine", 1.52, "mg/dL", "0.6 - 1.2", "ATTENTION"),
        ("Fasting Blood Glucose", 98, "mg/dL", "70 - 99", "NORMAL"),
        ("Hemoglobin", 12.8, "g/dL", "12.0 - 15.5", "NORMAL"),
        ("WBC Count", "6,900", "/µL", "4,500 - 11,000", "NORMAL"),
        ("Platelet Count", "240,000", "/µL", "150,000 - 450,000", "NORMAL")
    ],
    "Serum creatinine elevated at 1.52 mg/dL. Findings suggest increased renal filtration resistance. Ensure adequate oral hydration and discuss repeat creatinine with eGFR evaluation."
)

# 3. Diabetic & Metabolic Panel
create_report(
    "Kaggle_Sample3_Diabetic_Metabolic_Panel.pdf",
    "Apollo Health Diagnostic Network",
    "Ananya Sharma",
    "2026-09-22",
    "DIABETES & METABOLIC BIOCHEMICAL PANEL",
    [
        ("Fasting Blood Glucose", 138, "mg/dL", "70 - 99", "HIGH"),
        ("Serum Creatinine", 0.95, "mg/dL", "0.6 - 1.1", "NORMAL"),
        ("Hemoglobin", 13.2, "g/dL", "12.0 - 15.5", "NORMAL"),
        ("Vitamin D3", 16.5, "ng/mL", "30 - 100", "LOW"),
        ("WBC Count", "7,500", "/µL", "4,500 - 11,000", "NORMAL")
    ],
    "Elevated fasting glucose (138 mg/dL) consistent with hyperglycemia. Severe hypovitaminosis D3 noted (16.5 ng/mL). HbA1c test and dietary carbohydrate management indicated."
)

# 4. Lipid & Cardiovascular Panel
create_report(
    "Kaggle_Sample4_Lipid_Cardiovascular_Panel.pdf",
    "SRL Comprehensive Health Laboratory",
    "Ananya Sharma",
    "2026-09-23",
    "LIPID PROFILE & CARDIOVASCULAR RISK PANEL",
    [
        ("LDL Cholesterol", 165, "mg/dL", "< 100", "HIGH"),
        ("Serum Creatinine", 1.0, "mg/dL", "0.6 - 1.1", "NORMAL"),
        ("Fasting Blood Glucose", 90, "mg/dL", "70 - 99", "NORMAL"),
        ("Hemoglobin", 14.1, "g/dL", "12.0 - 15.5", "NORMAL"),
        ("Platelet Count", "215,000", "/µL", "150,000 - 450,000", "NORMAL")
    ],
    "Elevated LDL cholesterol at 165 mg/dL elevates atherogenic risk. Dietary soluble fiber, lifestyle intervention, and cardiovascular follow-up recommended."
)
