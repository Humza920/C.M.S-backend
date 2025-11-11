const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

// Dashboard
exports.dashboard = async (req, res) => {
  try {
    const doctors = await Doctor.find()
    .populate("roomId" , "roomNumber")
      .populate("userId", "userName emailAddress role")

    const patients = await Patient.find()
      .populate("userId", "userName emailAddress role");
    const appointments = await Appointment.find()
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "userName emailAddress" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "userName emailAddress" },
      })
      .sort({ appointmentDate: -1 });
    const doctorAppointments = {};
    doctors.forEach((doc) => {
      doctorAppointments[doc._id] = appointments.filter(
        (a) => a.doctorId && a.doctorId._id.toString() === doc._id.toString()
      );
    });
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        doctors,
        patients,
        appointments,
        doctorAppointments,
      },
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching dashboard data",
    });
  }
};

exports.doctorsAllData = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "userName emailAddress role");
    return res.status(200).json({
      success: true,
      message: "All doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.error("Doctors fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching doctors",
    });
  }
};
