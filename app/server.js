// server.js
const { createServer } = require("http")
const { Server } = require("socket.io")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  })

  io.on("connection", (socket) => {
    console.log("Nouvel utilisateur connecté :", socket.id)

    socket.on("send-message", ({ recipientId, message }) => {
      io.to(recipientId).emit("receive-message", {
        senderId: socket.id,
        message,
      })
    })

    socket.on("join", (userId) => {
      socket.join(userId)
    })
  })

  server.listen(3001, () => {
    console.log("Socket.IO server running on port 3001")
  })
})
