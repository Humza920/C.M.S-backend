const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient")
exports.myAppointments = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // ✅ Check if logged-in user is a patient
    if (!userId || userRole !== "Patient") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — Only patients can view their appointments.",
      });
    }

    // ✅ Find the patient's record using userId
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    // ✅ Find all appointments for this specific patient
    const myAppointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "userName emailAddress",
        },
      })
      .sort({ appointmentDate: 1, startAt: 1 }); // upcoming first

    // ✅ If no appointments
    if (!myAppointments.length) {
      return res.status(200).json({
        success: true,
        message: "You have no appointments booked yet.",
        appointments: [],
      });
    }

    // ✅ Return appointments
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

