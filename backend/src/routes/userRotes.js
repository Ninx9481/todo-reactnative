const express = require("express")

const router = express.Router()

const { createUser,getUsers} = require("../controllers/userController")

const { authenticateToken } = require("../middleware/authMiddleware")

router.post("/", createUser)

router.get("/", authenticateToken, getUsers)

module.exports = router