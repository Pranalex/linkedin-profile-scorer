# Notion Database Properties

## Required Properties for LinkedIn Profiles Database

### Basic Profile Information
| Property Name | Type | Description |
|---------------|------|-------------|
| **Full Name** | Title | Person's full name (primary identifier) |
| **LinkedIn URL** | URL | Original LinkedIn profile URL |
| **Current Position** | Rich Text | Current job title/role |
| **Current Company** | Rich Text | Current employer |
| **Location** | Rich Text | Geographic location |
| **Summary** | Rich Text | Profile about/bio section |

### Extracted Metrics
| Property Name | Type | Options | Description |
|---------------|------|---------|-------------|
| **Experience Years** | Number | - | Total years of professional experience |
| **Education Level** | Select | phd, master, bachelor, high_school | Highest education achieved |
| **Industry** | Select | technology, finance, healthcare, other | Primary industry classification |
| **Skills** | Multi-select | (dynamic) | Extracted professional skills |

### Scoring Results
| Property Name | Type | Description |
|---------------|------|-------------|
| **Experience Score** | Number | Points from experience (0-40) |
| **Education Score** | Number | Points from education (0-30) |
| **Industry Score** | Number | Points from industry (0-30) |
| **Total Score** | Number | Combined score (0-100) |
| **Qualification Level** | Select | excellent, good, average, poor, unqualified |

### AI Analysis Results
| Property Name | Type | Options | Description |
|---------------|------|---------|-------------|
| **LLM Education Reasoning** | Rich Text | - | AI explanation for education classification |
| **LLM Industry Reasoning** | Rich Text | - | AI explanation for industry classification |
| **LLM Skills Reasoning** | Rich Text | - | AI explanation for skills extraction |
| **LLM Education Confidence** | Select | high, medium, low | AI confidence in education analysis |
| **LLM Industry Confidence** | Select | high, medium, low | AI confidence in industry analysis |
| **LLM Skills Confidence** | Select | high, medium, low | AI confidence in skills analysis |
| **LLM Analysis Status** | Select | success, failed, fallback | Overall AI processing status |

### Metadata
| Property Name | Type | Description |
|---------------|------|-------------|
| **Processed At** | Date | Timestamp of profile analysis |

## Setup Instructions

### 1. Create Notion Database
1. Open Notion and create a new database
2. Name it "LinkedIn Profiles Database"
3. Add all properties listed above with correct types

### 2. Configure Property Options

#### Education Level (Select)
- phd
- master  
- bachelor
- high_school

#### Industry (Select)
- technology
- finance
- healthcare
- other

#### Qualification Level (Select)
- excellent
- good
- average
- poor
- unqualified

#### LLM Confidence Levels (Select)
- high
- medium
- low

#### LLM Analysis Status (Select)
- success
- failed
- fallback

### 3. Get Database ID
1. Open your database in Notion
2. Copy the URL
3. Extract the database ID (32-character string)
4. Use this ID in your n8n workflow configuration

### 4. n8n Integration Mapping

```javascript
// Property mappings for n8n Notion node
{
  "key": "Full Name|title",
  "title": "={{ $json.full_name }}"
},
{
  "key": "LinkedIn URL|url",
  "urlValue": "={{ $json.linkedin_url }}"
},
{
  "key": "Current Position|rich_text",
  "textContent": "={{ $json.current_position }}"
},
{
  "key": "Current Company|rich_text",
  "textContent": "={{ $json.current_company }}"
},
{
  "key": "Location|rich_text",
  "textContent": "={{ $json.location }}"
},
{
  "key": "Summary|rich_text",
  "textContent": "={{ $json.summary }}"
},
{
  "key": "Experience Years|number",
  "numberValue": "={{ $json.total_experience_years }}"
},
{
  "key": "Education Level|select",
  "selectValue": "={{ $json.education_level }}"
},
{
  "key": "Industry|select",
  "selectValue": "={{ $json.industry }}"
},
{
  "key": "Skills|multi_select",
  "multiSelectValue": "={{ $json.skills }}"
},
{
  "key": "Experience Score|number",
  "numberValue": "={{ $json.experience_score }}"
},
{
  "key": "Education Score|number",
  "numberValue": "={{ $json.education_score }}"
},
{
  "key": "Industry Score|number",
  "numberValue": "={{ $json.industry_score }}"
},
{
  "key": "Total Score|number",
  "numberValue": "="{{ $json.total_score }}"
},
{
  "key": "Qualification Level|select",
  "selectValue": "={{ $json.qualification_level }}"
},
{
  "key": "LLM Education Reasoning|rich_text",
  "textContent": "={{ $json.llm_education_reasoning }}"
},
{
  "key": "LLM Industry Reasoning|rich_text",
  "textContent": "={{ $json.llm_industry_reasoning }}"
},
{
  "key": "LLM Skills Reasoning|rich_text",
  "textContent": "={{ $json.llm_skills_reasoning }}"
},
{
  "key": "LLM Education Confidence|select",
  "selectValue": "={{ $json.llm_education_confidence }}"
},
{
  "key": "LLM Industry Confidence|select",
  "selectValue": "={{ $json.llm_industry_confidence }}"
},
{
  "key": "LLM Skills Confidence|select",
  "selectValue": "={{ $json.llm_skills_confidence }}"
},
{
  "key": "LLM Analysis Status|select",
  "selectValue": "={{ $json.llm_analysis_status }}"
},
{
  "key": "Processed At|date",
  "includeTime": "={{ $json.processed_at }}"
}
```

## Database Views

### Recommended Views
1. **All Profiles** - Default table view with all properties
2. **High Scores** - Filter: Total Score ≥ 80
3. **Recent Analyses** - Sort: Processed At (newest first)
4. **By Industry** - Group: Industry
5. **AI Success** - Filter: LLM Analysis Status = "success"

### Dashboard Widgets
- Total profiles count
- Average score
- Top industries
- AI analysis success rate
- Recent high-scoring profiles

## Troubleshooting

### Common Issues
1. **Property name mismatch** - Ensure exact naming in n8n
2. **Type conflicts** - Verify select options match exactly
3. **Missing properties** - Check all required fields are created
4. **API permissions** - Ensure Notion integration has write access

### Best Practices
- Use consistent naming conventions
- Set up proper filters and sorts
- Create useful views for different use cases
- Monitor API rate limits
- Regular backup of database content