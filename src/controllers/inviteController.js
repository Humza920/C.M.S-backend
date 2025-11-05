const DoctorInvite = require("../models/DoctorInvite");
const { sendMail } = require("../utils/mailer");
const { createInviteToken, hashToken } = require("../utils/token");

exports.sentInvite = async (req, res) => {
    try {
        const userId = req.user?._id
        const { email, salary, invitedDays = [], invitedTime = { start: "09:00", end: "17:00" }, role } = req.body;

        if (!email || !salary || !role) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const { token, tokenHash } = createInviteToken()
        const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await DoctorInvite.create({
            email,
            invitedBy: userId,
            salary,
            invitedDays,
            invitedTime,
            tokenHash,
            tokenExpiresAt,
        });

        const respond = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;
 

        const html = `
      <h3>You are invited to join the Clinic</h3>
      <p><strong>Salary:</strong> ${salary || "Not specified"}</p>
      <p><strong>Days:</strong> ${invitedDays.join(", ") || "Not specified"}</p>
      <p><strong>Time:</strong> ${invitedTime.start} - ${invitedTime.end}</p>
      <p>
        <a href="${respond}">Respond To Invite</a> 
      </p>
      <p>Link expires on ${tokenExpiresAt.toISOString()}</p>
    `;

        await sendMail({ to: email, subject: "Clinic Invitation", html })
        return res.status(200).json({ success: true, message: "Invite created & email sent" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.respondInvite = async (req ,res) => {
    
}
