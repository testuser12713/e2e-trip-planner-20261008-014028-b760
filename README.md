# Trip Planner

Der Trip Planner ist eine rein clientseitige Web-App (kein Backend), mit der man
Reisen mit Ziel und Zeitraum anlegt, je Reise einen Tagesplan mit Aktivitäten
(Uhrzeit, Ort, Kosten, Kategorie) pflegt, das Budget je Kategorie als einfaches,
handgebautes Balkendiagramm sieht und eine Packliste abhakt. Alle Daten liegen im
`localStorage` des Browsers; die Navigation läuft über den React Router, Formulare
validieren mit klaren Fehlermeldungen.

## Tech-Stack

- **Sprache**: TypeScript (strict, kein `any`)
- **Framework**: React 19 + Vite
- **Routing**: React Router (`react-router-dom`)
- **State**: React-Bordmittel (Context) + `localStorage` mit versionierten Schlüsseln
- **Styling**: reines CSS mit Design-Tokens (`src/styles/tokens.css`, `src/styles/global.css`), kein CSS-Framework
- **Diagramm**: handgebautes Balkendiagramm aus DOM und CSS, keine Chart-Bibliothek
- **Tests**: Vitest + `@testing-library/react` + `@testing-library/user-event` (jsdom)

## Installation

Voraussetzung: Node.js 20.19+ oder 22.12+.

```bash
npm ci        # reproduzierbare Installation aus package-lock.json
# alternativ, falls kein Lockfile vorhanden ist:
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Vite startet den Dev-Server (standardmäßig unter `http://localhost:5173`) mit
Hot Reload.

## Produktions-Build

```bash
npm run build     # Typecheck (tsc --noEmit) + Vite-Build nach dist/
npm run preview   # gebautes Ergebnis lokal testen
```

Das gebaute Ergebnis liegt in `dist/`. Da die App clientseitiges Routing nutzt,
müssen beim Ausliefern alle Pfade auf `index.html` fallen (SPA-Fallback).

## Tests

```bash
npm test
```

## Benutzung

Die App startet auf der **Reiseliste**. Über „New trip" öffnet sich das Formular
für Name, Ziel, Start- und Enddatum (echte Datumsfelder). Eine gespeicherte Reise
erscheint als Karte; die Detailseite zeigt für jeden Tag des Zeitraums einen
Abschnitt („Itinerary"). In der Kopfzeile sind „Trips" sowie innerhalb einer Reise
„Itinerary", „Budget" und „Packing" erreichbar; der aktuelle Bereich wird markiert.

- **Reisen**: anlegen, umbenennen (Name erscheint sofort überall) und löschen
  (mit Bestätigung; entfernt auch Aktivitäten und Packlisten-Einträge).
- **Tagesplan**: je Tag Aktivitäten mit Titel, Uhrzeit, Ort, Kosten und Kategorie
  anlegen, bearbeiten und löschen; jeder Tag zeigt Anzahl und Tagessumme.
- **Budget**: horizontale Balken je Kategorie, skaliert auf die größte Kategorie,
  plus Gesamtsumme.
- **Packliste**: Einträge anlegen, ab- und wieder abhaken sowie löschen; „x of y
  packed" zählt korrekt mit.
- **Persistenz**: alles übersteht einen Reload des Browsers.

## Funktionsumfang

- Anlegen, Umbenennen und Löschen von Reisen (Löschen mit Bestätigungsdialog)
- Tagesplan mit Aktivitäten je Tag (Zeit, Ort, Kosten, Kategorie)
- Kategorien: Travel, Accommodation, Food, Activities, Shopping, Other
- Budget-Übersicht mit handgebautem Balkendiagramm und Gesamtsumme
- Packliste mit Fortschrittsanzeige und Abhaken
- Einheitliche Euro-Formatierung über `Intl.NumberFormat` (EUR)
- Responsives Layout von 360px bis Desktop
- Nicht-gefunden-Ansicht für unbekannte Routen und Reise-IDs
