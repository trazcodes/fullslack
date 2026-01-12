# FullSlack 🚀

A **production-grade Slack-like chat application** deployed on AWS EC2 using **Docker, Nginx, CI/CD, and HTTPS**, built to deeply understand **real-world DevOps and backend infrastructure**, not just frontend features.

This project focuses on **how things actually work in production**: reverse proxying, environment isolation, event-driven systems, cloud callbacks, and debugging infra-level issues.

---

## 🔗 Live URLs

* **Frontend + Backend (same domain)**
  [https://fullslack.duckdns.org](https://fullslack.duckdns.org)

* **Backend API**
  [https://fullslack.duckdns.org/api](https://fullslack.duckdns.org/api)

> ⚠️ Frontend and backend intentionally run on the **same domain** to avoid CORS and mirror real production setups.

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Clerk (authentication)
* Stream Chat (real-time messaging)

### Backend

* Node.js + Express
* MongoDB Atlas
* Stream Chat server SDK
* Inngest (event-driven background jobs)

### DevOps / Infrastructure

* AWS EC2 (Ubuntu)
* Docker & Docker Compose
* Nginx (reverse proxy)
* Let’s Encrypt SSL (Certbot)
* DuckDNS (domain)
* GitHub Actions (CI/CD)
* SSH-based deployments

---

## 🏗️ Architecture Overview

```
Internet
   ↓
HTTPS (443)
   ↓
Nginx (EC2 Host)
   ├── /        → React frontend (static build)
   └── /api/*   → Express backend (Docker)
                     ↓
                MongoDB Atlas
```

* Backend runs on **internal port 8080**
* Exposed **only through Nginx** (no public Node port)
* SSL termination handled by Nginx

---

## 🔐 Environment Variable Strategy

### Backend (.env on EC2 only)

> `.env` is **never committed to GitHub**

```
MONGO_URI
CLERK_SECRET_KEY
STREAM_API_KEY
STREAM_API_SECRET
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
NODE_ENV=production
```

### Frontend (build-time env via CI/CD)

```
VITE_API_BASE_URL=https://fullslack.duckdns.org/api
VITE_STREAM_API_KEY
VITE_CLERK_PUBLISHABLE_KEY
```

---

## ⚙️ Nginx Configuration (Core Idea)

* Serves frontend static files
* Proxies `/api/*` to backend container
* Forces HTTPS
* Preserves cookies and headers (required for Clerk)

```nginx
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Cookie $http_cookie;
}
```

---

## 🔄 CI/CD Pipeline

### Backend CI/CD

Trigger: `push to main`

Steps:

1. SSH into EC2
2. Pull latest code
3. Rebuild Docker containers
4. Restart backend

### Frontend CI/CD

Trigger: `push to frontend/**`

Steps:

1. Build React app
2. SCP `dist/` to EC2
3. Replace old build
4. Reload Nginx

> No Vercel / Netlify used — deployment is fully controlled.

---

## ⚡ Inngest Setup (Important)

* Runs in **cloud mode only**
* `/api/inngest` must return:

```json
{ "mode": "cloud" }
```

* Requires:

  * Public HTTPS endpoint
  * `NODE_ENV=production`
  * Stable DNS resolution

Used for:

* Syncing Clerk users to MongoDB
* Deleting users when Clerk profile is removed

---

## 🧨 Problems Faced & How I Solved Them

### 1️⃣ Backend Crashed After Setting `NODE_ENV=production`

**Problem**
Server did not start after switching to production.

**Root Cause**
`app.listen()` was wrapped inside:

```js
if (NODE_ENV !== "production")
```

**Fix**
Always start the server in production. `NODE_ENV` should control behavior, not existence.

---

### 2️⃣ Inngest Cloud Failing with DNS Timeout

**Error**

```
lookup fullslack.duckdns.org ... i/o timeout
```

**Root Cause**
DuckDNS + IPv6 caused intermittent DNS resolution failures for cloud callbacks.

**Fix**
Disabled IPv6 at OS level on EC2:

```bash
net.ipv6.conf.all.disable_ipv6 = 1
```

After reboot, DNS resolution became deterministic (IPv4-only).

---

### 3️⃣ Clerk Delete Event Not Syncing to MongoDB

**Problem**
User creation worked, deletion failed intermittently.

**Root Cause**
Inngest could not resolve the domain during delete webhook execution due to IPv6 DNS ambiguity.

**Fix**
Same IPv6 fix + verified `/api/inngest` accessibility.

---

### 4️⃣ CORS & Cookie Issues

**Problem**
Auth cookies not sent properly.

**Fix**
Used **same-domain frontend + backend** via Nginx reverse proxy. No CORS-based architecture.

---

## 🧪 How to Run Locally (Development Setup)

> This section is **optional** and intended only for local development and testing.
> The production architecture (EC2 + Docker + Nginx) remains unchanged.

---

### 🔧 Prerequisites

Make sure you have the following installed on your local machine:

* Node.js (v18+ recommended)
* npm or yarn
* Git
* Docker (optional, for future parity with prod)

---

### 📁 Clone the Repository

```bash
git clone https://github.com/<your-username>/fullslack.git
cd fullslack
```

---

### 🔐 Backend Environment Setup

Create a `.env` file **locally** inside the backend folder:

```
MONGO_URI=<your_mongodb_atlas_uri>
CLERK_SECRET_KEY=<your_clerk_secret_key>
STREAM_API_KEY=<your_stream_api_key>
STREAM_API_SECRET=<your_stream_api_secret>
INNGEST_EVENT_KEY=<your_inngest_event_key>
INNGEST_SIGNING_KEY=<your_inngest_signing_key>
NODE_ENV=development
PORT=8080
```

> ⚠️ Never use production secrets locally.

---

### ▶️ Run Backend Locally

```bash
cd backend
npm install
npm run dev
```

Backend will start on:

```
http://localhost:8080
```

Verify:

```bash
curl http://localhost:8080/api/inngest
```

Expected:

```json
{ "mode": "dev" }
```

---

### 🎨 Frontend Environment Setup

Create a `.env` file in the frontend folder:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STREAM_API_KEY=<your_stream_api_key>
VITE_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
```

---

### ▶️ Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

### ⚠️ Local Development Notes

* Local setup uses **CORS** (unlike production)
* Cookies may behave differently than production
* Inngest runs in **dev mode locally**
* Nginx is **not used locally**

Local development is intentionally simpler; production behavior is validated only on EC2.

---

## 📚 What I Learned

* How production servers actually start and run
* Dockerized backend deployments on EC2
* Reverse proxying with Nginx
* HTTPS with Let’s Encrypt
* CI/CD via SSH (not platform magic)
* Event-driven systems (Inngest)
* Debugging infra issues: **logs → infra → config → code**
* DNS & IPv6 pitfalls in cloud callbacks

---

## 🎯 Why This Project Matters

This project was built to:

* Understand **real production systems**
* Avoid copy-paste DevOps
* Gain confidence explaining infra in interviews

It reflects how backend-heavy, event-driven applications are deployed in real companies.

---

## 👤 Author

**Kushal Himmatsinghka**
MERN Stack Developer | DevOps Learner

---

✅ Production-first mindset. No shortcuts.
