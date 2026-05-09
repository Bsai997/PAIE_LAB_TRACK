# 🚀 Deployment Guide

Complete guide for deploying the Student Engagement Platform to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema created in Supabase
- [ ] Test data created for verification
- [ ] All npm dependencies installed
- [ ] Frontend built successfully
- [ ] Backend tested locally
- [ ] No console errors
- [ ] CORS configured for production URLs
- [ ] JWT_SECRET is strong and random

---

## Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign in / Create account
3. Create new project
4. Choose region closest to users
5. Set a strong database password

### Step 2: Create Database Tables
1. Open SQL Editor
2. Copy entire schema from DATABASE_SCHEMA.md
3. Paste into SQL Editor
4. Click "Run"
5. Verify all tables created

### Step 3: Create Test Data (Optional)
```sql
-- Insert test admin
INSERT INTO Users (regdid, name, email, password_hash, role, department)
VALUES ('ADM001', 'Test Admin', 'admin@test.com', '$2b$10$...', 'admin', 'CSE');

-- Insert test students
INSERT INTO Users (regdid, name, email, password_hash, role, department)
VALUES 
('STU001', 'Student One', 'student1@test.com', '$2b$10$...', 'student', 'CSE'),
('STU002', 'Student Two', 'student2@test.com', '$2b$10$...', 'student', 'IT');
```

### Step 4: Get Credentials
1. Go to Project Settings → API
2. Copy Project URL (SUPABASE_URL)
3. Copy Service Role Key (SUPABASE_KEY)
4. Keep these safe!

---

## Part 2: Backend Deployment

### Option A: Deploy to Render

#### Step 1: Prepare Backend
```bash
cd backend
npm install
npm run build  # If applicable
```

#### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service

#### Step 3: Connect GitHub
1. Select your repository
2. Choose backend folder as root
3. Set environment variables:
   ```
   PORT=10000
   SUPABASE_URL=your-url
   SUPABASE_KEY=your-key
   JWT_SECRET=random-string-32-chars-long
   NODE_ENV=production
   ```

#### Step 4: Deploy
1. Click "Create Web Service"
2. Render automatically deploys on every push
3. Get your backend URL (e.g., https://yourapp.onrender.com)

### Option B: Deploy to Heroku

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### Step 2: Create Heroku App
```bash
cd backend
heroku create your-app-name
```

#### Step 3: Set Environment Variables
```bash
heroku config:set SUPABASE_URL="your-url"
heroku config:set SUPABASE_KEY="your-key"
heroku config:set JWT_SECRET="random-secret"
heroku config:set NODE_ENV="production"
```

#### Step 4: Deploy
```bash
git push heroku main
```

### Option C: Deploy to AWS

#### Step 1: Create EC2 Instance
1. Launch Ubuntu 20.04 LTS instance
2. Allow inbound on port 5000

#### Step 2: Setup Server
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd backend
npm install
```

#### Step 3: Create .env
```bash
nano .env
# Add your credentials
```

#### Step 4: Setup PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 start src/index.js --name "engagement-api"
pm2 startup
pm2 save
```

---

## Part 3: Frontend Deployment

### Option A: Deploy to Vercel

#### Step 1: Build Frontend
```bash
cd frontend
npm run build
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Import your Git repository
3. Select frontend folder as root

#### Step 3: Set Environment Variables
1. Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url
   ```

#### Step 4: Deploy
1. Click "Deploy"
2. Vercel automatically deploys on every push

### Option B: Deploy to Netlify

#### Step 1: Build Frontend
```bash
cd frontend
npm run build
```

#### Step 2: Connect to Netlify
1. Go to https://netlify.com
2. Drag & drop `dist` folder OR
3. Connect Git repository

#### Step 3: Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

#### Step 4: Environment Variables
1. Site settings → Build & deploy → Environment
2. Add VITE_API_URL

#### Step 5: Deploy
1. Click "Deploy site"

### Option C: Deploy to GitHub Pages

#### Step 1: Update vite.config.js
```javascript
export default {
  base: '/repository-name/',  // Your repo name
  // ...other config
}
```

#### Step 2: Build
```bash
npm run build
```

#### Step 3: Deploy
```bash
npm install -g gh-pages
gh-pages -d dist
```

---

## Part 4: Post-Deployment Configuration

### Update Backend URL in Frontend

**If using Vercel:**
```javascript
// frontend/.env.production
VITE_API_URL=https://your-backend-url.onrender.com
```

**If using Netlify:**
```javascript
// Update netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"
  status = 200
```

### Update CORS in Backend

**backend/src/index.js:**
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

### Setup Domain Name

#### For Frontend
1. Buy domain from GoDaddy, Namecheap, etc.
2. Update DNS to point to Vercel/Netlify

#### For Backend
1. Get custom domain feature
2. Update CORS_ORIGIN environment variable

---

## Part 5: Monitoring & Maintenance

### Setup Monitoring

**For Render:**
- Built-in monitoring dashboard
- Email alerts for crashes

**For Heroku:**
- Heroku Metrics
- Papertrail for logs

**For AWS:**
- CloudWatch
- Set up alarms

### View Logs

**Render:**
```bash
# In dashboard or
curl https://api.render.com/v1/services/your-service/logs
```

**Heroku:**
```bash
heroku logs --tail
```

**AWS EC2:**
```bash
pm2 logs
```

### Database Backups

**Supabase:**
1. Project Settings → Backups
2. Set automatic backups
3. Download point-in-time backups

### SSL/HTTPS

- Render: Automatic
- Heroku: Automatic
- Netlify: Automatic
- Vercel: Automatic
- AWS: Use AWS Certificate Manager

---

## Part 6: Performance Optimization

### Frontend

**Optimize Images**
```bash
npm install -D vite-plugin-imagemin
```

**Enable Compression**
```javascript
// vite.config.js
import compression from 'vite-plugin-compression';

export default {
  plugins: [compression()]
}
```

**Lazy Load Routes**
```javascript
// App.jsx
const StudentDashboard = React.lazy(() => import('./pages/student/Dashboard'));
```

### Backend

**Add Caching**
```javascript
npm install redis
```

**Use Connection Pooling**
- Built-in with Supabase

**Compress Responses**
```javascript
npm install compression
app.use(compression());
```

**Rate Limiting**
```javascript
npm install express-rate-limit
```

---

## Part 7: Security Checklist

### Environment Variables
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Never commit .env files
- [ ] Use different secrets for prod/dev
- [ ] Rotate secrets periodically

### CORS & HTTPS
- [ ] CORS configured for allowed origins only
- [ ] HTTPS enabled on all endpoints
- [ ] Security headers set

### Database Security
- [ ] Row-level security (RLS) enabled
- [ ] Strong database password
- [ ] Regular backups
- [ ] Access limited to backend only

### Authentication
- [ ] JWT expiration set (8 hours recommended)
- [ ] Password hashing with bcrypt
- [ ] Rate limiting on login
- [ ] HTTPS for all auth endpoints

### API Security
- [ ] CORS headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Supabase SDK)
- [ ] Rate limiting
- [ ] API key rotation

### Deployment Security
- [ ] Environment variables secure
- [ ] No sensitive data in logs
- [ ] Regular dependency updates
- [ ] Monitor for vulnerabilities

---

## Part 8: Troubleshooting Deployment Issues

### Backend Won't Start
```bash
# Check logs
heroku logs --tail
# OR for Render
# Check dashboard

# Verify environment variables
heroku config
```

### CORS Errors
- Update CORS in backend/src/index.js
- Redeploy backend
- Clear frontend cache

### Database Connection Failed
- Verify SUPABASE_URL in .env
- Check Supabase project is active
- Verify network connectivity

### Frontend Blank Page
- Check browser console (F12)
- Check API calls in Network tab
- Verify VITE_API_URL is set
- Clear browser cache

### Slow Performance
- Check database queries
- Enable caching
- Optimize images
- Use CDN for static files

---

## Part 9: Scaling Considerations

### Phase 1: Initial Launch
- Single backend instance
- Supabase auto-scaling
- Vercel/Netlify free tier

### Phase 2: Growth
- Add load balancer (AWS ELB)
- Redis caching layer
- Database read replicas

### Phase 3: Large Scale
- Kubernetes (Docker containers)
- Multiple backend instances
- Message queue (RabbitMQ)
- Analytics warehouse

---

## Part 10: Ongoing Maintenance

### Weekly
- [ ] Check logs for errors
- [ ] Monitor database size
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Backup database
- [ ] Performance analysis

### Quarterly
- [ ] Security audit
- [ ] Database optimization
- [ ] Plan new features
- [ ] Review costs

### Annually
- [ ] Full security audit
- [ ] Architecture review
- [ ] Scaling evaluation
- [ ] Disaster recovery test

---

## Example Production URLs

```
Frontend: https://engagement-platform.com
Backend API: https://api.engagement-platform.com
Supabase: https://project.supabase.co

Login: https://engagement-platform.com/login
Student Dashboard: https://engagement-platform.com/student
Admin Dashboard: https://engagement-platform.com/admin
Super Admin: https://engagement-platform.com/superadmin
```

---

## Quick Deployment Checklist

```bash
# Backend Deployment
cd backend
npm install
npm run build  # if applicable
# Deploy to Render/Heroku/AWS
# Set environment variables
# Test API endpoints

# Frontend Deployment
cd frontend
npm install
npm run build
# Deploy to Vercel/Netlify/GitHub Pages
# Set API URL
# Test all pages
# Verify login flow

# Final Testing
# Test all user roles
# Test all features
# Check performance
# Monitor logs
```

---

**Deployment is complete when:**
1. ✅ All pages load without errors
2. ✅ Login works with correct credentials
3. ✅ All API endpoints respond
4. ✅ Charts and data display correctly
5. ✅ Role-based access works
6. ✅ No CORS errors
7. ✅ Database is connected
8. ✅ Monitoring is active

---

**Questions? Check the documentation or reach out to the development team.**
