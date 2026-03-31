import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createBourseSchema, updateBourseSchema, createBourseDocSchema, updateBourseDocSchema } from '../validators/bourses.validator.js'
import * as ctrl from '../controllers/bourses.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createBourseSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateBourseSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)

router.post('/:id/documents', validateId, validate(createBourseDocSchema), ctrl.addDoc)
router.patch('/:id/documents/:docId', validateId, validate(updateBourseDocSchema), ctrl.updateDoc)
router.delete('/:id/documents/:docId', validateId, ctrl.removeDoc)

export default router
