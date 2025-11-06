const Invite = require("../models/Invite");
const { sendMail } = require("../utils/mailer");
const { createInviteToken, hashToken } = require("../utils/token");

exports.sendInvite = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      email,
      salary,
      invitedDays = [],
      invitedTime = { start: "09:00", end: "17:00" },
      role,
    } = req.body;

    if (!email || !salary || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const { token, tokenHash } = createInviteToken();
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const respondUrl = `${process.env.FRONTEND_URL}/invite/respond?token=${token}&role=${role}`

    const html = `
      <h3>You are invited to join the Clinic</h3>
      <p><strong>Role:</strong> ${role}</p>
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

    if (!mailResponse || mailResponse.rejected?.length) {
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
      status: "Pending",
    });

    return res.status(200).json({
      success: true,
      message: "Invite created & email sent successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


