# 🚀 EmailForge Production Setup Guide

## 📋 Required API Keys for Production

### 1. Email Deliverability Testing
**Mailtrap API Token** (Required)
- Sign up at: https://mailtrap.io/
- Get API token from Account Settings
- Add to `.env`: `MAILTRAP_API_TOKEN=your_token_here`

### 2. Domain Reputation Services
**SenderScore API Key** (Recommended)
- Sign up at: https://senderscore.org/
- Get API key from developer portal
- Add to `.env`: `SENDERSCORE_API_KEY=your_key_here`

**Spamhaus API Key** (Free tier available)
- Sign up at: https://www.spamhaus.org/
- Get API key from developer portal
- Add to `.env`: `SPAMHAUS_API_KEY=your_key_here`

**Barracuda API Key** (Optional)
- Contact Barracuda for API access
- Add to `.env`: `BARRAKUDA_API_KEY=your_key_here`

**CBL API Key** (Optional)
- Sign up at: https://cbl.abuseat.org/
- Add to `.env`: `CBL_API_KEY=your_key_here`

**DNS Reputation API Key** (Optional)
- Various providers available
- Add to `.env`: `DNS_REPUTATION_API_KEY=your_key_here`

## 💰 Cost Breakdown

### Essential Services (Recommended)
- **Mailtrap**: $15-99/month (100-10,000 emails/month)
- **SenderScore**: $50-200/month
- **Total**: $65-299/month

### Premium Services (Optional)
- **Barracuda**: $100-500/month
- **CBL**: $50-150/month
- **DNS Reputation**: $100-300/month
- **Total**: $250-950/month

## 🔧 Environment Configuration

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your API keys
nano .env
```

Required variables:
```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Security
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key

# Email Deliverability APIs
MAILTRAP_API_TOKEN=your_mailtrap_api_token_here
SENDERSCORE_API_KEY=your_senderscore_api_key_here
SPAMHAUS_API_KEY=your_spamhaus_api_key_here
BARRAKUDA_API_KEY=your_barracuda_api_key_here
CBL_API_KEY=your_cbl_api_key_here
DNS_REPUTATION_API_KEY=your_dns_reputation_api_key_here
```

## 🚀 Deployment Steps

### 1. Set Environment Variables
```bash
# On your production server
export MAILTRAP_API_TOKEN="your_token"
export SENDERSCORE_API_KEY="your_key"
export SPAMHAUS_API_KEY="your_key"
# ... other keys
```

### 2. Restart Application
```bash
npm run build
npm start
```

### 3. Test API Integration
- Navigate to Settings page
- Test deliverability with real email content
- Check domain reputation for your domains

## ✅ What You Get with Real APIs

### Email Deliverability Testing
- ✅ **Real spam scores** from industry-standard algorithms
- ✅ **Actual blacklist status** from multiple databases
- ✅ **Email preview** across different email clients
- ✅ **Client compatibility** testing
- ✅ **Professional recommendations** based on real data

### Domain Reputation Analysis
- ✅ **Real reputation scores** from historical data
- ✅ **Technical factor analysis** (SPF, DKIM, DMARC)
- ✅ **Industry benchmarks** and comparisons
- ✅ **Historical trends** and reputation tracking
- ✅ **Multi-service validation** for accuracy

## 🎯 Production Benefits

1. **Professional Grade**: Enterprise-level email marketing insights
2. **Real-time Data**: Live blacklist and reputation checking
3. **Industry Standards**: Compliance with email marketing best practices
4. **Actionable Insights**: Data-driven recommendations for improvement
5. **Competitive Advantage**: Professional tools that most platforms don't offer

## 🔍 Testing Your Setup

### Test Deliverability
1. Go to Settings → Deliverability Test
2. Enter test email content
3. Click "Test Deliverability"
4. Verify real API response (no more simulation)

### Test Domain Reputation
1. Go to Settings → Domain Reputation Check
2. Enter your domain
3. Click "Check Reputation"
4. Verify real reputation data

## 🚨 Troubleshooting

### Common Issues
- **401 Unauthorized**: Check API key validity
- **Rate Limit Exceeded**: Upgrade API plan or implement caching
- **Service Unavailable**: Check service status pages

### Fallback Behavior
- System will show error messages if APIs are unavailable
- No simulation fallbacks - real data only
- Users get clear feedback about service status

## 📞 Support

For API-specific issues:
- **Mailtrap**: support@mailtrap.io
- **SenderScore**: developer support portal
- **Spamhaus**: support@spamhaus.org

For EmailForge application issues:
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Ensure API keys have proper permissions
