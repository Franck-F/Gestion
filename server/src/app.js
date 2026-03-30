import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import env from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin requests (no origin header) and configured client URL
    if (!origin || origin === env.CLIENT_URL || (process.env.VERCEL_URL && origin.endsWith('.vercel.app'))) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
}))
if (env.NODE_ENV === 'development') {
  const morgan = await import('morgan')
  app.use(morgan.default('dev'))
}
app.use(express.json())
app.use(cookieParser())

app.use('/api', routes)

app.use(errorHandler)

export default app
