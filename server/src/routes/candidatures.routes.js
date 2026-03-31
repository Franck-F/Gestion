import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createCandidatureSchema, updateCandidatureSchema, updateStatusSchema, createContactSchema, updateContactSchema } from '../validators/candidatures.validator.js'
import * as ctrl from '../controllers/candidatures.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.get('/stats', ctrl.getStats)
router.get('/reminders', ctrl.getReminders)
router.post('/', validate(createCandidatureSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateCandidatureSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)
router.patch('/:id/status', validateId, validate(updateStatusSchema), ctrl.updateStatus)

router.get('/:id/contacts', validateId, ctrl.listContacts)
router.post('/:id/contacts', validateId, validate(createContactSchema), ctrl.createContact)
router.patch('/:id/contacts/:contactId', validateId, validate(updateContactSchema), ctrl.updateContact)
router.delete('/:id/contacts/:contactId', validateId, ctrl.deleteContact)

export default router
