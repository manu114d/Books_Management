const userModel = require('../model/userModel')
const JWT = require('jsonwebtoken')

/////////////////////////////////// Create User /////////////////////////////////

const createUser = async function (req, res) {
    try {
        const data = req.body
        const savedData = await userModel.create(data)
        return res.status(201).send({ status: true, msg: savedData })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

////////////////////////////// Login User /////////////////////////////////////////////

const login = async (req, res) => {
    try {
        let credentials = req.body

        let { email, password } = { ...credentials }

        let user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(400).send({ status: false, msg: "incorrect emailId or password" });

        let token = JWT.sign(
            {
                userId: user._id.toString(),
                type: 'book-management'
            },
            "-- plutonium-- project-book-management -- secret-token --",
            { expiresIn: "6h" }
        )
        res.setHeader("x-api-key", token);

        return res.status(201).send({ status: true, data: token })
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}

module.exports = { createUser, login }