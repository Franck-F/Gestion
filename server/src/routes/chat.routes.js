import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { chat } from '../controllers/chat.controller.js'

const router = Router()
router.use(authenticate)

router.post('/', chat)

export default router
