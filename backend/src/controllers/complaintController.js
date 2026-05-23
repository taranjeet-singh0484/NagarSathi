import Complaint from "../models/Complaint.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { detectComplaintCategory } from "../../ai/categoryDetection.js";
import { analyzeSentimentAndUrgency } from "../../ai/sentimentAnalysis.js";

// @desc Create new complaint
export const createComplaint = async (req, res, next) => {
  try {
    const complaintData = { ...req.body, user: req.user.id };

    // Upload photo if present
    if (req.file) {
      try {
        const uploadedPhoto = await uploadOnCloudinary(req.file.path);
        complaintData.photoUrl = uploadedPhoto.secure_url;
      } catch (error) {
        console.log("Error uploading photo:", error);
        return res.status(500).json({ message: "Failed to upload photo" });
      }
    }

    // Run AI analysis in parallel
    const [categoryResult, sentimentResult] = await Promise.all([
      detectComplaintCategory(complaintData.description),
      analyzeSentimentAndUrgency(complaintData.description),
    ]);

    console.log("AI Category:", categoryResult);
    console.log("AI Sentiment/Urgency:", sentimentResult);

    // Override category only if AI is confident enough
    if (categoryResult.confidence > 0.5) {
      complaintData.category = categoryResult.category;
    }

    // Attach AI analysis
    complaintData.aiAnalysis = {
      sentiment: sentimentResult.sentiment,
      urgency: sentimentResult.urgency,
      urgency_reason: sentimentResult.urgency_reason,
      category_confidence: categoryResult.confidence,
    };

    const complaint = await Complaint.create(complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc Get all complaints
export const getComplaints = async (req, res) => {
  try {
    const isAdmin = (req.user?.role || "").toLowerCase() === "admin";

    let query = Complaint.find(isAdmin ? {} : { user: req.user.id }).populate({
      path: "user",
      select: "name email",
    });

    // Hide aiAnalysis from citizens
    if (!isAdmin) {
      query = query.select("-aiAnalysis");
    }

    let complaints = await query.lean();

    // Sort by urgency for admin
    if (isAdmin) {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      complaints.sort(
        (a, b) =>
          (urgencyOrder[a.aiAnalysis?.urgency] ?? 2) -
          (urgencyOrder[b.aiAnalysis?.urgency] ?? 2),
      );
    }

    console.log(
      "GET /complaints -> role:",
      req.user?.role,
      "userId:",
      req.user?.id,
    );
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error });
  }
};

// @desc Update complaint status
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;

    const allowedStatuses = ["Open", "In Progress", "Resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status === "Resolved" && !resolutionNote) {
      return res
        .status(400)
        .json({
          message: "Resolution note is required when status is Resolved",
        });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNote },
      { new: true, runValidators: true },
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(updatedComplaint);
  } catch (error) {
    next(error);
  }
};
