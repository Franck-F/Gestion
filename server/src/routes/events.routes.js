import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createEventSchema, updateEventSchema } from '../validators/events.validator.js'
import * as ctrl from '../controllers/events.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.get('/deadlines', ctrl.getDeadlines)
router.post('/', validate(createEventSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateEventSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)

export default router
