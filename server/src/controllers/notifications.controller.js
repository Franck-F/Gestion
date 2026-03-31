import prisma from '../config/database.js'
import * as service from '../services/notification.service.js'
import { getVapidPublicKey } from '../services/push.service.js'

export async function list(req, res, next) {
  try {
    const unreadOnly = req.query.unread === 'true'
    res.json(await service.getUserNotifications(req.userId, { unreadOnly }))
  } catch (err) { next(err) }
}

export async function unreadCount(req, res, next) {
  try {
    res.json({ count: await service.getUnreadCount(req.userId) })
  } catch (err) { next(err) }
}

export async function markRead(req, res, next) {
  try {
    res.json(await service.markAsRead(req.userId, req.params.id))
  } catch (err) { next(err) }
}

export async function markAllRead(req, res, next) {
  try {
    await service.markAllAsRead(req.userId)
    res.json({ message: 'Toutes les notifications marquées comme lues' })
  } catch (err) { next(err) }
}

export async function getVapidKey(req, res) {
  const key = getVapidPublicKey()
  if (!key) return res.status(404).json({ error: 'Push notifications not configured' })
  res.json({ publicKey: key })
}

export async function subscribePush(req, res, next) {
  try {
    const { subscription } = req.body
    await prisma.user.update({
      where: { id: req.userId },
      data: { pushSubscription: JSON.stringify(subscription) },
    })
    res.json({ message: 'Push subscription enregistrée' })
  } catch (err) { next(err) }
}

export async function unsubscribePush(req, res, next) {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { pushSubscription: null },
    })
    res.json({ message: 'Push subscription supprimée' })
  } catch (err) { next(err) }
}

export async function updatePreferences(req, res, next) {
  try {
    const { notifyEmail, notifyPush } = req.body
    const data = {}
    if (typeof notifyEmail === 'boolean') data.notifyEmail = notifyEmail
    if (typeof notifyPush === 'boolean') data.notifyPush = notifyPush
    const user = await prisma.user.update({ where: { id: req.userId }, data })
    res.json({ notifyEmail: user.notifyEmail, notifyPush: user.notifyPush })
  } catch (err) { next(err) }
}

export async function triggerReminders(req, res, next) {
  try {
    await service.checkAndSendReminders()
    res.json({ message: 'Reminders checked' })
  } catch (err) { next(err) }
}
