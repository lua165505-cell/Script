# ScriptVault X full-platform prototype

This repository contains a safe full-platform prototype for **ScriptVault X**, focused on legitimate Roblox creator workflows rather than exploit distribution or anti-detection tooling.

## Included pieces

- `server.js` – dependency-free Node.js HTTP server with mock auth, script, analytics, settings, and UI builder APIs
- `index.html` – dashboard layout with sidebar, top bar, auth panel, script manager, upload form, UI builder, analytics, and settings
- `styles.css` – responsive dashboard styling and component layout
- `script.js` – client-side state loading, auth flow, script actions, UI builder interactions, filtering, and settings saves
- `package.json` – `npm start` entrypoint

## Demo API routes

- `GET /api/app-state`
- `GET /api/auth/session`
- `POST /api/auth/login`
- `GET /api/scripts`
- `POST /api/scripts`
- `PATCH /api/scripts/:id`
- `GET /api/analytics`
- `GET /api/settings`
- `POST /api/settings`
- `POST /api/ui-builder/components`

## Local preview

```bash
npm start
```

Then visit `http://127.0.0.1:3000`.
