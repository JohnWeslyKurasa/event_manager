# EventPulse

EventPulse is an event management platform with a React/Vite client and an Express API.

## Project layout

- `client/` - React and TypeScript web application
- `server/` - Express and TypeScript API

## Run locally

Install dependencies in both package directories, then run each development server in a separate terminal:

```powershell
cd client
npm install
npm run dev
```

```powershell
cd server
npm install
npm run dev
```

The client runs at `http://localhost:5173` and proxies `/api` requests to the server at `http://localhost:5000`.

The server reads its configuration from environment variables. Copy `.env.example` to `.env` and set the values for your environment. When PostgreSQL is unavailable, the server falls back to its in-memory store; that store is not persistent.

## Demo accounts

- Organizer: `organizer@eventpulse.com` / `12345678`
- Attendee: `attendee@eventpulse.com` / `12345678`

On startup, the server idempotently seeds these accounts, four sample events, and their ticket tiers into PostgreSQL. The attendee can register for additional sample events.

## Deployment

- Deploy `client/` to Vercel. Set `VITE_API_URL` to the Render API base URL, such as `https://eventpulse-api.onrender.com`.
- Deploy the root `render.yaml` Blueprint on Render. It creates the API and PostgreSQL database. Set `CLIENT_URL` to the deployed Vercel origin after the first frontend deployment.
- Set `GEMINI_API_KEY` in Render only if live AI generation is needed.