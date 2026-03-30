import prisma from '../config/database.js'

export async function listObjectives(userId) {
  return prisma.objective.findMany({
    where: { userId },
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getObjective(userId, id) {
  return prisma.objective.findFirst({
    where: { id, userId },
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function createObjective(userId, data) {
  return prisma.objective.create({ data: { ...data, userId } })
}

export async function updateObjective(userId, id, data) {
  await prisma.objective.findFirstOrThrow({ where: { id, userId } })
  return prisma.objective.update({
    where: { id },
    data,
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function deleteObjective(userId, id) {
  await prisma.objective.findFirstOrThrow({ where: { id, userId } })
  return prisma.objective.delete({ where: { id } })
}

export async function checkIn(userId, id) {
  const obj = await prisma.objective.findFirstOrThrow({ where: { id, userId } })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastCheckIn = obj.lastCheckIn ? new Date(obj.lastCheckIn) : null
  if (lastCheckIn) lastCheckIn.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let streakCurrent = obj.streakCurrent
  if (lastCheckIn && lastCheckIn.getTime() === yesterday.getTime()) {
    streakCurrent += 1
  } else if (!lastCheckIn || lastCheckIn.getTime() < yesterday.getTime()) {
    streakCurrent = 1
  }

  const streakBest = Math.max(obj.streakBest, streakCurrent)

  return prisma.objective.update({
    where: { id },
    data: { streakCurrent, streakBest, lastCheckIn: new Date(), status: 'IN_PROGRESS' },
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
  })
}

export async function createMilestone(userId, objectiveId, data) {
  await prisma.objective.findFirstOrThrow({ where: { id: objectiveId, userId } })
  const count = await prisma.milestone.count({ where: { objectiveId } })
  return prisma.milestone.create({
    data: { ...data, objectiveId, sortOrder: data.sortOrder ?? count },
  })
}

export async function updateMilestone(userId, objectiveId, milestoneId, data) {
  await prisma.objective.findFirstOrThrow({ where: { id: objectiveId, userId } })
  const updateData = { ...data }
  if (data.completed === true) updateData.completedAt = new Date()
  if (data.completed === false) updateData.completedAt = null
  return prisma.milestone.update({ where: { id: milestoneId }, data: updateData })
}

export async function deleteMilestone(userId, objectiveId, milestoneId) {
  await prisma.objective.findFirstOrThrow({ where: { id: objectiveId, userId } })
  return prisma.milestone.delete({ where: { id: milestoneId } })
}

export async function reorderMilestones(userId, objectiveId, milestoneIds) {
  await prisma.objective.findFirstOrThrow({ where: { id: objectiveId, userId } })
  const updates = milestoneIds.map((id, index) =>
    prisma.milestone.update({ where: { id }, data: { sortOrder: index } })
  )
  return prisma.$transaction(updates)
}
