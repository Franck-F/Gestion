import prisma from '../config/database.js'
import env from '../config/env.js'
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  sanitizeUser,
} from '../services/auth.service.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
}

export async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
    })

    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = await generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.status(201).json({
      accessToken,
      user: sanitizeUser(user),
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = await generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.json({
      accessToken,
      user: sanitizeUser(user),
    })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken
    if (!token) {
      return res.status(401).json({ error: 'Refresh token manquant' })
    }

    const result = await rotateRefreshToken(token)
    if (!result) {
      res.clearCookie('refreshToken', { path: '/' })
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' })
    }

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
    res.json({
      accessToken: result.accessToken,
      user: sanitizeUser(result.user),
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken
    if (token) {
      await revokeRefreshToken(token)
    }
    res.clearCookie('refreshToken', { path: '/' })
    res.json({ message: 'Déconnexion réussie' })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    })
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    res.json(sanitizeUser(user))
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
    })
    res.json(sanitizeUser(user))
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash },
    })

    res.json({ message: 'Mot de passe modifié avec succès' })
  } catch (err) {
    next(err)
  }
}
