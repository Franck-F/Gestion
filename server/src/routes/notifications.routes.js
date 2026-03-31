import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/notifications.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.get('/unread-count', ctrl.unreadCount)
router.patch('/:id/read', ctrl.markRead)
router.post('/mark-all-read', ctrl.markAllRead)
router.get('/vapid-key', ctrl.getVapidKey)
router.post('/push/subscribe', ctrl.subscribePush)
router.post('/push/unsubscribe', ctrl.unsubscribePush)
router.patch('/preferences', ctrl.updatePreferences)

// Cron-triggered endpoint (should be protected by secret in production)
router.post('/trigger-reminders', ctrl.triggerReminders)

export default router
