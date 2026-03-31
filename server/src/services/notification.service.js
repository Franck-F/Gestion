import prisma from '../config/database.js'
import { sendEmail, templateDeadlineReminder, templateFollowUpReminder } from './email.service.js'
import { sendPushNotification } from './push.service.js'

export async function createNotification(userId, { title, message, type = 'info', link = null }) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, link },
  })

  // Send email + push in background
  deliverNotification(userId, notification).catch(err =>
    console.error('[Notification] Delivery error:', err.message)
  )

  return notification
}

async function deliverNotification(userId, notification) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  // Email
  if (user.notifyEmail) {
    const result = await sendEmail({
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#2578eb;margin:0 0 16px">MyCheckList</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>${notification.message}</p>
          ${notification.link ? `<a href="${notification.link}" style="display:inline-block;background:#2578eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500;margin-top:12px">Voir le détail</a>` : ''}
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">MyCheckList — Organisez vos démarches</p>
        </div>
      `,
    })
    if (result) {
      await prisma.notification.update({ where: { id: notification.id }, data: { sentEmail: true } })
    }
  }

  // Push
  if (user.notifyPush && user.pushSubscription) {
    const result = await sendPushNotification(user.pushSubscription, {
      title: notification.title,
      body: notification.message,
      url: notification.link,
    })
    if (result === 'expired') {
      await prisma.user.update({ where: { id: userId }, data: { pushSubscription: null } })
    } else if (result) {
      await prisma.notification.update({ where: { id: notification.id }, data: { sentPush: true } })
    }
  }
}

export async function getUserNotifications(userId, { unreadOnly = false, limit = 50 }) {
  const where = { userId }
  if (unreadOnly) where.read = false
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markAsRead(userId, notificationId) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, read: false } })
}

// ─── Automated triggers ───

export async function checkAndSendReminders() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // 1. Follow-up reminders for candidatures
  const candidaturesNeedingFollowUp = await prisma.candidature.findMany({
    where: {
      nextFollowUp: { lte: tomorrow },
      status: { in: ['POSTULE', 'RELANCE'] },
    },
    include: { user: true },
  })

  for (const c of candidaturesNeedingFollowUp) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: c.userId,
        type: 'followup',
        link: { contains: c.id },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    })
    if (!existing) {
      await createNotification(c.userId, {
        title: `Relance : ${c.companyName}`,
        message: `Il est temps de relancer votre candidature chez ${c.companyName} pour le poste ${c.jobTitle}.`,
        type: 'followup',
        link: `/candidatures/${c.id}`,
      })
    }
  }

  // 2. Bourse deadline reminders (3 days before)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const boursesNearDeadline = await prisma.bourse.findMany({
    where: {
      deadline: { gte: now, lte: threeDaysFromNow },
      status: { notIn: ['ACCEPTE', 'REFUSE'] },
    },
    include: { user: true },
  })

  for (const b of boursesNearDeadline) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: b.userId,
        type: 'deadline',
        link: { contains: b.id },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    })
    if (!existing) {
      const days = Math.ceil((new Date(b.deadline) - now) / (1000 * 60 * 60 * 24))
      await createNotification(b.userId, {
        title: `Deadline : ${b.name}`,
        message: `La date limite pour ${b.name} est dans ${days} jour${days > 1 ? 's' : ''}.`,
        type: 'deadline',
        link: `/bourses/${b.id}`,
      })
    }
  }

  // 3. Objective check-in reminders (if last check-in > 2 days)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const objectivesNeedingCheckIn = await prisma.objective.findMany({
    where: {
      status: 'IN_PROGRESS',
      OR: [
        { lastCheckIn: { lt: twoDaysAgo } },
        { lastCheckIn: null },
      ],
    },
    include: { user: true },
  })

  for (const o of objectivesNeedingCheckIn) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: o.userId,
        type: 'checkin',
        link: { contains: o.id },
        createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
      },
    })
    if (!existing) {
      await createNotification(o.userId, {
        title: `Check-in : ${o.title}`,
        message: `N'oubliez pas de faire votre check-in pour "${o.title}" et maintenir votre streak !`,
        type: 'checkin',
        link: '/objectives',
      })
    }
  }
}
