-- LinkedIn Profile Scorer Database Schema
-- PostgreSQL Database for storing profile analysis results

-- Create the main profiles table
CREATE TABLE IF NOT EXISTS profiles (
    -- Primary identifiers
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    linkedin_url VARCHAR(500) UNIQUE NOT NULL,
    
    -- Basic profile information
    full_name VARCHAR(200),
    current_position TEXT,
    current_company VARCHAR(200),
    location VARCHAR(200),
    summary TEXT,
    
    -- Extracted metrics
    total_experience_years INTEGER,
    education_level VARCHAR(50) CHECK (education_level IN ('phd', 'master', 'bachelor', 'high_school')),
    industry VARCHAR(50) CHECK (industry IN ('technology', 'finance', 'healthcare', 'other')),
    skills JSONB,
    
    -- Calculated scores
    experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 40),
    education_score INTEGER CHECK (education_score >= 0 AND education_score <= 30),
    industry_score INTEGER CHECK (industry_score >= 0 AND industry_score <= 30),
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    qualification_level VARCHAR(50) CHECK (qualification_level IN ('excellent', 'good', 'average', 'poor', 'unqualified')),
    
    -- AI analysis results (new fields)
    llm_education_reasoning TEXT,
    llm_industry_reasoning TEXT,
    llm_skills_reasoning TEXT,
    llm_education_confidence VARCHAR(10) CHECK (llm_education_confidence IN ('high', 'medium', 'low')),
    llm_industry_confidence VARCHAR(10) CHECK (llm_industry_confidence IN ('high', 'medium', 'low')),
    llm_skills_confidence VARCHAR(10) CHECK (llm_skills_confidence IN ('high', 'medium', 'low')),
    llm_analysis_status VARCHAR(20) CHECK (llm_analysis_status IN ('success', 'failed', 'fallback')),
    llm_analysis JSONB,
    
    -- Metadata
    processing_status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_url ON profiles(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON profiles(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_qualification_level ON profiles(qualification_level);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for summary statistics
CREATE OR REPLACE VIEW profile_statistics AS
SELECT 
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE qualification_level = 'excellent') as excellent_count,
    COUNT(*) FILTER (WHERE qualification_level = 'good') as good_count,
    COUNT(*) FILTER (WHERE qualification_level = 'average') as average_count,
    COUNT(*) FILTER (WHERE qualification_level = 'poor') as poor_count,
    COUNT(*) FILTER (WHERE qualification_level = 'unqualified') as unqualified_count,
    ROUND(AVG(total_score), 2) as average_score,
    COUNT(DISTINCT industry) as unique_industries,
    COUNT(*) FILTER (WHERE llm_analysis_status = 'success') as ai_success_count,
    ROUND(
        (COUNT(*) FILTER (WHERE llm_analysis_status = 'success')::float / COUNT(*)) * 100, 
        2
    ) as ai_success_rate
FROM profiles;

-- Create view for recent activity
CREATE OR REPLACE VIEW recent_profiles AS
SELECT 
    full_name,
    current_company,
    industry,
    total_score,
    qualification_level,
    llm_analysis_status,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 50;

-- Insert sample data for testing (optional)
-- Uncomment the following if you want test data

/*
INSERT INTO profiles (
    linkedin_url, full_name, current_position, current_company, location,
    total_experience_years, education_level, industry,
    skills, experience_score, education_score, industry_score, total_score,
    qualification_level, llm_analysis_status
) VALUES 
(
    'https://www.linkedin.com/in/sample-profile-1/',
    'John Doe',
    'Senior Software Engineer',
    'Tech Corp',
    'San Francisco, CA',
    8, 'bachelor', 'technology',
    '["JavaScript", "Python", "Leadership", "AI"]'::jsonb,
    35, 15, 30, 80,
    'excellent', 'success'
),
(
    'https://www.linkedin.com/in/sample-profile-2/',
    'Jane Smith', 
    'Financial Analyst',
    'Investment Bank',
    'New York, NY',
    5, 'master', 'finance',
    '["Finance", "Analytics", "Excel", "Risk Management"]'::jsonb,
    20, 25, 25, 70,
    'good', 'success'
)
ON CONFLICT (linkedin_url) DO NOTHING;
*/

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON profiles TO linkedin_user;
-- GRANT SELECT ON profile_statistics TO linkedin_user;
-- GRANT SELECT ON recent_profiles TO linkedin_user;