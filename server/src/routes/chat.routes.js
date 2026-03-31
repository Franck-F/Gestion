import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { chat, getUsage } from '../controllers/chat.controller.js'

const router = Router()
router.use(authenticate)

router.post('/', chat)
router.get('/usage', getUsage)

export default router
