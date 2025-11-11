const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient")
const generateTimeSlots = require("../utils/generateSlots")
const moment = require("moment");

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { doctorId, startAt, endAt, appointmentDate, day } = req.body;
    if (!userId || userRole !== "Patient") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — Only patients can book appointments.",
      });
    }
    if (!doctorId || !startAt || !endAt || !appointmentDate || !day) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (doctorId, startAt, endAt, date).",
      });
    }
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please complete registration first.",
      });
    }
    const isBooked = await Appointment.findOne({
      doctorId,
      appointmentDate,
      startAt,
      endAt,
    });
    if (isBooked) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked, please choose another.",
      });
    }
    const newAppointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      startAt,
      day,
      endAt,
      appointmentDate,
      status: "booked",
    });
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Available Slots
exports.availableSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { range } = req.query;

    if (!range || !["week", "month"].includes(range)) {
      return res.status(400).json({
        success: false,
        message: "Please specify valid range = week or month",
      });
    }

    const doctor = await Doctor.findById(doctorId).select("availableDays availableTime");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const { availableDays, availableTime } = doctor;
    console.log(availableDays, availableTime);
    
    const { start, end } = availableTime;

    const startDate = moment().startOf("day"); 
    const endDate = moment().endOf(range); // till end of week/month

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    });

    const bookedSet = new Set(
      appointments.map((a) => {
        const dateStr = moment(a.appointmentDate).format("YYYY-MM-DD");
        return `${dateStr} ${a.startAt} - ${a.endAt}`;
      })
    );

    const allAvailable = [];

    // Loop from today -> end of range
    for (let d = moment(startDate); d.isSameOrBefore(endDate); d.add(1, "day")) {
      const currentDate = d.format("YYYY-MM-DD");
      const dayName = d.format("dddd");

      if (availableDays.includes(dayName)) {
        const dailySlots = generateTimeSlots(start, end, 30, currentDate);

        const availableForDay = dailySlots.filter(
          (slot) => !bookedSet.has(`${currentDate} ${slot}`)
        );

        if (availableForDay.length > 0) {
          allAvailable.push({
            date: currentDate,
            day: dayName,
            availableSlots: availableForDay,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Available slots for upcoming ${range}`,
      range,
      totalDays: allAvailable.length,
      slots: allAvailable,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};


// Cancel Appointment 
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Appointment cancelled (deleted) successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

