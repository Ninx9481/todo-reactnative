const bcrypt = require("bcrypt")
const db = require("../../db")

async function createUser(req, res) {
    const { name, email, password } = req.body

    // เช็ค email ซ้ำ
    const existing = await db.collection("users")
        .where("email", "==", email).get()
    if (!existing.empty)
        return res.status(400).json({ message: "email already exists" })

    const password_hash = await bcrypt.hash(password, 10)
    const newUser = {
        name,
        email,
        password_hash,
        created_at: new Date().toISOString()
    }

    const ref = await db.collection("users").add(newUser)
    res.json({ id: ref.id, name, email, created_at: newUser.created_at })
}

async function getUsers(req, res) {
    const snapshot = await db.collection("users").get()
    const users = snapshot.docs.map(doc => {
        const { password_hash, ...data } = doc.data()
        return { id: doc.id, ...data }
    })
    res.json(users)
}

async function findUser(email) {
    const snapshot = await db.collection("users")
        .where("email", "==", email).get()
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
}

module.exports = { createUser, getUsers, findUser }