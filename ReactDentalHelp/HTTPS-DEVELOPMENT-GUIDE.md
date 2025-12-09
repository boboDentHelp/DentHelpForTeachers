# HTTPS Development Setup for React + Vite

## Quick Start (5 minutes)

### Step 1: Generate SSL Certificates

**Windows (PowerShell):**
```powershell
cd ReactDentalHelp
.\generate-ssl-cert.ps1
```

**Mac/Linux or Git Bash:**
```bash
cd ReactDentalHelp
./generate-ssl-cert.sh
```

**What this does:**
- Creates `localhost.pem` (certificate)
- Creates `localhost-key.pem` (private key)
- Valid for 365 days

---

### Step 2: Start Development Server

```bash
npm run dev
```

**You'll see:**
```
VITE v7.2.2  ready in 523 ms

➜  Local:   https://localhost:5173/
➜  Network: https://192.168.1.x:5173/
➜  press h + enter to show help
```

**Note the HTTPS!** ✅

---

### Step 3: Accept the Security Warning

1. Open browser to `https://localhost:5173`
2. You'll see: **"Your connection is not private"** or **"Warning: Potential Security Risk"**
3. **This is normal!** It's a self-signed certificate
4. Click **"Advanced"**
5. Click **"Proceed to localhost"** or **"Accept the Risk and Continue"**

**Why the warning?**
- Self-signed certificates aren't trusted by browsers by default
- Totally normal for local development
- Production certificates (like Let's Encrypt) don't have this issue

---

## What Changed

### Before (HTTP):
```
Dev Server: http://localhost:5173
Backend API: https://dentalhelp.34.55.12.229.nip.io

❌ Mixed content (HTTP frontend, HTTPS backend)
⚠️  Not ideal for development
```

### After (HTTPS):
```
Dev Server: https://localhost:5173
Backend API: https://dentalhelp.34.55.12.229.nip.io

✅ Both HTTPS
✅ Closer to production
✅ No mixed content issues
```

---

## Update API URLs

### Find your API configuration:

```bash
# Search for API URLs in your code
grep -r "http://34.55.12.229" src/
# Or search for old API base URL
```

### Update to HTTPS:

```javascript
// Before:
const API_BASE_URL = "http://34.55.12.229:8080";

// After:
const API_BASE_URL = "https://dentalhelp.34.55.12.229.nip.io";
```

**Common locations:**
- `src/config.js`
- `src/services/api.js`
- `src/utils/axios.js`
- `.env.development`

---

## Update Backend CORS

Your backend needs to allow HTTPS localhost:

```powershell
# Edit the HTTPS ingress file
cd ../deployment/kubernetes/https-setup

# Open: 01-https-ingress-dentalhelp.yaml
# Find this line:
nginx.ingress.kubernetes.io/cors-allow-origin: "*"

# Change to:
nginx.ingress.kubernetes.io/cors-allow-origin: "https://localhost:5173,http://localhost:5173"

# Apply changes:
kubectl apply -f 01-https-ingress-dentalhelp.yaml
```

**Why both HTTP and HTTPS?**
- In case you want to switch back temporarily
- Doesn't hurt to have both

---

## Troubleshooting

### Issue: "Cannot find module 'fs'"

**Vite 5+:** Module `fs` is built-in, this shouldn't happen.

**If it does:**
```javascript
// vite.config.js - alternative approach
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Uses built-in SSL generation
  ],
})
```

Install plugin:
```bash
npm install @vitejs/plugin-basic-ssl --save-dev
```

---

### Issue: Certificate files not found

**Error:**
```
Error: ENOENT: no such file or directory, open 'localhost.pem'
```

**Solution:**
```bash
# Make sure you're in ReactDentalHelp directory
cd ReactDentalHelp

# Run the certificate generation script
./generate-ssl-cert.sh
# or
.\generate-ssl-cert.ps1

# Verify files were created
ls -la localhost*.pem
```

---

### Issue: Browser keeps showing warning

**This is normal!** Self-signed certificates always show warnings.

**Options:**

1. **Accept each time** (simplest)
   - Just click "Proceed to localhost"

2. **Trust the certificate** (one-time setup)

   **Mac:**
   ```bash
   sudo security add-trusted-cert -d -r trustRoot \
     -k /Library/Keychains/System.keychain localhost.pem
   ```

   **Windows:**
   - Double-click `localhost.pem`
   - Click "Install Certificate"
   - Store Location: "Local Machine"
   - Place in: "Trusted Root Certification Authorities"

   **Linux:**
   ```bash
   sudo cp localhost.pem /usr/local/share/ca-certificates/localhost.crt
   sudo update-ca-certificates
   ```

3. **Use Chrome flag** (not recommended)
   - Chrome: `chrome://flags/#allow-insecure-localhost`
   - Enable "Allow invalid certificates for resources loaded from localhost"

---

### Issue: CORS errors

**Error in browser console:**
```
Access to XMLHttpRequest at 'https://dentalhelp...' from origin 'https://localhost:5173'
has been blocked by CORS policy
```

**Solution:**

Update backend CORS configuration:
```yaml
# In: deployment/kubernetes/https-setup/01-https-ingress-dentalhelp.yaml
nginx.ingress.kubernetes.io/cors-allow-origin: "https://localhost:5173"
```

Then apply:
```bash
kubectl apply -f deployment/kubernetes/https-setup/01-https-ingress-dentalhelp.yaml
```

---

### Issue: "Module not found: Can't resolve 'fs'"

Vite should handle this automatically, but if you see this error:

**Option 1: Use the basic-ssl plugin (recommended)**
```bash
npm install @vitejs/plugin-basic-ssl --save-dev
```

```javascript
// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
})
```

**Option 2: Use mkcert (better certificates)**
```bash
# Install mkcert
# Mac:
brew install mkcert
# Windows (with Chocolatey):
choco install mkcert

# Generate certificates
mkcert -install
mkcert localhost
# Creates: localhost.pem and localhost-key.pem
```

---

## Testing HTTPS Works

### Test 1: Dev server loads
```bash
npm run dev
# Should show: https://localhost:5173
```

### Test 2: Can call API
```javascript
// Browser console (on https://localhost:5173)
fetch('https://dentalhelp.34.55.12.229.nip.io/actuator/health')
  .then(r => r.json())
  .then(data => console.log(data))

// Should print: {status: "UP"}
```

### Test 3: Login works
- Go to your login page
- Try logging in
- Open DevTools → Network tab
- Should see requests to `https://dentalhelp...`
- Should see green padlock 🔒

---

## Development Workflow

### Daily Development:

```bash
cd ReactDentalHelp

# Start HTTPS dev server
npm run dev

# Opens: https://localhost:5173
# Backend: https://dentalhelp.34.55.12.229.nip.io
```

**First time each day:**
- Browser shows security warning
- Click "Proceed to localhost"
- That's it!

---

## Certificate Renewal

**Your certificate is valid for 365 days.**

**When it expires:**
```bash
# Just regenerate
./generate-ssl-cert.sh
# or
.\generate-ssl-cert.ps1

# Restart dev server
npm run dev
```

**Check expiry:**
```bash
openssl x509 -in localhost.pem -noout -enddate
# Prints: notAfter=Nov 29 2026
```

---

## Alternative: Use @vitejs/plugin-basic-ssl

**Simpler option (no manual certificate generation):**

```bash
npm install @vitejs/plugin-basic-ssl --save-dev
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Auto-generates certificates
  ],
})
```

**Pros:**
- Automatic certificate generation
- No manual steps
- Simpler

**Cons:**
- Less control
- Still shows browser warning

---

## Switching Back to HTTP

**If you need to switch back:**

```javascript
// vite.config.js - comment out HTTPS section
export default defineConfig({
  // ... plugins ...
  server: {
    // https: { ... },  // Commented out
    port: 5173,
  },
})
```

Or delete the server section entirely.

---

## Production Deployment

**For production, don't use self-signed certificates!**

**Options:**

1. **Netlify/Vercel** (easiest)
   - FREE automatic HTTPS
   - Just deploy: `netlify deploy --prod`

2. **GKE with Let's Encrypt** (what backend uses)
   - Follow same pattern as backend
   - Use NGINX Ingress + cert-manager

3. **Cloud CDN** (Google/Cloudflare)
   - Host on Cloud Storage
   - Add HTTPS load balancer

---

## Summary

**What you did:**
1. ✅ Generated self-signed SSL certificates
2. ✅ Updated Vite config to use HTTPS
3. ✅ Added certificates to .gitignore

**What you get:**
- ✅ HTTPS dev server (https://localhost:5173)
- ✅ Closer to production environment
- ✅ No mixed content issues
- ✅ More realistic development

**Trade-off:**
- ⚠️ Browser security warning (click "Proceed")
- One-time setup per developer
- Certificate renewal every 365 days

**Worth it?** Absolutely! Especially since your backend is HTTPS.

---

## Next Steps

1. Generate certificates: `./generate-ssl-cert.sh`
2. Start dev server: `npm run dev`
3. Accept browser warning
4. Update API URLs to use HTTPS backend
5. Update backend CORS to allow `https://localhost:5173`
6. Start developing! 🚀

---

**Your development environment now matches production - both using HTTPS!** 🔒✨
