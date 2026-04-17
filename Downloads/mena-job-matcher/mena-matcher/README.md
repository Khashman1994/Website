# KI Job-Matcher MVP - Produktionsreife SaaS-Plattform

## 🚀 Projektübersicht

Eine sichere, produktionsreife Job-Matching-Plattform mit KI-gestützter Profilerstellung und intelligenter Job-Suche.

## 📁 Projektstruktur

```
job-matcher-mvp/
├── app/
│   ├── page.tsx                    # Landing Page mit Upload
│   ├── dashboard/
│   │   └── page.tsx                # Profile Dashboard & Job Results
│   ├── api/
│   │   ├── extract-profile/
│   │   │   └── route.ts            # OpenAI Profil-Extraktion (Server)
│   │   ├── match-jobs/
│   │   │   └── route.ts            # Job-Matching mit KI (Server)
│   │   └── chat/
│   │       └── route.ts            # Profile Chat Assistant (Server)
│   ├── layout.tsx                  # Root Layout
│   └── globals.css                 # Global Styles
├── components/
│   ├── landing/
│   │   ├── Hero.tsx                # Hero Section
│   │   └── FileUpload.tsx          # Drag & Drop Upload
│   ├── dashboard/
│   │   ├── ProfileCard.tsx         # Profil-Anzeige
│   │   ├── JobCard.tsx             # Job-Ergebnis Karte
│   │   ├── ChatAssistant.tsx       # Chat-Interface
│   │   └── FilterPanel.tsx         # Such-Filter
│   └── ui/
│       ├── Button.tsx              # Shared Button
│       ├── Card.tsx                # Shared Card
│       └── MatchRing.tsx           # Match-Score Visualisierung
├── lib/
│   ├── openai.ts                   # OpenAI Client
│   ├── job-api.ts                  # Adzuna API Client
│   ├── mock-data.ts                # Fallback Mock-Daten
│   └── types.ts                    # TypeScript Typen
├── .env.local.example              # Beispiel für Environment-Variablen
└── package.json
```

## 🔐 Sicherheits-Architektur

**KRITISCH**: Alle API-Aufrufe laufen ausschließlich über sichere Server-Routen:
- ✅ OpenAI API-Aufrufe nur im Backend
- ✅ Adzuna API-Aufrufe nur im Backend
- ✅ API-Keys niemals im Client-Code
- ✅ Alle sensiblen Operationen in `/app/api/*` Routes

## 🛠️ Installation & Setup

### 1. Projekt initialisieren

```bash
npx create-next-app@latest job-matcher-mvp --typescript --tailwind --app
cd job-matcher-mvp
```

### 2. Dependencies installieren

```bash
npm install openai pdf-parse lucide-react framer-motion
npm install -D @types/node
```

### 3. Environment-Variablen konfigurieren

Erstelle `.env.local`:

```env
# OpenAI (erforderlich für KI-Funktionen)
OPENAI_API_KEY=sk-...

# Adzuna Job API (optional - nutzt Mock-Daten als Fallback)
ADZUNA_APP_ID=deine-app-id
ADZUNA_APP_KEY=dein-app-key
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 🎯 Features

### Phase 1: Landing & Upload
- ✅ Modernes Hero-Design mit Call-to-Action
- ✅ Drag & Drop PDF/TXT Upload
- ✅ Client-seitige PDF-Extraktion (pdf.js)
- ✅ Sichere Datenübertragung an Backend

### Phase 2: KI-Profil
- ✅ OpenAI-basierte Profil-Extraktion (JSON)
- ✅ Profile Dashboard mit strukturierten Daten
- ✅ Chat Assistant zur Profilverfeinerung
- ✅ Filter-Panel (Branche, Ort, Remote, etc.)

### Phase 3: Job-Matching
- ✅ Adzuna API-Integration (mit Mock-Fallback)
- ✅ KI-basiertes Matching pro Job
- ✅ Sortierung nach Match-Score
- ✅ Detaillierte Job-Insights:
  - Key Matches (warum es passt)
  - Missing Skills (was fehlt)
  - Actionable Insight (Bewerbungs-Tipp)

## 🎨 Design-System

- **Farbpalette**: Warme, vertrauenserweckende Töne
- **Typografie**: Charaktervolle Display-Fonts
- **Animationen**: Subtile Micro-Interactions
- **Layout**: Luftig, professionell, modern

## 🚢 Deployment

### Vercel (empfohlen)

```bash
npm install -g vercel
vercel
```

Füge Environment-Variablen in den Vercel-Projekteinstellungen hinzu.

### Alternative: Docker

```bash
docker build -t job-matcher .
docker run -p 3000:3000 --env-file .env.local job-matcher
```

## 📝 Lizenz

MIT
