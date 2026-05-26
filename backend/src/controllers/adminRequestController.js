import User from "../models/User.js";

// POST - user requests admin role
export const requestAdminRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({ message: "You are already an admin" });
    }

    if (user.adminStatus === "pending") {
      return res
        .status(400)
        .json({
          message: "Request already submitted, please wait for approval",
        });
    }

    if (user.adminStatus === "approved") {
      return res
        .status(400)
        .json({ message: "Your request was already approved" });
    }

    user.adminStatus = "pending";
    user.adminRequestedAt = new Date(); // ← sets the timestamp
    await user.save();

    res.status(200).json({ message: "Admin request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting request" });
  }
};

// GET all pending admin requests
export const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ adminStatus: "pending" })
      .select("name email adminRequestedAt createdAt")
      .sort({ adminRequestedAt: 1 });

    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// PATCH approve admin request
export const approveAdminRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.adminStatus !== "pending") {
      return res.status(400).json({ message: "No pending request found" });
    }

    user.role = "admin";
    user.adminStatus = "approved";
    user.adminApprovedBy = req.user.id;

    // in-app notification
    user.notifications.push({
      message: "🎉 Your request to become an admin has been approved!",
      isRead: false,
      createdAt: new Date(),
    });

    await user.save();

    res.status(200).json({ message: `${user.name} is now an admin` });
  } catch (error) {
    res.status(500).json({ message: "Error approving request" });
  }
};

// PATCH reject admin request
export const rejectAdminRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.adminStatus !== "pending") {
      return res.status(400).json({ message: "No pending request found" });
    }

    user.role = "citizen";
    user.adminStatus = "rejected";

    // in-app notification
    user.notifications.push({
      message: "❌ Your request for admin access has been rejected.",
      isRead: false,
      createdAt: new Date(),
    });

    await user.save();

    res.status(200).json({ message: `${user.name}'s admin request rejected` });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting request" });
  }
};
