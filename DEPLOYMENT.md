# Deploying Huddle

Three free-tier services, none of which I can click through on your behalf (they all require your
own account/login) — but everything on the code side is already configured, so each step is short.

## 1. MongoDB Atlas (database)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no card required)
2. Create a free **M0** cluster (any region close to you)
3. Under **Database Access**, create a database user with a username/password
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere — fine for a free-tier
   personal project; Render's free plan doesn't have static IPs to whitelist individually)
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/huddle?retryWrites=true&w=majority`
   — replace `<username>`/`<password>` with what you created, and add `/huddle` before the `?` so
   it uses a database named `huddle`.

Keep this connection string — you'll paste it into Render in step 2.

## 2. Render (backend)

1. Go to https://render.com and sign up/log in with GitHub
2. **New → Blueprint**, connect the `Huddle-` repo — Render will detect `backend/render.yaml`
   automatically and pre-fill the service config
3. When it asks for environment variables, set:
   - `MONGO_URI` → the connection string from step 1
   - `CLIENT_URL` → leave blank for now, come back and set it after step 3 (needs the Vercel URL)
4. Deploy. First deploy takes a few minutes. Note the URL Render gives you, e.g.
   `https://huddle-backend.onrender.com`

Note: Render's free tier spins the service down after 15 minutes of inactivity — the first request
after idle takes ~30–50 seconds to wake up. Fine for a portfolio project; worth knowing so it
doesn't look "broken" the first time someone opens your link after it's been quiet.

## 3. Vercel (frontend)

1. Go to https://vercel.com and sign up/log in with GitHub
2. **Add New → Project**, import the `Huddle-` repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `VITE_API_BASE_URL` → your Render URL from step 2, e.g. `https://huddle-backend.onrender.com`
     (no trailing slash)
   - `VITE_GOOGLE_MAPS_API_KEY` → optional, only if you set up Places
5. Deploy. Vercel gives you a URL like `https://huddle-xyz.vercel.app`

## 4. Close the loop

Go back to Render → your service → Environment → set `CLIENT_URL` to your Vercel URL from step 3
(e.g. `https://huddle-xyz.vercel.app`). Redeploy. This is what makes CORS accept requests from your
actual frontend.

## Verify it worked

1. Open your Vercel URL
2. Register an account, create a huddle
3. Open the invite link in a different browser (or incognito) to simulate a friend joining as a
   guest — vote/RSVP and confirm it updates live on the first tab without refreshing
