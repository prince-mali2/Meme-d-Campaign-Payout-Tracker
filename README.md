# Meme'd Campaign Payout Tracker

A full-stack web application built for **Meme'd**, a creator marketplace where brands run campaigns and creators (meme pages, clip accounts, hype pages) post content on Instagram or YouTube and earn payouts based on milestone ladders.

---

## 🚀 Live Deployed Links

- **Frontend (Vercel):** [https://memed-tracker.vercel.app](https://memed-tracker.vercel.app) *(or your deployed URL)*
- **Backend API (Render):** [https://memed-backend.onrender.com](https://memed-backend.onrender.com)

---

## 📂 Repository Structure

```
/
├── backend/            # Node.js + Express + TypeScript + Mongoose + Jest
│   ├── src/
│   │   ├── config/     # DB, Redis, Env validation
│   │   ├── models/     # Mongoose Schemas (User, Campaign, Submission)
│   │   ├── middleware/ # Auth & Role guards
│   │   ├── controllers/# Route handlers
│   │   └── services/   # Payout calculation, view spike detection, Redis cache
│   └── tests/          # Jest unit tests for payout & budget cap
├── frontend/           # Next.js 14+ (App Router) + TypeScript + Tailwind CSS
│   ├── app/            # Pages & layouts for brand & creator roles
│   ├── components/     # Reusable UI components
│   └── context/        # Auth context & JWT management
├── docker-compose.yml  # Local Docker setup (app, mongo, redis)
└── README.md
```

---

## 🛠️ Setup Instructions (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas URI)
- Redis (optional, app gracefully falls back if Redis is not running)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```
To run unit tests:
```bash
npm test
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.local.example .env.local  # or create .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/memed_tracker` |
| `JWT_SECRET` | Secret key for JWT signing | `required_min_10_chars` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SPIKE_RATE_THRESHOLD` | Growth rate threshold for spike detection | `5.0` (500%) |

### Frontend (`/frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` |

---

## 🧠 Key Design Decisions & Assumptions

1. **Highest Milestone Only:** When a post crosses multiple milestones in a single view update, the creator is paid for the **highest** milestone crossed (non-cumulative), per the brief.
2. **Budget Safety & Insufficient Budget:** If a campaign's remaining budget is less than the milestone payout when a post qualifies, the payout is **not** processed partially; the submission status is marked as `insufficient_budget`.
3. **Idempotency:** Each submission tracks `lastMilestonePaid`. Repeated view updates with the same or lower view count will not trigger duplicate payouts (`already_paid`).
4. **Integer Cents / Paise:** All budgets and payouts are stored as integer cents/paise (e.g., ₹500 = `50000`) to avoid floating-point rounding inaccuracies.
5. **Atomic Transactions:** View updates use MongoDB multi-document sessions & transactions (`session.startTransaction()`) to guarantee that concurrent PATCH requests can never overspend a campaign's total budget.

---

## 🐳 Docker Support

To run the entire stack (Backend, Frontend, MongoDB, Redis) via Docker:
```bash
docker-compose up --build
```

---

## 📈 Scaling to 10,000 Creators (Stretch Note)

To scale this platform to 10,000+ creators generating high-frequency view updates:
1. **Database Partitioning & Read Replicas:** Use MongoDB Atlas sharding on `campaignId` and read replicas for creator earnings queries.
2. **Queue-Based View Processing:** Replace synchronous REST PATCH endpoints with a message queue (e.g., BullMQ backed by Redis). Incoming view updates are queued per submission and processed serially to prevent write contention on campaign budgets.
3. **Caching Layer:** Redis cluster for live campaign lists and budget status, reducing MongoDB load significantly.
4. **Rate Limiting:** Implement API rate limiting on `PATCH /api/submissions/:id/views` to prevent scraping or abuse.
