const db = require("../../db")

async function createActivity(req, res) {
    const { activity_name, activity_date, activity_time, place, tag, description } = req.body
    const newActivity = {
        activity_name,
        activity_date,
        activity_time,
        place,
        tag,
        description,
        user_id: req.user.id,
        created_at: new Date().toISOString()
    }
    const ref = await db.collection("activities").add(newActivity)
    res.json({ id: ref.id, ...newActivity })
}

async function getActivities(req, res) {
    const snapshot = await db.collection("activities")
        .where("user_id", "==", req.user.id).get()
    const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    res.json(activities)
}

async function getActivityById(req, res) {
    const doc = await db.collection("activities").doc(req.params.id).get()
    if (!doc.exists || doc.data().user_id !== req.user.id)
        return res.status(404).json({ message: "not found" })
    res.json({ id: doc.id, ...doc.data() })
}

async function updateActivity(req, res) {
    const doc = await db.collection("activities").doc(req.params.id).get()
    if (!doc.exists || doc.data().user_id !== req.user.id)
        return res.status(404).json({ message: "not found" })

    const updated = {
        activity_name: req.body.activity_name,
        activity_date: req.body.activity_date,
        activity_time: req.body.activity_time,
        place: req.body.place,
        tag: req.body.tag,
        description: req.body.description
    }
    await db.collection("activities").doc(req.params.id).update(updated)
    res.json({ id: req.params.id, ...updated })
}

async function deleteActivity(req, res) {
    const doc = await db.collection("activities").doc(req.params.id).get()
    if (!doc.exists || doc.data().user_id !== req.user.id)
        return res.status(404).json({ message: "not found" })

    await db.collection("activities").doc(req.params.id).delete()
    res.json({ message: "deleted" })
}

module.exports = {
    createActivity,
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity
}