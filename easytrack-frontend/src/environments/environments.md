# 🏭 environment.prod.ts - Complete Guide

## **File Location**

```
src/environments/environment.prod.ts
```

---

##  **What It Should Contain (For Now)**

### **Minimal Version (Sufficient for now):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

**That's it!** Just 3 lines for basic setup.

---

##  **When to Update Each Part**

### **Now (Development Phase):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'  // Keep localhost for now
};
```

**Why?** You can test production builds locally before deploying.

---

### **When You Deploy to Production:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.easytrack.com/api'  // Your real backend URL
};
```

---

##  **Comparison: Dev vs Prod**

### **environment.ts (Development - What you have now)**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**When used:** `ng serve` (local development)

---

### **environment.prod.ts (Production - What you need)**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

**When used:** `ng build` (deploying to server)

---

##  **Complete Production Environment (Advanced)**

When you're ready to deploy, you can expand it:

```typescript
export const environment = {
  // Core settings
  production: true,
  apiUrl: 'https://api.easytrack.com/api',
  
  // Feature flags (disable beta features in production)
  features: {
    newDashboard: true,
    betaFeatures: false,
    exportPDF: true,
    darkMode: true
  },
  
  // Security settings (shorter timeout in production)
  auth: {
    tokenExpiry: 1800000,        // 30 minutes (vs 1 hour in dev)
    refreshTokenExpiry: 604800000 // 7 days
  },
  
  // Logging (disable debug logs in production)
  logging: {
    enableDebugLogs: false,      // No console.log in production
    enableErrorReporting: true,
    errorReportingUrl: 'https://errors.easytrack.com/api/log'
  },
  
  // Analytics (enable in production)
  analytics: {
    enabled: true,
    googleAnalyticsId: 'UA-XXXXX-Y',
    trackPageViews: true,
    trackErrors: true
  },
  
  // Performance
  cache: {
    enabled: true,
    duration: 300000  // 5 minutes
  },
  
  // External services (production keys)
  services: {
    stripePublicKey: 'pk_live_...',  // If using Stripe
    firebaseConfig: {                 // If using Firebase
      apiKey: "prod-api-key",
      authDomain: "easytrack.firebaseapp.com",
      projectId: "easytrack-prod"
    }
  }
};
```

---

##  **Important Security Notes**

### **NEVER Put These in environment.prod.ts:**

```typescript
//  BAD - Don't put secret keys in code
export const environment = {
  production: true,
  databasePassword: 'secret123',        //  NO!
  jwtSecretKey: 'my-secret-key',        //  NO!
  stripeSecretKey: 'sk_live_...',       //  NO!
  apiPrivateKey: '...'                  //  NO!
};
```

**Why?** These files are included in your compiled code and can be seen by anyone!

### ** ONLY Put These:**

```typescript
//  GOOD - Public configuration only
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',     //  OK - Public URL
  stripePublicKey: 'pk_live_...',               //  OK - Public key
  googleMapsApiKey: '...',                      //  OK - Public API key
  appVersion: '1.0.0'                           //  OK - Public info
};
```

---

##  **What You Need RIGHT NOW**

### **Create this file: `src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'
};
```

**That's it!** This is all you need for now.

---

##  **How to Test**

### **1. Create the file:**

```bash
# Create the file
touch src/environments/environment.prod.ts
```

### **2. Add the content:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'
};
```

### **3. Test production build:**

```bash
# Build with production configuration
ng build

# Check if it worked
# The build should complete without errors
```

### **4. Test locally:**

```bash
# Build
ng build

# Serve the production build
npx http-server dist/easytrack-frontend/browser -p 4200

# Open browser to http://localhost:4200
# Check console for: production: true
```

---
 **Both Files Side by Side**

### **Your Project Should Have:**

```
src/environments/
├── environment.ts          ← Development (what you have)
└── environment.prod.ts     ← Production (what you need to create)
```

### **environment.ts (Development):**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### **environment.prod.ts (Production):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'  // Update later when deploying
};
```

---

##  **Deployment Workflow**

### **Step 1: Now (Development)**

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'  // Keep localhost
};
```

### **Step 2: Get a Domain & Deploy Backend**

Example: Deploy backend to `api.easytrack.com`

### **Step 3: Update environment.prod.ts**

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.easytrack.com/api'  // Real URL
};
```

### **Step 4: Build & Deploy Frontend**

```bash
ng build
# Upload dist/easytrack-frontend/browser/ to hosting
```

---

##  **Real-World Example**

### **Typical Setup:**

```
Development:
- Frontend: http://localhost:4200
- Backend:  http://localhost:8080/api

Staging (Optional):
- Frontend: https://dev.easytrack.com
- Backend:  https://dev-api.easytrack.com/api

Production:
- Frontend: https://easytrack.com
- Backend:  https://api.easytrack.com/api
```

### **Your environment.prod.ts when deployed:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.easytrack.com/api'
};
```

---

##  **Quick Start - Copy This Now**

**Create:** `src/environments/environment.prod.ts`

**Content:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'
};
```

**Save and you're done!** You can update the URL later when you deploy.

---

##  **Summary**

| Question | Answer |
|----------|--------|
| **What is it?** | Production configuration file |
| **Where?** | `src/environments/environment.prod.ts` |
| **When used?** | When running `ng build` |
| **What's in it now?** | Same as dev but with `production: true` |
| **What changes later?** | The `apiUrl` to your real domain |
| **Is it required?** | Yes, for production builds |

---

**Just create the file with the minimal content above and you're ready!** 🚀

You can expand it later as your app grows!