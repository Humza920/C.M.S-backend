const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient")
const CaseHistory = require("../models/CaseHistory")
const Doctor = require("../models/Doctor")
// Patient Appointments
exports.myAppointments = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId || userRole !== "Patient") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — Only patients can view their appointments.",
      });
    }
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }
    const myAppointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "userName emailAddress",
        },
      })
      .sort({ appointmentDate: 1, startAt: 1 });
    if (!myAppointments.length) {
      return res.status(200).json({
        success: true,
        message: "You have no appointments booked yet.",
        appointments: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Your booked appointments fetched successfully!",
      appointments: myAppointments,
    });
  } catch (error) {
    console.error("Error fetching my appointments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching appointments.",
    });
  }
};

exports.getCaseHistories = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || !["Patient", "Doctor"].includes(userRole)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — Only patients or doctors can view case histories.",
      });
    }

    let caseHistories = [];

    if (userRole === "Patient") {
      // ✅ Patient perspective
      const patient = await Patient.findOne({ userId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient record not found.",
        });
      }

      caseHistories = await CaseHistory.find({ patient: patient._id })
        .populate({
          path: "doctor",
          populate: { path: "userId", select: "userName emailAddress" },
        })
        .populate("appointment", "appointmentDate startAt endAt status")
        .sort({ createdAt: -1 });
    } else if (userRole === "Doctor") {
      // ✅ Doctor perspective
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor record not found.",
        });
      }

      caseHistories = await CaseHistory.find({ doctor: doctor._id })
        .populate({
          path: "doctor",
          populate: { path: "userId", select: "userName emailAddress" },
        })
        .populate({
          path: "patient",
          populate: { path: "userId", select: "userName emailAddress" },
        })
        .populate("appointment", "appointmentDate startAt endAt status")
        .sort({ createdAt: -1 });
    }

    if (!caseHistories.length) {
      return res.status(200).json({
        success: true,
        message: "No case histories found yet.",
        caseHistories: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Case histories fetched successfully.",
      caseHistories,
    });
  } catch (error) {
    console.error("Error fetching case histories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching case histories.",
      error: error.message,
    });
  }
};