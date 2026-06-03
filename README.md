# Complete Lead CRM
Features: CRUD, Search, Status, Stats, Pagination, Filtering.

## Deployment

### Local deployment
1. Create `server/.env` from `server/.env.example`.
2. Install dependencies:
   - `npm install` (from the repo root)
   - or `npm run server-install && npm run client-install`
3. Start the backend and frontend manually:
   - `npm run start --prefix server`
   - `npm start --prefix client`

### Production build locally
1. Build the React app: `npm run build`
2. Start the server: `npm start`
3. Open `http://localhost:5000`

### Deploy to Heroku / Render / similar
1. Push the repository to a Git host.
2. Ensure `MONGO_URI` is configured in the platform environment.
3. Use the root `start` script (`npm start`) and `Procfile`.
4. The server will serve the React build from `client/build` in production.

### Notes
- The backend listens on `process.env.PORT || 5000`.
- The front-end is built in `client/build` and served by Express when `NODE_ENV=production`.


# Lead Management CRM

## Live Demo
https://web-production-f10a3.up.railway.app

## Features
- Create Leads
- Update Leads
- Delete Leads
- Search Leads
- MongoDB Integration

## Tech Stack
- React
- Node.js
- Express
- MongoDB
- Railway

