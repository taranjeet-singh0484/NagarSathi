export const detectComplaintCategory = async (text) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { category: "Other", confidence: 0 };
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
          max_tokens: 100,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: `Classify this civic complaint into exactly one category.

Categories: Roads & Infrastructure, Water Supply, Sanitation & Waste, Street Lighting, Public Safety, Environmental Issues, Noise Pollution, Drainage & Sewage, Traffic & Parking, Illegal Construction, Stray Animals, Parks & Public Spaces, Government Staff Misconduct, Other

Complaint: "${text}"

Reply ONLY with raw JSON, no markdown, no explanation: {"category": "...", "confidence": 0.0}`,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      throw new Error(data.error?.message || "Groq API failed");
    }

    const raw = data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    console.log(
      "Detected category:",
      parsed.category,
      "| Confidence:",
      parsed.confidence,
    );

    return {
      category: parsed.category,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error("Category detection error:", error.message);
    return { category: "Other", confidence: 0 };
  }
};
