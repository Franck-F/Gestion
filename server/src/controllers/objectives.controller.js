import * as service from '../services/objectives.service.js'

export async function list(req, res, next) {
  try { res.json(await service.listObjectives(req.userId)) }
  catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const data = await service.getObjective(req.userId, req.params.id)
    if (!data) return res.status(404).json({ error: 'Objectif non trouvé' })
    res.json(data)
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await service.createObjective(req.userId, req.body)) }
  catch (err) { next(err) }
}

export async function update(req, res, next) {
  try { res.json(await service.updateObjective(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try { await service.deleteObjective(req.userId, req.params.id); res.json({ message: 'Objectif supprimé' }) }
  catch (err) { next(err) }
}

export async function checkIn(req, res, next) {
  try { res.json(await service.checkIn(req.userId, req.params.id)) }
  catch (err) { next(err) }
}

export async function createMilestone(req, res, next) {
  try { res.status(201).json(await service.createMilestone(req.userId, req.params.id, req.body)) }
  catch (err) { next(err) }
}

export async function updateMilestone(req, res, next) {
  try { res.json(await service.updateMilestone(req.userId, req.params.id, req.params.milestoneId, req.body)) }
  catch (err) { next(err) }
}

export async function deleteMilestone(req, res, next) {
  try { await service.deleteMilestone(req.userId, req.params.id, req.params.milestoneId); res.json({ message: 'Jalon supprimé' }) }
  catch (err) { next(err) }
}

export async function reorderMilestones(req, res, next) {
  try { res.json(await service.reorderMilestones(req.userId, req.params.id, req.body.milestoneIds)) }
  catch (err) { next(err) }
}
