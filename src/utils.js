export async function generateFeedback(clientName, goal, entry) {
  const prompt = `You are Evan from ESFITNESS — a strict, no-BS natural bodybuilding coach.
Write a direct weekly check-in response to ${clientName} (goal: ${goal || "physique improvement"}).

Stats: Weight ${entry.weight}lbs, Waist ${entry.waist || "N/A"}", Arms ${entry.arms || "N/A"}", Chest ${entry.chest || "N/A"}".
Workout compliance: ${entry.workoutCompliance}%, Diet adherence: ${entry.dietAdherence}%.
Sleep: ${entry.sleep}/10, Energy: ${entry.energy}/10, Mood: ${entry.mood}/10.
Client notes: "${entry.notes || "None"}".

Be under 80 words. Be direct and specific. If compliance is below 80%, call it out hard. If they're doing well, acknowledge briefly then push for more.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Keep your compliance up. Review next week.";
  } catch {
    return "Keep pushing. Stay consistent with your plan and we'll review next week.";
  }
}

export function getWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
