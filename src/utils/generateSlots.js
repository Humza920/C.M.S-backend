function generateTimeSlots(start, end, intervalMinutes) {
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute
  for (let time = startTotal; time < endTotal; time += intervalMinutes) {
    const startH = String(Math.floor(time / 60)).padStart(2, "0");
    const startM = String(time % 60).padStart(2, "0");
    const endH = String(Math.floor((time + intervalMinutes) / 60)).padStart(2, "0");
    const endM = String((time + intervalMinutes) % 60).padStart(2, "0");
    slots.push(`${startH}:${startM} - ${endH}:${endM}`);
  }
  return slots;
}
module.exports = generateTimeSlots