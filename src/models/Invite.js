const mongoose = require("mongoose");

const doctorInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, default: "Doctor" },

  salary: { type: Number },
  invitedDays: { type: [String], default: [] },
  invitedTime: {
    start: String,
    end: String
  },

  status: { type: String, enum: ["Pending","Accepted","Rejected" , "Used"], default: "Pending" },
  tokenHash: { type: String, required: true, unique: true },
  tokenExpiresAt: { type: Date, required: true },

}, { timestamps: true });

module.exports = mongoose.model("DoctorInvite", doctorInviteSchema);
