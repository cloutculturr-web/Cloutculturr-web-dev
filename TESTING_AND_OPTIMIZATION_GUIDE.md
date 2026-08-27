# Testing and Performance Optimization Guide

## Overview
Complete guide for testing the Admin Dashboard and optimizing performance across frontend and backend.

---

## Part 1: Testing

### Backend Testing Setup

#### 1. Install Test Dependencies
```bash
npm install --save-dev jest @jest/globals supertest @types/jest ts-jest
```

#### 2. Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

#### 3. Run Backend Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- admin.test.ts

# Watch mode
npm test -- --watch
```

### Frontend Testing Setup

#### 1. Install Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitest/ui
```

#### 2. Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/'
      ]
    }
  }
});
```

#### 3. Run Frontend Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch

# UI mode
npm run test -- --ui
```

### Test Categories

#### Unit Tests
```typescript
describe('Unit Tests', () => {
  it('should calculate KPI growth correctly', () => {
    const calculateGrowth = (current: number, previous: number) => {
      return ((current - previous) / previous) * 100;
    };

    const growth = calculateGrowth(125000, 110000);
    expect(growth).toBeCloseTo(13.64, 2);
  });

  it('should format currency correctly', () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    };

    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

#### Integration Tests
```typescript
describe('Integration Tests', () => {
  it('should create and retrieve CMS content', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/admin/cms/content')
      .send({ title: 'Test', content: 'Content' });

    const contentId = createRes.body.data._id;

    // Retrieve
    const getRes = await request(app)
      .get(`/api/admin/cms/content/${contentId}`);

    expect(getRes.body.data.title).toBe('Test');
  });
});
```

#### E2E Tests
```typescript
// For Cypress or Playwright
describe('E2E Tests', () => {
  it('should complete admin workflow', () => {
    cy.visit('/admin/dashboard');
    cy.login('admin@test.com', 'password');

    // View KPIs
    cy.contains('Total Revenue').should('be.visible');

    // Navigate to CMS
    cy.get('[data-testid="nav-cms"]').click();

    // Create content
    cy.get('[data-testid="create-content"]').click();
    cy.get('input[placeholder="Title"]').type('Test');
    cy.get('textarea').type('Content');
    cy.get('button[type="submit"]').click();

    cy.contains('Content created').should('be.visible');
  });
});
```

### Test Coverage Targets

| Component | Target |
|-----------|--------|
| Controllers | 85%+ |
| Services | 90%+ |
| Utilities | 95%+ |
| Frontend Components | 80%+ |
| Overall | 75%+ |

---

## Part 2: Performance Optimization

### Frontend Optimization

#### 1. Code Splitting
```typescript
// Use dynamic imports
const Dashboard = lazy(() => import('./routes/admin/dashboard'));
const CMS = lazy(() => import('./routes/admin/cms'));

<Suspense fallback={<Skeleton />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/cms" element={<CMS />} />
  </Routes>
</Suspense>
```

#### 2. Memoization
```typescript
// Memoize expensive components
const KPICard = memo(({ data }: Props) => {
  return <div>{data.value}</div>;
});

// Memoize computed values
const memoizedKPIs = useMemo(() => {
  return calculateKPIs(data);
}, [data]);

// Memoize callbacks
const handleFilterChange = useCallback((filter) => {
  setFilter(filter);
}, []);
```

#### 3. Image Optimization
```typescript
// Use responsive images
<img
  src="image.webp"
  srcSet="image-small.webp 480w, image-medium.webp 768w"
  sizes="(max-width: 600px) 480px, 768px"
  alt="Description"
  loading="lazy"
/>
```

#### 4. Bundle Size Analysis
```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Check bundle size
npm run build -- --analyze

# Target: Keep main bundle < 200KB (gzipped)
```

#### 5. Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={clients.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {clients[index].name}
    </div>
  )}
</List>
```

### Backend Optimization

#### 1. Database Query Optimization
```typescript
// Add indexes
DashboardKPISnapshotSchema.index({ timestamp: -1 });
RevenueAnalyticsSchema.index({ date: -1 });

// Use lean() for read-only queries
const kpis = await DashboardKPISnapshot.find().lean();

// Selective field retrieval
const clients = await Client.find()
  .select('id name email plan') // Only get needed fields
  .lean();

// Pagination for large datasets
const page = parseInt(req.query.page || '1');
const limit = 50;
const skip = (page - 1) * limit;
const items = await Items.find().skip(skip).limit(limit);
```

#### 2. Caching Strategy
```typescript
import Redis from 'redis';

const redis = Redis.createClient();

// Cache KPI data
const cacheKPIs = async (period: string) => {
  const cacheKey = `kpis:${period}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Calculate if not cached
  const kpis = await calculateKPIs(period);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(kpis));
  
  return kpis;
};
```

#### 3. API Response Compression
```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balance between compression ratio and speed
}));
```

#### 4. Request Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Apply to sensitive routes
app.post('/api/admin/settings', limiter, settingsController.updateSettings);
app.post('/api/admin/reports/generate', limiter, reportsController.generateReport);
```

#### 5. Async Processing
```typescript
// Move heavy operations to background jobs
import Bull from 'bull';

const reportQueue = new Bull('reports');

// Enqueue job
reportQueue.add({
  reportType: 'revenue',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
}, {
  priority: 1,
  attempts: 3
});

// Process in background
reportQueue.process(async (job) => {
  return generateReport(job.data);
});
```

### Network Optimization

#### 1. HTTP/2 Push
```typescript
// Push critical resources
if (res.push) {
  res.push('/css/admin.css', {
    request: { accept: '*/*' }
  });
}
```

#### 2. CDN Integration
```typescript
// Serve static assets from CDN
const cdnUrl = process.env.CDN_URL || '';

app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));
```

#### 3. Prefetching and Preloading
```html
<!-- Prefetch likely next resources -->
<link rel="prefetch" href="/api/admin/dashboard/analytics">
<link rel="preconnect" href="https://api.stripe.com">

<!-- Preload critical resources -->
<link rel="preload" as="script" href="/admin.js">
<link rel="preload" as="style" href="/admin.css">
```

### Monitoring and Metrics

#### 1. Frontend Performance Monitoring
```typescript
// Measure performance
const vitalsCallback = (metric: any) => {
  console.log(metric);
  // Send to analytics service
};

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(vitalsCallback);
getFID(vitalsCallback);
getFCP(vitalsCallback);
getLCP(vitalsCallback);
getTTFB(vitalsCallback);
```

#### 2. Backend Monitoring
```typescript
import prometheus from 'prom-client';

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  buckets: [0.1, 5, 15, 50, 100, 500]
});

// Middleware to track
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequestDuration.observe(Date.now() - start);
  });
  next();
});
```

#### 3. Error Tracking
```typescript
import Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

// Capture errors
Sentry.captureException(error);
```

### Performance Benchmarks

#### Target Metrics

| Metric | Target |
|--------|--------|
| Dashboard Load | < 2s |
| KPI Update | < 500ms |
| Search Response | < 300ms |
| Report Generation | < 5s |
| Page Navigation | < 500ms |
| API Response (avg) | < 200ms |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 100 http://localhost:4000/api/admin/dashboard/kpis

# Load testing with k6
k6 run load-test.js

# Lighthouse CI
npm install -g @lhci/cli@latest
lhci autorun
```

### Optimization Checklist

- [ ] Code splitting implemented
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size < 200KB (gzipped)
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] API response compression enabled
- [ ] Rate limiting configured
- [ ] Background job queue set up
- [ ] CDN configured
- [ ] Performance monitoring active
- [ ] Error tracking enabled
- [ ] Load tests passed
- [ ] Lighthouse score > 80
- [ ] API response times < 200ms
- [ ] Zero critical security issues

---

## File Locations

- Backend Tests: `backend/src/__tests__/admin.test.ts`
- Frontend Tests: `src/__tests__/admin-components.test.tsx`
- This Guide: `TESTING_AND_OPTIMIZATION_GUIDE.md`

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test -- --coverage
      - run: npm run test:e2e
      
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```
