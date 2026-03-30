import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createBourseSchema, updateBourseSchema, createBourseDocSchema, updateBourseDocSchema } from '../validators/bourses.validator.js'
import * as ctrl from '../controllers/bourses.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createBourseSchema), ctrl.create)
router.get('/:id', ctrl.getOne)
router.patch('/:id', validate(updateBourseSchema), ctrl.update)
router.delete('/:id', ctrl.remove)

router.post('/:id/documents', validate(createBourseDocSchema), ctrl.addDoc)
router.patch('/:id/documents/:docId', validate(updateBourseDocSchema), ctrl.updateDoc)
router.delete('/:id/documents/:docId', ctrl.removeDoc)

export default router
