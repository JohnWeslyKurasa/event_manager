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