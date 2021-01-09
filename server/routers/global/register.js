const express = require('express')
const router = new express.Router()
const User = require('../../models/user')
const log = console.log

router.post('/signup', async (req, res) => {
  const username = req.body.username.toLowerCase()
  const password = req.body.password

  try {
    let usernameTaken = await User.findOne({ username })

    if (!usernameTaken) {
      const userForSave = new User({
        username,
        displayName: username,
        password
      })

      const user = await userForSave.save()

      const token = await userForSave.generateAuthToken()

      return res.status(201).send({ user, token })
    } else {
      return res.status(400).send('Username taken.')
    }
  } catch(err) {
    log(err)
    return res.status(500).send(err)
  }
})

module.exports = router