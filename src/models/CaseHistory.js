const mongoose = require("mongoose");

const caseHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    
    diagnosis: {
        type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    
    prescription: {
        type: String,
      trim: true,
    },
    
    notes: {
        type: String,
        trim: true,
    },
    
    followUpDate: {
        type: Date,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("CaseHistory", caseHistorySchema);