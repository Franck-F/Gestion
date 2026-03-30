import * as service from '../services/events.service.js'

export async function list(req, res, next) {
  try {
    const { start, end, source } = req.query
    res.json(await service.listEvents(req.userId, { start, end, source }))
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getEvent(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Événement non trouvé' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createEvent(req.userId, req.body)) }
  catch (err) { next(err) }
}

export async function update(req, res, next) {
  try { res.json(await service.updateEvent(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try { await service.deleteEvent(req.userId, req.params.id); res.json({ message: 'Événement supprimé' }) }
  catch (err) { next(err) }
}

export async function getDeadlines(req, res, next) {
  try { res.json(await service.getAggregatedDeadlines(req.userId)) }
  catch (err) { next(err) }
}
