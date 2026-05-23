import Complaint from "../models/Complaint.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { detectComplaintCategory } from "../ai/categoryDetection.js";
import { analyzeSentimentAndUrgency } from "../ai/sentimentAnalysis.js";
import { findDuplicateComplaint } from "../ai/duplicateDetection.js";

// @desc Create new complaint

export const createComplaint = async (req, res, next) => {
  try {
    const complaintData = { ...req.body, user: req.user.id };

    // Photo upload
    if (req.file) {
      try {
        const uploadedPhoto = await uploadOnCloudinary(req.file.path);
        complaintData.photoUrl = uploadedPhoto.secure_url;
      } catch (error) {
        return res.status(500).json({ message: "Failed to upload photo" });
      }
    }

    // ── Duplicate Check ──────────────────────────────
    if (complaintData.forceSubmit !== "true") {
      // ← ONLY change inside here
      const recentComplaints = await Complaint.find({
        ward: complaintData.ward,
        category: complaintData.category,
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }).lean();

      const duplicateResult = await findDuplicateComplaint(
        complaintData,
        recentComplaints,
      );

      if (duplicateResult.isDuplicate) {
        return res.status(200).json({
          isDuplicate: true,
          matchedComplaint: duplicateResult.matchedComplaint,
          message: "A similar complaint already exists in your area.",
        });
      }
    }
    delete complaintData.forceSubmit; // ← add this line here
    // ── End Duplicate Check ──────────────────────────

    // AI analysis
    const [categoryResult, sentimentResult] = await Promise.all([
      detectComplaintCategory(complaintData.description),
      analyzeSentimentAndUrgency(complaintData.description),
    ]);

    if (categoryResult.confidence > 0.5) {
      complaintData.category = categoryResult.category;
    }

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
      return res.status(400).json({
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
