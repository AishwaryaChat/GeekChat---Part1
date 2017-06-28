const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

const users = []
const connections = []

server.listen(process.env.PORT || 3000, () => {
  console.log('server running')
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

io.sockets.on('connection', socket => {
  connections.push(socket)
  console.log('sockets connected: ', connections.length)

  // Disconnect
  socket.on('disconnect', data => {
    if (socket.username !== undefined) {
      users.splice(users.indexOf(socket.username), 1)
      updateUsernames()
    }
    connections.splice(connections.indexOf(socket), 1)
    console.log('Disconnected: %s sockets connected', connections.length)
  })

  // Send Message
  socket.on('send message', data => {
    console.log(data)
    io.sockets.emit('new message', {msg: data, user: socket.username})
  })

  // New users
  socket.on('new user', (username, cb) => {
    cb(true)
    socket.username = username
    users.push(socket.username)
    updateUsernames()
  })

  const updateUsernames = () => {
    io.sockets.emit('get users', users)
  }
})
