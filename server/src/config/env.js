import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

function required(name) {
  const val = process.env[name]
  if (!val && isProd) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return val
}

function getClientUrl() {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:5173'
}

const env = {
  DATABASE_URL: required('DATABASE_URL') || process.env.DATABASE_URL,
  ACCESS_TOKEN_SECRET: required('ACCESS_TOKEN_SECRET') || 'dev-secret-only',
  REFRESH_TOKEN_SECRET: required('REFRESH_TOKEN_SECRET') || 'dev-refresh-only',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '30', 10),
  PORT: parseInt(process.env.PORT || '3001', 10),
  CLIENT_URL: getClientUrl(),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
}

export default env
