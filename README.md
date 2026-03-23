# ScriptVault full-stack prototype

This repository contains a safe full-stack prototype for **ScriptVault**, positioned as a secure Roblox module delivery platform for legitimate creator workflows.

## Included pieces

- `server.js` – dependency-free Node.js HTTP server for static files and demo JSON APIs
- `index.html` – landing page and control center UI
- `styles.css` – responsive styling for all sections and cards
- `script.js` – API-driven rendering, waitlist submission, and mobile navigation
- `package.json` – start script for the backend server

## API routes

- `GET /api/dashboard` – returns metrics, releases, modules, audit feed, and integrations
- `GET /api/waitlist` – returns the current in-memory waitlist count
- `POST /api/waitlist` – accepts `email`, `teamSize`, and `useCase`

## Local preview

```bash
npm start
```

Then visit `http://127.0.0.1:3000`.
