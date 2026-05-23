import stringSimilarity from "string-similarity";

// Step 1: Fast string check
// Step 2: If suspicious, ask Groq with full location context
export const findDuplicateComplaint = async (
  newComplaint,
  existingComplaints,
) => {
  if (!existingComplaints?.length) return { isDuplicate: false };

  const newText =
    `${newComplaint.description} ${newComplaint.location}`.toLowerCase();

  for (const existing of existingComplaints) {
    const existingText =
      `${existing.description} ${existing.location}`.toLowerCase();

    // Step 1: string-similarity check
    const score = stringSimilarity.compareTwoStrings(newText, existingText);

    console.log(`Similarity score with #${existing.complaintId}:`, score);

    // Clearly different → skip
    if (score < 0.5) continue;

    // Suspicious → ask Groq for final decision
    const groqResult = await askGroqForDuplicate(newComplaint, existing);

    if (groqResult.isDuplicate) {
      return {
        isDuplicate: true,
        similarityScore: score,
        matchedComplaint: {
          complaintId: existing.complaintId,
          category: existing.category,
          location: existing.location,
          ward: existing.ward,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      };
    }
  }

  return { isDuplicate: false };
};

// Groq cross-language + location-aware check
const askGroqForDuplicate = async (newComplaint, existingComplaint) => {
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
              content: `You are a duplicate complaint detector for an Indian civic app.
Compare these two complaints and check if they report the SAME issue at the SAME location.
Complaints may be in English, Hindi, Punjabi, or Hinglish.

Complaint 1 (existing):
Description: "${existingComplaint.description}"
Location: "${existingComplaint.location}, Ward ${existingComplaint.ward}"

Complaint 2 (new):
Description: "${newComplaint.description}"
Location: "${newComplaint.location}, Ward ${newComplaint.ward}"

Rules:
- If same issue AND same location → isDuplicate: true
- If same issue BUT different street/location → isDuplicate: false
- If different issue → isDuplicate: false

Reply ONLY with raw JSON:
{"isDuplicate": true/false, "reason": "one line explanation"}`,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message);

    const raw = data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Groq duplicate check error:", error.message);
    return { isDuplicate: false }; // safe fallback
  }
};
