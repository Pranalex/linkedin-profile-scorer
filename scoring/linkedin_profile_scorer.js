// Get the input data (profile from previous node)
const profileData = $input.first().json;

// Function to create LLM prompt
function createLLMPrompt(profileData) {
    return `Analyze this LinkedIn profile data and provide structured 
analysis in JSON format:

PROFILE DATA:
- Name: ${profileData.basic_info?.fullname || 'Not provided'}
- Education: ${JSON.stringify(profileData.education || [])}
- Experience: ${JSON.stringify(profileData.experience?.slice(0, 3) || 
[])}
- Current Company: ${profileData.basic_info?.current_company || 'Not provided'}
- Headline: ${profileData.basic_info?.headline || 'Not provided'}
- About: ${profileData.basic_info?.about?.substring(0, 500) || 'Not provided'}
- Creator Hashtags: 
${JSON.stringify(profileData.basic_info?.creator_hashtags || [])}

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
- Education: PhD/Doctorate=phd, Master's/MBA=master, 
Bachelor's/University=bachelor, High School/None=high_school
- Industry: Technology companies/roles=technology, 
Finance/Banking/Consulting=finance, Healthcare/Medical=healthcare, 
Others=other
- Skills: Extract 5-8 most relevant professional skills from all provided
 data

Respond with JSON only, no additional text.`;
}

class LinkedInProfileScorer {
    constructor() {
        this.maxScore = 100;
    }

    scoreProfile(profileData) {
        const totalExperienceYears = this.extractExperienceYears(profileData);
        const educationLevel = this.extractEducationLevel(profileData);
        const industry = this.extractIndustry(profileData);

        const experienceScore = this.calculateExperienceScore(totalExperienceYears);
        const educationScore = this.calculateEducationScore(educationLevel);
        const industryScore = this.calculateIndustryScore(industry);

        const totalScore = experienceScore + educationScore + industryScore;
        const qualificationLevel = this.getQualificationLevel(totalScore);

        return {
            total_experience_years: totalExperienceYears,
            education_level: educationLevel,
            industry: industry,
            experience_score: experienceScore,
            education_score: educationScore,
            industry_score: industryScore,
            total_score: totalScore,
            qualification_level: qualificationLevel
        };
    }

    extractExperienceYears(profileData) {
        if (!profileData.experience || profileData.experience.length === 0) {
            return 0;
        }

        const currentYear = new Date().getFullYear();
        let totalMonths = 0;

        profileData.experience.forEach(exp => {
            const startYear = exp.start_date?.year || currentYear;
            const endYear = exp.end_date?.year || currentYear;
            const startMonth = exp.start_date?.month ? this.monthToNumber(exp.start_date.month) : 1;
            const endMonth = exp.end_date?.month ? this.monthToNumber(exp.end_date.month) : 12;

            const months = (endYear - startYear) * 12 + (endMonth - startMonth);
            totalMonths += Math.max(months, 0);
        });

        return Math.round(totalMonths / 12);
    }

    extractEducationLevel(profileData) {
        if (!profileData.education || profileData.education.length === 0) {
            return 'high_school';
        }

        const degrees = profileData.education.map(edu => {
            const degree = (edu.degree_name || edu.degree || '').toLowerCase();

            if (degree.includes('phd') || degree.includes('doctorate') || degree.includes('ph.d')) {
                return 'phd';
            } else if (degree.includes('master') || degree.includes('mba') || degree.includes('m.s') || degree.includes('m.a')) {
                return 'master';
            } else if (degree.includes('bachelor') || degree.includes('b.s') || degree.includes('b.a') || degree.includes('engineer')) {
                return 'bachelor';
            } else {
                return 'high_school';
            }
        });

        if (degrees.includes('phd')) return 'phd';
        if (degrees.includes('master')) return 'master';
        if (degrees.includes('bachelor')) return 'bachelor';
        return 'high_school';
    }

    extractIndustry(profileData) {
        const currentExperience = profileData.experience?.find(exp => exp.is_current);
        const company = currentExperience?.company?.toLowerCase() || '';
        const title = (profileData.basic_info?.headline || currentExperience?.title || '').toLowerCase();
        const about = (profileData.basic_info?.about || '').toLowerCase();

        const combinedText = `${company} ${title} ${about}`;

        const techKeywords = ['software', 'developer', 'engineer', 'tech', 'programming', 'coding', 'javascript', 'python', 'react', 'ai', 'machine learning', 'data science', 'startup', 'saas', 'cloud', 'aws', 'google', 'microsoft', 'apple', 'meta', 'uber', 'airbnb'];
        const financeKeywords = ['finance', 'investment', 'banking', 'financial', 'consulting', 'mckinsey', 'bain', 'bcg', 'goldman sachs', 'jp morgan', 'morgan stanley', 'analyst', 'advisor', 'capital', 'fund'];
        const healthcareKeywords = ['healthcare', 'medical', 'doctor', 'nurse', 'hospital', 'pharma', 'biotech', 'education', 'teacher', 'professor', 'university', 'school', 'research'];

        if (techKeywords.some(keyword => combinedText.includes(keyword))) {
            return 'technology';
        } else if (financeKeywords.some(keyword => combinedText.includes(keyword))) {
            return 'finance';
        } else if (healthcareKeywords.some(keyword => combinedText.includes(keyword))) {
            return 'healthcare';
        } else {
            return 'other';
        }
    }

    calculateExperienceScore(years) {
        if (years >= 11) return 40;
        if (years >= 6) return 30;
        if (years >= 3) return 20;
        if (years >= 1) return 10;
        return 0;
    }

    calculateEducationScore(level) {
        switch (level) {
            case 'phd': return 30;
            case 'master': return 25;
            case 'bachelor': return 15;
            case 'high_school': return 5;
            default: return 0;
        }
    }

    calculateIndustryScore(industry) {
        switch (industry) {
            case 'technology': return 30;
            case 'finance': return 25;
            case 'healthcare': return 20;
            case 'other': return 10;
            default: return 0;
        }
    }

    getQualificationLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'average';
        if (score >= 20) return 'poor';
        return 'unqualified';
    }

    monthToNumber(month) {
        const months = {
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
            'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };
        return months[month.toLowerCase().substring(0, 3)] || 1;
    }
}

// Create scorer and process the profile
const scorer = new LinkedInProfileScorer();
const scoringResults = scorer.scoreProfile(profileData);

// Create LLM prompt for Gemini analysis
const llmPrompt = createLLMPrompt(profileData);

// Enhanced skills extraction
const skills = [];

if (profileData.basic_info?.creator_hashtags) {
    profileData.basic_info.creator_hashtags.forEach(tag => {
        if (!skills.includes(tag)) {
            skills.push(tag);
        }
    });
}

const headline = (profileData.basic_info?.headline || '').toLowerCase();
let about = (profileData.basic_info?.about || '').toLowerCase();
let combinedText = `${headline} ${about}`;

if (profileData.experience) {
    profileData.experience.forEach(exp => {
        if (exp.description) {
            const desc = exp.description.toLowerCase();
            combinedText += ` ${desc}`;
        }
        if (exp.title) {
            combinedText += ` ${exp.title.toLowerCase()}`;
        }
    });
}

const skillKeywords = {
    'technology': ['javascript', 'python', 'react', 'ai', 'artificial intelligence', 'machine learning', 'data science', 'cloud', 'aws', 'azure', 'software', 'programming', 'coding', 'development', 'innovation'],
    'leadership': ['leadership', 'management', 'strategy', 'ceo', 'founder', 'co-founder', 'chair', 'chairman', 'executive', 'director'],
    'finance': ['finance', 'investment', 'banking', 'financial', 'funding', 'capital', 'venture', 'equity', 'portfolio'],
    'healthcare': ['healthcare', 'medical', 'health', 'biotech', 'pharma', 'research', 'science', 'clinical'],
    'sustainability': ['sustainability', 'climate', 'environment', 'energy', 'renewable', 'green', 'carbon'],
    'education': ['education', 'teaching', 'learning', 'university', 'school', 'foundation', 'nonprofit', 'philanthropy'],
    'communication': ['communication', 'writing', 'blogger', 'speaking', 'presentation', 'media', 'books', 'reading']
};

Object.keys(skillKeywords).forEach(skillCategory => {
    skillKeywords[skillCategory].forEach(keyword => {
        if (combinedText.includes(keyword) && !skills.includes(skillCategory)) {
            skills.push(skillCategory);
        }
    });
});

const specificSkills = ['books', 'healthcare', 'innovation', 'climatechange', 'sustainability', 'philanthropy', 'entrepreneurship', 'investing'];
specificSkills.forEach(skill => {
    if (combinedText.includes(skill.toLowerCase()) && !skills.includes(skill)) {
        skills.push(skill);
    }
});

const finalSkills = skills.slice(0, 10);

return [
    {
        json: {
            llm_prompt: llmPrompt,
            linkedin_url: $('analyse-profile1').first().json.body.url || null,
            full_name: profileData.basic_info?.fullname || null,
            current_position: (() => {
                const currentExp = profileData.experience?.find(exp => exp.is_current);
                const title = currentExp?.title;
                const company = currentExp?.company || profileData.basic_info?.current_company;
                
                if (title && company) {
                    return `${title} at ${company}`;
                }
                return title || profileData.basic_info?.headline || null;
            })(),
            current_company: profileData.basic_info?.current_company || null,
            location: profileData.basic_info?.location?.full || null,
            total_experience_years: scoringResults.total_experience_years,
            education_level: scoringResults.education_level,
            industry: scoringResults.industry,
            skills: finalSkills,
            summary: profileData.basic_info?.about || null,
            experience_score: scoringResults.experience_score,
            education_score: scoringResults.education_score,
            industry_score: scoringResults.industry_score,
            total_score: scoringResults.total_score,
            qualification_level: scoringResults.qualification_level,
            processed_at: new Date().toISOString()
        }
    }
];

/**
 * n8n Code Node Implementation
 * This is the complete preliminary score code for the n8n workflow
 * 
 * ENHANCED: current_position now correctly extracts job title from experience
 * and includes company name for better context
 * 
 * Key Enhancements:
 * - Line 266-275: Enhanced position logic that combines title and company
 * - Format: "Co-Founder at AYOMI.fr" instead of just "Co-Founder"
 * - Fallback: title only → headline → null
 * - This ensures actual job title with company context instead of LinkedIn bio/summary
 */