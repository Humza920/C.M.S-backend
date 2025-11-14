const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor")
const Invite = require("../models/Invite")
const bcrypt = require("bcrypt");
const validator = require("validator");
const generateToken = require("../utils/generatetoken");
const { hashToken } = require("../utils/token")
const mongoose = require("mongoose");
const Room = require("../models/Room");
const { uploadToCloudinary } = require("../config/cloudinary");
const { json } = require("express");

// Register
exports.register = async (req, res) => {
  let uploadResult
  const { userName, emailAddress, password, cnic, token, role} = req.body;
  const file = req.file
  console.log(file);
  console.log(role);
  console.log(token);
  if (file) {
    uploadResult = await uploadToCloudinary(file.buffer)
  }
  
  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    if (!userName || !emailAddress || !password || !cnic) {
      throw new Error("Please fill all required fields")
    }
    if (!validator.isEmail(emailAddress)) {
      throw new Error("Please enter a valid email address")
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error(
        "Password must be strong (uppercase, lowercase, number, symbol, 8+ characters)"
      );
    }
    const existingUser = await User.findOne({ emailAddress }).session(session);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALTED_ROUNDS)
    );
    let user, invite, doctor, room;
    if (token && role === "Doctor") {
      const tokenHash = hashToken(token);
      console.log(tokenHash);
      
      invite = await Invite.findOne({
        tokenHash,
        status: "Pending",
      }).session(session);
      if (!invite) {
        throw new Error("Invalid or expired invitation link");
      }
      room = await Room.create(
        [
          {
            roomNumber: invite.roomNumber,
          },
        ],
        { session }
      );
      room = room[0];
      user = await User.create(
        [
          {
            userName,
            emailAddress,
            password: hashedPassword,
            cnic,
            role: "Doctor",
            isProfileComplete: false,
          },
        ],
        { session }
      );
      user = user[0];

      doctor = await Doctor.create(
        [
          {
            userId: user._id,
            salary: invite.salary,
            roomId: room._id,
            availableDays: invite.invitedDays,
            availableTime: invite.invitedTime,
            profileImg : uploadResult.secure_url
          },
        ],
        { session }
      );
      doctor = doctor[0];
      await Room.updateOne(
        { _id: room._id },
        {
          $push: {
            schedules: {
              doctor: doctor._id,
              day: invite.invitedDays,
              startTime: invite.invitedTime?.start || "09:00 AM",
              endTime: invite.invitedTime?.end || "05:00 PM",
            },
          },
        },
        { session }
      );
      invite.status = "Accepted";
      await invite.save({ session });
    }
    else {
      user = await User.create(
        [
          {
            userName,
            emailAddress,
            password: hashedPassword,
            cnic,
            role: "Patient",
          },
        ],
        { session }
      );
      user = user[0];
      await Patient.create(
        [
          {
            userId: user._id,
            profileImg : uploadResult.secure_url
          },
        ],
        { session }
      );
    }
    await session.commitTransaction();
    session.endSession();
    const tokenJWT = await generateToken(user._id, user.role);
    res.cookie("token", tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPass } = user._doc || user;
    return res.status(201).json({
      success: true,
      message: `${user.role} registration successful`,
      user: userWithoutPass,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Registration Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    if (!emailAddress)
      return res.status(400).json({ success: false, message: "Enter your Email Address" });
    if (!password)
      return res.status(400).json({ success: false, message: "Enter your Password" });
    const user = await User.findOne({ emailAddress }).select("+password");
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userWithoutPass } = user._doc;
    res.status(200).json({
      success: true,
      message: "Login Successful",
      user: userWithoutPass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.json({ success: true, message: "Logout Successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. User not found in request.",
      });
    }
    if (userRole === "Patient") {
      const patient = await Patient.findOne({ userId })
        .populate("userId");
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found for this user ID",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Patient details fetched successfully",
        data : patient,
      });
    }
    if (userRole === "Doctor") {
      const doctor = await Doctor.findOne({ userId })
        .populate("userId");
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found for this user ID",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Doctor details fetched successfully",
        data :  doctor,
      });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data :  user
    });
  } catch (error) {
    console.error("Error in getMe:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Complete Profile
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    let uploadResult = null;

    // Upload only if file exists
    if (req.file) {
      uploadResult = await uploadToCloudinary(req.file.buffer);
    }

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. User not found in request.",
      });
    }

    // ---------------- PATIENT ----------------
    if (userRole === "Patient") {
      let {
        age,
        gender,
        bloodGroup,
        address,
        phoneNumber,
        emergencyContact,
        medicalHistory,
        allergies,
      } = req.body;
      emergencyContact = JSON.parse(emergencyContact)
      allergies = JSON.parse(allergies)
      

      const updateData = {
        age,
        gender,
        bloodGroup,
        address,
        phoneNumber,
        emergencyContact,
        medicalHistory,
        allergies,
      };

      // Add profileImg only if new file uploaded
      if (uploadResult) {
        updateData.profileImg = uploadResult.secure_url;
      }

      const patient = await Patient.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient record not found. Please contact admin.",
        });
      }

      await User.findByIdAndUpdate(userId, { isProfileComplete: true });

      return res.status(200).json({
        success: true,
        message: "Patient profile updated successfully.",
        data: patient,
      });
    }

    // ---------------- DOCTOR ----------------
    if (userRole === "Doctor") {
      let {
        gender,
        phoneNumber,
        specialization,
        qualification,
        experience,
        about,
        fees,
        availableDays,
        availableTime,
        location,
        averageRating,
      } = req.body;

            availableDays = JSON.parse(availableDays)
            availableTime = JSON.parse(availableTime)
            location = JSON.parse(location)

      const updateData = {
        gender,
        phoneNumber,
        specialization,
        qualification,
        experience,
        about,
        fees,
        availableDays,
        availableTime,
        location,
        averageRating,
      };


      
      // Update only if file uploaded
      if (uploadResult) {
        updateData.profileImg = uploadResult.secure_url;
      }

      const doctor = await Doctor.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor record not found. Please contact admin.",
        });
      }

      await User.findByIdAndUpdate(userId, { isProfileComplete: true });

      return res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully.",
        data: doctor,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid user role. Only Doctor or Patient allowed.",
    });

  } catch (error) {
    console.error("Error in completeProfile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


