# Airbnb Kirenga Frontend

Complete React + TypeScript frontend for Assignments 1–5. It connects to your deployed backend by default.

## Backend used

`https://airbnb-kirenga-final.onrender.com/api/v1`

## What is included

- Assignment 1: feature-based listings, cards, search, saved state, clsx, date-fns, react-icons, numeral.
- Assignment 2: Context + reducer store, hooks, toast, framer-motion, Headless UI transition, lodash debounce, CSS Modules.
- Assignment 3: React Router, auth, protected dashboard, detail page, lazy loading, NProgress, react-window virtualization, RESET action.
- Assignment 4: Axios instance, TanStack Query, query devtools, single listing query, optimistic saved hook, Zod + react-hook-form 4-step booking flow.
- Assignment 5: SRS-inspired polish: directory template-style UI, responsive design, Render-ready environment, graceful backend fallback data, README guide.

## Run step by step

1. Unzip the folder.
2. Open terminal inside the folder.
3. Install packages:

```bash
npm install
```

4. Create `.env`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
copy .env.example .env
```

5. Start:

```bash
npm run dev
```

6. Open the Vite URL, usually `http://localhost:5173`.

7. Test login:

```text
Email: sam@gmail.com
Password: 12345678
```

8. Test build:

```bash
npm run build
```

## Important

- The app calls `/listings`, `/listings/:id`, `/auth/login`, and `/bookings` through `src/lib/axios.ts`.
- If the Render backend is sleeping or fails, demo listings still show so you can test the UI.
- The selected template direction is a clean directory/listing card style inspired by modern listing templates and Airbnb-like search UX, with original code and styling.
