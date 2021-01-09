const mongoose = require('mongoose')
const log = console.log

const projectSchema = new mongoose.Schema({
    open: {
        type: Boolean,
        default: true
    },
    creatorDisplayName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    paid: {
        type: Boolean,
        default: false
    },
    memberLimit: {
        type: Number,
        default: 5
    },
    tags: [],
    members: [],
    githubLink: {
        type: String,
        required: false
    },
    discordLink: {
        type: String,
        required: false
    },
   createdAt: {
       type: Date,
       default: new Date()
   },
   createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
   }
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project