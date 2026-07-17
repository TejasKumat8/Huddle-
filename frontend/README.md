# Huddle — Frontend

React frontend for **Huddle**, a real-time group hangout planner. Talks to the [backend API](../backend)
for auth, huddle creation, voting, and RSVPs.

## Tech stack

- React 19 + Vite
- Redux Toolkit (auth + huddle state, async thunks for every API call)
- React Router
- Tailwind CSS v4
- Axios

## Design

The visual identity leans into the idea of a huddle as a shared ticket: the huddle detail page is
styled like a torn ticket stub, with a perforated edge separating event info from the voting
board. Palette is a "golden hour hangout" theme — deep plum background, coral CTA, gold vote
accent, teal for "going" RSVPs. Type pairing is `Unbounded` (display), `Inter` (body), and
`Space Mono` (invite codes, dates).

## Why guests don't need an account

The single biggest UX decision in this app: only the organizer needs to sign up. Everyone else
follows the invite link, types their name once (stored as a `guestId` in localStorage), and can
immediately vote and RSVP. This is what makes the app usable with a real friend group instead of
losing half of them at a signup wall.

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:5000`
(configured in `vite.config.js`). Start the backend first — see [`../backend/README.md`](../backend/README.md).

## Project structure

```
src/
  lib/api.js          Axios instance + guest identity helper
  lib/guest.js         localStorage-backed guest id/name
  store/               Redux Toolkit slices (auth, huddles)
  components/          Reusable UI (Button, Navbar, HuddleBoard, ...)
  pages/                Route-level pages
```

## Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/login`, `/register` | Auth |
| `/dashboard` | Your huddles (protected) |
| `/create` | Create a new huddle (protected) |
| `/h/:id` | Huddle detail / voting board |
| `/invite/:code` | Guest join flow via shared invite link |

## Coming in later sessions

- [ ] Socket.io client — live vote/RSVP updates without refreshing
- [ ] Google Places autocomplete for location options
- [ ] Deployment (Vercel)
