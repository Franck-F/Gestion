import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createDocumentSchema, updateDocumentSchema } from '../validators/documents.validator.js'
import * as ctrl from '../controllers/documents.controller.js'

const router = Router()
router.use(authenticate)

router.get('/', ctrl.list)
router.post('/', validate(createDocumentSchema), ctrl.create)
router.get('/:id', ctrl.getOne)
router.patch('/:id', validate(updateDocumentSchema), ctrl.update)
router.delete('/:id', ctrl.remove)

router.post('/:id/versions', ctrl.upload.single('file'), ctrl.addVersion)
router.delete('/:id/versions/:versionId', ctrl.deleteVersion)

export default router
