# 🛡️ UPI FraudGuard — AI-Powered UPI Fraud Detection System

![UPI FraudGuard](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Backend-Node.js-green) ![React](https://img.shields.io/badge/Frontend-React-blue) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green) ![License](https://img.shields.io/badge/License-ISC-yellow)

> Protect yourself from UPI fraud with AI-powered detection. Real-time fraud analysis, risk scoring, and recovery assistance for Indian users.

🔗 **Live Demo:** [https://upi-frauddetection.netlify.app](https://upi-frauddetection.netlify.app)  
🔗 **Backend API:** [https://upi-fraud-detection-qdxe.onrender.com](https://upi-fraud-detection-qdxe.onrender.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

- 🔐 **User Authentication** — Secure JWT-based login & registration
- 🤖 **AI Fraud Detection** — ML model analyzes UPI transactions in real-time
- 📊 **Analytics Dashboard** — Visual insights into transaction patterns
- 🚨 **Risk Scoring** — Categorizes transactions as Safe, Suspicious, or Fraudulent
- 📝 **Complaint System** — File and track fraud complaints
- 👮 **Admin Panel** — Manage users, transactions, and complaints
- 📱 **Responsive UI** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **ML Model** | Python (Jupyter Notebook) |
| **Auth** | JWT, bcryptjs |
| **Deployment** | Netlify (frontend), Render (backend) |

---

## 📁 Project Structure

```
upi-fraud-detection/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/       # Axios API config
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── config/    # DB connection
│   │   ├── routes/    # API routes
│   │   ├── models/    # Mongoose models
│   │   └── middleware/
│   └── server.js
├── ml/                # ML model (Jupyter Notebooks)
└── api/               # ML API service
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Krushilmodi1/upi-fraud-detection.git
cd upi-fraud-detection
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/upifraud
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`  
Backend runs at: `http://localhost:5000`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `NODE_ENV` | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/transactions` | Get all transactions |
| `POST` | `/api/transactions` | Submit a transaction |
| `GET` | `/api/analytics` | Get analytics data |
| `GET` | `/api/complaints` | Get complaints |
| `POST` | `/api/complaints` | File a complaint |
| `GET` | `/api/admin` | Admin dashboard data |

---

## 🌐 Deployment

### Frontend → Netlify

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |
| Environment variable | `REACT_APP_API_URL=https://upi-fraud-detection-qdxe.onrender.com/api` |

### Backend → Render

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Environment variables | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` |

---

## 👥 Contributors

- **Krushil Modi** — [@Krushilmodi1](https://github.com/Krushilmodi1)
- **Rakshit Soni** — [@Rakshitsoni1410](https://github.com/Rakshitsoni1410)
---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Made with ❤️ for safer UPI transactions in India 🇮🇳</p>
