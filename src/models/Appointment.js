const mongoose = require('mongoose')
const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    appointmentDate: { type: Date, required: true },
    day:{type: String, required: true },
    startAt: { type: String, required: true },
    endAt: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "checked-in", "completed"],
      default: "booked",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment

