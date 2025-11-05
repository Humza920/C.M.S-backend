const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: [true, "Room number is required"],
      unique: true,
      min: [1, "Room number must be at least 1"],
      max: [4, "Clinic has only 4 rooms"],
    },
    availability: {
      openTime: { type: String, default: "10:00 AM" },
      closeTime: { type: String, default: "08:00 PM" },
    },
    schedules: [
      {
        doctor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        day: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collection: "rooms" }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
