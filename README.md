# TrabahoTrack

**The privacy-first, no-login Kanban board for job seekers.**

TrabahoTrack is a blazing-fast job application tracker. No sign-ups, no passwords. Just create a board, drag and drop your applications, and track your career.

## Features

### Board & Columns
- **5-stage pipeline:** Applied → Interview → Offer → Rejected → Ghosted
- **Native drag & drop** — mouse and touch (250ms hold to drag on mobile)
- **Stale card detection** — Applied cards older than 14 days are marked Stale; 7+ days get a "Ghosting?" warning

### Smart Stats Bar
- Live counts for Total, Interview Rate, Offer Rate, Rejections, and Ghosting Risk
- Rejection stage insight — shows your most common point of failure
- Motivational tagline that adapts to your pipeline state

### Job Cards
- Company logo auto-fetched from the job URL or company name
- Tags: **Urgent**, **Remote**, **Hybrid**, **In-Person** — filterable from the control bar
- Priority levels: Low, Medium, High (High cards get a red left-border highlight)
- Rejection stage tracking (Resume Screen, Phone Screen, Technical, Final Round, Offer Stage, No Response)
- Salary and free-text notes fields
- Click to expand — shows exact date added, Edit/Delete actions
- Direct "View posting" link on each card

### Search & Filter
- Search by company, role, or notes (press `/` to focus)
- Filter by tag — shows live counts per tag

### Import / Export
- **Export** all jobs as CSV
- **Import** from a JSON backup — adds jobs to your existing board without overwriting

### Cross-Device
- Scan the QR code to open your board on any device
- Data lives in Supabase — always in sync

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `N` | Open Add Job modal |
| `/` | Focus search bar |
| `Esc` | Close modal / collapse card / clear filter |

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, SCSS
- **Backend:** Supabase (PostgreSQL, Row Level Security, RPC functions)
- **Local state:** `localStorage` for tags, priorities, and rejection reasons

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/Po0mi/trabahotrack.git
   cd trabahotrack && npm install
   ```

2. **Setup Supabase**
   Create a Supabase project and run the SQL schema in the SQL Editor to set up tables and RLS policies.

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

Built with ♥ by [Dan Gabrielle De Castro](https://github.com/Po0mi)
