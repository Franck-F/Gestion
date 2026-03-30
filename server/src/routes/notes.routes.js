import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createNoteSchema, updateNoteSchema } from '../validators/notes.validator.js'
import * as ctrl from '../controllers/notes.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createNoteSchema), ctrl.create)
router.get('/:id', ctrl.getOne)
router.patch('/:id', validate(updateNoteSchema), ctrl.update)
router.delete('/:id', ctrl.remove)
router.patch('/:id/pin', ctrl.togglePin)

export default router
