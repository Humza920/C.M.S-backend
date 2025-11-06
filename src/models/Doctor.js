const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
      default: "Other",
    },

    phoneNumber: {
      type: String,
      match: [/^[0-9]{11}$/, "Please enter a valid phone number (11 digits)"],
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      default: "//",
    },

    qualification: {
      type: String,
      trim: true,
      required: [true, "Qualification is required"],
      default: "//",
    },

    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      required: [true, "Experience is required"],
      default: 0,
    },

    about: {
      type: String,
      trim: true,
      default: "No description provided",
    },

    profileImg: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },

    fees: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
      default: 0,
    },

    availableDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],

    availableTime: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: [true, "Room is required for invite"]
    },

    location: {
      address: { type: String },
      city: { type: String },
      country: { type: String, default: "Pakistan" },
    },

    averageRating: {
      type: Number,
      default: 0,
    },


    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
