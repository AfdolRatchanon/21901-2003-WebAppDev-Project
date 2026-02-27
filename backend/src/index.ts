import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

import authRouter from './routes/auth'
import { createEquipmentRouter } from './routes/equipments'

const app = express()
const httpServer = createServer(app)

// ตั้งค่า Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/equipments', createEquipmentRouter(io))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('joinRoom', (room: string) => {
    socket.join(room)
    console.log(`${socket.id} joined room: ${room}`)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
