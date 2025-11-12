const Invite = require("../models/Invite");
const { sendMail } = require("../utils/mailer");
const { createInviteToken } = require("../utils/token");
const Room = require("../models/Room");

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let time = timeStr.trim().toUpperCase();
    let isPM = false;

    if (time.endsWith("PM")) isPM = true;
    if (time.endsWith("AM")) time = time.replace("AM", "").trim();
    if (isPM) time = time.replace("PM", "").trim()

    const [hours, minutes] = time.split(":").map(Number);

    let totalHours = hours;
    if (isPM && hours < 12) totalHours += 12;
    if (!isPM && hours === 12 && timeStr.toUpperCase().includes("AM")) totalHours = 0;

    return totalHours * 60 + minutes;
}

exports.sendInvite = async (req, res) => {
    try {
        const userId = req.user?._id;
        const {
            email,
            salary,
            invitedDays = [],
            invitedTime = { start: "09:00", end: "17:00" },
            role,
            roomNumber
        } = req.body;

        if (!email || !salary || !role || !roomNumber) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields including room number",
            });
        }

        // convert roomNumber to number for DB comparison
        const roomNumberNum = Number(roomNumber);

        const room = await Room.findOne({ roomNumber: roomNumberNum });

        if (room) {
            for (let schedule of room.schedules) {
                const commonDays = invitedDays.filter(day =>
                    schedule.day.map(d => d.toLowerCase()).includes(day.toLowerCase())
                );

                if (commonDays.length > 0) {
                    const invitedStart = timeToMinutes(invitedTime.start);
                    const invitedEnd = timeToMinutes(invitedTime.end);
                    const scheduleStart = timeToMinutes(schedule.startTime);
                    const scheduleEnd = timeToMinutes(schedule.endTime);

                    if (invitedStart < scheduleEnd && invitedEnd > scheduleStart) {
                        return res.status(400).json({
                            success: false,
                            message: `Schedule conflict on ${commonDays.join(", ")} for the selected time`,
                        });
                    }
                }
            }
        }

        const { token, tokenHash } = createInviteToken();
        const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const respondUrl = `${process.env.FRONTEND_URL}?token=${token}&role=${role}`;
        const html = `
            <h3>You are invited to join the Clinic</h3>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Assigned Room:</strong> ${roomNumber}</p>
            <p><strong>Salary:</strong> ${salary}</p>
            <p><strong>Days:</strong> ${invitedDays.join(", ") || "Not specified"}</p>
            <p><strong>Time:</strong> ${invitedTime.start} - ${invitedTime.end}</p>
            <p>
                <a href="${respondUrl}" 
                   style="background:#4CAF50;color:white;padding:10px 15px;
                   text-decoration:none;border-radius:5px;">
                   Respond to Invitation
                </a>
            </p>
            <p><em>Note: This link will expire on ${tokenExpiresAt.toDateString()}.</em></p>
        `;

        const mailResponse = await sendMail({
            to: email,
            subject: "Clinic Invitation",
            html,
        });

        if (!mailResponse) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email, invite not created.",
            });
        }

        await Invite.create({
            email,
            invitedBy: userId,
            salary,
            invitedDays,
            invitedTime,
            tokenHash,
            tokenExpiresAt,
            role,
            roomNumber: roomNumberNum,
            status: "Pending"
        });

        return res.status(200).json({
            success: true,
            message: "Invite created & email sent successfully.",
        });
    } catch (err) {
        console.error(err , "run");
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
};
