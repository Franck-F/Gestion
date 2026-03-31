import { z } from 'zod'

const uuidSchema = z.string().uuid('ID invalide')

export function validateId(req, res, next) {
  if (req.params.id) {
    const result = uuidSchema.safeParse(req.params.id)
    if (!result.success) {
      return res.status(400).json({ error: 'Format d\'identifiant invalide' })
    }
  }
  next()
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query)
      next()
    } catch (err) {
      return res.status(400).json({
        error: 'Paramètres de requête invalides',
        details: err.errors?.map(e => ({ field: e.path.join('.'), message: e.message })),
      })
    }
  }
}
