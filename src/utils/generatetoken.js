const jwt = require("jsonwebtoken")
async function generateToken(userId , role) {
    const token = jwt.sign({ id: userId , role}, process.env.SECRET_KEY_JWT, {
        expiresIn: "30d"
    })
    return token
}
module.exports = generateToken