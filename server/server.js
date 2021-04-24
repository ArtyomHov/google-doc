const mongoose = require('mongoose')
const Document = require('./Document')
mongoose.connect('mongodb://localhost/google-doc', {
UseNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify: false,
useCreateIndex: true
})
const io = require('socket.io')(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  socket.on('get-document', (documentId) => {
    findOrCreateDocument(documentId)
    .then((document) => {
      socket.join(documentId)
      socket.emit('load-document', document.data)
      socket.on('send-changes', (delta) => {
        socket.broadcast.to(documentId).emit('receive-changes', delta)
      })
      socket.on('save-document', (data) => {
        Document.findOneAndUpdate({_id: documentId}, {data: data }).then()
    })

    })
  })
})

const findOrCreateDocument = (id) => {
  if (!id) {
    return
  }
  return Document.findById(id)
  .then((document) => {
    return document || Document.create({_id: id, data: {opts: 'test'}})
  })
}
