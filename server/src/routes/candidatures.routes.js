import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createCandidatureSchema, updateCandidatureSchema, updateStatusSchema, createContactSchema, updateContactSchema } from '../validators/candidatures.validator.js'
import * as ctrl from '../controllers/candidatures.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.get('/stats', ctrl.getStats)
router.get('/reminders', ctrl.getReminders)
router.post('/', validate(createCandidatureSchema), ctrl.create)
router.get('/:id', ctrl.getOne)
router.patch('/:id', validate(updateCandidatureSchema), ctrl.update)
router.delete('/:id', ctrl.remove)
router.patch('/:id/status', validate(updateStatusSchema), ctrl.updateStatus)

router.get('/:id/contacts', ctrl.listContacts)
router.post('/:id/contacts', validate(createContactSchema), ctrl.createContact)
router.patch('/:id/contacts/:contactId', validate(updateContactSchema), ctrl.updateContact)
router.delete('/:id/contacts/:contactId', ctrl.deleteContact)

export default router
