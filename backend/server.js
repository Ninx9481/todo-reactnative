require("dotenv").config()

const express = require("express")
const cors = require("cors")

const userRoutes = require("./src/routes/userRotes")
const tokenRoutes = require("./src/routes/tokenRoutes")
const activityRoutes = require("./src/routes/activityRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/users", userRoutes)
app.use("/tokens", tokenRoutes)
app.use("/activities", activityRoutes)

app.listen(process.env.PORT, () => {
    console.log("server running on port", process.env.PORT)
})