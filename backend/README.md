# Huddle — Backend

Backend API for **Huddle**, a real-time group hangout planner. Friends propose a hangout, vote on
date and location options, and RSVP — all without guests needing to create an account.

This is part 1 of a multi-part build. This session covers the data models, auth, and core
voting/RSVP API. Real-time broadcasting (Socket.io), the React frontend, and Google Maps location
search are built in later sessions.

## Tech stack

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- Socket.io (room infrastructure scaffolded now, event broadcasting wired up in the real-time session)
- nanoid for short, unambiguous invite codes

## Why guests can vote and RSVP without an account

Most hangout invites go to a group where not everyone wants to sign up for a new app. Huddle only
requires an account to **create** a huddle (you're the organizer). Anyone with the invite link can
join, vote, and RSVP as a guest — identified by a `guestId` generated and stored in their browser,
paired with the name they type in. This keeps the door open for real usage from friends who'd
otherwise bounce off a signup wall.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon, auto-restarts on changes
```

Requires a MongoDB instance — either local (`mongodb://localhost:27017/huddle`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster for production.

## API overview

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| GET | `/api/auth/me` | required | Current user info |

### Huddles
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/huddles` | required | Create a huddle with date/location options |
| GET | `/api/huddles` | required | List huddles you organize or are part of |
| GET | `/api/huddles/invite/:code` | optional | Public join view via invite link |
| GET | `/api/huddles/:id` | optional | Get a huddle by id |
| POST | `/api/huddles/:id/join` | optional | Join as a participant (guest or logged-in) |
| POST | `/api/huddles/:id/rsvp` | optional | Set RSVP status: going / maybe / cant_go |
| POST | `/api/huddles/:id/vote/date/:optionId` | optional | Toggle vote on a date option |
| POST | `/api/huddles/:id/vote/location/:optionId` | optional | Toggle vote on a location option |
| POST | `/api/huddles/:id/options/location` | optional | Propose a new location option |
| PUT | `/api/huddles/:id/finalize` | organizer only | Lock in the final date/location |

"Optional auth" routes accept either a JWT (logged-in user) **or** a `{ guestId, guestName }` pair
in the request body (guest).

## Smoke test

```bash
node smoke-test.js
```

Verifies the app boots, all routes register correctly, and validation logic responds correctly —
without requiring a live database connection.

## Project structure

```
src/
  config/db.js              MongoDB connection
  models/User.js            User schema (bcrypt password hashing)
  models/Huddle.js           Huddle schema (date/location options, votes, participants)
  middleware/auth.js         JWT auth — protect() and optionalAuth()
  controllers/               Route logic
  routes/                    Express routers
  server.js                  App entry point, Socket.io room setup
```

## Coming in later sessions

- [x] Socket.io: broadcast live vote/RSVP updates to everyone viewing a huddle
- [ ] Google Places API integration for location search/suggestions
- [ ] Deployment (Render/Railway + Vercel) so it's live and shareable

## Real-time updates

Every mutating huddle action (join, RSVP, vote, add location, finalize) re-fetches the huddle with
full population and emits it as a `huddleUpdated` event to the Socket.io room named after the
huddle's id. Clients join that room when they open the huddle page. This means if three friends
have the same huddle open, a vote from any one of them appears for the other two without a
refresh.
