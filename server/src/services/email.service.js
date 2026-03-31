import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'MyCheckList <onboarding@resend.dev>'

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email:', subject)
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    if (error) {
      console.error('[Email] Send failed:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('[Email] Error:', err.message)
    return null
  }
}

// ─── Templates ───

export function templateDeadlineReminder({ userName, title, date, link }) {
  return {
    subject: `Rappel : ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#2578eb;margin:0 0 16px">MyCheckList</h2>
        <p>Bonjour ${userName},</p>
        <p>Vous avez une échéance qui approche :</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
          <p style="font-weight:600;margin:0 0 4px">${title}</p>
          <p style="color:#64748b;margin:0;font-size:14px">${date}</p>
        </div>
        ${link ? `<a href="${link}" style="display:inline-block;background:#2578eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500">Voir le détail</a>` : ''}
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">MyCheckList — Organisez vos démarches</p>
      </div>
    `,
  }
}

export function templateFollowUpReminder({ userName, companyName, jobTitle, link }) {
  return {
    subject: `Relance à faire : ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#2578eb;margin:0 0 16px">MyCheckList</h2>
        <p>Bonjour ${userName},</p>
        <p>Il est temps de relancer votre candidature :</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0">
          <p style="font-weight:600;margin:0 0 4px">${companyName}</p>
          <p style="color:#64748b;margin:0;font-size:14px">${jobTitle}</p>
        </div>
        ${link ? `<a href="${link}" style="display:inline-block;background:#2578eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500">Voir la candidature</a>` : ''}
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">MyCheckList — Organisez vos démarches</p>
      </div>
    `,
  }
}

export function templateWelcome({ userName }) {
  return {
    subject: 'Bienvenue sur MyCheckList !',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#2578eb;margin:0 0 16px">MyCheckList</h2>
        <p>Bonjour ${userName},</p>
        <p>Bienvenue sur MyCheckList ! Votre espace est prêt.</p>
        <p>Vous pouvez maintenant :</p>
        <ul style="color:#334155">
          <li>Suivre vos candidatures en mode Kanban</li>
          <li>Gérer vos bourses et aides</li>
          <li>Définir vos objectifs avec des jalons</li>
          <li>Organiser vos documents</li>
        </ul>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">MyCheckList — Organisez vos démarches</p>
      </div>
    `,
  }
}
