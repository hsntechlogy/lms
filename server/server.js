import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import connectDB from './configs/mongoDB.js'
import connectCloudinary from './configs/cloudinary.js'

import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import { clerkMiddleware } from '@clerk/express'

import educatorRouter from './routes/educatorRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'

// === Initial Setup ===
const app = express()

// === Connect to DB and Cloudinary ===
await connectDB()
await connectCloudinary()

// === CORS Configuration ===
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,// optional, for localhost dev
]

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

// === Middleware ===
app.use(express.json())
app.use(clerkMiddleware())

// === Routes ===
app.get('/', (req, res) => res.send("API working"))
app.post('/clerk', clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/admin', adminRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// === Start Server ===
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
