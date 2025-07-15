/**
 * LinkedIn Profile Scorer - Based on plan.md specifications
 * Three-Criteria System: Experience (0-40) + Education (0-30) + Industry (0-30) = 100 points
 */

class LinkedInProfileScorer {
    constructor() {
        this.maxScore = 100;
    }

    /**
     * Main scoring function - takes extracted profile data and returns scores
     * @param {Object} profileData - Profile data from API
     * @returns {Object} Scoring results matching plan.md format
     */
    scoreProfile(profileData) {
        // Extract the three key parameters for scoring
        const totalExperienceYears = this.extractExperienceYears(profileData);
        const educationLevel = this.extractEducationLevel(profileData);
        const industry = this.extractIndustry(profileData);

        // Calculate scores based on plan.md criteria
        const experienceScore = this.calculateExperienceScore(totalExperienceYears);
        const educationScore = this.calculateEducationScore(educationLevel);
        const industryScore = this.calculateIndustryScore(industry);
        
        const totalScore = experienceScore + educationScore + industryScore;
        const qualificationLevel = this.getQualificationLevel(totalScore);

        return {
            // Scoring inputs (extracted data)
            total_experience_years: totalExperienceYears,
            education_level: educationLevel,
            industry: industry,
            
            // Calculated scores (matching plan.md format)
            experience_score: experienceScore,
            education_score: educationScore,
            industry_score: industryScore,
            total_score: totalScore,
            qualification_level: qualificationLevel,
            
            // Additional metadata
            scoring_breakdown: {
                experience: `${totalExperienceYears} years → ${experienceScore}/40 points`,
                education: `${educationLevel} → ${educationScore}/30 points`,
                industry: `${industry} → ${industryScore}/30 points`
            },
            profile_summary: {
                name: profileData.basic_info?.fullname || 'Unknown',
                current_role: profileData.basic_info?.current_company || 'Unknown',
                location: profileData.basic_info?.location?.full || 'Unknown'
            }
        };
    }

    /**
     * Extract total experience years from profile data
     */
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

    /**
     * Extract education level from profile data
     */
    extractEducationLevel(profileData) {
        if (!profileData.education || profileData.education.length === 0) {
            return 'high_school';
        }

        // Get the highest degree
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

        // Return the highest degree level
        if (degrees.includes('phd')) return 'phd';
        if (degrees.includes('master')) return 'master';
        if (degrees.includes('bachelor')) return 'bachelor';
        return 'high_school';
    }

    /**
     * Extract industry from profile data
     */
    extractIndustry(profileData) {
        // Try to extract from current company or experience
        const currentExperience = profileData.experience?.find(exp => exp.is_current);
        const company = currentExperience?.company?.toLowerCase() || '';
        const title = (profileData.basic_info?.headline || currentExperience?.title || '').toLowerCase();
        const about = (profileData.basic_info?.about || '').toLowerCase();
        
        const combinedText = `${company} ${title} ${about}`;

        // Technology keywords
        const techKeywords = ['software', 'developer', 'engineer', 'tech', 'programming', 'coding', 'javascript', 'python', 'react', 'ai', 'machine learning', 'data science', 'startup', 'saas', 'cloud', 'aws', 'google', 'microsoft', 'apple', 'meta', 'uber', 'airbnb'];
        
        // Finance/Consulting keywords
        const financeKeywords = ['finance', 'investment', 'banking', 'financial', 'consulting', 'mckinsey', 'bain', 'bcg', 'goldman sachs', 'jp morgan', 'morgan stanley', 'analyst', 'advisor', 'capital', 'fund'];
        
        // Healthcare/Education keywords
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

    /**
     * Calculate Experience Score (0-40 points) - Based on plan.md
     */
    calculateExperienceScore(years) {
        if (years >= 11) return 40;      // 11+ years: 31-40 points (max)
        if (years >= 6) return 30;       // 6-10 years: 21-30 points  
        if (years >= 3) return 20;       // 3-5 years: 11-20 points
        if (years >= 1) return 10;       // 0-2 years: 0-10 points
        return 0;                        // No experience
    }

    /**
     * Calculate Education Score (0-30 points) - Based on plan.md
     */
    calculateEducationScore(level) {
        switch (level) {
            case 'phd': return 30;           // PhD/Advanced: 26-30 points (max)
            case 'master': return 25;        // Master's: 16-25 points
            case 'bachelor': return 15;      // Bachelor's: 6-15 points
            case 'high_school': return 5;    // High School: 0-5 points
            default: return 0;
        }
    }

    /**
     * Calculate Industry Score (0-30 points) - Based on plan.md
     */
    calculateIndustryScore(industry) {
        switch (industry) {
            case 'technology': return 30;        // Technology: High relevance (25-30 points)
            case 'finance': return 25;           // Finance/Consulting: Medium-high relevance (20-25 points)
            case 'healthcare': return 20;       // Healthcare/Education: Medium relevance (15-20 points)
            case 'other': return 10;             // Other Industries: Variable relevance (0-15 points)
            default: return 0;
        }
    }

    /**
     * Get qualification level based on total score - Based on plan.md
     */
    getQualificationLevel(score) {
        if (score >= 80) return 'excellent';     // 🏆 Excellent (80-100): Immediate follow-up priority
        if (score >= 60) return 'good';          // ✅ Good (60-79): Standard outreach sequence
        if (score >= 40) return 'average';       // ⚡ Average (40-59): Nurturing campaign
        if (score >= 20) return 'poor';          // ⚠️ Poor (20-39): Low priority
        return 'unqualified';                    // ❌ Unqualified (<20): Exclusion list
    }

    /**
     * Convert month name to number
     */
    monthToNumber(month) {
        const months = {
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
            'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };
        return months[month.toLowerCase().substring(0, 3)] || 1;
    }
}

/**
 * Main function for n8n Code node usage
 */
function scoreLinkedInProfile(profileData) {
    const scorer = new LinkedInProfileScorer();
    return scorer.scoreProfile(profileData);
}

/**
 * n8n Code Node Implementation
 * Paste this entire section into your n8n Code node
 */
function n8nCodeNodeImplementation() {
    // Get the input data (profile from previous node)
    const profileData = $input.first().json;

    // LinkedIn Profile Scorer Class (copy the entire class from above)
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
                qualification_level: qualificationLevel,
                scoring_breakdown: {
                    experience: `${totalExperienceYears} years → ${experienceScore}/40 points`,
                    education: `${educationLevel} → ${educationScore}/30 points`,
                    industry: `${industry} → ${industryScore}/30 points`
                },
                profile_summary: {
                    name: profileData.basic_info?.fullname || 'Unknown',
                    current_role: profileData.basic_info?.current_company || 'Unknown',
                    location: profileData.basic_info?.location?.full || 'Unknown'
                }
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

    // IMPORTANT: Return in n8n format - array of objects with 'json' property
    return [
        {
            json: {
                // Original profile data
                profile_data: profileData,
                // Scoring results
                scoring_results: scoringResults,
                // Combined for easy access
                ...scoringResults
            }
        }
    ];
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LinkedInProfileScorer, scoreLinkedInProfile };
} else if (typeof window !== 'undefined') {
    window.LinkedInProfileScorer = LinkedInProfileScorer;
    window.scoreLinkedInProfile = scoreLinkedInProfile;
}

/**
 * Example usage with the provided Guillaume Tourniaire data:
 * 
 * Input:
 * - total_experience_years: ~15 years (2007-2024)
 * - education_level: "engineer" → "bachelor"
 * - industry: "finance" (AYOMI.fr, investment/funding)
 * 
 * Expected Output:
 * - experience_score: 40 (15+ years)
 * - education_score: 15 (bachelor's/engineer)
 * - industry_score: 25 (finance)
 * - total_score: 80
 * - qualification_level: "excellent"
 */