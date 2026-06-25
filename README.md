# TrabahoTrack

**A privacy-first, no-login Kanban board for job seekers**

TrabahoTrack is a fast and simple job application tracker. No sign-ups, no passwords. Just create a board, drag your applications, and stay on top of your job hunt.

## Features

### Board and Columns

* **5-stage pipeline:** Applied → Interview → Offer → Rejected → Ghosted
* Smooth drag and drop for both mouse and touch, with a 250ms hold on mobile
* Stale card detection

  * Applied cards older than 14 days are marked as Stale
  * Cards older than 7 days show a "Ghosting?" warning

### Smart Stats Bar

* Live stats for Total, Interview Rate, Offer Rate, Rejections, and Ghosting Risk
* Shows your most common rejection stage
* Includes a motivational message that adapts to your progress

### Job Cards

* Company logos are automatically fetched from the job URL or company name
* Tags: **Urgent, Remote, Hybrid, In-Person**, all filterable
* Priority levels: Low, Medium, High

  * High priority cards are highlighted with a red border
* Track rejection stages like Resume Screen, Phone Screen, Technical, Final Round, Offer Stage, or No Response
* Includes salary and notes fields
* Click to expand for full details, edit, or delete
* Direct link to view the original job posting

### Search and Filter

* Search by company, role, or notes. Press `/` to focus
* Filter by tags with live counts

### Import and Export

* Export all jobs as a CSV file
* Import from a JSON backup without overwriting your current board

### Cross-Device

* Scan a QR code to open your board on another device
* Data is stored in Supabase and stays in sync

### Keyboard Shortcuts

| Key   | Action                                      |
| ----- | ------------------------------------------- |
| `N`   | Open Add Job modal                          |
| `/`   | Focus search bar                            |
| `Esc` | Close modal, collapse card, or clear filter |

## Tech Stack

* **Frontend:** Next.js, React, TypeScript, SCSS
* **Backend:** Supabase with PostgreSQL, Row Level Security, and RPC functions
* **Local State:** localStorage for tags, priorities, and rejection reasons

## Quick Start

1. Clone and install

```bash
git clone https://github.com/Po0mi/trabahotrack.git
cd trabahotrack && npm install
```

2. Set up Supabase
   Create a project and run the SQL schema in the SQL Editor

3. Add environment variables
   Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the app

```bash
npm run dev
```

## Live Demo

https://trabahotrack.vercel.app

Built by Dan
