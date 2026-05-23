export const analyzeSentimentAndUrgency = async (text) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { sentiment: "neutral", urgency: "medium", urgency_reason: "" };
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 150,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: `Analyze this civic complaint for sentiment and urgency.

Complaint: "${text}"

Urgency levels:
- critical: immediate danger to life/health (open manhole, live wire, contaminated water)
- high: serious issue affecting daily life (no water for days, accident-prone road)
- medium: significant but not immediate (broken streetlight, garbage not collected)
- low: minor inconvenience (park bench broken, minor pothole)

Reply ONLY with raw JSON, no markdown:
{"sentiment": "positive|negative|neutral", "urgency": "low|medium|high|critical", "urgency_reason": "one line reason"}`,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "Groq API failed");

    const raw = data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Sentiment/Urgency error:", error.message);
    return { sentiment: "neutral", urgency: "medium", urgency_reason: "" };
  }
};
