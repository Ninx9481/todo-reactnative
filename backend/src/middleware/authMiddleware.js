const jwt = require("jsonwebtoken")

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"]

    if (!authHeader)
        return res.status(401).json({
            message: "token required"
        })

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY,
        (err, user) => {

        if (err)
            return res.status(401).json({
                message: "invalid token"
            })

        req.user = user

        next()
    })
}

module.exports = {
    authenticateToken
}