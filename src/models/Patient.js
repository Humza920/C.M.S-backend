const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      required: true,
      default: 0,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
      default: "Other",
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    address: {
      type: String,
      trim: true,
    },

    profileImg: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },

    phoneNumber: {
      type: String,
      match: [/^[0-9]{11}$/, "Please enter a valid phone number (11 digits)"],
      required: [true, "Phone number is required"],
      default: "00000000000",
    },

    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: {
        type: String,
        match: [/^[0-9]{11}$/, "Please enter a valid emergency contact number"],
        required: [true, "Emergency number is required"],
        default: "00000000000",
      },
    },

    medicalHistory: {
      type: String,
      default: "No medical history provided",
      trim: true,
    },

    allergies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
