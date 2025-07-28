# Easy Eddy - Vercel Deployment Guide

## Architecture Overview

Easy Eddy has been restructured for Vercel deployment using their recommended architecture:

### Frontend (Static)
- **React SPA** built with Vite
- **Static files** served from CDN
- **Build output**: `dist/` directory
- **Routing**: Client-side routing with Wouter

### Backend (Serverless Functions)
- **API Functions** in `/api` directory
- **Node.js runtime** (18.x)
- **Database**: PostgreSQL via Neon serverless
- **Authentication**: Session-based with database storage

## API Endpoints

All API endpoints are now serverless functions:

### Core Functions
- `GET /api/health` - Health check
- `POST /api/signup` - User registration
- `POST /api/signin` - User authentication

### Job Management
- `POST /api/job-search` - Trigger job search automation
- `GET /api/job-criteria?userId=X` - Get user job criteria
- `POST /api/job-criteria` - Create job criteria
- `PUT /api/job-criteria?id=X` - Update job criteria
- `GET /api/applications?userId=X` - Get user applications

### File Management
- `POST /api/upload-cv` - CV upload with formidable

### Payment Processing
- `POST /api/stripe/create-checkout` - Stripe checkout session

## Environment Variables

Required for Vercel deployment:

```bash
# Database
DATABASE_URL=postgresql://...

# OpenAI (for CV processing)
OPENAI_API_KEY=sk-...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...

# PostgreSQL (auto-provided by Neon)
PGDATABASE=...
PGHOST=...
PGPASSWORD=...
PGPORT=...
PGUSER=...
```

## Deployment Steps

1. **Connect Repository**
   ```bash
   # Push to GitHub/GitLab
   git add .
   git commit -m "Vercel serverless architecture"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect repo at https://vercel.com/new
   - Auto-detects Vite framework
   - Uses `vercel.json` configuration

3. **Configure Environment**
   - Add all environment variables in Vercel dashboard
   - Database URL from Neon
   - Stripe keys from dashboard

4. **Database Setup**
   ```bash
   # Run migrations after deployment
   npm run db:push
   ```

## Key Benefits

### Performance
- **Static frontend**: Fast CDN delivery
- **Serverless functions**: Auto-scaling, zero cold starts for common requests
- **Database**: Connection pooling with Neon serverless

### Cost Efficiency
- **Vercel Free Tier**: 100GB bandwidth, 1000 serverless invocations
- **Neon Free Tier**: 512MB database
- **Total Cost**: $0-15/month for small scale

### Scalability
- **Automatic scaling**: Functions scale to zero when not used
- **Global CDN**: Static assets served globally
- **Database**: Serverless PostgreSQL scales automatically

## Architecture Changes

### From Express Server
```javascript
// OLD: Single Express server
app.listen(5000)
```

### To Serverless Functions
```javascript
// NEW: Individual API functions
export default function handler(req, res) {
  // Handle specific endpoint
}
```

### Frontend Requests
```javascript
// API calls now go to /api/* endpoints
await apiRequest('POST', '/api/signup', userData)
await apiRequest('GET', '/api/applications?userId=123')
```

## Production Features Maintained

- ✅ Real job search across 40+ platforms
- ✅ CV processing with PDF parsing
- ✅ Word matching algorithm (70% threshold)
- ✅ Stripe payment integration
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Mobile-responsive PWA
- ✅ Professional UI with shadcn/ui

## Development vs Production

### Development (Replit)
- Express server for API
- Vite dev server for frontend
- Single process, hot reloading

### Production (Vercel)
- Static frontend on CDN
- Serverless functions for API
- Separate scaling, global distribution

This architecture provides better performance, lower costs, and infinite scalability while maintaining all core functionality.