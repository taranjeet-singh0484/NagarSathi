import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY);

export const detectComplaintCategory = async (text) => {
  try {
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",

      inputs: text,

      parameters: {
        candidate_labels: [
          "Road Issue",
          "Garbage",
          "Water Supply",
          "Electricity",
          "Drainage",
          "Street Light",
          "Traffic",
          "Illegal Construction",
        ],
      },
    });

    return {
      category: result.labels[0],
      confidence: result.scores[0],
    };
  } catch (error) {
    console.error("AI Category Detection Error:", error);

    return {
      category: "Other",
      confidence: 0,
    };
  }
};
