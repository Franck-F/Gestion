import prisma from '../config/database.js'

export async function listCandidatures(userId, { status, search, page = 1, limit = 50 }) {
  const where = { userId }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { jobTitle: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit)
  const [data, total] = await Promise.all([
    prisma.candidature.findMany({
      where,
      include: { contacts: true, _count: { select: { attachments: true, notes: true } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.candidature.count({ where }),
  ])
  return { data, total, page: parseInt(page), limit: parseInt(limit) }
}

export async function getCandidature(userId, id) {
  return prisma.candidature.findFirst({
    where: { id, userId },
    include: {
      contacts: true,
      activities: { orderBy: { date: 'desc' }, take: 50 },
      attachments: true,
    },
  })
}

export async function createCandidature(userId, data) {
  const candidature = await prisma.candidature.create({
    data: { ...data, userId },
  })
  await prisma.candidatureActivity.create({
    data: {
      candidatureId: candidature.id,
      type: 'created',
      description: `Candidature créée pour ${data.companyName}`,
    },
  })
  return candidature
}

export async function updateCandidature(userId, id, data) {
  const record = await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  return prisma.candidature.update({ where: { id: record.id }, data })
}

export async function deleteCandidature(userId, id) {
  const record = await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  return prisma.candidature.delete({ where: { id: record.id } })
}

export async function updateStatus(userId, id, newStatus) {
  const candidature = await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  const oldStatus = candidature.status

  const updated = await prisma.candidature.update({
    where: { id: candidature.id },
    data: {
      status: newStatus,
      appliedAt: newStatus === 'POSTULE' && !candidature.appliedAt ? new Date() : candidature.appliedAt,
      nextFollowUp: newStatus === 'POSTULE' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : candidature.nextFollowUp,
    },
  })

  await prisma.candidatureActivity.create({
    data: {
      candidatureId: id,
      type: 'status_change',
      description: `Statut changé de ${oldStatus} à ${newStatus}`,
      oldStatus,
      newStatus,
    },
  })

  return updated
}

export async function getStats(userId) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [grouped, total, thisWeek] = await Promise.all([
    prisma.candidature.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    prisma.candidature.count({ where: { userId } }),
    prisma.candidature.count({ where: { userId, appliedAt: { gte: oneWeekAgo } } }),
  ])

  const byStatus = {}
  let withResponse = 0
  let applied = 0
  for (const g of grouped) {
    byStatus[g.status] = g._count
    if (['ENTRETIEN', 'OFFRE', 'REFUS'].includes(g.status)) withResponse += g._count
    if (g.status !== 'A_POSTULER') applied += g._count
  }

  const responseRate = applied > 0 ? Math.round((withResponse / applied) * 100) : 0
  return { total, byStatus, responseRate, thisWeek }
}

export async function getReminders(userId) {
  return prisma.candidature.findMany({
    where: {
      userId,
      nextFollowUp: { lte: new Date() },
      status: { in: ['POSTULE', 'RELANCE'] },
    },
    orderBy: { nextFollowUp: 'asc' },
  })
}

// Contacts
export async function listContacts(userId, candidatureId) {
  await prisma.candidature.findFirstOrThrow({ where: { id: candidatureId, userId } })
  return prisma.contact.findMany({ where: { candidatureId } })
}

export async function createContact(userId, candidatureId, data) {
  await prisma.candidature.findFirstOrThrow({ where: { id: candidatureId, userId } })
  return prisma.contact.create({ data: { ...data, candidatureId } })
}

export async function updateContact(userId, candidatureId, contactId, data) {
  await prisma.candidature.findFirstOrThrow({ where: { id: candidatureId, userId } })
  const contact = await prisma.contact.findFirstOrThrow({ where: { id: contactId, candidatureId } })
  return prisma.contact.update({ where: { id: contact.id }, data })
}

export async function deleteContact(userId, candidatureId, contactId) {
  await prisma.candidature.findFirstOrThrow({ where: { id: candidatureId, userId } })
  const contact = await prisma.contact.findFirstOrThrow({ where: { id: contactId, candidatureId } })
  return prisma.contact.delete({ where: { id: contact.id } })
}
