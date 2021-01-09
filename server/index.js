const express = require('express')
const cors = require('cors')
require('./db/mongoose')

// Global
const register = require('./routers/global/register')
const login = require('./routers/global/login')
const logout = require('./routers/global/logout')
const circuit = require('./routers/circuit')

const app = express()
const port = process.env.PORT || 3000

//enables cors
app.use(cors({
    'allowedHeaders': ['Authorization', 'Content-Type'],
    'exposedHeaders': ['Authorization'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}))

app.use(express.json())

// Global for Forms
app.use(register)
app.use(login)
app.use(logout)
app.use(circuit)

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

const io = require('socket.io')(server);

io.on('connection', function(socket) {
    // console.log(socket.id)
    console.log("Socket connected.")

    socket.on('subscribe', function(room) {
        console.log('joining room', room);
        socket.join(room);
    });
    
    socket.on('send message', function(data) {
        console.log('sending room post', data.room);
        socket.broadcast.to(data.room).emit('conversation private post', {
            message: data.message
        });
    });

    socket.on('send notification', function(data) {
        // log("joined ")
        console.log('sending room post', data.room);
        socket.broadcast.to(data.room).emit('receive notification', {
            body: data
        });
    });
});