import prisma from '../config/database.js'

export async function listCandidatures(userId, { status, search }) {
  const where = { userId }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { jobTitle: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  return prisma.candidature.findMany({
    where,
    include: { contacts: true, _count: { select: { attachments: true, notes: true } } },
    orderBy: { updatedAt: 'desc' },
  })
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
  await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  return prisma.candidature.update({ where: { id }, data })
}

export async function deleteCandidature(userId, id) {
  await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  return prisma.candidature.delete({ where: { id } })
}

export async function updateStatus(userId, id, newStatus) {
  const candidature = await prisma.candidature.findFirstOrThrow({ where: { id, userId } })
  const oldStatus = candidature.status

  const updated = await prisma.candidature.update({
    where: { id },
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
  const candidatures = await prisma.candidature.findMany({ where: { userId } })
  const total = candidatures.length
  const byStatus = {}
  for (const c of candidatures) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  }

  const withResponse = candidatures.filter(c =>
    ['ENTRETIEN', 'OFFRE', 'REFUS'].includes(c.status)
  ).length
  const applied = candidatures.filter(c => c.status !== 'A_POSTULER').length
  const responseRate = applied > 0 ? Math.round((withResponse / applied) * 100) : 0

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeek = candidatures.filter(c => c.appliedAt && new Date(c.appliedAt) >= oneWeekAgo).length

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
  return prisma.contact.update({ where: { id: contactId }, data })
}

export async function deleteContact(userId, candidatureId, contactId) {
  await prisma.candidature.findFirstOrThrow({ where: { id: candidatureId, userId } })
  return prisma.contact.delete({ where: { id: contactId } })
}
