const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Project = require('../models/project')
const log = console.log

router.get('/user', auth, async(req, res) => {
    return res.send(req.user)
})

router.patch('/user-data', auth, async(req, res) => {
    const displayName = req.body.displayName
    const description = req.body.description
    const githubRepository = req.body.githubRepository
    const discordProfileLink = req.body.discordProfileLink
    const stackOverflowLink = req.body.stackOverflowLink
    const location = req.body.location

    if (displayName) req.user.displayName = displayName
    else if (description) req.user.description = description
    else if (githubRepository) req.user.githubRepository = githubRepository
    else if (discordProfileLink) req.user.discordProfileLink = discordProfileLink
    else if (stackOverflowLink) req.user.stackOverflowLink = stackOverflowLink
    else if (location) req.user.location = location

    try {
        await req.user.save()

        return res.send()
    } catch(err) {
        return res.send(err)
    }
})

router.post('/tag', auth, async(req, res) => {
    const tag = req.body.tag.toLowerCase()

    try {
        const user = await User.findById({_id: req.user._id})
        user.tags.push(tag)
        await user.save()

        res.sendStatus(200)
    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/project', auth, async(req, res) => {
    try {
        if (req.body.title.length < 10) throw new Error()
        else if (req.body.description.length < 50) throw new Error()
        // else if (req.body.tags.length = 0) throw new Error()
        // else if (req.body.tags.length > 5) throw new Error()
        
        // lowercase Tags
        let lowercasedTags = []
        req.body.tags.forEach((tag) => {
            lowercasedTags.push(tag.toLowerCase())
        })

        const project = new Project({
            creatorDisplayName: req.user.displayName,
            createdBy: req.user._id,
            title: req.body.title,
            description: req.body.description,
            githubLink: req.body.githubLink || null,
            tags: lowercasedTags
        })
        const savedProject = await project.save()

        res.send(savedProject)
    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/projects', auth, async(req, res) => {
    const timesRequestedNewLoad = req.body.timesRequestedNewLoad
    const amountToLoad = 4

    try {
        // timesRequestedNewLoad starts at 0 to fetch latest 12 documents
        const projects = await Project.find({
            createdBy: {$ne: req.user._id}}).
            sort({ _id: -1 }).
            skip(amountToLoad * timesRequestedNewLoad).
            limit(amountToLoad)

        res.send(projects)
    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/my-projects', auth, async(req, res) => {
    try {
        const projects = await Project.find({createdBy: req.user._id})

        return res.send(projects)
    } catch(err) {
        return res.send(err)
    }
})

router.post('/users', auth, async(req, res) => {
    const timesRequestedNewLoad = req.body.timesRequestedNewLoad
    const amountToLoad = 4

    try {
        // timesRequestedNewLoad starts at 0 to fetch latest 12 documents
        const users = await User.find({_id: {$ne: req.user._id}})
        .sort({ _id: -1 })
        .skip(amountToLoad * timesRequestedNewLoad)
        .limit(amountToLoad)

        res.send(users)
    } catch (err) {
        res.sendStatus(400)
    }
})

router.patch('/join', auth, async(req, res) => {
    const projectID = req.body.projectID
    const notificationObject = req.body.notificationObject

    try {
        let project = await Project.findById(projectID)

        // making sure user can't join own project
        if (req.user._id == project.createdBy) { 
            throw new Error("Cannot join own project or team up.")
        }

        project.members.unshift(req.user._id)
        await project.save()

        const userToNotify = await User.findById(project.createdBy)
        userToNotify.notifications.unshift(notificationObject)
        await userToNotify.save()

        return res.send()
    } catch (err) {
        return res.status(400).send(err)
    }
})

router.patch('/leave', auth, async(req, res) => {
    const projectID = req.body.projectID
    const notificationObject = req.body.notificationObject

    try {
        const project = await Project.findById(projectID)

        // Making sure User can't leave his own Project.
        if (req.user._id == project.createdBy) { 
            throw new Error("Cannot leave own project or team up.")
        }

        const index = project.members.indexOf(req.user._id)
        if (index !== -1) project.members.splice(index, 1)

        await project.save()

        const userToNotify = await User.findById(project.createdBy)
        userToNotify.notifications.unshift(notificationObject)
        await userToNotify.save()

        return res.send()
    } catch (err) {
        return res.status(400).send(err)
    }
})

router.delete('/my-project', auth, async(req, res) => {
    const projectID = req.body.projectID

    try {
        const project = await Project.findById(projectID)

        // Making sure User can't delete someone else's Project.
        if (req.user._id.toString() != project.createdBy.toString()) { 
            throw new Error("No permission.")
        }
        await project.delete()

        return res.send()
    } catch (err) {
        return res.status(400).send(err)
    }
})

router.post('/get-users-by-tag', auth, async(req, res) => {
    const tagsArr = req.body.tags
    const timesRequestedNewLoad = req.body.timesRequestedNewLoad
    const amountToLoad = 4

    try {
        let users

        // After * Tags REMOVED from SEARCH 
        // => Load default as below.
        if (!tagsArr.length) {
            users = await User.find()
                .sort({ _id: -1 })
                .limit(amountToLoad)
        } else {
            // Find Projects with Tags. Excluding the User requesting..
            users = await User.find({ tags : { $all : tagsArr }, 
                _id: {$ne: req.user._id}})
                .sort({ _id: -1 })
                .skip(amountToLoad * timesRequestedNewLoad)
                .limit(amountToLoad)
        }
        return res.send(users)
    } catch(err) {
        return res.status(400).send(err)
    }
})

router.post('/get-project-by-id', auth, async(req, res) => {
    const id = req.body.id

    try {
        const project = await Project.findById(id)

        return res.send(project)
    } catch(err) {
        return res.send(err)
    }
})

router.post('/get-user-by-id', auth, async(req, res) => {
    const id = req.body.id

    try {
        const user = await User.findById(id, '-notifications -username')

        return res.send(user)
    } catch(err) {
        return res.send(err)
    }
})

router.post('/set-notifications-as-seen', auth, async(req, res) => {
    const notifications = req.user.notifications.map(obj => ({
         ...obj, read: true
    }))

    try {
        await req.user.updateOne({
            notifications
        })

        res.send()
    } catch(err) {
        res.send(err)
    }
})

router.post('/edit-project', auth, async(req, res) => {
    const receivedProjectData = req.body.projectData
    log(receivedProjectData)

    if (receivedProjectData.title.length < 10) throw new Error()
    else if (receivedProjectData.description.length < 50) throw new Error()
    // else if (receivedProjectData.tags.length = 0) throw new Error()
    // else if (receivedProjectData.tags.length > 5) throw new Error()

    try {
        const project = await Project.findById(receivedProjectData.id)

        // Prevent User from updating someone else's Project.
        if (req.user._id.toString() != project.createdBy.toString()) { 
            log("error")
            throw new Error("No permission.")
        }
        log("on")

        await Project.findByIdAndUpdate(project._id, {
            title: receivedProjectData.title,
            description: receivedProjectData.description,
            githubLink: receivedProjectData.githubLink,
            tags: receivedProjectData.tags
        })

        res.send()
    } catch (error) {
        log(error)
        res.send(error)
    }
})

router.post('/get-projects-by-tag', auth, async(req, res) => {
    const timesRequestedNewLoad = req.body.timesRequestedNewLoad
    const tagsArr = req.body.tags
    const amountToLoad = 4

    try {
        let projects

        // After * Tags REMOVED from SEARCH 
        // => Load default as below.
        if (!tagsArr.length) {
            projects = await Project.find({createdBy: {$ne: req.user._id}}).sort({ _id: -1 }).limit(amountToLoad)
        } else {
            // Find Projects with Tags. Excluding the User requesting...
            projects = await Project.find({ tags : { $all : tagsArr }, 
                createdBy: {$ne: req.user._id}})
                .sort({ _id: -1 })
                .skip(amountToLoad * timesRequestedNewLoad)
                .limit(amountToLoad)
        }

        return res.send(projects)
    } catch(err) {
        return res.status(400).send(err)
    }
})

router.delete('/tag', auth, async(req, res) => {
    const tag = req.body.tag.toLowerCase()
    const userID = req.user._id

    try {
        const user = await User.findById(userID)

        // Remove Tag from Array
        const index = user.tags.indexOf(tag);
        if (index !== -1) user.tags.splice(index, 1);

        await user.save()
        
        return res.send()
    } catch(err) {
        return res.status(400).send(err)
    }
})

router.post('/notifications', auth, async(req, res) => {
    const timeRequested = req.body.timeRequested
    let notifications

    try {
        // Initial Load Request
        if (timeRequested === 0) {
            notifications = req.user.notifications.slice(0, 21)
        } else {
            notifications = req.user.notifications.slice((timeRequested * 21), (timeRequested * 21 + 21))
        }
        
        return res.send(notifications)
    } catch(err) {
        log(err)
        return res.send(err)
    }
})

router.post('/view-members', auth, async(req, res) => {
    const projectID = req.body.projectID
    // log(projectID)

    try {
        const project = await Project.findById(projectID)
        log(project)

        let users = []
        await Promise.all(project.members.map(async (id) => {
            let user = await User.findById(id, 'displayName tags')
            log(user)
            
            users.push(user)
        }))

        return res.send(users)
    } catch(err) {
        return res.send(err)
    }
})

module.exports = router