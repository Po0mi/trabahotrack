# TrabahoTrack

**A blazing-fast, privacy-first Kanban job tracker. No sign-ups, no logins. Just your career.**

TrabahoTrack is a modern, link-based job application tracker built for speed and privacy. Instead of forcing users to create accounts and remember passwords, TrabahoTrack generates a secure, unique "Magic Link" for every board. 

## Key Features

- **Zero-Friction Onboarding:** Create a board instantly. No email, no password, no verification emails.
- **Secure by Design:** Uses a unique access token stored in your browser's `localStorage`. Supabase Row Level Security (RLS) and RPC functions ensure only the token holder can access the data.
- **Native Drag & Drop:** Smoothly move applications between columns (Applied, Interview, Offer, Rejected, Ghosted) using native HTML5 DnD.
- **Smart Bookmarklet:** One-click save directly from LinkedIn, Indeed, or Glassdoor. The bookmarklet scrapes the page title and auto-fills your board.
- **Cross-Device Sync:** Generate a secure QR code to instantly open your board on your phone or another computer.
- **Data Ownership:** Export/Import your entire board as JSON. If you clear your cache, you can restore your data in seconds.
- **Premium UI:** Built with a custom, eye-friendly dark theme using SCSS.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** SCSS (Custom Dark Theme, BEM-inspired single-dash naming)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, RPC Functions)
- **Hosting:** Vercel

## Architecture & Security Model

TrabahoTrack operates on a **"No-Auth" architecture**. 

1. **The Identity:** When a user creates a board, the frontend generates a secure, random `access_token`. 
2. **The Database:** The `board_id` (public) and `access_token` (private) are saved in Supabase. The user's token is saved in their browser's `localStorage`.
3. **The Bouncers (RPCs):** Direct table access is completely revoked. All data operations (Create, Read, Update, Delete) are handled via Supabase **RPC (Remote Procedure Call) functions**. 
4. **The Check:** Every time the frontend calls an RPC function, it passes the `access_token`. The SQL function checks if the token matches the board. If it does, the action is allowed. If not, it throws an exception.

This means **zero user data is ever exposed**, and the database is completely locked down from direct SQL injection or unauthorized access.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A free [Supabase](https://supabase.com) account

### 1. Clone the Repository
```bash
git clone https://github.com/Po0mi/trabahotrack.git
cd trabahotrack
npm install
