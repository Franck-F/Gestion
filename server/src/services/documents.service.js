import prisma from '../config/database.js'
import { uploadFile, deleteFile, getPublicUrl } from './storage.service.js'

export async function listDocuments(userId, { status, category }) {
  const where = { userId }
  if (status) where.status = status
  if (category) where.category = category
  const docs = await prisma.document.findMany({
    where,
    include: { versions: { orderBy: { createdAt: 'desc' } } },
    orderBy: { updatedAt: 'desc' },
  })
  return docs.map(doc => ({
    ...doc,
    versions: doc.versions.map(v => ({ ...v, url: getPublicUrl(v.filePath) })),
  }))
}

export async function getDocument(userId, id) {
  const doc = await prisma.document.findFirst({
    where: { id, userId },
    include: { versions: { orderBy: { createdAt: 'desc' } } },
  })
  if (doc) {
    doc.versions = doc.versions.map(v => ({ ...v, url: getPublicUrl(v.filePath) }))
  }
  return doc
}

export async function createDocument(userId, data) {
  return prisma.document.create({ data: { ...data, userId } })
}

export async function updateDocument(userId, id, data) {
  await prisma.document.findFirstOrThrow({ where: { id, userId } })
  return prisma.document.update({ where: { id }, data })
}

export async function deleteDocument(userId, id) {
  const doc = await prisma.document.findFirstOrThrow({
    where: { id, userId },
    include: { versions: true },
  })
  for (const v of doc.versions) {
    await deleteFile(v.filePath).catch(() => {})
  }
  return prisma.document.delete({ where: { id } })
}

export async function addVersion(userId, documentId, file, versionLabel) {
  await prisma.document.findFirstOrThrow({ where: { id: documentId, userId } })
  const uploaded = await uploadFile(file)
  return prisma.documentVersion.create({
    data: {
      documentId,
      versionLabel,
      fileName: uploaded.fileName,
      filePath: uploaded.filePath,
      fileSize: uploaded.fileSize,
      mimeType: uploaded.mimeType,
    },
  })
}

export async function deleteVersion(userId, documentId, versionId) {
  await prisma.document.findFirstOrThrow({ where: { id: documentId, userId } })
  const version = await prisma.documentVersion.findFirstOrThrow({ where: { id: versionId } })
  await deleteFile(version.filePath).catch(() => {})
  return prisma.documentVersion.delete({ where: { id: versionId } })
}
