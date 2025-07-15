/**
 * Enhanced Score Logic - AI-Powered LinkedIn Profile Scoring
 * Combines rule-based scoring with Google Gemini 2.5 Flash AI analysis
 */

/**
 * Enhanced Score Code for n8n Workflow
 * Processes Gemini AI results and merges with traditional scoring
 */
function enhancedScoreLogic() {
    // Get LLM results and original profile data
    const geminiResponse = $('Google Gemini').first().json;
    const originalData = $('Preliminary Score Code').first().json;

    // Parse Gemini response with robust error handling
    let llmAnalysis = {};
    try {
        const responseText = geminiResponse.message || geminiResponse.text || geminiResponse.response;
        
        // Clean up response format (remove markdown code blocks)
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        
        llmAnalysis = JSON.parse(cleanedResponse);
        
        // Validate structure
        if (!llmAnalysis.education_analysis || !llmAnalysis.industry_analysis || !llmAnalysis.skills_analysis) {
            throw new Error('Invalid AI response structure');
        }
        
    } catch (error) {
        console.log('Gemini parsing failed, using fallback analysis:', error.message);
        llmAnalysis = null;
    }

    /**
     * Enhanced education extraction with AI integration
     * @param {string} originalLevel - Rule-based education classification
     * @param {Object} llmResult - AI analysis result
     * @returns {string} Final education level
     */
    function getEnhancedEducation(originalLevel, llmResult) {
        if (llmResult && 
            llmResult.education_analysis && 
            llmResult.education_analysis.confidence !== 'low') {
            
            const aiLevel = llmResult.education_analysis.education_level;
            
            // Validation: AI result must be valid option
            const validLevels = ['phd', 'master', 'bachelor', 'high_school'];
            if (validLevels.includes(aiLevel)) {
                return aiLevel;
            }
        }
        return originalLevel;
    }

    /**
     * Enhanced industry classification with AI context understanding
     * @param {string} originalIndustry - Rule-based industry classification
     * @param {Object} llmResult - AI analysis result
     * @returns {string} Final industry classification
     */
    function getEnhancedIndustry(originalIndustry, llmResult) {
        if (llmResult && 
            llmResult.industry_analysis && 
            llmResult.industry_analysis.confidence !== 'low') {
            
            const aiIndustry = llmResult.industry_analysis.industry;
            
            // Validation: AI result must be valid option
            const validIndustries = ['technology', 'finance', 'healthcare', 'other'];
            if (validIndustries.includes(aiIndustry)) {
                return aiIndustry;
            }
        }
        return originalIndustry;
    }

    /**
     * Enhanced skills extraction with AI natural language understanding
     * @param {Array} originalSkills - Rule-based skills extraction
     * @param {Object} llmResult - AI analysis result
     * @returns {Array} Final skills array
     */
    function getEnhancedSkills(originalSkills, llmResult) {
        if (llmResult && 
            llmResult.skills_analysis && 
            llmResult.skills_analysis.confidence !== 'low' &&
            Array.isArray(llmResult.skills_analysis.skills)) {
            
            const aiSkills = llmResult.skills_analysis.skills;
            
            // Combine AI skills with original skills, removing duplicates
            const combinedSkills = [...new Set([...aiSkills, ...originalSkills])];
            
            // Limit to top 10 skills
            return combinedSkills.slice(0, 10);
        }
        return originalSkills;
    }

    // Apply AI enhancements
    const enhancedEducation = getEnhancedEducation(originalData.education_level, llmAnalysis);
    const enhancedIndustry = getEnhancedIndustry(originalData.industry, llmAnalysis);
    const enhancedSkills = getEnhancedSkills(originalData.skills, llmAnalysis);

    /**
     * Calculate education score based on enhanced classification
     * @param {string} level - Education level
     * @returns {number} Education score (0-30)
     */
    function calculateEducationScore(level) {
        const scoreMap = {
            'phd': 30,           // PhD/Doctorate: Maximum points
            'master': 25,        // Master's/MBA: High points
            'bachelor': 15,      // Bachelor's: Medium points
            'high_school': 5     // High School: Minimum points
        };
        return scoreMap[level] || 0;
    }

    /**
     * Calculate industry score based on relevance
     * @param {string} industry - Industry classification
     * @returns {number} Industry score (0-30)
     */
    function calculateIndustryScore(industry) {
        const scoreMap = {
            'technology': 30,    // Technology: Highest relevance
            'finance': 25,       // Finance: High relevance
            'healthcare': 20,    // Healthcare: Medium relevance
            'other': 10          // Other: Lower relevance
        };
        return scoreMap[industry] || 0;
    }

    /**
     * Calculate qualification level based on total score
     * @param {number} score - Total score (0-100)
     * @returns {string} Qualification level
     */
    function getQualificationLevel(score) {
        if (score >= 80) return 'excellent';      // 80-100: Top tier
        if (score >= 60) return 'good';           // 60-79: Strong candidate
        if (score >= 40) return 'average';        // 40-59: Average candidate
        if (score >= 20) return 'poor';           // 20-39: Below average
        return 'unqualified';                     // 0-19: Not qualified
    }

    // Recalculate scores with enhanced data
    const enhancedEducationScore = calculateEducationScore(enhancedEducation);
    const enhancedIndustryScore = calculateIndustryScore(enhancedIndustry);
    const enhancedTotalScore = originalData.experience_score + enhancedEducationScore + enhancedIndustryScore;
    const enhancedQualificationLevel = getQualificationLevel(enhancedTotalScore);

    /**
     * Generate analysis summary for transparency
     * @returns {Object} Analysis summary
     */
    function generateAnalysisSummary() {
        return {
            ai_used: llmAnalysis !== null,
            education_enhanced: enhancedEducation !== originalData.education_level,
            industry_enhanced: enhancedIndustry !== originalData.industry,
            skills_enhanced: enhancedSkills.length !== originalData.skills.length,
            score_improvement: enhancedTotalScore - (originalData.experience_score + calculateEducationScore(originalData.education_level) + calculateIndustryScore(originalData.industry)),
            confidence_levels: llmAnalysis ? {
                education: llmAnalysis.education_analysis?.confidence,
                industry: llmAnalysis.industry_analysis?.confidence,
                skills: llmAnalysis.skills_analysis?.confidence
            } : null
        };
    }

    // Return enhanced results with comprehensive data
    return [
        {
            json: {
                // Basic profile information
                linkedin_url: originalData.linkedin_url,
                full_name: originalData.full_name,
                current_position: originalData.current_position,
                current_company: originalData.current_company,
                location: originalData.location,
                summary: originalData.summary,
                
                // Enhanced metrics
                total_experience_years: originalData.total_experience_years,
                education_level: enhancedEducation,
                industry: enhancedIndustry,
                skills: enhancedSkills,
                
                // Updated scoring
                experience_score: originalData.experience_score,
                education_score: enhancedEducationScore,
                industry_score: enhancedIndustryScore,
                total_score: enhancedTotalScore,
                qualification_level: enhancedQualificationLevel,
                
                // AI analysis transparency
                llm_education_reasoning: llmAnalysis?.education_analysis?.reasoning || 'Fallback rule-based analysis used',
                llm_industry_reasoning: llmAnalysis?.industry_analysis?.reasoning || 'Fallback rule-based analysis used',
                llm_skills_reasoning: llmAnalysis?.skills_analysis?.reasoning || 'Fallback rule-based analysis used',
                llm_education_confidence: llmAnalysis?.education_analysis?.confidence || 'unknown',
                llm_industry_confidence: llmAnalysis?.industry_analysis?.confidence || 'unknown',
                llm_skills_confidence: llmAnalysis?.skills_analysis?.confidence || 'unknown',
                llm_analysis_status: llmAnalysis ? 'success' : 'fallback',
                
                // Complete AI response for debugging
                llm_analysis: llmAnalysis,
                
                // Analysis summary
                analysis_summary: generateAnalysisSummary(),
                
                // Metadata
                processed_at: new Date().toISOString(),
                processing_version: '2.0_ai_enhanced'
            }
        }
    ];
}

/**
 * Fallback scoring logic when AI analysis fails
 * @param {Object} profileData - Original profile data
 * @returns {Object} Basic scoring results
 */
function fallbackScoring(profileData) {
    // Implement enhanced rule-based scoring as fallback
    const education_scores = {
        'phd': 30,
        'master': 25, 
        'bachelor': 15,
        'high_school': 5
    };
    
    const industry_scores = {
        'technology': 30,
        'finance': 25,
        'healthcare': 20,
        'other': 10
    };
    
    // Enhanced education detection
    function detectEducation(education_array) {
        if (!education_array || education_array.length === 0) return 'high_school';
        
        // Check for prestigious universities
        const prestigiousUniversities = [
            'harvard', 'stanford', 'mit', 'cambridge', 'oxford', 'yale', 
            'princeton', 'berkeley', 'caltech', 'columbia', 'chicago'
        ];
        
        for (const edu of education_array) {
            const school = (edu.school || '').toLowerCase();
            const degree = (edu.degree_name || edu.degree || '').toLowerCase();
            
            // Check degree names first
            if (degree.includes('phd') || degree.includes('doctorate')) return 'phd';
            if (degree.includes('master') || degree.includes('mba')) return 'master';
            if (degree.includes('bachelor')) return 'bachelor';
            
            // Check prestigious universities (likely bachelor's even without degree info)
            if (prestigiousUniversities.some(uni => school.includes(uni))) {
                return 'bachelor';
            }
        }
        
        return 'high_school';
    }
    
    const education_level = detectEducation(profileData.education);
    const education_score = education_scores[education_level] || 0;
    
    return {
        education_level,
        education_score,
        analysis_method: 'rule_based_fallback'
    };
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enhancedScoreLogic, fallbackScoring };
} else if (typeof window !== 'undefined') {
    window.EnhancedScoring = { enhancedScoreLogic, fallbackScoring };
}