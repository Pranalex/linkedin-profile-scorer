# LinkedIn Profile Scorer - Complete Setup Guide

## Prerequisites

### Required Services
- **n8n Instance** (self-hosted or cloud)
- **PostgreSQL Database** (v12+)
- **Notion Workspace** with API access
- **Google Gemini API** key (2.5 Flash model)
- **Apify Account** for LinkedIn scraping

### Development Environment
- Node.js 18+
- Docker & Docker Compose (optional)
- Git for version control

## 1. Database Setup

### PostgreSQL Configuration

1. **Create Database**:
```sql
CREATE DATABASE linkedin_profiles;
CREATE USER linkedin_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE linkedin_profiles TO linkedin_user;
```

2. **Run Schema**:
```bash
psql -h localhost -U linkedin_user -d linkedin_profiles -f database/postgresql-schema.sql
```

3. **Verify Setup**:
```sql
\d profiles
SELECT * FROM profile_statistics;
```

### Notion Database Setup

1. **Create Database**: 
   - Open Notion → New Database
   - Name: "LinkedIn Profiles Database"

2. **Add Properties** (refer to `database/notion-properties.md`):
   - Follow the exact property names and types
   - Configure select options as specified

3. **Get Database ID**:
   - Copy database URL
   - Extract 32-character ID from URL
   - Format: `https://notion.so/DATABASE_ID`

## 2. API Configuration

### Google Gemini Setup

1. **Get API Key**:
   - Visit Google AI Studio
   - Create new API key
   - Enable Gemini 2.5 Flash model access

2. **Test API**:
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY"
```

### Apify Configuration

1. **Create Account**: Sign up at apify.com
2. **Get Actor ID**: `VhxlqQXRwhW8H5hNV` (LinkedIn Profile Details Scraper)
3. **API Token**: Generate in account settings

### Notion API Setup

1. **Create Integration**:
   - Visit https://www.notion.so/my-integrations
   - New integration → Internal integration
   - Copy integration token

2. **Share Database**:
   - Open your LinkedIn database
   - Share → Add your integration
   - Grant read/write permissions

## 3. n8n Workflow Import

### Import Workflow

1. **Download Workflow**:
   ```bash
   wget https://raw.githubusercontent.com/yourusername/linkedin-profile-scorer/main/workflows/linkedin-profile-scorer-workflow.json
   ```

2. **Import to n8n**:
   - n8n interface → Import from file
   - Select the downloaded JSON file
   - Confirm import

### Configure Credentials

1. **Apify Credential**:
   - Name: "Apify account"
   - API Token: Your Apify token

2. **PostgreSQL Credential**:
   - Name: "Postgres account"
   - Host: your-postgres-host
   - Database: linkedin_profiles
   - User: linkedin_user
   - Password: your_secure_password

3. **Notion Credential**:
   - Name: "Notion account"
   - API Key: Your integration token

4. **Google Gemini**:
   - Name: "Google Gemini"
   - API Key: Your Gemini API key

### Update Node Configuration

1. **Notion Database ID**:
   - Open "Get many database pages" node
   - Update Database ID field
   - Repeat for "Create a database page" node

2. **Webhook URL**:
   - Note webhook URL from "analyse-profile1" node
   - Format: `https://your-n8n-instance/webhook/analyse-profile`

## 4. Testing & Validation

### Test Individual Nodes

1. **Test Apify Scraper**:
   - Manual execution with sample LinkedIn URL
   - Verify profile data extraction

2. **Test Gemini Integration**:
   - Check prompt generation
   - Validate AI response parsing

3. **Test Database Operations**:
   - Verify PostgreSQL inserts
   - Check Notion page creation

### End-to-End Testing

1. **Sample Request**:
```bash
curl -X POST https://your-n8n-instance/webhook/analyse-profile \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.linkedin.com/in/williamhgates/"}'
```

2. **Expected Response**:
```json
{
  "linkedin_url": "https://www.linkedin.com/in/williamhgates/",
  "full_name": "Bill Gates",
  "total_score": 85,
  "qualification_level": "excellent",
  "llm_analysis_status": "success"
}
```

## 5. Production Deployment

### Security Configuration

1. **Environment Variables**:
```env
POSTGRES_PASSWORD=your_secure_password
GEMINI_API_KEY=your_gemini_key
NOTION_API_TOKEN=your_notion_token
APIFY_API_TOKEN=your_apify_token
```

2. **Rate Limiting**:
   - Configure appropriate delays
   - Respect API quotas
   - Implement retry logic

3. **Error Handling**:
   - Monitor webhook responses
   - Set up alerts for failures
   - Configure fallback mechanisms

### Monitoring Setup

1. **n8n Execution Logs**:
   - Enable detailed logging
   - Monitor execution times
   - Track success/failure rates

2. **Database Monitoring**:
   - Monitor connection pools
   - Track query performance
   - Set up backup procedures

3. **API Monitoring**:
   - Track API usage and quotas
   - Monitor response times
   - Set up quota alerts

## 6. Customization

### Modify Scoring Logic

1. **Edit Score Weights**:
   - Update `scoring/linkedin_profile_scorer.js`
   - Adjust point distributions
   - Modify qualification thresholds

2. **Enhance AI Prompts**:
   - Customize `scoring/gemini_prompts.js`
   - Improve classification accuracy
   - Add new analysis categories

### Add New Features

1. **Additional Data Sources**:
   - Integrate other profile sources
   - Add social media analysis
   - Include company data

2. **Enhanced Analytics**:
   - Add dashboard views
   - Create custom reports
   - Implement trend analysis

## 7. Troubleshooting

### Common Issues

1. **Workflow Import Fails**:
   - Check n8n version compatibility
   - Verify credential names match
   - Update node configurations manually

2. **Apify Scraping Errors**:
   - Verify LinkedIn URL format
   - Check profile accessibility
   - Review rate limiting

3. **AI Analysis Failures**:
   - Validate API key permissions
   - Check quota limits
   - Review prompt format

4. **Database Connection Issues**:
   - Verify credentials
   - Check network connectivity
   - Review firewall settings

### Debug Steps

1. **Enable Debug Mode**:
   - n8n settings → Enable debug
   - Check execution logs
   - Review node outputs

2. **Test Components Individually**:
   - Manual node execution
   - Verify data flow
   - Check transformations

3. **Monitor API Responses**:
   - Log API calls
   - Check error messages
   - Verify response formats

## 8. Maintenance

### Regular Tasks

1. **Database Maintenance**:
   - Clean old profile data
   - Optimize query performance
   - Update schema as needed

2. **API Monitoring**:
   - Review usage statistics
   - Rotate API keys
   - Update rate limits

3. **Workflow Updates**:
   - Deploy new versions
   - Test changes thoroughly
   - Backup configurations

### Performance Optimization

1. **Database Optimization**:
   - Add appropriate indexes
   - Archive old data
   - Optimize queries

2. **API Efficiency**:
   - Implement caching
   - Batch operations
   - Optimize prompts

3. **Workflow Optimization**:
   - Reduce execution time
   - Parallel processing
   - Error recovery

## Support

### Documentation
- [API Reference](api-documentation.md)
- [Workflow Documentation](../workflows/workflow-documentation.md)
- [Database Schema](../database/postgresql-schema.sql)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for community guides

### Professional Support
- Custom implementation services
- Training and consultation
- Enterprise deployment assistance