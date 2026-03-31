import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ─── CLIENTS ────────────────────────────────────────────────────────
export async function getClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return data;
}

export async function addClient({ name, goal, email, phone }) {
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, goal, email, phone })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── CHECK-INS ───────────────────────────────────────────────────────
export async function getCheckins(clientId) {
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("client_id", clientId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllThisWeek(weekLabel) {
  const { data, error } = await supabase
    .from("checkins")
    .select("client_id, week_label")
    .eq("week_label", weekLabel);
  if (error) throw error;
  return data;
}

export async function submitCheckin(clientId, weekLabel, formData, aiFeedback) {
  const { data, error } = await supabase
    .from("checkins")
    .upsert({
      client_id: clientId,
      week_label: weekLabel,
      weight: formData.weight,
      waist: formData.waist || null,
      arms: formData.arms || null,
      chest: formData.chest || null,
      workout_compliance: formData.workoutCompliance,
      diet_adherence: formData.dietAdherence,
      sleep_quality: formData.sleep,
      energy_level: formData.energy,
      mood: formData.mood,
      client_notes: formData.notes,
      photos: formData.photos,
      ai_feedback: aiFeedback,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "client_id,week_label" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveCoachNote(checkinId, note) {
  const { error } = await supabase
    .from("checkins")
    .update({ coach_note: note })
    .eq("id", checkinId);
  if (error) throw error;
}
