import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createNoteSchema, updateNoteSchema } from '../validators/notes.validator.js'
import * as ctrl from '../controllers/notes.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createNoteSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateNoteSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)
router.patch('/:id/pin', ctrl.togglePin)

export default router
