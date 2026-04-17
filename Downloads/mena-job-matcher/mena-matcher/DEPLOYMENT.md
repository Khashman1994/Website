# Deployment-Anleitung

## 🚀 Vercel Deployment (Empfohlen)

### 1. Repository vorbereiten

```bash
# Git-Repository initialisieren
git init
git add .
git commit -m "Initial commit: KI Job-Matcher MVP"

# GitHub-Repository erstellen und pushen
gh repo create job-matcher-mvp --public --source=. --remote=origin --push
```

### 2. Vercel-Deployment

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke auf "Import Project"
3. Wähle dein GitHub-Repository
4. Konfiguriere Environment-Variablen:
   - `OPENAI_API_KEY` (erforderlich)
   - `ADZUNA_APP_ID` (optional)
   - `ADZUNA_APP_KEY` (optional)
5. Klicke auf "Deploy"

### 3. Environment-Variablen in Vercel

```
Settings → Environment Variables → Add New
```

- **OPENAI_API_KEY**: `sk-...` (von OpenAI Dashboard)
- **ADZUNA_APP_ID**: (optional, von Adzuna API)
- **ADZUNA_APP_KEY**: (optional, von Adzuna API)

---

## 🐳 Docker Deployment

### 1. Dockerfile erstellen

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### 2. Build & Run

```bash
# Build
docker build -t job-matcher-mvp .

# Run
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e ADZUNA_APP_ID=... \
  -e ADZUNA_APP_KEY=... \
  job-matcher-mvp
```

---

## ☁️ Alternative Deployment-Optionen

### Netlify

1. Installiere Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`

### Railway

1. Gehe zu [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Füge Environment-Variablen hinzu
4. Deploy

### AWS / Azure / GCP

- Nutze Container-Services (ECS, Azure Container Instances, Cloud Run)
- Oder serverless (Lambda, Azure Functions, Cloud Functions)
- Dokumentation siehe jeweilige Plattform

---

## 🔐 Sicherheits-Checkliste vor Deployment

- ✅ API-Keys niemals in Code committen
- ✅ `.env.local` zu `.gitignore` hinzugefügt
- ✅ Environment-Variablen in Deployment-Plattform gesetzt
- ✅ HTTPS aktiviert (automatisch bei Vercel/Netlify)
- ✅ CORS richtig konfiguriert (falls nötig)
- ✅ Rate Limiting für API-Routes (für Production empfohlen)

---

## 📊 Nach dem Deployment

### 1. Domain konfigurieren (optional)

- Vercel: Settings → Domains → Add Domain
- Custom Domain wie `jobmatcher.example.com`

### 2. Analytics einrichten (optional)

```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Monitoring

- Vercel Dashboard für Logs und Metrics
- Sentry für Error Tracking
- Posthog für User Analytics

---

## 🧪 Testing vor Deployment

```bash
# Production Build testen
npm run build
npm start

# Öffne http://localhost:3000
# Teste alle Features:
# - Upload
# - Profil-Erstellung
# - Job-Suche
# - Chat-Assistent
# - Filter
```

---

## 🔄 Updates deployen

```bash
# Code ändern
git add .
git commit -m "Feature: XYZ"
git push

# Vercel deployed automatisch!
```
