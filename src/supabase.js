import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const COACH_EMAIL = "esfitnesscoachingg@gmail.com";

// ─── AUTH ────────────────────────────────────────────────────────────
export async function signUp(email, password, name, goal) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from("pending_signups").insert({
      user_id: data.user.id, name, goal, email
    });
  }
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => cb(session));
}

export function isCoach(session) {
  return session?.user?.email === COACH_EMAIL;
}

// ─── CLIENTS ────────────────────────────────────────────────────────
export async function getClients() {
  const { data, error } = await supabase
    .from("clients").select("*").eq("active", true).order("name");
  if (error) throw error;
  return data;
}

export async function getMyClient(userId) {
  const { data, error } = await supabase
    .from("clients").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function approveSignup(pending) {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: pending.name, goal: pending.goal, email: pending.email,
      user_id: pending.user_id, status: "approved", active: true,
      joined_at: new Date().toISOString()
    }).select().single();
  if (error) throw error;
  await supabase.from("pending_signups").delete().eq("id", pending.id);
  return data;
}

export async function denySignup(id) {
  await supabase.from("pending_signups").delete().eq("id", id);
}

export async function getPendingSignups() {
  const { data, error } = await supabase
    .from("pending_signups").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCheckins(clientId) {
  const { data, error } = await supabase
    .from("checkins").select("*").eq("client_id", clientId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllThisWeek(weekLabel) {
  const { data, error } = await supabase
    .from("checkins").select("client_id, week_label").eq("week_label", weekLabel);
  if (error) throw error;
  return data;
}

export async function submitCheckin(clientId, weekLabel, formData, aiFeedback) {
  const { data, error } = await supabase
    .from("checkins")
    .upsert({
      client_id: clientId, week_label: weekLabel,
      weight: formData.weight, waist: formData.waist || null,
      arms: formData.arms || null, chest: formData.chest || null,
      workout_compliance: formData.workoutCompliance,
      diet_adherence: formData.dietAdherence,
      sleep_quality: formData.sleep, energy_level: formData.energy,
      mood: formData.mood, client_notes: formData.notes,
      photos: formData.photos, ai_feedback: aiFeedback,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "client_id,week_label" })
    .select().single();
  if (error) throw error;
  return data;
}

export async function saveCoachNote(checkinId, note) {
  const { error } = await supabase
    .from("checkins").update({ coach_note: note }).eq("id", checkinId);
  if (error) throw error;
}
