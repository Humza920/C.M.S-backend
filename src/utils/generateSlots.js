const moment = require("moment");

function generateTimeSlots(start, end, intervalMinutes, currentDate) {
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  const isToday = moment(currentDate).isSame(moment(), "day");
  const now = moment(); 
  for (let time = startTotal; time < endTotal; time += intervalMinutes) {
    const slotStart = moment(`${startHour}:${startMinute}`, "HH:mm")
      .startOf("day")
      .add(time, "minutes");
    const slotEnd = moment(slotStart).add(intervalMinutes, "minutes");
    if (isToday && slotEnd.isBefore(now)) continue;
    const formattedSlot = `${slotStart.format("HH:mm")} - ${slotEnd.format("HH:mm")}`;
    slots.push(formattedSlot);
  }

  return slots;
}

module.exports = generateTimeSlots;
