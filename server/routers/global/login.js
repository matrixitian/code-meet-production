const express = require('express')
const router = new express.Router()
const User = require('../../models/user')
const log = console.log

router.post('/signin', async (req, res) => {
    const username = req.body.username.toLowerCase()
    log(username)
    const password = req.body.password

    try {
        const user = await User.findByCredentials(username, password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch(err) {
        log(err)
        res.status(400).send("error") 
    }
})

module.exports = router