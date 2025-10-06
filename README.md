### **Project Information**

- **Company:** CODTECH IT SOLUTION  
- **Intern Name:** Channabasava Rampur  
- **Intern ID:** CT06DY2265  
- **Domain:** Full Stack Web Development  
- **Duration:** 6 Weeks  
- **Mentor:** Neela Santhosh 


A Chrome extension + Node.js backend + React dashboard that tracks time spent on websites, classifies sites as productive/unproductive/neutral, stores per-user usage in MongoDB, and displays analytics in a React + Bootstrap dashboard.

Table of contents

Project summary
Features
Repo structure (folders & important files)
Prerequisites
Setup — Backend
Setup — Frontend (React dashboard)
Setup — Chrome extension
Environment variables (.env example)
Running the full system (order)
API endpoints (examples & curl)
How the extension syncs data to backend
Troubleshooting (common errors & fixes)
Security notes

Project summary

This project collects active tab usage in a Chrome extension (background service worker), aggregates usage locally and periodically sends events to the backend (/api/usage). The backend stores usage events in MongoDB. Users register / login in the React dashboard; the dashboard fetches stored usage (protected by JWT) and displays two charts: domain breakdown and category breakdown.

Features

Ask user for email (persisted in extension until cleared).
Track active tab domain and seconds spent.
Local aggregation and queued delivery to backend.
Backend stores usage events in MongoDB Atlas.
React dashboard with login/register (JWT) and charts (Chart.js + react-chartjs-2).
Bootstrap for layout; responsive charts and styling.
Routes: /api/auth/* for auth, /api/usage for usage.

Repo structure (important files)
```
backend/
  server.js
  .env
  package.json
  models/
    User.js
    Usage.js
  routes/
    auth.js
    usage.js
  middleware/
    auth.js

frontend/  (React app)
  src/
    api.js
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
    components/
      Navbar.jsx
      ProtectedRoute.jsx
    index.js
    App.js
  package.json

extension/
  manifest.json
  background.js
  popup.html
  popup.js
  popup.css
  icons/

README.md
```

Prerequisites

Node.js (v16+ recommended) and npm
MongoDB Atlas account (or local MongoDB instance)
Chrome browser for extension testing
(Optional) nodemon for dev auto-reload

Setup — Backend
Open terminal and go to backend folder:
cd backend
Install packages:

npm install
# if package.json missing dependencies:
npm install express mongoose cors morgan helmet dotenv bcryptjs jsonwebtoken


Create .env in backend/:
```PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<super_secret_key>
FRONTEND_ORIGIN=http://localhost:3000
```
Example (do NOT commit real credentials):

```MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/time_tracker_db
JWT_SECRET=replace_this_with_a_strong_secret
```
Start backend:
```
node server.js
# or for dev:
npx nodemon server.js
```
Confirm server and DB are connected: you should see MongoDB connected and Server running on port 5000 in logs.

Setup — Frontend (React + Bootstrap)
Open another terminal tab:
cd frontend


Install:
npm install
# plus chart libs
npm install react-chartjs-2 chart.js axios react-router-dom bootstrap react-bootstrap
Start dev server:
npm start
Open http://localhost:3000 in browser.

Notes:

src/api.js points to http://localhost:5000/api by default.
api axios instance attaches Authorization: Bearer <token> automatically if token in localStorage.
Setup — Chrome extension (development)
Open chrome://extensions/ in Chrome. Turn on Developer mode.
Click Load unpacked and select the extension/ folder.
When you first open the popup, enter your email and click Save. This saves email to chrome.storage.local.
Browse sites — extension background tracks active time and queues events.

The background service periodically (default 15s) reads latest email from storage and flushes queued events to backend POST http://localhost:5000/api/usage.
```
Environment variables (.env example)
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/time_tracker_db?retryWrites=true&w=majority
JWT_SECRET=9f4d7b2c8e1a5f6d3b7c9e2f1a6d4b8c
FRONTEND_ORIGIN=http://localhost:3000
```
Running the full system (recommended order)

Start MongoDB (Atlas or local).
Start backend: node server.js
Start frontend: npm start in frontend/
Load extension in Chrome (unpacked)
Register a user in frontend (Dashboard) and login (so you get JWT)
Save email in extension popup (only once) — extension will start sending usage to backend.

Open Dashboard — usage will be available via JWT-protected endpoint.

API endpoints & examples
Auth

POST /api/auth/register
Body: { "email": "user@example.com", "password": "Secret123" }
Response: 201 registered.

POST /api/auth/login
Body: { "email":"user@example.com", "password":"Secret123" }
Response: { token: "...", user: { email } }

Example curl:

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123"}'

Usage (extension -> backend)

POST /api/usage (no auth)
Body: { userEmail: "user@example.com", events: [ { domain, seconds, category, ts? } ] }

Example:

curl -X POST http://localhost:5000/api/usage \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"me@x.com","events":[{"domain":"github.com","seconds":12,"category":"productive"}]}'

Usage (dashboard)

GET /api/usage (protected — requires Authorization: Bearer <token>)
Returns array of usage documents (aggregated client-side by domain for charts).

Or fallback:

GET /api/usage/:email (open — optional for testing)

How the extension syncs data

Background service tracks active tab start/stop.

On domain switch/blur/interval it pushes { domain, seconds, category } events into an in-memory queue and stores aggregates to chrome.storage.local.usageData for quick popup rendering.

flushQueue() reads latest userEmail from chrome.storage.local and POSTs queued events to backend /api/usage.

On network failure, batch is put back into queue and retried on next flush.

Important: If you clear email in popup, the extension clears the queue to avoid sending old email. When user saves a new email, events use the new email.

Troubleshooting (common issues & fixes)
CORS error (browser blocked request)

Install & enable CORS on backend (server.js uses cors()).

Ensure app.use(cors({ origin: 'http://localhost:3000', credentials: true })) or app.use(cors()) (dev).

Restart backend.

OverwriteModelError: Cannot overwrite 'Usage' model once compiled.

Make sure you only define Mongoose models once. Use module.exports = mongoose.models.Usage || mongoose.model('Usage', schema);

Move model definitions to models/*.js and only require them.

Cannot find module 'morgan' or other missing modules

Run npm install in backend folder to install dependencies: npm install express mongoose cors morgan helmet dotenv bcryptjs jsonwebtoken.

MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017

Your MONGO_URI may point to local MongoDB while it's not running. Start local MongoDB or set MONGO_URI to Atlas connection string.

Duplicate key error on registration (e.g., username null)

Make sure your User schema fields are correct and unique constraints are applied on email. Delete bad documents or recreate DB.

Use normalized email lowercased (registration/login code uses trim().toLowerCase()).

Service worker registration failed. Status code: 15 (Chrome extension)

Ensure manifest v3 has valid background.service_worker path and no syntax error.

Check logs in extension inspect view.

Refused to load script due to CSP for popup

Chrome extensions must not load remote scripts when CSP forbids. Bundle Chart.js locally or use web_accessible_resources correctly. For dev, include chart.js in extension folder and reference locally.

UI / Dashboard behaviors

Dashboard aggregates database entries by domain client-side to avoid duplicate slices.

Category chart (bar) aggregates total seconds per category.

Logout removes JWT token from localStorage.

Security notes

Do not use cors({ origin: '*' }) in production with credentials: true.

Keep JWT_SECRET secret and robust.

Consider rate-limiting auth endpoints and using HTTPS in production.

Limit exposed data and secure /api/usage endpoints appropriately.

Next steps / Enhancements

Add pagination / server-side aggregation endpoint to return aggregated sums per domain (to reduce client-side work).

Add per-user dashboard settings (work hours, productive site list).

Add server-side validation and rate-limiting.

Add background sync improvements and robust offline storage for extension (IndexedDB).

Add tests.
<img width="1878" height="1034" alt="Image" src="https://github.com/user-attachments/assets/46366e38-7f3a-4156-9069-100f5f5b36a8" />
<img width="1893" height="1024" alt="Image" src="https://github.com/user-attachments/assets/ede19c4b-1014-4aba-ac84-7b9e89513d45" />
<img width="1881" height="1023" alt="Image" src="https://github.com/user-attachments/assets/67cb23b7-c382-492f-850e-eb3cdd54c9c0" />
