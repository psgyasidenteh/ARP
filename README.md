# Prompt-to-Plant

Web-based chemical process flowsheet UI (React + Vite + Tailwind + React Flow) with an AI copilot panel, model palette, data browser, and local persistence.

**Team:** ARP (Adam, Richel, Prince) — Cursor Hackathon.

## Requirements

- Node.js 18+ (includes npm)
- Optional: **Google Gemini** API key for the AI copilot ([Google AI Studio](https://aistudio.google.com/apikey))

## Environment (Gemini)

1. Copy `.env.example` to **`.env.local`** (gitignored).
2. Set `VITE_GEMINI_API_KEY=` to your key.
3. Restart `npm run dev` after changing env vars.

Without a key, the copilot uses **local phrase matching** only (same behavior as before).

**Security:** `VITE_*` variables are embedded in the **browser bundle** — anyone with the built site can extract the key. For production, use a small backend proxy or restrict the key by HTTP referrer / separate project; treat the key as public if you ship static `dist/`. **Rotate** any key that was ever pasted into chat or committed.

## Install & run (development)

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Production build (“package”)

The deployable app is the static output in **`dist/`** after:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

Deploy **`dist/`** to any static host (Netlify, Vercel, S3 + CloudFront, nginx, IIS, etc.). Configure the host to serve `index.html` for client-side routes (SPA fallback) if you add routing later.

### Single downloadable zip

Build and create **`prompt-to-plant-dist.zip`** in the project root (contains the `dist` folder; unzip and upload the inner `dist` contents to your host):

```bash
npm run zip
```

Same as `npm run dist:zip`. The zip file is listed in `.gitignore` so it is not committed by mistake.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Typecheck + optimized production bundle → `dist/` |
| `npm run zip` / `npm run dist:zip` | Build + zip `dist` → `prompt-to-plant-dist.zip` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

## Features (current)

- Ribbon-style layout: data browser, React Flow canvas (dot grid, minimap, controls), equipment palette (drag-and-drop), AI copilot
- **File →** New flowsheet, Export JSON, Import JSON
- Flowsheet auto-saved to **localStorage** (debounced)
- **Gemini** copilot when `VITE_GEMINI_API_KEY` is set (function calling: add equipment, clear flowsheet; otherwise local phrase matching)

**Not implemented:** real process simulation behind “Run Simulation” (placeholder UI only).

## Tech stack

- React 18, Vite 6, TypeScript, Tailwind CSS, React Flow 11, Lucide icons, `clsx`
