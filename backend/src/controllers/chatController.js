import Complaint from "../models/Complaint.js";

export const chatWithBot = async (req, res, next) => {
  try {
    const { message, chatHistory = [] } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    // Fetch citizen's own complaints for context
    const userComplaints = await Complaint.find({ user: userId })
      .select("-aiAnalysis")
      .sort({ createdAt: -1 }) // latest first
      .limit(5) // ← only last 5 complaints
      .lean();


      const trimmedHistory = chatHistory.slice(-6); 
    // Format complaints as readable context for Groq
    const complaintsContext =
      userComplaints.length > 0
        ? userComplaints
            .map(
              (c) =>
                `#${c.complaintId}|${c.category}|${c.status}|${c.location},Ward ${c.ward}|${new Date(c.createdAt).toLocaleDateString("en-IN")}${c.resolutionNote ? `|${c.resolutionNote}` : ""}`,
            )
            .join("\n")
        : "No complaints filed yet.";

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
          max_tokens: 800,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `You are NagarSathi Assistant, a helpful civic complaint chatbot for Indian citizens.
You are talking to ${userName}.

Their complaints:
${complaintsContext}

Total complaints filed: ${userComplaints.length}
If total is 0, tell the user they haven't filed any complaints yet and guide them to submit one.
If total > 0, show them their complaint details directly without asking them to go somewhere else.

How to file a complaint on NagarSathi:
1. Click "Submit Complaint" in the top navigation bar
2. Fill in your Name, Ward number, and Location (street/landmark)
3. Write a detailed Description of the issue
4. The AI will auto-detect the category, or you can select manually from:
   Roads & Infrastructure, Water Supply, Sanitation & Waste, Street Lighting,
   Public Safety, Environmental Issues, Noise Pollution, Drainage & Sewage,
   Traffic & Parking, Illegal Construction, Stray Animals, Parks & Public Spaces,
   Government Staff Misconduct
5. Optionally upload a photo (JPG/PNG, max 5MB)
6. Click "Submit Complaint"

You can also check your complaints under "My Complaints" in the navigation bar.

Status meanings:
- Open: Complaint received, not yet assigned to anyone
- In Progress: Authorities are actively working on it
- Resolved: Issue has been fixed (resolution note will be shown)

If the user sends a very short message, ask them to clarify what they need help with.
Never crash or say sorry — always give a helpful response.

Important rules:
- Never mention any external website URL, helpline number, or mobile app
- Never say "insert website URL" or "insert helpline number"
- Only refer to NagarSathi features described above
- Always respond in English by default
- Only switch to Hindi or Punjabi if the user explicitly writes in that language
- Never make up complaint details — only use the complaint data provided above`,
            },
            ...trimmedHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq error:", data);
      throw new Error(data.error?.message || "Groq API failed");
    }
    console.log("Raw reply:", data.choices[0].message.content); // debug log
    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
};
