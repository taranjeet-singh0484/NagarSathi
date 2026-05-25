import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId; // password not required for Google OAuth users
      },
    },
    role: { type: String, enum: ["citizen", "admin"], default: "citizen" },

    // Admin request fields
    adminStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    adminRequestedAt: { type: Date, default: null },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Google OAuth field (for later)
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  { timestamps: true },
);

// Hash password if modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next(); // skip for OAuth users
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare method
UserSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", UserSchema);
