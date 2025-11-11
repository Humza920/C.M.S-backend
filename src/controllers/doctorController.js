const Appointment = require("../models/Appointment");
const CaseHistory = require("../models/CaseHistory");
const Doctor = require("../models/Doctor");

exports.mydocAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "userName emailAddress" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "userName emailAddress role" },
      })
      .sort({ appointmentDate: 1, startAt: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, diagnosis, prescription, notes, followUpDate } = req.body;
    const userId = req.user._id;
    const appointment = await Appointment.findById(id);

    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    const doctor = await Doctor.findOne({ userId });
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found for this user" });

    if (status === "checkin") {
      appointment.status = "checked-in";
      await appointment.save();
      return res.status(200).json({ success: true, message: "Patient checked in successfully", appointment });
    }

    if (status === "completed") {
      if (!diagnosis)
        return res.status(400).json({ success: false, message: "Diagnosis required" });

      const caseHistory = new CaseHistory({
        patient: appointment.patientId,
        doctor: doctor._id,
        appointment: appointment._id,
        diagnosis,
        prescription,
        notes,
        followUpDate,
      });

      await caseHistory.save();
      appointment.status = "completed";
      await appointment.save();

      return res.status(200).json({
        success: true,
        message: "Appointment completed and case history saved successfully",
        appointment,
      });
    }

    res.status(400).json({ success: false, message: "Invalid status update request" });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
