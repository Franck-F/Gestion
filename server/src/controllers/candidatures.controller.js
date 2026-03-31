import * as service from '../services/candidatures.service.js'

export async function list(req, res, next) {
  try {
    const { status, search, page, limit } = req.query
    const data = await service.listCandidatures(req.userId, { status, search, page, limit })
    res.json(data)
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getCandidature(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Candidature non trouvée' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try {
    const data = await service.createCandidature(req.userId, req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function update(req, res, next) {
  try {
    const data = await service.updateCandidature(req.userId, req.params.id, req.body)
    res.json(data)
  } catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try {
    await service.deleteCandidature(req.userId, req.params.id)
    res.json({ message: 'Candidature supprimée' })
  } catch (err) { next(err) }
}

export async function updateStatus(req, res, next) {
  try {
    const data = await service.updateStatus(req.userId, req.params.id, req.body.status)
    res.json(data)
  } catch (err) { next(err) }
}

export async function getStats(req, res, next) {
  try {
    const data = await service.getStats(req.userId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function getReminders(req, res, next) {
  try {
    const data = await service.getReminders(req.userId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function listContacts(req, res, next) {
  try {
    const data = await service.listContacts(req.userId, req.params.id)
    res.json(data)
  } catch (err) { next(err) }
}

export async function createContact(req, res, next) {
  try {
    const data = await service.createContact(req.userId, req.params.id, req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function updateContact(req, res, next) {
  try {
    const data = await service.updateContact(req.userId, req.params.id, req.params.contactId, req.body)
    res.json(data)
  } catch (err) { next(err) }
}

export async function deleteContact(req, res, next) {
  try {
    await service.deleteContact(req.userId, req.params.id, req.params.contactId)
    res.json({ message: 'Contact supprimé' })
  } catch (err) { next(err) }
}
