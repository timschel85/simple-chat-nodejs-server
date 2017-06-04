const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const config = require('./config')

app.set('view engine', 'ejs')
app.use(express.static('public'))

var nicknames = [];
var i=0;

const passFriendsList = (socket) => {
    socket.emit('freindsList', { 
        id : Object.keys(nicknames), 
        nickname : Object.keys(nicknames).map(id=>nicknames[id])
    })
        socket.broadcast.emit('freindsList', { 
        id : Object.keys(nicknames), 
        nickname : Object.keys(nicknames).map(id=>nicknames[id])
    })
}

io.on('connection', (socket)=>{
    socket.nickname = "GUEST-"+i;
    console.log(socket.nickname+' has connected.')
    i++;
    nicknames[socket.id] = socket.nickname;
    console.log("### List of friends who join this room ###")
    console.log(nicknames)
    passFriendsList(socket);

    socket.on('fromClient', (data)=>{
        console.log("[From "+data.nickname+"] : " + data.message)
        socket.emit('toClient toMyself', data) // send the message to the client who send the message
        socket.broadcast.emit('toClient toFriends', data)
    })

    socket.on('changeNickname', (newNickname)=>{        
        socket.nickname = newNickname;
        nicknames[socket.id] = newNickname
        passFriendsList(socket)
    })

    socket.on('disconnect', ()=>{
        console.log(socket.nickname+' has disconnected.')
        delete nicknames[socket.id]
        console.log("### List of friends who join this room ###")
        console.log(nicknames)
        passFriendsList(socket);
    })
})

app.get('/', (req, res)=>{
    res.render('chatroom')

})

http.listen(config.port, ()=>{
    console.log('Listening to the port number ' + config.port)
})