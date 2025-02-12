const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../../dev.env')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')

        const decoded = jwt.verify(token, process.env.SECRET_CODE || config.secret_code)
        
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
              
        next()
    } catch(err) {
        // console.log(err)
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth
