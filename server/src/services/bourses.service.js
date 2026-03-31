import prisma from '../config/database.js'

export async function listBourses(userId) {
  return prisma.bourse.findMany({
    where: { userId },
    include: { requiredDocs: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getBourse(userId, id) {
  return prisma.bourse.findFirst({
    where: { id, userId },
    include: { requiredDocs: true },
  })
}

export async function createBourse(userId, data) {
  return prisma.bourse.create({ data: { ...data, userId } })
}

export async function updateBourse(userId, id, data) {
  const record = await prisma.bourse.findFirstOrThrow({ where: { id, userId } })
  return prisma.bourse.update({ where: { id: record.id }, data })
}

export async function deleteBourse(userId, id) {
  const record = await prisma.bourse.findFirstOrThrow({ where: { id, userId } })
  return prisma.bourse.delete({ where: { id: record.id } })
}

export async function addBourseDoc(userId, bourseId, data) {
  await prisma.bourse.findFirstOrThrow({ where: { id: bourseId, userId } })
  return prisma.bourseDocument.create({ data: { ...data, bourseId } })
}

export async function updateBourseDoc(userId, bourseId, docId, data) {
  await prisma.bourse.findFirstOrThrow({ where: { id: bourseId, userId } })
  const doc = await prisma.bourseDocument.findFirstOrThrow({ where: { id: docId, bourseId } })
  return prisma.bourseDocument.update({ where: { id: doc.id }, data })
}

export async function deleteBourseDoc(userId, bourseId, docId) {
  await prisma.bourse.findFirstOrThrow({ where: { id: bourseId, userId } })
  const doc = await prisma.bourseDocument.findFirstOrThrow({ where: { id: docId, bourseId } })
  return prisma.bourseDocument.delete({ where: { id: doc.id } })
}
