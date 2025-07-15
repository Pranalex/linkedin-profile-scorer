/**
 * Google Gemini 2.5 Flash Prompts for LinkedIn Profile Analysis
 * Optimized prompts for education, industry, and skills classification
 */

/**
 * Main analysis prompt for comprehensive profile evaluation
 * @param {Object} profileData - LinkedIn profile data from Apify
 * @returns {string} Formatted prompt for Gemini 2.5 Flash
 */
function createLLMPrompt(profileData) {
    return `Analyze this LinkedIn profile data and provide structured analysis in JSON format:

PROFILE DATA:
- Name: ${profileData.basic_info?.fullname || 'Not provided'}
- Education: ${JSON.stringify(profileData.education || [])}
- Experience: ${JSON.stringify(profileData.experience?.slice(0, 3) || [])}
- Current Company: ${profileData.basic_info?.current_company || 'Not provided'}
- Headline: ${profileData.basic_info?.headline || 'Not provided'}
- About: ${profileData.basic_info?.about?.substring(0, 500) || 'Not provided'}
- Creator Hashtags: ${JSON.stringify(profileData.basic_info?.creator_hashtags || [])}

ANALYSIS REQUIRED:
1. Education Level Classification
2. Industry Classification  
3. Skills Extraction

RESPONSE FORMAT (JSON ONLY):
{
  "education_analysis": {
    "education_level": "bachelor|master|phd|high_school",
    "confidence": "high|medium|low",
    "reasoning": "Brief explanation"
  },
  "industry_analysis": {
    "industry": "technology|finance|healthcare|other",
    "confidence": "high|medium|low", 
    "reasoning": "Brief explanation"
  },
  "skills_analysis": {
    "skills": ["skill1", "skill2", "skill3"],
    "confidence": "high|medium|low",
    "reasoning": "Brief explanation"
  }
}

CLASSIFICATION RULES:
- Education: PhD/Doctorate=phd, Master's/MBA=master, Bachelor's/University=bachelor, High School/None=high_school
- Industry: Technology companies/roles=technology, Finance/Banking/Consulting=finance, Healthcare/Medical=healthcare, Others=other
- Skills: Extract 5-8 most relevant professional skills from all provided data

Respond with JSON only, no additional text.`;
}

/**
 * Education-focused prompt for detailed degree analysis
 * @param {Object} educationData - Education array from profile
 * @returns {string} Education analysis prompt
 */
function createEducationPrompt(educationData) {
    return `Analyze these education records and determine the highest education level:

EDUCATION DATA:
${JSON.stringify(educationData, null, 2)}

CLASSIFICATION RULES:
- PhD/Doctorate/Ph.D = "phd"
- Master's/MBA/M.S./M.A./Graduate degree = "master"  
- Bachelor's/B.S./B.A./Undergraduate/University attendance = "bachelor"
- High School/No degree information = "high_school"

IMPORTANT CONSIDERATIONS:
- University attendance without stated degree = "bachelor" (unless clearly high school)
- Professional certifications alone = maintain previous level
- Incomplete degrees = level of program attempted
- International equivalents count at appropriate levels

Respond with JSON:
{
  "education_level": "phd|master|bachelor|high_school",
  "confidence": "high|medium|low",
  "reasoning": "Detailed explanation of classification decision"
}`;
}

/**
 * Industry classification prompt with company/role context
 * @param {Object} profileData - Profile data with experience and headline
 * @returns {string} Industry analysis prompt
 */
function createIndustryPrompt(profileData) {
    const currentExp = profileData.experience?.find(exp => exp.is_current);
    
    return `Classify the primary industry for this professional profile:

CURRENT ROLE:
- Company: ${currentExp?.company || 'Not specified'}
- Title: ${currentExp?.title || profileData.basic_info?.headline || 'Not specified'}
- Description: ${currentExp?.description?.substring(0, 200) || 'Not provided'}

PROFILE CONTEXT:
- Headline: ${profileData.basic_info?.headline || 'Not provided'}
- About: ${profileData.basic_info?.about?.substring(0, 300) || 'Not provided'}
- Creator Hashtags: ${JSON.stringify(profileData.basic_info?.creator_hashtags || [])}

CLASSIFICATION OPTIONS:
- "technology": Software, IT, tech companies, engineering, AI/ML, startups
- "finance": Banking, investment, consulting, financial services, accounting
- "healthcare": Medical, pharmaceutical, biotech, health services, research
- "other": Education, retail, manufacturing, government, non-profit, etc.

ANALYSIS CRITERIA:
1. Current company industry
2. Job role and responsibilities  
3. Career progression and focus
4. Professional interests and activities

Respond with JSON:
{
  "industry": "technology|finance|healthcare|other",
  "confidence": "high|medium|low",
  "reasoning": "Explanation of industry classification with specific evidence"
}`;
}

/**
 * Skills extraction prompt focusing on professional competencies
 * @param {Object} profileData - Complete profile data
 * @returns {string} Skills analysis prompt
 */
function createSkillsPrompt(profileData) {
    const allExperience = profileData.experience?.slice(0, 5) || [];
    
    return `Extract the most relevant professional skills from this LinkedIn profile:

PROFILE SUMMARY:
- Name: ${profileData.basic_info?.fullname}
- Current Role: ${profileData.basic_info?.headline}
- About: ${profileData.basic_info?.about?.substring(0, 400)}

EXPERIENCE HISTORY:
${allExperience.map(exp => 
    `- ${exp.title} at ${exp.company} (${exp.start_date?.year || 'Unknown'}-${exp.end_date?.year || 'Present'})`
).join('\n')}

CREATOR HASHTAGS: ${JSON.stringify(profileData.basic_info?.creator_hashtags || [])}

SKILL CATEGORIES TO CONSIDER:
- Technical: Programming languages, software, tools, platforms
- Leadership: Management, strategy, team building, executive skills
- Industry-specific: Domain expertise, specialized knowledge
- Functional: Marketing, sales, operations, finance, HR
- Soft skills: Communication, problem-solving, innovation

EXTRACTION RULES:
1. Focus on skills demonstrated through experience
2. Include both technical and soft skills
3. Prioritize current/recent role requirements
4. Extract 5-8 most relevant skills
5. Use clear, professional skill names

Respond with JSON:
{
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "confidence": "high|medium|low",
  "reasoning": "Explanation of skill selection and evidence from profile"
}`;
}

/**
 * Fallback prompt for partial data scenarios
 * @param {Object} limitedData - Minimal profile information
 * @returns {string} Basic analysis prompt
 */
function createFallbackPrompt(limitedData) {
    return `Analyze this limited LinkedIn profile data:

AVAILABLE DATA:
${JSON.stringify(limitedData, null, 2)}

Provide best-effort analysis with lower confidence levels.
Focus on what can be reasonably inferred from available information.

Respond with JSON:
{
  "education_analysis": {
    "education_level": "bachelor|master|phd|high_school",
    "confidence": "low",
    "reasoning": "Based on limited data: [explanation]"
  },
  "industry_analysis": {
    "industry": "technology|finance|healthcare|other", 
    "confidence": "low",
    "reasoning": "Based on available information: [explanation]"
  },
  "skills_analysis": {
    "skills": ["general_skill1", "general_skill2"],
    "confidence": "low",
    "reasoning": "Inferred from limited profile data: [explanation]"
  }
}`;
}

/**
 * Confidence validation prompt to verify AI analysis quality
 * @param {Object} analysisResult - Previous AI analysis result
 * @param {Object} originalData - Original profile data
 * @returns {string} Validation prompt
 */
function createValidationPrompt(analysisResult, originalData) {
    return `Review and validate this AI analysis of a LinkedIn profile:

ORIGINAL ANALYSIS:
${JSON.stringify(analysisResult, null, 2)}

ORIGINAL PROFILE DATA:
- Education: ${JSON.stringify(originalData.education)}
- Current Role: ${originalData.basic_info?.headline}
- Experience: ${originalData.experience?.length || 0} positions listed

VALIDATION QUESTIONS:
1. Is the education classification accurate based on the degree information?
2. Does the industry classification match the professional background?
3. Are the extracted skills relevant and well-supported by the profile?
4. Are the confidence levels appropriate for the evidence available?

Respond with JSON:
{
  "validation_result": "approved|needs_revision|low_confidence",
  "revised_analysis": {
    // Only include if needs_revision, otherwise null
  },
  "validation_notes": "Explanation of validation decision"
}`;
}

// Export functions for use in n8n workflows
module.exports = {
    createLLMPrompt,
    createEducationPrompt,
    createIndustryPrompt,
    createSkillsPrompt,
    createFallbackPrompt,
    createValidationPrompt
};

// For browser environments
if (typeof window !== 'undefined') {
    window.GeminiPrompts = {
        createLLMPrompt,
        createEducationPrompt,
        createIndustryPrompt,
        createSkillsPrompt,
        createFallbackPrompt,
        createValidationPrompt
    };
}