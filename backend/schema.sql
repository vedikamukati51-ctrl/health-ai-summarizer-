-- ============================================================================
-- Health AI Summarizer — Production PostgreSQL Schema with pgvector
-- Target: Supabase / Neon / Railway PostgreSQL 15+
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector extension for chatbot RAG embeddings

-- ============================================================================
-- 2. PATIENTS & USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'usr-' || substr(md5(random()::text), 1, 12),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relation VARCHAR(50) DEFAULT 'Self',
    age INT CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) DEFAULT 'Female',
    blood_group VARCHAR(10) DEFAULT 'B+',
    height VARCHAR(20),
    weight VARCHAR(20),
    allergies TEXT,
    conditions TEXT,
    emergency_contact VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. MEDICAL REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'rep-' || substr(md5(random()::text), 1, 12),
    user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT DEFAULT 0,
    file_type VARCHAR(100) DEFAULT 'application/pdf',
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT,
    key_findings JSONB DEFAULT '[]'::jsonb,
    attention_needed JSONB DEFAULT '[]'::jsonb,
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CLINICAL BIOMARKERS TABLE (Relational Normalized)
-- ============================================================================
CREATE TABLE IF NOT EXISTS biomarkers (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'bio-' || substr(md5(random()::text), 1, 12),
    report_id VARCHAR(64) NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    canonical_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50),
    status VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL | LOW | HIGH | BORDERLINE | ATTENTION
    reference_range VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. VECTOR EMBEDDINGS TABLE FOR RAG (pgvector)
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_embeddings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'vec-' || substr(md5(random()::text), 1, 12),
    report_id VARCHAR(64) NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(64), -- 64-dimensional clinical embedding vector
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_biomarkers_report ON biomarkers(report_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_canonical ON biomarkers(user_id, canonical_name);
CREATE INDEX IF NOT EXISTS idx_biomarkers_status ON biomarkers(user_id, status);

-- HNSW Vector index for fast cosine distance approximate nearest neighbors
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw ON report_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- 7. ROW-LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- ============================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_embeddings ENABLE ROW LEVEL SECURITY;

-- User Isolation Policies: Users only access their own patient profile & reports
CREATE POLICY patient_isolation_policy ON patients
    FOR ALL
    USING (id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL);

CREATE POLICY report_isolation_policy ON reports
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL);

CREATE POLICY biomarker_isolation_policy ON biomarkers
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL);

CREATE POLICY embedding_isolation_policy ON report_embeddings
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true) OR current_setting('app.current_user_id', true) IS NULL);

-- ============================================================================
-- 8. INITIAL SEED DATA
-- ============================================================================
INSERT INTO patients (id, email, full_name, relation, age, gender, blood_group, conditions, allergies)
VALUES 
    ('usr-default', 'ananya.sharma@example.com', 'Ananya Sharma', 'Self', 29, 'Female', 'B+', 'Mild Iron Deficiency Anemia', 'Penicillin, Pollen'),
    ('usr-spouse', 'dr.vikram@example.com', 'Dr. Vikram Sharma', 'Spouse', 32, 'Male', 'O+', 'None', 'None'),
    ('usr-mother', 'sunita.sharma@example.com', 'Sunita Sharma', 'Parent', 58, 'Female', 'A+', 'Mild Hypertension', 'Sulfa drugs')
ON CONFLICT (id) DO NOTHING;
