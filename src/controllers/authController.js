const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor")
const bcrypt = require("bcrypt");
const validator = require("validator");
const generateToken = require("../utils/generatetoken");
// const {uploadToCloudinary} = require("../config/cloudinary")

exports.register = async (req, res) => {
  const { userName, emailAddress, password, cnic, role } = req.body;

  try {
    if (!userName || !emailAddress || !password || !cnic) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!validator.isEmail(emailAddress)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be strong (uppercase, lowercase, number, symbol, 8+ characters)",
      });
    }

    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALTED_ROUNDS)
    );

    let user = await User.create({
      userName,
      emailAddress,
      password: hashedPassword,
      cnic,
      role,
    });

    try {
      if (user.role === "Patient") {
        await Patient.create({ userId: user._id });
      } else if (user.role === "Doctor") {
        await Doctor.create({ userId: user._id });
      } else if (user.role === "Staff") {
        user = await User.findByIdAndUpdate(
          user._id,
          { isProfileComplete: true },
          { new: true }
        );
      }
    } catch (relatedError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: `Error creating ${user.role} profile: ${relatedError.message}`,
      });
    }

    const token = await generateToken(user._id, user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPass } = user._doc;
    return res.status(201).json({
      success: true,
      message: `${user.role} registration successful`,
      user: userWithoutPass,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};


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
        patient,
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
        doctor,
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
      staff: user
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

exports.completeProfile = async (req, res) => {
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
      const {
        age,
        gender,
        bloodGroup,
        address,
        profileImg,
        phoneNumber,
        emergencyContact,
        medicalHistory,
        allergies,
      } = req.body;

      const patient = await Patient.findOneAndUpdate(
        { userId },
        {
          $set: {
            age,
            gender,
            bloodGroup,
            address,
            profileImg,
            phoneNumber,
            emergencyContact,
            medicalHistory,
            allergies,
          },
        },
        { new: true, runValidators: true }
      );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient record not found. Please contact admin.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Patient profile updated successfully.",
        data: patient,
      });
    }

    if (userRole === "Doctor") {
      const {
        gender,
        phoneNumber,
        specialization,
        qualification,
        experience,
        about,
        profileImg,
        fees,
        availableDays,
        availableTime,
        location,
        averageRating,
      } = req.body;

      const doctor = await Doctor.findOneAndUpdate(
        { userId },
        {
          $set: {
            gender,
            phoneNumber,
            specialization,
            qualification,
            experience,
            about,
            profileImg,
            fees,
            availableDays,
            availableTime,
            location,
            averageRating,
          },
        },
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor record not found. Please contact admin.",
        });
      }

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
