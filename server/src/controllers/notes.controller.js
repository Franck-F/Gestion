import * as service from '../services/notes.service.js'

export async function list(req, res, next) {
  try {
    const { type, tag, candidatureId, search } = req.query
    res.json(await service.listNotes(req.userId, { type, tag, candidatureId, search }))
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getNote(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Note non trouvée' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createNote(req.userId, req.body)) }
  catch (err) { next(err) }
}

export async function update(req, res, next) {
  try { res.json(await service.updateNote(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try { await service.deleteNote(req.userId, req.params.id); res.json({ message: 'Note supprimée' }) }
  catch (err) { next(err) }
}

export async function togglePin(req, res, next) {
  try { res.json(await service.togglePin(req.userId, req.params.id)) }
  catch (err) { next(err) }
}
