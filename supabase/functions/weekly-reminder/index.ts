// supabase/functions/weekly-reminder/index.ts
// Runs every Sunday at 10am — sends SMS + email to clients who haven't checked in yet
// Deploy with: supabase functions deploy weekly-reminder
// Schedule with: Supabase Dashboard → Edge Functions → weekly-reminder → Schedule → "0 10 * * 0"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function getWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function sendSMS(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const from = Deno.env.get("TWILIO_PHONE_NUMBER")!;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  return res.ok;
}

async function sendEmail(to: string, name: string, appUrl: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ESFITNESS <checkin@esfitness.com>",
      to,
      subject: "⚡ Weekly Check-In Reminder",
      html: `
        <div style="background:#080808;color:#e8e8e8;font-family:monospace;padding:32px;max-width:500px;margin:0 auto;">
          <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#C8FF00;margin-bottom:4px;">ESFITNESS</div>
          <div style="font-size:11px;color:#555;letter-spacing:2px;margin-bottom:28px;text-transform:uppercase;">Weekly Check-In</div>
          <p style="font-size:14px;line-height:1.8;margin-bottom:20px;">
            Hey <strong>${name}</strong>,<br/><br/>
            It's Sunday — time to submit your weekly check-in.<br/>
            Evan reviews every submission personally. Don't be the one missing from the dashboard.
          </p>
          <a href="${appUrl}" style="display:inline-block;background:#C8FF00;color:#080808;font-weight:900;font-size:14px;letter-spacing:3px;padding:14px 32px;text-decoration:none;text-transform:uppercase;">
            Submit Check-In →
          </a>
          <p style="font-size:11px;color:#444;margin-top:28px;">
            Takes less than 3 minutes. Your progress file is waiting.
          </p>
        </div>
      `,
    }),
  });
  return res.ok;
}

async function notifyCoach(missing: string[]) {
  const coachEmail = Deno.env.get("COACH_EMAIL")!;
  const coachPhone = Deno.env.get("COACH_PHONE")!;
  const week = getWeekLabel();

  // Email coach
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ESFITNESS <checkin@esfitness.com>",
      to: coachEmail,
      subject: `📋 ${week} — ${missing.length} client${missing.length > 1 ? "s" : ""} haven't checked in`,
      html: `
        <div style="background:#080808;color:#e8e8e8;font-family:monospace;padding:32px;max-width:500px;margin:0 auto;">
          <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#C8FF00;margin-bottom:20px;">ESFITNESS</div>
          <p style="font-size:14px;line-height:1.8;">
            <strong>${week} Reminder Sent</strong><br/><br/>
            Reminders sent to ${missing.length} client${missing.length > 1 ? "s" : ""} who haven't checked in yet:
          </p>
          <ul style="margin:16px 0;padding-left:20px;color:#C8FF00;">
            ${missing.map(n => `<li style="margin-bottom:6px;">${n}</li>`).join("")}
          </ul>
          <a href="${Deno.env.get("APP_URL")}" style="display:inline-block;background:#C8FF00;color:#080808;font-weight:900;font-size:13px;letter-spacing:2px;padding:12px 28px;text-decoration:none;text-transform:uppercase;margin-top:8px;">
            Open Dashboard →
          </a>
        </div>
      `,
    }),
  });

  // SMS coach
  if (coachPhone) {
    await sendSMS(coachPhone, `ESFITNESS ${week}: Reminders sent to ${missing.length} client(s) — ${missing.join(", ")}`);
  }
}

Deno.serve(async () => {
  const week = getWeekLabel();
  const appUrl = Deno.env.get("APP_URL")!;

  // Get all active clients
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, email, phone")
    .eq("active", true);

  if (error || !clients) {
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), { status: 500 });
  }

  // Get who already checked in this week
  const { data: checkins } = await supabase
    .from("checkins")
    .select("client_id")
    .eq("week_label", week);

  const checkedInIds = new Set((checkins || []).map((c: any) => c.client_id));
  const missing = clients.filter(c => !checkedInIds.has(c.id));

  if (missing.length === 0) {
    return new Response(JSON.stringify({ message: "All clients checked in!", week }), { status: 200 });
  }

  // Send reminders to missing clients
  const results = await Promise.allSettled(
    missing.flatMap(client => {
      const tasks = [];
      if (client.email) tasks.push(sendEmail(client.email, client.name, appUrl));
      if (client.phone) tasks.push(sendSMS(client.phone,
        `Hey ${client.name}, it's Sunday — time to submit your ESFITNESS check-in. Takes 3 min: ${appUrl}`
      ));
      return tasks;
    })
  );

  // Notify Evan
  await notifyCoach(missing.map(c => c.name));

  return new Response(JSON.stringify({
    week,
    reminders_sent: missing.length,
    clients: missing.map(c => c.name),
    results: results.map(r => r.status),
  }), { status: 200 });
});
