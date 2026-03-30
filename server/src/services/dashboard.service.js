import prisma from '../config/database.js'

export async function getStats(userId) {
  const [
    candidaturesTotal,
    candidaturesActive,
    boursesTotal,
    boursesActive,
    objectivesTotal,
    objectivesInProgress,
    documentsTotal,
    documentsPret,
  ] = await Promise.all([
    prisma.candidature.count({ where: { userId } }),
    prisma.candidature.count({ where: { userId, status: { notIn: ['OFFRE', 'REFUS'] } } }),
    prisma.bourse.count({ where: { userId } }),
    prisma.bourse.count({ where: { userId, status: { notIn: ['ACCEPTE', 'REFUSE'] } } }),
    prisma.objective.count({ where: { userId } }),
    prisma.objective.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.document.count({ where: { userId } }),
    prisma.document.count({ where: { userId, status: 'PRET' } }),
  ])

  return {
    candidatures: { total: candidaturesTotal, active: candidaturesActive },
    bourses: { total: boursesTotal, active: boursesActive },
    objectives: { total: objectivesTotal, inProgress: objectivesInProgress },
    documents: { total: documentsTotal, ready: documentsPret },
  }
}

export async function getUpcomingDeadlines(userId, limit = 10) {
  const now = new Date()

  const [candidatures, bourses, objectives, events] = await Promise.all([
    prisma.candidature.findMany({
      where: { userId, nextFollowUp: { gte: now }, status: { in: ['POSTULE', 'RELANCE'] } },
      select: { id: true, companyName: true, jobTitle: true, nextFollowUp: true },
      orderBy: { nextFollowUp: 'asc' },
      take: limit,
    }),
    prisma.bourse.findMany({
      where: { userId, deadline: { gte: now }, status: { notIn: ['ACCEPTE', 'REFUSE'] } },
      select: { id: true, name: true, deadline: true },
      orderBy: { deadline: 'asc' },
      take: limit,
    }),
    prisma.objective.findMany({
      where: { userId, targetDate: { gte: now }, status: { notIn: ['COMPLETED', 'ABANDONED'] } },
      select: { id: true, title: true, targetDate: true },
      orderBy: { targetDate: 'asc' },
      take: limit,
    }),
    prisma.event.findMany({
      where: { userId, startDate: { gte: now } },
      select: { id: true, title: true, startDate: true, source: true },
      orderBy: { startDate: 'asc' },
      take: limit,
    }),
  ])

  const deadlines = [
    ...candidatures.map(c => ({ type: 'candidature', id: c.id, title: `Relance: ${c.companyName}`, date: c.nextFollowUp })),
    ...bourses.map(b => ({ type: 'bourse', id: b.id, title: `Deadline: ${b.name}`, date: b.deadline })),
    ...objectives.map(o => ({ type: 'objective', id: o.id, title: `Objectif: ${o.title}`, date: o.targetDate })),
    ...events.map(e => ({ type: 'event', id: e.id, title: e.title, date: e.startDate })),
  ]

  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date))
  return deadlines.slice(0, limit)
}

export async function getRecentActivity(userId, limit = 20) {
  const [activities, notes] = await Promise.all([
    prisma.candidatureActivity.findMany({
      where: { candidature: { userId } },
      include: { candidature: { select: { companyName: true } } },
      orderBy: { date: 'desc' },
      take: limit,
    }),
    prisma.note.findMany({
      where: { userId },
      select: { id: true, title: true, createdAt: true, type: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  const items = [
    ...activities.map(a => ({
      type: 'candidature_activity',
      description: `${a.candidature.companyName}: ${a.description}`,
      date: a.date,
    })),
    ...notes.map(n => ({
      type: 'note',
      description: `Note: ${n.title}`,
      date: n.createdAt,
    })),
  ]

  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return items.slice(0, limit)
}
