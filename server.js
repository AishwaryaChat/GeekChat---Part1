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

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

io.sockets.on('connection', socket => {
  connections.push(socket)
  console.log('sockets connected: ', connections.length)

  // Disconnect
  socket.on('disconnect', data => {
    let i = 0
    if (socket.username !== undefined) {
      users.map(user => {
        if (user.name === socket.username) {
          users.splice(i, 1)
        }
        i++
      })
      updateUsernames()
    }
    connections.splice(connections.indexOf(socket), 1)
    console.log('Disconnected: %s sockets connected', connections.length)
  })

  // Send Message
  socket.on('send message', (data, selectedUser) => {
    let selectedUserID = ''
    users.map(user => {
      if (user.name === selectedUser) {
        selectedUserID = user.id
        user['msgs'].push({name: socket.username, text: data})
      }
      if (user.name === socket.username) {
        user['msgs'].push({name: socket.username, text: data})
      }
    })
    io.sockets.in(socket.id).emit('new message', {msg: data, user: socket.username})
    if (selectedUserID !== '') {
      io.sockets.in(selectedUserID).emit('new message', {msg: data, user: socket.username})
    }
    console.log('userssssssssssssss: ', users)
  })

  // New users
  socket.on('new user', (userName, cb) => {
    let fusers = users.filter(user => user.name === userName)
    if (fusers[0]) {
      cb(false)
    } else {
      cb(true)
      socket.username = userName
      users.push({
        id: socket.id,
        name: socket.username,
        msgs: []
      })
      updateUsernames()
    }
  })

  // user selected
  socket.on('user selected', user => {
    users.map(u => {
      if (u.name === user) {
        io.sockets.in(socket.id).emit('send history', u['msgs'])
      }
    })
  })

  // video chat
  socket.on('video chat', (URL, user) => {
    console.log('userrrrrrrrrr', user, 'myURLllllllllll', URL)
    users.map(u => {
      if (u.name === user) {
        io.sockets.in(u.id).emit('accept video', URL, socket.username)
      }
    })
  })

  const updateUsernames = () => {
    var i = 0
    for (; i < users.length; i++) {
      let onlineUserList = []
      users.map(user => {
        if (user.name !== users[i].name) {
          onlineUserList.push(user)
        }
      })
      io.sockets.in(users[i].id).emit('get users', onlineUserList)
    }
  }
})
