# 🎉 DentHelp Backend - LIVE & READY!

## ✅ System Status: OPERATIONAL

Your microservices backend is **running on Google Cloud (GKE)** and ready for your frontend!

---

## 🌐 API Gateway URL

```
http://34.55.12.229:8080
```

**Use this URL in your frontend configuration!**

---

## 👥 Test Accounts

All accounts use password: **`password123`**

| Role | Email | CNP |
|------|-------|-----|
| **👨‍⚕️ ADMIN (Doctor)** | admin@denthelp.ro | 1850515123456 |
| **🔬 RADIOLOGIST** | radiologist@denthelp.ro | 1750315123456 |
| **👤 PATIENT** | patient@denthelp.ro | 2950101123456 |
| **👤 PATIENT** | test@denthelp.ro | 2850515123789 |

---

## 🏥 Clinic Data

**DentHelp Dental Clinic**
- 📍 Timișoara, Romania
- 📞 0721321111
- ✉️ contact@denthelp.ro
- ⏰ Mon-Sat: 07:00 - 20:00
- 💼 10 Services Available

---

## 🚀 Running Services

| Service | Status | Purpose |
|---------|--------|---------|
| **API Gateway** | ✅ Running | Main entry point (Load Balanced) |
| **Auth Service** | ✅ Running | Login, Register, JWT tokens |
| **Patient Service** | ✅ Running | Clinic info, Patient records |
| **Eureka Server** | ✅ Running | Service discovery |
| **MySQL (x2)** | ✅ Running | Databases (Auth, Patient) |
| **Redis** | ✅ Running | Caching |
| **RabbitMQ** | ⚠️ Running | Messaging (ready but probe issue) |

**Note:** Appointment Service skipped due to cluster resource limits (you can add it later if needed).

---

## 📡 API Endpoints

### **Authentication** (`/auth/*`)

#### Login
```bash
POST http://34.55.12.229:8080/auth/login
Content-Type: application/json

{
  "email": "admin@denthelp.ro",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "cnp": "1850515123456",
    "email": "admin@denthelp.ro",
    "firstName": "Dr. John",
    "lastName": "Smith",
    "role": "ADMIN"
  }
}
```

#### Register
```bash
POST http://34.55.12.229:8080/auth/register
Content-Type: application/json

{
  "cnp": "1234567890123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### **Patient Service** (`/patient/*`)

#### Get Clinic Information
```bash
GET http://34.55.12.229:8080/patient/clinic
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "name": "DentHelp Dental Clinic",
  "addressCity": "Timișoara",
  "phonePRIMARY": "0721321111",
  "email": "contact@denthelp.ro",
  ...
}
```

#### Get Clinic Services
```bash
GET http://34.55.12.229:8080/patient/services
Authorization: Bearer {token}

Response: [
  {
    "id": 1,
    "serviceName": "Consultation and Diagnosis",
    "category": "General",
    "price": 100.00,
    "durationMinutes": 30
  },
  ...
]
```

#### Get Patient Details
```bash
GET http://34.55.12.229:8080/patient/{cnp}
Authorization: Bearer {token}
```

---

## 💻 Frontend Integration

### **React Example**

```javascript
// .env
REACT_APP_API_URL=http://34.55.12.229:8080

// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Add token to requests
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// src/services/authService.js
import API from './api';

export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

// src/services/clinicService.js
import API from './api';

export const getClinicInfo = async () => {
  const response = await API.get('/patient/clinic');
  return response.data;
};

export const getServices = async () => {
  const response = await API.get('/patient/services');
  return response.data;
};
```

### **Vue Example**

```javascript
// .env
VITE_API_URL=http://34.55.12.229:8080

// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### **Angular Example**

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://34.55.12.229:8080'
};

// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/auth/login`, {
      email,
      password
    });
  }
}
```

---

## 🧪 Test Your Backend

### **Quick Test (PowerShell)**

```powershell
# Test health endpoint
curl http://34.55.12.229:8080/actuator/health

# Test login
curl -X POST http://34.55.12.229:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@denthelp.ro","password":"password123"}'

# Test clinic info (replace TOKEN with actual token from login)
curl http://34.55.12.229:8080/patient/clinic `
  -H "Authorization: Bearer TOKEN"
```

### **Quick Test (Browser)**

Open DevTools Console and run:

```javascript
// Test login
fetch('http://34.55.12.229:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@denthelp.ro',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login success:', data);
  window.token = data.token; // Save for next test
});

// Then test clinic info
fetch('http://34.55.12.229:8080/patient/clinic', {
  headers: { 'Authorization': 'Bearer ' + window.token }
})
.then(r => r.json())
.then(data => console.log('Clinic info:', data));
```

---

## 📊 Scalability Features

Your system is **enterprise-ready** with:

- **✅ Horizontal Auto-Scaling**: Services automatically scale 1→3 replicas when CPU/Memory > 70%
- **✅ Load Balancing**: Google Cloud distributes traffic across all replicas
- **✅ Self-Healing**: Failed pods automatically restart within 30 seconds
- **✅ Rolling Updates**: Zero-downtime deployments when updating services
- **✅ Persistent Storage**: MySQL data survives pod restarts

---

## 🔧 Management Commands

```powershell
# Check all pods
kubectl get pods -n dentalhelp

# Check services
kubectl get svc -n dentalhelp

# Check auto-scaling status
kubectl get hpa -n dentalhelp

# View logs
kubectl logs -f deployment/api-gateway -n dentalhelp
kubectl logs -f deployment/auth-service -n dentalhelp
kubectl logs -f deployment/patient-service -n dentalhelp

# Check resource usage
kubectl top nodes
kubectl top pods -n dentalhelp
```

---

## ❗ Important Notes

### **CORS Configuration**

If you get CORS errors from your frontend, you may need to configure CORS in your Spring Boot services. Add this to your frontend proxy or API Gateway:

**Option 1: Frontend Proxy (Development)**
```javascript
// React: package.json
"proxy": "http://34.55.12.229:8080"

// Vue: vite.config.js
server: {
  proxy: {
    '/api': 'http://34.55.12.229:8080'
  }
}
```

**Option 2: API Gateway CORS (if supported)**
Check your Spring Cloud Gateway configuration for CORS settings.

### **Database Passwords**

Current passwords (for development):
- MySQL root: `rootpassword123`
- All test users: `password123`

**⚠️ Change these for production!**

---

## 📈 Next Steps

1. **✅ Start your frontend development**
2. **✅ Test login with test accounts**
3. **✅ Fetch and display clinic information**
4. **✅ Build your UI components**
5. **⏳ Add Appointment Service later** (when you have more resources or optimize)
6. **⏳ Set up custom domain** (optional)
7. **⏳ Enable HTTPS** (for production)

---

## 💰 Cost Info

- **Current**: 4 nodes (e2-medium) = ~$100/month
- **Free**: Using Google Cloud $300 credits (3 months free)
- **Optimization**: Can reduce to 3 nodes or use preemptible nodes

**Stop cluster when not in use:**
```bash
gcloud container clusters resize dentalhelp-cluster --num-nodes=0 --zone=us-central1-a
```

---

## 🎯 Summary

**Your backend is LIVE and ready!** 🚀

- ✅ **API Gateway**: http://34.55.12.229:8080
- ✅ **4 Test Accounts** with clinic data
- ✅ **Auto-scaling** & **Load Balancing**
- ✅ **Self-healing** infrastructure
- ✅ **Persistent databases**

**You can now connect your frontend and start developing!**

---

## 📞 Quick Reference

**API URL**: `http://34.55.12.229:8080`

**Test Login**:
- Email: `admin@denthelp.ro`
- Password: `password123`

**Check Health**: `http://34.55.12.229:8080/actuator/health`

**Good luck with your project! 🎉**
