import webpush from 'web-push'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:contact@mychecklist.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC || null
}

export async function sendPushNotification(subscription, { title, body, url }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE || !subscription) return null

  try {
    const payload = JSON.stringify({ title, body, url })
    await webpush.sendNotification(JSON.parse(subscription), payload)
    return true
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired or invalid
      return 'expired'
    }
    console.error('[Push] Error:', err.message)
    return null
  }
}
