# SkillSwap Platform 🤝

A full-stack, peer-to-peer knowledge barter platform built from scratch with React, Vite, Node.js, Express, and MongoDB.

---

## 🏗️ Architecture Overview

The application is structured into two completely independent tiers:

- **Frontend (`/frontend`)**: React 18 SPA powered by Vite, React Router v7, Lucide Icons, modular CSS design system, and Context-based session management.
- **Backend (`/backend`)**: Node.js & Express.js REST API with clean MVC architecture (Controllers, Models, Middlewares, Routes, Config), JWT authentication, bcrypt password hashing, and Mongoose ODM.

```
SkillSwap-Project/
├── backend/                  # Node.js + Express + MongoDB REST API (MVC)
│   ├── src/
│   │   ├── config/           # Database configuration (Mongoose)
│   │   ├── controllers/      # Route controllers (Business logic)
│   │   ├── middlewares/      # JWT auth, Admin role & Error handlers
│   │   ├── models/           # Mongoose Data Models
│   │   ├── routes/           # Express API route declarations
│   │   └── server.js         # API Entrypoint
│   ├── .env                  # Backend environment secrets
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies & scripts
│
├── frontend/                 # React + Vite + React Router (SPA)
│   ├── src/
│   │   ├── assets/           # Static media assets
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Button, Card, Modal, Badge)
│   │   ├── context/          # Global state (AuthContext)
│   │   ├── pages/            # View pages (Home, Explore, Profile, Swaps, Admin, Auth)
│   │   ├── services/         # Axios HTTP client configuration
│   │   ├── styles/           # Theme variables & global CSS reset
│   │   ├── App.jsx           # App layout & protected routes
│   │   ├── App.css           # Shell layout styles
│   │   ├── main.jsx          # React DOM mounting
│   │   └── index.css         # Entry styles
│   ├── .env                  # Frontend client environment
│   ├── .env.example          # Client environment template
│   ├── vite.config.js        # Vite build & dev server configuration
│   └── package.json          # Frontend dependencies & scripts
│
├── .gitignore                # Workspace git ignore rules
├── package.json              # Root workspace orchestrator scripts
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start Commands

### 1. Running the Backend Server
```bash
cd backend
npm install       # (Already executed in Step 1)
npm run dev       # Starts development server with nodemon on http://localhost:5000
```
*Health Check*: Navigate to `http://localhost:5000/api/health`

### 2. Running the Frontend Client
```bash
cd frontend
npm install       # (Already executed in Step 1)
npm run dev       # Starts Vite dev server on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
- `PORT=5000`: HTTP port for Express.
- `NODE_ENV=development`: Node environment.
- `MONGO_URI=mongodb://127.0.0.1:27017/skillswap`: MongoDB connection string.
- `JWT_SECRET=skillswap_super_secret_jwt_key_2026_dev`: Cryptographic secret for signing JWTs.
- `CLIENT_URL=http://localhost:5173`: Allowed origin for CORS headers.

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL=http://localhost:5000/api`: Target backend API endpoint.

