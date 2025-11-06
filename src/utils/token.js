const crypto = require("crypto")

function createInviteToken() {
    const token = crypto.randomBytes(24).toString("hex")

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    return { token, tokenHash }
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex")
}

module.exports = { createInviteToken, hashToken };