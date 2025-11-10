const Room = require("../models/Room");

exports.checkRoomAvailability = async (req, res, next) => {
  try {
    const { invitedDays = [], invitedTime = {} } = req.body;

    const rooms = await Room.find({});

    function toMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    }

    function isTimeOverlap(start1, end1, start2, end2) {
      const s1 = toMinutes(start1);
      const e1 = toMinutes(end1);
      const s2 = toMinutes(start2)
      const e2 = toMinutes(end2);
      return s1 < e2 && e1 > s2;
    }

    for (const room of rooms) {
      for (const schedule of room.schedules) {
        const hasCommonDay = schedule.day.some((d) =>
          invitedDays.includes(d)
        );

        if (hasCommonDay) {
          if (
            isTimeOverlap(
              invitedTime.start,
              invitedTime.end,
              schedule.startTime,
              schedule.endTime
            )
          ) {
            return res.status(400).json({
              success: false,
              message: `Time conflict! ${schedule.day.join(
                ", "
              )} between ${schedule.startTime}-${schedule.endTime} already booked.`,
            });
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error("Room availability check failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error checking room availability.",
    });
  }
};
