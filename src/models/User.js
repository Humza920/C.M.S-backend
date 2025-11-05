const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
    },
    emailAddress: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Please enter a valid CNIC (e.g. 12345-1234567-1)"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["Staff", "Doctor", "Patient"],
      required: [true, "Role is required"],
      default: "Patient",
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
