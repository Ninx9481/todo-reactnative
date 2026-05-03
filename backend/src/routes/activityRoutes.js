const express =
require("express")

const router = express.Router()

const {
    createActivity,
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity
} = require("../controllers/activityController")

const {
    authenticateToken
} = require("../middleware/authMiddleware")

router.post("/",authenticateToken,createActivity)

router.get("/",authenticateToken,getActivities)

router.get("/:id",authenticateToken,getActivityById)

router.put("/:id",authenticateToken,updateActivity)

router.delete("/:id",authenticateToken,deleteActivity)

module.exports = router