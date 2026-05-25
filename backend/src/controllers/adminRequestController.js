import User from "../models/User.js";

// GET all pending admin requests
export const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ adminStatus: "pending" })
      .select("name email adminRequestedAt createdAt")
      .sort({ adminRequestedAt: 1 }); // oldest first

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
    await user.save();

    res.status(200).json({ message: `${user.name}'s admin request rejected` });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting request" });
  }
};
