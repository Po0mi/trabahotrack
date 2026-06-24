# TrabahoTrack

**The privacy-first, no-login Kanban board for job seekers.**

TrabahoTrack is a blazing-fast job application tracker. No sign-ups, no passwords. Just create a board, drag and drop your applications, and track your career.

## Features
- **Zero-Friction:** Instant board creation. No accounts needed.
- **URL Auto-Fill:** Paste a LinkedIn or Indeed job URL into the Job URL field and the company and role auto-fill instantly.
- **Native Drag & Drop:** Smooth drag-and-drop between columns.
- **Cross-Device Sync:** Scan a QR code to open your board on your phone.
- **Secure:** Data is locked behind a unique token and Supabase RPC functions.

## Tech Stack
- **Frontend:** Next.js 16, React, TypeScript, SCSS
- **Backend:** Supabase (PostgreSQL, Row Level Security)

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/Po0mi/trabahotrack.git
   cd trabahotrack && npm install
   ```

2. **Setup Supabase**
   Create a Supabase project and run the SQL schema in the SQL Editor to set up tables and security policies.

3. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## Live Demo
https://trabahotrack.vercel.app

Built with by [Dan Gabrielle De Castro](https://github.com/Po0mi)
