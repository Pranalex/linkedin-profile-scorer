# 🎯 LinkedIn Profile Scorer

AI-powered LinkedIn profile analysis and scoring system using n8n automation, PostgreSQL, and Notion integration.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd linkedin-profile-scorer

# Start all services
docker-compose up -d

# Access the interfaces
# Web Demo: http://localhost:8081
# n8n Workflow: http://localhost:8081/n8n
# Grafana Dashboard: http://localhost:8081/grafana
# Prometheus Metrics: http://localhost:8081/prometheus
```

## 📊 System Overview

**Goal**: Extract and score LinkedIn profiles based on 3 criteria:
- ⏱️ **Experience** (0-40 points): Years of professional experience
- 🎓 **Education** (0-30 points): Academic qualification level  
- 🏢 **Industry** (0-30 points): Sector relevance and fit

**Total Score**: 0-100 points with qualification levels:
- 🏆 **Excellent** (80-100): Immediate follow-up priority
- ✅ **Good** (60-79): Standard outreach sequence
- ⚡ **Average** (40-59): Nurturing campaign
- ⚠️ **Poor** (20-39): Low priority
- ❌ **Unqualified** (<20): Exclusion list

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  WEB INTERFACE  │───▶│   n8n WORKFLOW   │───▶│   POSTGRESQL    │
│  (Port 8081)    │    │   (Port 5679)    │    │   (Port 5433)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                      │
         │            ┌──────────────────┐              │
         └───────────▶│   MONITORING     │◀─────────────┘
                      │ Grafana (3001)   │
                      │ Prometheus (9091)│
                      └──────────────────┘
```

### Core Components
- **n8n**: Workflow orchestration and automation
- **PostgreSQL**: Profile data storage with GDPR compliance
- **Grafana**: Real-time analytics and monitoring dashboards
- **Prometheus**: Metrics collection and alerting
- **Redis**: Caching and rate limiting
- **Nginx**: Reverse proxy with security headers

## 🔄 Processing Workflow

```
User Input (LinkedIn URL)
    ↓
HTTP Request (Fetch Profile)
    ↓
AI Extraction (Gemini API)
    ↓
Data Validation & Cleanup
    ↓
Scoring Engine (Rule-based)
    ↓
PostgreSQL Storage
    ↓
JSON Response + Metrics
```

## 📊 Monitoring & Metrics

### Key Metrics Tracked
- **Business**: Profiles processed, success rate, score distribution
- **Performance**: Processing time, API latency, database operations  
- **Errors**: Failed requests, retry attempts, timeout failures
- **System**: CPU, memory, disk usage, network traffic

### Grafana Dashboards
- **Overview**: Total profiles, success rate, average score
- **Real-time**: Processing timeline, error tracking
- **Analytics**: Score distribution, industry breakdown
- **System Health**: Resource usage, alert status

### Prometheus Alerts
- High error rate (>20% failures)
- Low success rate (<80% success)  
- High processing time (>30 seconds)
- Database connection issues
- AI API quota/errors

## 🛡️ Error Handling

### Error Categories
1. **Input Validation**: Invalid URLs, non-LinkedIn domains
2. **Network Issues**: Profile not found, rate limiting, timeouts
3. **AI Processing**: Extraction failures, API quota exceeded
4. **Database**: Connection failures, storage issues

### Retry Strategy
- **Network errors**: 3 retries with exponential backoff
- **AI failures**: 2 retries with circuit breaker
- **Database issues**: 5 retries with connection pooling
- **Rate limiting**: Intelligent delay based on response headers

### Graceful Degradation
- Partial data extraction when possible
- Fallback scoring algorithms
- Offline mode with cached results
- User-friendly error messages

## 🔧 Configuration

### Environment Variables
```env
# Database
POSTGRES_DB=linkedin_profiles
POSTGRES_USER=linkedin_user
POSTGRES_PASSWORD=LinkedInDB2025!SecurePass

# Authentication
N8N_AUTH_USER=admin
N8N_AUTH_PASSWORD=linkedin_scorer_2025

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Rate Limiting
USER_AGENT=Mozilla/5.0 (compatible; LinkedIn-Scorer/1.0)
REQUEST_DELAY_MS=2000
MAX_RETRIES=3
```

### Port Configuration
- **8081**: Main web interface (Nginx)
- **5679**: n8n workflow editor
- **5433**: PostgreSQL database
- **6380**: Redis cache
- **3001**: Grafana dashboards
- **9091**: Prometheus metrics
- **9101**: Node exporter

## 📦 Data Schema

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    linkedin_url TEXT UNIQUE,
    full_name VARCHAR(200),
    current_position VARCHAR(300),
    current_company VARCHAR(200),
    industry VARCHAR(100),
    total_experience_years INTEGER,
    education_level VARCHAR(50),
    experience_score INTEGER,
    education_score INTEGER,
    industry_score INTEGER,
    total_score INTEGER,
    qualification_level VARCHAR(20),
    scoring_details JSONB,
    processing_status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚦 API Endpoints

### Main Webhook
```
POST /webhook/analyze-profile
Content-Type: application/json

{
  "url": "https://www.linkedin.com/in/username"
}
```

### Response Format
```json
{
  "success": true,
  "profile": {
    "name": "John Doe",
    "position": "Senior Software Engineer",
    "company": "Tech Corp",
    "industry": "Technology"
  },
  "scoring": {
    "experience": {"score": 35, "details": "8 years experience"},
    "education": {"score": 25, "details": "Master's degree"},
    "industry": {"score": 30, "details": "Technology sector"},
    "total": {"score": 90, "qualification": "excellent"}
  },
  "processing": {
    "duration_ms": 2847,
    "timestamp": "2025-07-05T16:30:00Z"
  }
}
```

## 🔒 Compliance & Security

### Data Privacy
- GDPR-compliant data handling
- No personal data retention beyond demo period
- Transparent processing logs
- Optional data deletion endpoints

### Security Measures
- Rate limiting (10 requests/minute per IP)
- Input validation and sanitization  
- Secure headers (XSS, CSRF protection)
- Database connection encryption
- API key rotation support

### LinkedIn Compliance
- Public profiles only
- Respectful rate limiting (2s delays)
- No bulk scraping or automation
- Educational/demo purpose only
- Clear attribution and usage tracking

## 🎬 Demo Instructions

1. **Start System**: `docker-compose up -d`
2. **Open Interface**: http://localhost:8081
3. **Enter LinkedIn URL**: Public profile URL
4. **View Results**: Real-time scoring and breakdown
5. **Check Monitoring**: Grafana dashboard for metrics
6. **Review Logs**: n8n execution history

## 📈 Performance Benchmarks

- **Processing Time**: 2-5 seconds per profile
- **Throughput**: 10-20 profiles per minute  
- **Success Rate**: >95% for public profiles
- **Memory Usage**: <512MB per container
- **Storage**: ~1KB per profile record

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development stack
docker-compose -f docker-compose.dev.yml up

# Access development interfaces
# n8n: http://localhost:5679
# Database: localhost:5433
# Monitoring: http://localhost:3001
```

### Testing
```bash
# Run integration tests
npm test

# Test specific profile
curl -X POST http://localhost:8081/webhook/analyze-profile \
  -H "Content-Type: application/json" \
  -d '{"url": "https://linkedin.com/in/test-profile"}'
```

## 📚 Documentation

- [System Plan](SYSTEM_PLAN.md) - Detailed architecture and implementation
- [API Documentation](docs/api.md) - Complete API reference
- [Monitoring Guide](docs/monitoring.md) - Grafana setup and metrics
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [n8n](https://n8n.io/) for workflow automation
- [Grafana](https://grafana.com/) for monitoring dashboards
- [Prometheus](https://prometheus.io/) for metrics collection
- [PostgreSQL](https://postgresql.org/) for data storage

---

**⚠️ Disclaimer**: This tool is for educational and demonstration purposes only. Always respect LinkedIn's Terms of Service and rate limits. Only analyze public profiles with appropriate permissions.