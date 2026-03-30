import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createObjectiveSchema, updateObjectiveSchema, createMilestoneSchema, updateMilestoneSchema, reorderMilestonesSchema } from '../validators/objectives.validator.js'
import * as ctrl from '../controllers/objectives.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createObjectiveSchema), ctrl.create)
router.get('/:id', ctrl.getOne)
router.patch('/:id', validate(updateObjectiveSchema), ctrl.update)
router.delete('/:id', ctrl.remove)
router.post('/:id/check-in', ctrl.checkIn)

router.post('/:id/milestones', validate(createMilestoneSchema), ctrl.createMilestone)
router.patch('/:id/milestones/:milestoneId', validate(updateMilestoneSchema), ctrl.updateMilestone)
router.delete('/:id/milestones/:milestoneId', ctrl.deleteMilestone)
router.patch('/:id/milestones/reorder', validate(reorderMilestonesSchema), ctrl.reorderMilestones)

export default router
