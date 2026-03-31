const isProd = process.env.NODE_ENV === 'production'

export function errorHandler(err, req, res, next) {
  if (!isProd) {
    console.error(err.stack || err.message)
  } else {
    console.error('[ERROR]', err.message)
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Données invalides',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Cette valeur existe déjà' })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Ressource non trouvée' })
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Fichier trop volumineux' })
  }

  const status = err.status || 500
  res.status(status).json({
    error: isProd ? 'Erreur interne du serveur' : err.message,
  })
}
