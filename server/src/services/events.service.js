import prisma from '../config/database.js'

export async function listEvents(userId, { start, end, source }) {
  const where = { userId }
  if (start || end) {
    where.startDate = {}
    if (start) where.startDate.gte = new Date(start)
    if (end) where.startDate.lte = new Date(end)
  }
  if (source) where.source = source
  return prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
  })
}

export async function getEvent(userId, id) {
  return prisma.event.findFirst({ where: { id, userId } })
}

export async function createEvent(userId, data) {
  return prisma.event.create({ data: { ...data, userId } })
}

export async function updateEvent(userId, id, data) {
  await prisma.event.findFirstOrThrow({ where: { id, userId } })
  return prisma.event.update({ where: { id }, data })
}

export async function deleteEvent(userId, id) {
  await prisma.event.findFirstOrThrow({ where: { id, userId } })
  return prisma.event.delete({ where: { id } })
}

export async function getAggregatedDeadlines(userId) {
  const now = new Date()
  const [candidatures, bourses, objectives] = await Promise.all([
    prisma.candidature.findMany({
      where: { userId, nextFollowUp: { gte: now }, status: { in: ['POSTULE', 'RELANCE'] } },
      select: { id: true, companyName: true, jobTitle: true, nextFollowUp: true },
    }),
    prisma.bourse.findMany({
      where: { userId, deadline: { gte: now }, status: { notIn: ['ACCEPTE', 'REFUSE'] } },
      select: { id: true, name: true, deadline: true },
    }),
    prisma.objective.findMany({
      where: { userId, targetDate: { gte: now }, status: { notIn: ['COMPLETED', 'ABANDONED'] } },
      select: { id: true, title: true, targetDate: true },
    }),
  ])

  const deadlines = [
    ...candidatures.map(c => ({
      id: c.id, title: `Relance: ${c.companyName} - ${c.jobTitle}`, date: c.nextFollowUp, source: 'CANDIDATURE', sourceId: c.id,
    })),
    ...bourses.map(b => ({
      id: b.id, title: `Deadline: ${b.name}`, date: b.deadline, source: 'BOURSE', sourceId: b.id,
    })),
    ...objectives.map(o => ({
      id: o.id, title: `Objectif: ${o.title}`, date: o.targetDate, source: 'OBJECTIVE', sourceId: o.id,
    })),
  ]

  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date))
  return deadlines
}
