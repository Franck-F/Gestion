import * as service from '../services/dashboard.service.js'

export async function getStats(req, res, next) {
  try { res.json(await service.getStats(req.userId)) }
  catch (err) { next(err) }
}

export async function getUpcomingDeadlines(req, res, next) {
  try { res.json(await service.getUpcomingDeadlines(req.userId)) }
  catch (err) { next(err) }
}

export async function getRecentActivity(req, res, next) {
  try { res.json(await service.getRecentActivity(req.userId)) }
  catch (err) { next(err) }
}
