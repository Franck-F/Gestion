import multer from 'multer'
import * as service from '../services/documents.service.js'

const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, images, Word, Excel, texte.'))
    }
  },
})

export { upload }

export async function list(req, res, next) {
  try {
    const { status, category } = req.query
    res.json(await service.listDocuments(req.userId, { status, category }))
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getDocument(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Document non trouvé' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createDocument(req.userId, req.body)) }
  catch (err) { next(err) }
}

export async function update(req, res, next) {
  try { res.json(await service.updateDocument(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try { await service.deleteDocument(req.userId, req.params.id); res.json({ message: 'Document supprimé' }) }
  catch (err) { next(err) }
}

export async function addVersion(req, res, next) {
  try {
    const versionLabel = req.body.versionLabel || `v${Date.now()}`
    res.status(201).json(await service.addVersion(req.userId, req.params.id, req.file, versionLabel))
  } catch (err) { next(err) }
}

export async function deleteVersion(req, res, next) {
  try { await service.deleteVersion(req.userId, req.params.id, req.params.versionId); res.json({ message: 'Version supprimée' }) }
  catch (err) { next(err) }
}
