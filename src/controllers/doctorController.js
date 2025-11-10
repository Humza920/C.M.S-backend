const Appointment = require("../models/Appointment");
const CaseHistory = require("../models/CaseHistory");

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, diagnosis, prescription, notes, followUpDate } = req.body;
    const doctorId = req.user._id; // assuming doctor is logged in

    // 1️⃣ Find appointment and populate related data
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }



    // 3️⃣ Update appointment status
    appointment.status = status || "completed";
    await appointment.save();

    // 4️⃣ If appointment completed → create case history
    if (status === "completed") {
      if (!diagnosis) {
        return res.status(400).json({
          success: false,
          message: "Diagnosis is required to mark appointment as completed",
        });
      }

      const caseHistory = new CaseHistory({
        patient: appointment.patientId,
        doctor: doctorId,
        appointment: appointment._id,
        diagnosis,
        prescription,
        notes,
        followUpDate,
      });

      await caseHistory.save();
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });

  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.getPatientsPerDoctor = async (req, res) => {
  try {
    const userId = req.user

    // 1️⃣ Doctor ke sare appointments find karo
    const appointments = await Appointment.find(user)
      .populate("patient", "fullName email phoneNumber gender");

    if (!appointments.length) {
      return res.status(404).json({
        success: false,
        message: "No patients found for this doctor",
      });
    }

    // 2️⃣ Unique patients collect karo
    const uniquePatients = new Map();
    appointments.forEach(app => {
      if (app.patient && !uniquePatients.has(app.patient._id.toString())) {
        uniquePatients.set(app.patient._id.toString(), app.patient);
      }
    });

    // 3️⃣ Final list bana do
    const patientsList = Array.from(uniquePatients.values());

    res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      totalPatients: patientsList.length,
      patients: patientsList,
    });

  } catch (error) {
    console.error("Error fetching patients per doctor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const Doctor = require("../models/Doctor");

exports.mydocAppointments = async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in Doctor's User ID

    // Get doctor profile linked to this user
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({
        path: "patientId",        // Appointment -> Patient
        populate: {               // Patient -> User
          path: "userId",
          select: "userName emailAddress", 
        },
      })
      .populate({
        path: "doctorId",       
        populate: {               // Doctor -> User
          path: "userId",
          select: "userName emailAddress role",
        },
      })
      .sort({ appointmentDate: 1, startAt: 1 });

    // const appointment = await Appointment.findOne().populate("patientId");
console.log(appointments);

      
    res.status(200).json({
      success: true,
      data: appointments,
    })
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

