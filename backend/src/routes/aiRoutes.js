import express from "express";
import { detectComplaintCategory } from "../ai/categoryDetection.js";

const router = express.Router();

// POST endpoint to handle category detection
router.post("/detect-category", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text field is required for classification.",
      });
    }

    // Call the zero-shot classification function you built
    const classification = await detectComplaintCategory(text);

    return res.status(200).json({
      success: true,
      data: classification,
    });
  } catch (error) {
    console.error("AI Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during AI classification.",
    });
  }
});

export default router;
