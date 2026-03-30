import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database.js'
import env from '../config/env.js'

const SALT_ROUNDS = 12

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function generateAccessToken(userId, email) {
  return jwt.sign(
    { userId, email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY }
  )
}

export async function generateRefreshToken(userId) {
  const token = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRY_DAYS)

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })

  return token
}

export async function rotateRefreshToken(oldToken) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  })

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } })
    }
    return null
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  const newToken = await generateRefreshToken(stored.userId)
  const accessToken = generateAccessToken(stored.user.id, stored.user.email)

  return { accessToken, refreshToken: newToken, user: stored.user }
}

export async function revokeRefreshToken(token) {
  try {
    await prisma.refreshToken.delete({ where: { token } })
  } catch {
    // Token already deleted or doesn't exist
  }
}

export async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}

export function sanitizeUser(user) {
  const { passwordHash, ...safe } = user
  return safe
}
