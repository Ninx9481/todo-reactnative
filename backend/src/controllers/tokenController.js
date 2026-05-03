const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { findUser } = require("./userController")

async function login(req, res) {
    const { email, password } = req.body
    const user = await findUser(email)  // เพิ่ม await

    if (!user)
        return res.status(401).json({ message: "login failed" })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match)
        return res.status(401).json({ message: "login failed" })

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
    )
    res.json({ token })
}

module.exports = { login }