import { Router } from 'express'
import authRoutes from './auth.routes.js'
import candidaturesRoutes from './candidatures.routes.js'
import boursesRoutes from './bourses.routes.js'
import objectivesRoutes from './objectives.routes.js'
import documentsRoutes from './documents.routes.js'
import eventsRoutes from './events.routes.js'
import notesRoutes from './notes.routes.js'
import dashboardRoutes from './dashboard.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/candidatures', candidaturesRoutes)
router.use('/bourses', boursesRoutes)
router.use('/objectives', objectivesRoutes)
router.use('/documents', documentsRoutes)
router.use('/events', eventsRoutes)
router.use('/notes', notesRoutes)
router.use('/dashboard', dashboardRoutes)

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
