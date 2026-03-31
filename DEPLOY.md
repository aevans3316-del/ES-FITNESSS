# ESFITNESS — Deployment Guide
# Total time: ~30-45 minutes. Do it once, runs forever.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — SUPABASE (your database + automation backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://supabase.com → Sign up (free)
2. Click "New Project" → name it "esfitness" → pick a password → Create
3. Wait ~2 min for it to spin up
4. Go to: SQL Editor (left sidebar) → New Query
5. Paste the ENTIRE contents of: supabase/migrations/001_schema.sql
6. Click "Run" → you should see "Success"
7. Go to: Settings → API
   - Copy "Project URL"  → this is your REACT_APP_SUPABASE_URL
   - Copy "anon public" key → this is your REACT_APP_SUPABASE_ANON_KEY


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — RESEND (free email API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://resend.com → Sign up (free — 3,000 emails/month)
2. Go to API Keys → Create API Key → copy it
3. Optional: Add your domain for branded "from" email address
   (If you skip this, use "onboarding@resend.dev" as the from address in the edge function)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — TWILIO (SMS, ~$1/month for small volume)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://twilio.com → Sign up → free trial gives you $15 credit
2. Get a phone number (costs ~$1/month after trial)
3. From your dashboard, copy:
   - Account SID
   - Auth Token
   - Your Twilio phone number (format: +15551234567)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — DEPLOY THE EDGE FUNCTION (automated reminders)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Install Supabase CLI:
  npm install -g supabase

In your terminal (from the esfitness folder):
  supabase login
  supabase link --project-ref YOUR_PROJECT_ID
    (Project ID is in your Supabase URL: https://YOUR_PROJECT_ID.supabase.co)

Set secrets (replace with your real values):
  supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
  supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
  supabase secrets set TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
  supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
  supabase secrets set COACH_EMAIL=your@email.com
  supabase secrets set COACH_PHONE=+1xxxxxxxxxx
  supabase secrets set APP_URL=https://your-app.vercel.app

Deploy the function:
  supabase functions deploy weekly-reminder

Schedule it to run every Sunday at 10am UTC:
  → Supabase Dashboard → Edge Functions → weekly-reminder
  → Click "Schedule" → Enter cron: 0 10 * * 0
  → Save

That's it. Every Sunday at 10am, anyone who hasn't checked in gets
an SMS + email automatically. You also get a summary text + email.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — DEPLOY THE FRONTEND (Vercel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Push this project to GitHub:
   git init
   git add .
   git commit -m "ESFITNESS initial"
   → Create a new repo on github.com → push to it

2. Go to https://vercel.com → Sign up with GitHub (free)
3. Click "Import Project" → select your repo
4. Add Environment Variables (Settings → Environment Variables):
   REACT_APP_SUPABASE_URL      = your Supabase URL
   REACT_APP_SUPABASE_ANON_KEY = your Supabase anon key
5. Click Deploy → wait 2 min
6. Your app is live at: https://esfitness-[hash].vercel.app
7. Optional: Add a custom domain in Vercel settings


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — UPDATE YOUR EDGE FUNCTION URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Once you have your Vercel URL, update the secret:
  supabase secrets set APP_URL=https://your-actual-vercel-url.vercel.app

Redeploy the function:
  supabase functions deploy weekly-reminder


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — PWA (make it installable on phones)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tell your clients:
  iPhone: Open the link in Safari → Share button → "Add to Home Screen"
  Android: Open in Chrome → menu → "Add to Home Screen"

The app will appear as a full-screen icon on their phone,
no browser bar, looks and feels like a native app.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S FULLY AUTOMATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Every Sunday 10am — SMS + email sent to clients who haven't checked in
✅ You get a summary SMS + email every Sunday with who's missing
✅ AI feedback generated instantly on every check-in submission
✅ Real database — data never gets wiped, works across all devices
✅ Installable as a home screen app on any phone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTHLY COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase:  $0   (free tier — 500MB DB, 50k requests/month)
Vercel:    $0   (free tier — unlimited deploys)
Resend:    $0   (free tier — 3,000 emails/month)
Twilio:    ~$1  (phone number) + $0.0079/SMS (pennies per message)

Total: ~$1-2/month max until you scale to 50+ clients
