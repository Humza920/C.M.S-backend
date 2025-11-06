const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, default: "Doctor" },

  salary: { type: Number },
  invitedDays: { type: [String], default: [] },
  invitedTime: {
    start: String,
    end: String
  },

  roomNumber: {
    type: Number,
    required: [true, "Room number is required"],
    min: [1, "Room number must be between 1 and 4"],
    max: [4, "Room number must be between 1 and 4"]
  },

  status: { type: String, enum: ["Pending", "Accepted", "Used"], default: "Pending" },
  tokenHash: { type: String, required: true, unique: true },
  tokenExpiresAt: { type: Date, required: true },

}, { timestamps: true });

module.exports = mongoose.model("Invite", inviteSchema)
