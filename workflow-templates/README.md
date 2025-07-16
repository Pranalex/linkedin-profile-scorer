# LinkedIn Profile Scorer - Complete n8n Workflow Template

A comprehensive, production-ready n8n workflow template for analyzing LinkedIn profiles with AI-powered scoring. This template provides a complete implementation that you can deploy in your own n8n instance.

## 🚀 Features

### Core Functionality
- **LinkedIn Profile Scraping**: Extracts comprehensive profile data using Apify
- **AI-Enhanced Analysis**: Uses Google Gemini 2.5 Flash for intelligent classification
- **Comprehensive Scoring**: 100-point scoring system across experience, education, and industry
- **Dual Storage**: Saves results to both PostgreSQL and Notion databases
- **Error Handling**: Robust error handling with fallback mechanisms
- **Real-time API**: RESTful webhook endpoint for frontend integration

### Scoring System
- **Experience Score (40 points)**: Based on years of professional experience
- **Education Score (30 points)**: From high school to PhD classification
- **Industry Score (30 points)**: Technology, finance, healthcare, and other industries
- **AI Enhancement**: Improves accuracy through natural language understanding

### AI Analysis
- **Education Classification**: Better detection of degrees and certifications
- **Industry Recognition**: Context-aware industry classification
- **Skills Extraction**: Enhanced skills identification from job descriptions
- **Confidence Scoring**: Provides confidence levels for AI decisions
- **Fallback System**: Graceful degradation to rule-based analysis

## 📋 Prerequisites

### Required Services
1. **n8n**: Self-hosted or cloud instance
2. **Apify**: For LinkedIn profile scraping
3. **Google AI Studio**: For Gemini AI analysis
4. **PostgreSQL**: For data storage
5. **Notion** (Optional): For team collaboration

### Node Packages
- `@apify/n8n-nodes-apify`: Apify integration
- `@n8n/n8n-nodes-langchain`: LangChain integration for AI

## 🛠️ Setup Instructions

### 1. Import the Workflow
1. Download `LinkedIn_Profile_Scorer_Complete_Template.json`
2. Open your n8n instance
3. Go to Workflows → Import from file
4. Select the template file
5. Click Import

### 2. Configure Credentials

#### Apify API
1. Create account at [Apify.com](https://apify.com)
2. Get your API token from [Apify Console](https://console.apify.com/account/integrations)
3. In n8n: Credentials → Add → Apify API
4. Enter your API token

#### Google Gemini API
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In n8n: Credentials → Add → Google PaLM API
3. Enter your API key

#### PostgreSQL Database
1. Install PostgreSQL locally or use cloud service
2. Create database named `linkedin_profiles`
3. Run the schema from `database/schema.sql`
4. In n8n: Credentials → Add → PostgreSQL
5. Enter connection details

#### Notion API (Optional)
1. Create integration at [Notion Integrations](https://www.notion.so/my-integrations)
2. Create database with required properties (see Database Schema below)
3. Share database with your integration
4. In n8n: Credentials → Add → Notion API
5. Enter integration token

### 3. Update Configuration

#### Replace Placeholder Values
1. **Webhook ID**: The webhook will generate automatically when you save
2. **Credential IDs**: Will be set when you assign credentials
3. **Notion Database ID**: Replace `YOUR_NOTION_DATABASE_ID` with actual database ID

#### Node Configuration
1. **Apify Scraper**: Verify actor ID `VhxlqQXRwhW8H5hNV` (LinkedIn Profile Scraper)
2. **Gemini Model**: Confirm model name `models/gemini-2.5-flash`
3. **PostgreSQL**: Update database name if different
4. **Notion**: Update database properties if customized

## 📊 Database Schema

### PostgreSQL Schema
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_url TEXT UNIQUE NOT NULL,
    full_name TEXT,
    current_position TEXT,
    current_company TEXT,
    location TEXT,
    total_experience_years INTEGER,
    education_level TEXT,
    industry TEXT,
    skills JSONB,
    experience_score INTEGER,
    education_score INTEGER,
    industry_score INTEGER,
    total_score INTEGER,
    qualification_level TEXT,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_linkedin_url ON profiles(linkedin_url);
CREATE INDEX idx_total_score ON profiles(total_score);
CREATE INDEX idx_qualification_level ON profiles(qualification_level);
```

### Notion Database Properties
Create a Notion database with these properties:

| Property Name | Type | Options |
|---------------|------|---------|
| Full Name | Title | - |
| LinkedIn URL | URL | - |
| Current Position | Rich Text | - |
| Current Company | Rich Text | - |
| Location | Rich Text | - |
| Experience Years | Number | - |
| Education Level | Select | high_school, bachelor, master, phd |
| Industry | Select | technology, finance, healthcare, other |
| Skills | Multi-select | (Auto-created from data) |
| Summary | Rich Text | - |
| Experience Score | Number | - |
| Education Score | Number | - |
| Industry Score | Number | - |
| Total Score | Number | - |
| Qualification Level | Select | unqualified, poor, average, good, excellent |
| Processed At | Date | Include time |
| LLM Education Reasoning | Rich Text | - |
| LLM Industry Reasoning | Rich Text | - |
| LLM Skills Reasoning | Rich Text | - |
| LLM Education Confidence | Select | high, medium, low, unknown |
| LLM Industry Confidence | Select | high, medium, low, unknown |
| LLM Skills Confidence | Select | high, medium, low, unknown |
| LLM Analysis Status | Select | success, fallback |

## 🔧 API Usage

### Webhook Endpoint
After saving the workflow, the webhook node will provide a URL:
```
https://your-n8n-instance.com/webhook/analyse-profile
```

### Request Format
```bash
curl -X POST https://your-n8n-instance.com/webhook/analyse-profile \
  -H "Content-Type: application/json" \
  -d '{
    "url": "linkedin.com/in/username"
  }'
```

### Response Format
```json
{
  "linkedin_url": "https://linkedin.com/in/username",
  "full_name": "John Doe",
  "current_position": "Software Engineer at Microsoft",
  "current_company": "Microsoft",
  "location": "Seattle, WA",
  "total_experience_years": 8,
  "education_level": "bachelor",
  "industry": "technology",
  "skills": ["programming", "leadership", "technology"],
  "experience_score": 30,
  "education_score": 15,
  "industry_score": 30,
  "total_score": 75,
  "qualification_level": "good",
  "llm_education_reasoning": "Bachelor's degree in Computer Science from a reputable university",
  "llm_industry_reasoning": "Clear technology industry role with software development focus",
  "llm_skills_reasoning": "Strong technical skills with leadership experience",
  "llm_education_confidence": "high",
  "llm_industry_confidence": "high",
  "llm_skills_confidence": "high",
  "llm_analysis_status": "success",
  "processed_at": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "LinkedIn profile not found or URL is invalid",
    "details": "The provided LinkedIn URL does not exist, is private, or is not accessible."
  }
}
```

## 🎯 Workflow Flow

1. **Webhook Trigger**: Receives LinkedIn URL via POST request
2. **Apify Scraper**: Extracts comprehensive profile data
3. **Data Validation**: Checks if profile was successfully scraped
4. **Preliminary Scoring**: Rule-based analysis and scoring
5. **AI Analysis**: Google Gemini enhances classification
6. **Enhanced Scoring**: Combines rule-based and AI analysis
7. **Data Storage**: Saves to PostgreSQL and Notion
8. **Response**: Returns complete analysis to client

## 🔄 Customization

### Scoring Weights
Modify scoring weights in the `Preliminary Scoring` node:

```javascript
// Experience scoring (modify these values)
calculateExperienceScore(years) {
    if (years >= 11) return 40;  // Adjust maximum score
    if (years >= 6) return 30;   // Adjust thresholds
    if (years >= 3) return 20;
    if (years >= 1) return 10;
    return 0;
}

// Education scoring (modify these values)
calculateEducationScore(level) {
    switch (level) {
        case 'phd': return 30;      // PhD score
        case 'master': return 25;   // Master's score
        case 'bachelor': return 15; // Bachelor's score
        case 'high_school': return 5; // High school score
        default: return 0;
    }
}
```

### Industry Keywords
Add or modify industry classification keywords:

```javascript
const techKeywords = ['software', 'ai', 'machine learning', 'blockchain']; // Add new keywords
const financeKeywords = ['banking', 'investment', 'fintech', 'cryptocurrency']; // Add fintech terms
const healthcareKeywords = ['medical', 'biotech', 'telemedicine']; // Add modern healthcare terms
```

### AI Prompt
Customize the AI analysis prompt in the `Preliminary Scoring` node:

```javascript
function createLLMPrompt(profileData) {
    return `Your custom prompt here...
    
    Additional instructions:
    - Focus on specific skills you care about
    - Add industry-specific analysis
    - Include custom classification criteria
    `;
}
```

## 📈 Performance Optimization

### Apify Settings
- **Memory**: 256MB (default) or higher for large profiles
- **Timeout**: 60 seconds (increase for slow responses)
- **Retries**: Configure in node settings

### AI Settings
- **Temperature**: 0.1 (deterministic) to 0.3 (creative)
- **Model**: Use `gemini-2.5-flash` for speed or `gemini-pro` for accuracy
- **Batching**: Enable for multiple profiles

### Database Optimization
- **PostgreSQL**: Add indexes for frequently queried fields
- **Notion**: Limit properties to essential fields for better performance

## 🛡️ Security Considerations

### API Keys
- Store all credentials securely in n8n
- Use environment variables for sensitive data
- Rotate API keys regularly

### Rate Limiting
- Apify: Check your plan limits
- Google AI: Monitor token usage
- Notion: Be aware of API rate limits

### Data Privacy
- Ensure compliance with GDPR/CCPA
- Implement data retention policies
- Handle sensitive information appropriately

## 📊 Monitoring

### Key Metrics
- **Success Rate**: Percentage of successful profile analyses
- **Processing Time**: Average time per profile
- **AI Confidence**: Distribution of AI confidence scores
- **Error Types**: Common failure modes

### Logging
- Enable n8n execution logging
- Monitor webhook response times
- Track API usage and costs

## 🚨 Troubleshooting

### Common Issues

#### Profile Not Found
- Check LinkedIn URL format
- Verify profile is public
- Check Apify actor status

#### AI Analysis Fails
- Verify Google AI API key
- Check API quotas
- Review prompt format

#### Database Connection
- Verify PostgreSQL credentials
- Check database permissions
- Ensure schema is created

#### Notion Integration
- Verify database is shared with integration
- Check property names match exactly
- Ensure all required properties exist

### Debug Mode
Enable debug mode in n8n workflow settings to see detailed execution logs.

## 📄 License

This template is provided under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review n8n documentation
- Open an issue in the GitHub repository

## 🙏 Acknowledgments

- **n8n Community**: For the amazing automation platform
- **Apify**: For LinkedIn scraping capabilities
- **Google AI**: For Gemini language model
- **PostgreSQL**: For reliable data storage
- **Notion**: For collaborative workspace features

---

**Note**: This template is designed for educational and legitimate business use cases. Ensure compliance with LinkedIn's Terms of Service and applicable data protection laws.