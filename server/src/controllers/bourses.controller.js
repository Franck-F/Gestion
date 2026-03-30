import * as service from '../services/bourses.service.js'

export async function list(req, res, next) {
  try { res.json(await service.listBourses(req.userId)) }
  catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getBourse(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Bourse non trouvée' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createBourse(req.userId, req.body)) }
  catch (err) { next(err) }
}

export async function update(req, res, next) {
  try { res.json(await service.updateBourse(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try { await service.deleteBourse(req.userId, req.params.id); res.json({ message: 'Bourse supprimée' }) }
  catch (err) { next(err) }
}

export async function addDoc(req, res, next) {
  try { res.status(201).json(await service.addBourseDoc(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function updateDoc(req, res, next) {
  try { res.json(await service.updateBourseDoc(req.userId, req.params.id, req.params.docId, req.body)) }
  catch (err) { next(err) }
}

export async function removeDoc(req, res, next) {
  try { await service.deleteBourseDoc(req.userId, req.params.id, req.params.docId); res.json({ message: 'Document supprimé' }) }
  catch (err) { next(err) }
}
