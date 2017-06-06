const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser  = require('body-parser');
const mongoose = require('mongoose')

const config = require('./config')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs')
app.use(express.static('public'))

mongoose.connect(config.dbConnectionString);
const db = mongoose.connection;
db.once('open', ()=>{
    console.log("DB connected.")
})
db.on('error', (err)=>{
    console.log("DB ERROR : "+err)
})
const Room  = require('./models/room')


var nicknames = []
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
    // enter the lobby
    socket.nickname = "GUEST-"+i;
    console.log(socket.nickname+' has connected.')
    i++;
    nicknames[socket.id] = socket.nickname;
    console.log("### List of friends who join this room ###")
    console.log(nicknames)
    passFriendsList(socket);

    socket.on('joinRoom', (roomId)=>{
        console.log(socket.nickname+" has joined a room["+roomId+"].")
        socket.roomId = roomId
        socket.join(roomId)
        Room.findByIdAndUpdate(
            roomId, 
            {$push:{socketIds:socket.id}},
            {'new':true, safe:true},
            (err, model) => {
                if(err) {
                    console.error('error : ' + err)
                    return
                }
                console.log(model)
        })
    })
    socket.on('leaveRoom', ()=>{
        console.log(socket.nickname+" has left a room["+socket.roomId+"].")
        socket.leave(socket.roomId)
        Room.findById(socket.roomId, (err, room)=>{
            var index = room.socketIds.indexOf(socket.id);
            room.socketIds.splice(index, 1);
            room.save((err, room)=>{
                console.log('save the result...')
                console.log('members : '+room.socketIds.length)
                // There is no one where I've just left.
                if(room.socketIds.length < 1) {
                    Room.findByIdAndRemove(socket.roomId, (err, res)=>{
                        if(err) console.error(err)
                        console.log('There is no one in the room, so delete the room')
                        socket.emit('backToLobby')
                    })
                } else {
                    socket.emit('backToLobby')
                }
            })
        })
    })

    socket.on('fromClient', (data)=>{
        console.log("From "+data.nickname+" in a room["+data.roomId+"] > " + data.message)
        socket.emit('toClient toMyself', data) // send the message to the client who send the message
        socket.broadcast.in(data.roomId).emit('toClient toFriends', data)
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

app.get('/', (req,res)=>{
    res.render('index')
})

app.get('/api/rooms', (req, res)=>{
    Room.find((err, rooms)=>{
        if(err) return res.status(500).send({error:'database failure'})
        res.json(rooms)
    })
})

// make a new chat room
app.post('/api/rooms', (req,res)=>{
    var room = new Room()
    room.name = req.body.name
    room.createAt = new Date()
    room.save((err)=>{
        if(err) {
            console.error(err)
            res.json({result:0})
            return
        }
        res.json(room)
    })
})

http.listen(config.port, ()=>{
    console.log('Listening to the port number ' + config.port)
})