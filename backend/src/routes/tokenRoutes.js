const express = require("express")

const router = express.Router()

const { login } = require("../controllers/tokenController")

router.post( "/", login )

module.exports = router