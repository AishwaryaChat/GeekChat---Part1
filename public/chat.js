window.onload = () => {
  const socket = io.connect()
  const message = document.getElementById('message')
  const submitMsg = document.getElementById('submitMsg')
  const userArea = document.getElementById('userArea')
  const messageArea = document.getElementById('messageArea')
  const submitUser = document.getElementById('submitUser')
  const userName = document.getElementById('userName')
  const usersList = document.getElementById('users')
  const messagesArea = document.getElementById('messages-area')
  const chat = document.getElementById('chat')
  const videoButton = document.getElementById('video-button')
  const videoArea = document.getElementById('video-area')
  const video = document.getElementById('video')

  let selectedUser = ''

  submitMsg.onclick = e => {
    e.preventDefault()
    socket.emit('send message', message.value, selectedUser)
    message.value = ''
  }
  socket.on('new message', message => {
    const ele = document.createElement('p')
    ele.innerHTML = `<strong>${message.user}: </strong>` + message.msg
    messagesArea.appendChild(ele)
  })

  submitUser.onclick = e => {
    e.preventDefault()
    socket.emit('new user', userName.value, data => {
      if (data) {
        userArea.style.display = 'none'
        messageArea.style.display = 'block'
        const user = document.getElementById('user')
        user.innerHTML = userName.value
        userName.value = ''
      }
    })
  }

  videoButton.onclick = () => {
    let myURL = URL || window.webkitURL

    navigator.getMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia

    // Capture video
    navigator.getMedia({
      video: true,
      audio: false
    },
    stream => {
      console.log(stream)
      myURL = myURL.createObjectURL(stream)
      socket.emit('video chat', myURL, selectedUser)
    },
    err => console.log(err))
  }

  socket.on('get users', users => {
    usersList.innerHTML = ''
    users.map(user => {
      const userName = document.createElement('li')
      userName.innerHTML = `<span>${user.name}</span>`
      userName.id = user.name
      userName.classname = 'list-group-item'
      usersList.appendChild(userName)
      userName.onclick = e => {
        e.preventDefault()
        selectedUser = userName.id
        socket.emit('user selected', selectedUser)
      }
    })
  })

  socket.on('send history', msgs => {
    messagesArea.innerHTML = ''
    console.log('messagesssssss', msgs)
    msgs.map(msg => {
      console.log('something')
      let message = document.createElement('p')
      message.innerHTML = `<strong>${msg.name}: </strong>` + msg.text
      messagesArea.appendChild(message)
    })
    chat.style.display = 'block'
  })

  socket.on('accept video', (URL, user) => {
    chat.style.display = 'block'
    video.src = URL
    console.log('videoArea ', videoArea)
  })
}
