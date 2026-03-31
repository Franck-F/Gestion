import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import env from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === env.CLIENT_URL || (process.env.VERCEL_URL && origin.endsWith('.vercel.app'))) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
}))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes. Réessayez dans une minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/google', authLimiter)
app.use('/api', apiLimiter)

if (env.NODE_ENV === 'development') {
  const morgan = await import('morgan')
  app.use(morgan.default('dev'))
}
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api', routes)

app.use(errorHandler)

export default app
