import { GoogleGenAI } from '@google/genai'
import { FirecrawlClient } from 'firecrawl'
import prisma from '../config/database.js'

const genai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null
const firecrawl = process.env.FIRECRAWL_API_KEY ? new FirecrawlClient({ apiKey: process.env.FIRECRAWL_API_KEY }) : null

const DAILY_MESSAGE_LIMIT = 30
const WEEKLY_TOKEN_LIMIT = 500000

// ─── Usage tracking ───

export async function checkUsageLimit(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usage = await prisma.chatUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  if (usage && usage.count >= DAILY_MESSAGE_LIMIT) {
    return { allowed: false, reason: `Limite quotidienne atteinte (${DAILY_MESSAGE_LIMIT} messages/jour). Réessayez demain.` }
  }

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyUsage = await prisma.chatUsage.aggregate({
    where: { userId, date: { gte: weekAgo } },
    _sum: { tokens: true },
  })

  if ((weeklyUsage._sum.tokens || 0) >= WEEKLY_TOKEN_LIMIT) {
    return { allowed: false, reason: 'Limite hebdomadaire de tokens atteinte. Réessayez la semaine prochaine.' }
  }

  return { allowed: true, remaining: DAILY_MESSAGE_LIMIT - (usage?.count || 0) }
}

async function trackUsage(userId, tokenCount) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.chatUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 }, tokens: { increment: tokenCount } },
    create: { userId, date: today, count: 1, tokens: tokenCount },
  })
}

// ─── User context from DB ───

async function getUserContext(userId) {
  const [user, candidatures, bourses, objectives, documents] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true, goalType: true } }),
    prisma.candidature.findMany({ where: { userId }, select: { companyName: true, jobTitle: true, status: true, location: true }, take: 20 }),
    prisma.bourse.findMany({ where: { userId }, select: { name: true, status: true, organism: true, deadline: true }, take: 10 }),
    prisma.objective.findMany({ where: { userId }, select: { title: true, status: true, category: true }, take: 10 }),
    prisma.document.findMany({ where: { userId }, select: { name: true, status: true, category: true }, take: 15 }),
  ])

  let context = `## Profil utilisateur\n- Nom : ${user.firstName} ${user.lastName}\n- Objectifs : ${user.goalType || 'non défini'}\n`

  if (candidatures.length > 0) {
    context += `\n## Candidatures (${candidatures.length})\n`
    candidatures.forEach(c => { context += `- ${c.companyName} — ${c.jobTitle} (${c.status})${c.location ? ` à ${c.location}` : ''}\n` })
  }

  if (bourses.length > 0) {
    context += `\n## Bourses suivies (${bourses.length})\n`
    bourses.forEach(b => { context += `- ${b.name} (${b.status})${b.organism ? ` — ${b.organism}` : ''}\n` })
  }

  if (objectives.length > 0) {
    context += `\n## Objectifs (${objectives.length})\n`
    objectives.forEach(o => { context += `- ${o.title} (${o.status}) [${o.category}]\n` })
  }

  if (documents.length > 0) {
    const ready = documents.filter(d => d.status === 'PRET').length
    context += `\n## Documents (${ready}/${documents.length} prêts)\n`
    documents.forEach(d => { context += `- ${d.name} : ${d.status}\n` })
  }

  return context
}

// ─── Web search via Firecrawl ───

async function searchWeb(query) {
  if (!firecrawl) return null
  try {
    const result = await firecrawl.search(query, { limit: 3, lang: 'fr', country: 'fr' })
    if (!result?.data?.length) return null
    return result.data.map(r => `**${r.title}**\n${r.description || ''}\nSource: ${r.url}`).join('\n\n')
  } catch (err) {
    console.error('[Firecrawl] Search error:', err.message)
    return null
  }
}

// ─── System prompt ───

function buildSystemPrompt(userContext, webResults) {
  let prompt = `Tu es l'assistant expert de MyCheckList, spécialisé dans la recherche d'alternance, de stages, de bourses et d'aides pour les étudiants en France.

## Règles strictes
- Tu ne parles QUE de : alternance, stages, emploi étudiant, bourses, aides, CV, lettres de motivation, entretiens, administratif étudiant
- Si la question est hors sujet, refuse poliment et redirige vers tes domaines
- Ne génère JAMAIS de fausses offres ou faux montants
- Précise TOUJOURS que les montants/conditions peuvent varier et donne la source officielle
- Réponds en français, tutoie l'utilisateur, sois concis et pratique

## Sources officielles
service-public.fr, 1jeune1solution.gouv.fr, etudiant.gouv.fr, alternance.emploi.gouv.fr, caf.fr

## Format
- Listes à puces, actions concrètes
- Si incertain, redirige vers la source officielle`

  if (userContext) {
    prompt += `\n\n## Données du compte de l'utilisateur\n${userContext}\nPersonnalise tes réponses avec ces données.`
  }

  if (webResults) {
    prompt += `\n\n## Résultats web récents\n${webResults}\nUtilise ces résultats pour enrichir ta réponse. Cite les sources.`
  }

  return prompt
}

// ─── Main streaming function ───

export async function streamChat(userId, messages, onChunk) {
  if (!genai) {
    throw new Error('GEMINI_API_KEY non configurée')
  }

  const usage = await checkUsageLimit(userId)
  if (!usage.allowed) {
    throw new Error(usage.reason)
  }

  const userContext = await getUserContext(userId)

  // Detect if web search would help
  const lastMsg = messages[messages.length - 1]?.content || ''
  const searchKeywords = /cherche|trouver|offre|site|plateforme|montant|combien|salaire|aide|bourse|actualit|nouveaut|2024|2025|2026/i
  let webResults = null
  if (searchKeywords.test(lastMsg) && firecrawl) {
    webResults = await searchWeb(lastMsg)
  }

  const systemPrompt = buildSystemPrompt(userContext, webResults)

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await genai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1500,
      temperature: 0.7,
    },
  })

  let totalTokens = 0
  for await (const chunk of response) {
    const text = chunk.text
    if (text) onChunk(text)
    if (chunk.usageMetadata) {
      totalTokens = (chunk.usageMetadata.promptTokenCount || 0) + (chunk.usageMetadata.candidatesTokenCount || 0)
    }
  }

  await trackUsage(userId, totalTokens || 500)
}
