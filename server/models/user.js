const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../../dev.env')
const log = console.log

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    notifications: [],
    // for finding same-stacked coders
    lookingForTeamUp: {
        type: Boolean,
        default: true
    },
    displayName: {
        type: String,
        trim: true,
        required: false,
        maxlength: 18
    },
    description: {
        type: String,
        required: false,
        maxlength: 200
    },
    githubRepository: {
        type: String,
        trim: true,
        required: false,
        maxlength: 60
    },
    discordProfileLink: {
        type: String,
        trim: true,
        required: false,
        maxlength: 60
    },
    stackOverflowLink: {
        type: String,
        trim: true,
        required: false,
        maxlength: 60
    },
    location: {
        type: String,
        trim: true,
        required: false,
        maxlength: 60
    },
    points: {
        type: Number,
        default: 0
    },
    img: { 
        data: Buffer, 
        contentType: String 
    },
    tags: [],
    password: {
        type: String,
        minlength: 7,
        trim: true,
        required: true,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})


userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.SECRET_CODE || config.secret_code)
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    log(username, password)
    let isMatch
    if (!user) { 
      throw new Error('Unable to login.')
    } else {
      isMatch = await bcrypt.compare(password, user.password)
    }

    if (!isMatch) throw new Error('Unable to login')

    return user
}


userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User