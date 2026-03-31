import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateId } from '../middleware/validateParams.js'
import { createDocumentSchema, updateDocumentSchema } from '../validators/documents.validator.js'
import * as ctrl from '../controllers/documents.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createDocumentSchema), ctrl.create)
router.get('/:id', validateId, ctrl.getOne)
router.patch('/:id', validateId, validate(updateDocumentSchema), ctrl.update)
router.delete('/:id', validateId, ctrl.remove)

router.post('/:id/versions', validateId, ctrl.upload.single('file'), ctrl.addVersion)
router.delete('/:id/versions/:versionId', validateId, ctrl.deleteVersion)

export default router
