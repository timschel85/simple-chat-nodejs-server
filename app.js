const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const config = require('./config')

app.set('view engine', 'ejs')
app.use(express.static('public'))

var socket_ids = [];
var i=0;

const passFriendsList = (socket) => {
    socket.emit('freindsList', { 
        nickname : Object.keys(socket_ids), 
        id : Object.keys(socket_ids).map(nickname=>socket_ids[nickname])
    })
        socket.broadcast.emit('freindsList', { 
        nickname : Object.keys(socket_ids), 
        id : Object.keys(socket_ids).map(nickname=>socket_ids[nickname])
    })
}

io.on('connection', (socket)=>{
    console.log('A Client has connected.')
    socket.nickname = "GUEST-"+i;
    i++;
    socket_ids[socket.nickname] = socket.id;
    console.log("### List of friends who join this room ###")
    console.log(socket_ids)
    passFriendsList(socket);

    socket.on('fromClient', (data)=>{
        console.log("[From "+socket.id+"] : " + data)
        socket.emit('toClient toMyself', data) // send the message to the client who send the message
        socket.broadcast.emit('toClient toFriends', data)
    })

    socket.on('disconnect', ()=>{
        console.log(socket.id+' has disconnected.')
        delete socket_ids[socket.nickname]
        console.log("### List of friends who join this room ###")
        console.log(socket_ids)
        passFriendsList(socket);
    })
})

app.get('/', (req, res)=>{
    res.render('chatroom')

})

http.listen(config.port, ()=>{
    console.log('Listening to the port number ' + config.port)
})