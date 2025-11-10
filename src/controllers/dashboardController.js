// const Appointment = require("../models/Appointment");
// const Doctor = require("../models/Doctor");
// const User = require("../models/User");

// exports.getMyAppointments = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const userRole = req.user?.role;

//     if (!userId || !userRole) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized access.",
//       });
//     }

//     let appointments = [];

//     // ✅ PATIENT — show only their booked appointments
//     if (userRole === "Patient") {
//       appointments = await Appointment.find({ patientId: userId })
//         .populate("doctorId", "fullName specialization")
//         .sort({ appointmentDate: 1 });
//     }

//     // ✅ DOCTOR — show all appointments booked with them
//     else if (userRole === "Doctor") {
//       appointments = await Appointment.find({ doctorId: userId })
//         .populate("patientId", "userName emailAddress")
//         .sort({ appointmentDate: 1 });
//     }

//     // ✅ STAFF — show all appointments (clinic-wide)
//     else if (userRole === "Staff") {
//       appointments = await Appointment.find()
//         .populate("patientId", "userName emailAddress")
//         .populate("doctorId", "fullName specialization")
//         .sort({ appointmentDate: 1 });
//     }

//     // ✅ If no role matched
//     else {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied for this role.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Appointments fetched successfully",
//       total: appointments.length,
//       appointments,
//     });

//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// controllers/dashboardController.js
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

// ✅ GET /api/dashboard
exports.dashboard = async (req, res) => {
  try {
    // 1️⃣ Fetch all doctors with related user & room info
    const doctors = await Doctor.find()
    .populate("roomId" , "roomNumber")
      .populate("userId", "userName emailAddress role")

    // 2️⃣ Fetch all patients with their user info
    const patients = await Patient.find()
      .populate("userId", "userName emailAddress role");

    // 3️⃣ Fetch all appointments with populated doctor & patient info
    const appointments = await Appointment.find()
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "userName emailAddress" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "userName emailAddress" },
      })
      .sort({ appointmentDate: -1 }); // latest first

    // 4️⃣ Group appointments per doctor (useful for dashboard insights)
    const doctorAppointments = {};
    doctors.forEach((doc) => {
      doctorAppointments[doc._id] = appointments.filter(
        (a) => a.doctorId && a.doctorId._id.toString() === doc._id.toString()
      );
    });

    // 5️⃣ Send response
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

// ✅ Get All Doctors (for dropdowns, lists, etc.)
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
