import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createObjectiveSchema, updateObjectiveSchema, createMilestoneSchema, updateMilestoneSchema, reorderMilestonesSchema } from '../validators/objectives.validator.js'
import * as ctrl from '../controllers/objectives.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createObjectiveSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateObjectiveSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)
router.post('/:id/, validateId,check-in', ctrl.checkIn)

router.post('/:id/, validateId,milestones', validate(createMilestoneSchema), ctrl.createMilestone)
router.patch('/:id/milestones/:milestoneId', validate(updateMilestoneSchema), ctrl.updateMilestone)
router.delete('/:id/milestones/:milestoneId', ctrl.deleteMilestone)
router.patch('/:id/milestones/reorder', validate(reorderMilestonesSchema), ctrl.reorderMilestones)

export default router
