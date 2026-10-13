# Meme'd Campaign Payout Tracker

This project is a full-stack creator marketplace application where brands create campaigns with milestone payout ladders, and creators submit posts, track views, and earn milestone-based payouts.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Mongoose, MongoDB, Redis, JWT auth, Jest unit tests.
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.

## Architecture & Design Decisions
- **Milestone Payout:** Non-cumulative; pays the highest milestone crossed per post.
- **Budget Protection:** Atomic MongoDB transactions prevent race conditions and overspending campaigns.
- **Idempotency:** `lastMilestonePaid` tracking prevents double-payouts on repeated view updates.
- **Currency Unit:** Stored as integer cents/paise to avoid floating-point errors.

## Running Tests
```bash
cd backend
npm test
```
