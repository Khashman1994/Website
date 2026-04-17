# ⚡ QUICK START - In 5 Minuten live!

## 🎯 Schritt 1: Projekt einrichten

```bash
# Navigiere in das Projekt-Verzeichnis
cd job-matcher-mvp

# Installiere Dependencies
npm install

# Erstelle .env.local-Datei
cp .env.local.example .env.local
```

## 🔑 Schritt 2: API-Keys eintragen

Öffne `.env.local` und füge ein:

```env
OPENAI_API_KEY=sk-proj-DEIN-KEY-HIER

# Optional (wenn nicht gesetzt, werden Mock-Daten verwendet):
ADZUNA_APP_ID=deine-app-id
ADZUNA_APP_KEY=dein-app-key
```

### OpenAI API-Key erhalten:
1. Gehe zu [platform.openai.com](https://platform.openai.com)
2. Erstelle einen Account (falls noch nicht vorhanden)
3. Gehe zu API Keys → Create new secret key
4. Kopiere den Key (beginnt mit `sk-proj-...`)

### Adzuna API-Keys (optional):
1. Gehe zu [developer.adzuna.com](https://developer.adzuna.com)
2. Registriere dich kostenlos
3. Erstelle eine App
4. Kopiere App ID und App Key

> **Wichtig:** Ohne Adzuna-Keys verwendet die App automatisch Mock-Daten aus 10+ Branchen!

## 🚀 Schritt 3: App starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser!

## ✅ Schritt 4: Testen

1. **Landing Page**: Sollte Hero-Section mit Upload zeigen
2. **Upload testen**: 
   - Erstelle eine test.txt-Datei mit Lebenslauf-Text
   - Oder nutze eine echte PDF
3. **Dashboard**: Nach Upload solltest du weitergeleitet werden
4. **Job-Suche**: Klicke auf "Jobs suchen"
5. **Ergebnisse**: Match-Scores und Insights sollten erscheinen

## 📋 Test-Lebenslauf

Erstelle eine `test.txt` mit folgendem Inhalt:

```
Max Mustermann
max@example.com
+49 123 456789
Berlin, Deutschland

BERUFSERFAHRUNG
Senior Full-Stack Developer bei TechCorp (2020-2024)
- Entwicklung von React/Next.js Anwendungen
- Backend mit Node.js und TypeScript
- Team-Lead für 5 Entwickler

Junior Developer bei StartUp GmbH (2018-2020)
- JavaScript, React, MongoDB

SKILLS
JavaScript, TypeScript, React, Next.js, Node.js, Python, SQL, Git

AUSBILDUNG
Bachelor Informatik, TU München (2014-2018)

SPRACHEN
Deutsch (Muttersprache), Englisch (Fließend)
```

## 🐛 Troubleshooting

### "OpenAI API Key nicht konfiguriert"
- Überprüfe, ob `.env.local` existiert
- Stelle sicher, dass `OPENAI_API_KEY=sk-...` korrekt ist
- Starte Dev-Server neu: Strg+C, dann `npm run dev`

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript-Fehler
```bash
npm run build
```
Falls Build erfolgreich ist, ignoriere Editor-Warnungen.

### Port 3000 bereits belegt
```bash
# Starte auf anderem Port
PORT=3001 npm run dev
```

## 🎨 Anpassungen

### Farben ändern
Bearbeite `app/globals.css` → CSS-Variablen unter `:root`

### Texte ändern
- Landing Page: `app/page.tsx`
- Dashboard: `app/dashboard/page.tsx`

### Mock-Daten erweitern
Bearbeite `lib/mock-data.ts`

## 📦 Production Build

```bash
# Build erstellen
npm run build

# Production-Server starten
npm start
```

Öffne [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

Siehe `DEPLOYMENT.md` für detaillierte Anleitung zu:
- Vercel (1-Click)
- Docker
- Netlify
- Railway

## 🆘 Support

Bei Problemen:
1. Überprüfe Console-Logs im Browser (F12)
2. Überprüfe Terminal-Ausgabe
3. Stelle sicher, dass alle Environment-Variablen gesetzt sind
4. Prüfe, ob OpenAI-API-Key gültig ist und Guthaben hat

## 🎉 Fertig!

Deine Job-Matching-Plattform ist jetzt live und bereit für Nutzer!

**Nächste Schritte:**
- [ ] OpenAI API-Key hinzufügen
- [ ] Ersten Test-Upload durchführen
- [ ] Job-Matching ausprobieren
- [ ] Optional: Adzuna-Keys hinzufügen
- [ ] Deployment vorbereiten
