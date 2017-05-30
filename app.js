const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const config = require('./config')

app.set('view engine', 'ejs')

io.on('connection', (socket)=>{
    console.log('A Client has connected.')

    socket.on('fromclient', (data)=>{
        console.log("[From Client] : " + data)
        socket.emit('toclient', data) // send the message to the client who send the message
        socket.broadcast.emit('toclient', data)
    })

    socket.on('disconnect', ()=>{
        console.log('A Client has disconnected.')
    })
})

app.get('/', (req, res)=>{
    res.render('chatroom')

})

http.listen(config.port, ()=>{
    console.log('Listening to the port number ' + config.port)
})