# Huddle

A real-time group hangout planner — propose a hangout, share one link, friends vote on
date/location and RSVP without creating an account. Built to actually be used by a friend group,
not just sit as a portfolio demo.

**[Backend →](./backend)** · **[Frontend →](./frontend)**

## Why this exists

Planning anything with more than 3 friends usually means a group chat with 40 messages and no
decision. Huddle replaces that with: propose a couple of dates/spots, share a link, everyone taps
in and votes — no signup wall for anyone but the organizer.

## Tech stack

**Backend:** Node.js, Express, MongoDB, JWT auth, Socket.io
**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS v4

## Status

- [x] Auth, data models, voting/RSVP REST API
- [x] Full React frontend — landing page, auth, dashboard, huddle creation, voting board, guest join flow
- [x] Live updates via Socket.io — votes/RSVPs appear for everyone viewing a huddle without a refresh
- [ ] Google Places location search
- [ ] Deployment

## Running locally

```bash
# backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev

# frontend, in a separate terminal
cd frontend
npm install
npm run dev
```

See each folder's README for details.
