import { Router } from 'express'
import prisma from '../config/database.js'
import authRoutes from './auth.routes.js'
import candidaturesRoutes from './candidatures.routes.js'
import boursesRoutes from './bourses.routes.js'
import objectivesRoutes from './objectives.routes.js'
import documentsRoutes from './documents.routes.js'
import eventsRoutes from './events.routes.js'
import notesRoutes from './notes.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import notificationsRoutes from './notifications.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/candidatures', candidaturesRoutes)
router.use('/bourses', boursesRoutes)
router.use('/objectives', objectivesRoutes)
router.use('/documents', documentsRoutes)
router.use('/events', eventsRoutes)
router.use('/notes', notesRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/notifications', notificationsRoutes)

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() })
  }
})

export default router
