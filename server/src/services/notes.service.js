import prisma from '../config/database.js'

export async function listNotes(userId, { type, tag, candidatureId, search }) {
  const where = { userId }
  if (type) where.type = type
  if (tag) where.tags = { has: tag }
  if (candidatureId) where.candidatureId = candidatureId
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }
  return prisma.note.findMany({
    where,
    include: { candidature: { select: { id: true, companyName: true, jobTitle: true } } },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  })
}

export async function getNote(userId, id) {
  return prisma.note.findFirst({
    where: { id, userId },
    include: { candidature: { select: { id: true, companyName: true, jobTitle: true } } },
  })
}

export async function createNote(userId, data) {
  return prisma.note.create({
    data: { ...data, userId },
    include: { candidature: { select: { id: true, companyName: true, jobTitle: true } } },
  })
}

export async function updateNote(userId, id, data) {
  const record = await prisma.note.findFirstOrThrow({ where: { id, userId } })
  return prisma.note.update({
    where: { id: record.id },
    data,
    include: { candidature: { select: { id: true, companyName: true, jobTitle: true } } },
  })
}

export async function deleteNote(userId, id) {
  const record = await prisma.note.findFirstOrThrow({ where: { id, userId } })
  return prisma.note.delete({ where: { id: record.id } })
}

export async function togglePin(userId, id) {
  const note = await prisma.note.findFirstOrThrow({ where: { id, userId } })
  return prisma.note.update({
    where: { id: note.id },
    data: { isPinned: !note.isPinned },
  })
}
