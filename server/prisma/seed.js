import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@gestion.fr' },
    update: {},
    create: {
      email: 'demo@gestion.fr',
      passwordHash,
      firstName: 'Marie',
      lastName: 'Dupont',
      onboardingCompleted: true,
      goalType: 'alternance',
    },
  })

  console.log('Seed user created:', user.email)

  // Candidatures de démo
  const candidatures = [
    { companyName: 'Google France', jobTitle: 'Développeur Full Stack Alternance', status: 'ENTRETIEN', location: 'Paris', appliedAt: new Date('2026-03-15') },
    { companyName: 'Capgemini', jobTitle: 'Ingénieur Logiciel Junior', status: 'POSTULE', location: 'Lyon', appliedAt: new Date('2026-03-20'), nextFollowUp: new Date('2026-03-27') },
    { companyName: 'OVHcloud', jobTitle: 'Alternant DevOps', status: 'A_POSTULER', location: 'Roubaix' },
    { companyName: 'Thales', jobTitle: 'Alternant Cybersécurité', status: 'RELANCE', location: 'Paris', appliedAt: new Date('2026-03-10'), nextFollowUp: new Date('2026-03-25') },
    { companyName: 'BNP Paribas', jobTitle: 'Développeur React', status: 'OFFRE', location: 'Paris', appliedAt: new Date('2026-02-28') },
    { companyName: 'Ubisoft', jobTitle: 'Alternant Gameplay', status: 'REFUS', location: 'Montreuil', appliedAt: new Date('2026-03-01') },
  ]

  for (const c of candidatures) {
    await prisma.candidature.create({ data: { ...c, userId: user.id } })
  }

  // Bourses de démo
  await prisma.bourse.create({
    data: {
      userId: user.id,
      name: 'Bourse CROUS',
      organism: 'CROUS',
      type: 'bourse',
      amount: 5000,
      status: 'DOSSIER_EN_COURS',
      deadline: new Date('2026-05-15'),
      requiredDocs: {
        create: [
          { name: 'Avis d\'imposition', status: 'PRET' },
          { name: 'Certificat de scolarité', status: 'EN_COURS' },
          { name: 'RIB', status: 'A_FAIRE' },
        ],
      },
    },
  })

  await prisma.bourse.create({
    data: {
      userId: user.id,
      name: 'Aide Île-de-France',
      organism: 'Région IDF',
      type: 'aide_mobilite',
      amount: 1200,
      status: 'RECHERCHE',
      deadline: new Date('2026-06-01'),
    },
  })

  // Objectifs de démo
  const obj = await prisma.objective.create({
    data: {
      userId: user.id,
      title: 'Envoyer 10 candidatures par semaine',
      description: 'Maintenir un rythme soutenu de candidatures',
      status: 'IN_PROGRESS',
      category: 'career',
      targetDate: new Date('2026-06-30'),
      specific: 'Envoyer des candidatures ciblées alternance dev',
      measurable: '10 candidatures envoyées chaque semaine',
      streakCurrent: 3,
      streakBest: 5,
      lastCheckIn: new Date(),
    },
  })

  await prisma.milestone.createMany({
    data: [
      { objectiveId: obj.id, title: 'Préparer CV v2', completed: true, completedAt: new Date(), sortOrder: 0 },
      { objectiveId: obj.id, title: 'Créer lettre de motivation type', completed: true, completedAt: new Date(), sortOrder: 1 },
      { objectiveId: obj.id, title: 'Lister 50 entreprises cibles', completed: false, sortOrder: 2 },
      { objectiveId: obj.id, title: 'Postuler aux 50 entreprises', completed: false, sortOrder: 3 },
    ],
  })

  // Documents de démo
  await prisma.document.createMany({
    data: [
      { userId: user.id, name: 'CV', category: 'professional', status: 'PRET' },
      { userId: user.id, name: 'Lettre de motivation', category: 'professional', status: 'EN_COURS' },
      { userId: user.id, name: 'Relevés de notes', category: 'academic', status: 'PRET' },
      { userId: user.id, name: 'Attestation de scolarité', category: 'academic', status: 'A_FAIRE' },
      { userId: user.id, name: 'Pièce d\'identité', category: 'identity', status: 'PRET' },
    ],
  })

  // Notes de démo
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: 'Prépa entretien Google',
        content: '## Points à préparer\n- Algorithmes et structures de données\n- System design basique\n- Questions comportementales STAR\n\n## Recherche entreprise\n- Culture : innovation, 20% time\n- Produits : Cloud, AI, Search',
        type: 'interview_prep',
        tags: ['google', 'entretien', 'technique'],
        isPinned: true,
      },
      {
        userId: user.id,
        title: 'Débrief Thales',
        content: 'Entretien téléphonique de 30min. Questions sur la motivation et le parcours. RH sympathique. Attente retour sous 2 semaines.',
        type: 'debrief',
        tags: ['thales', 'debrief'],
      },
    ],
  })

  // Événements de démo
  await prisma.event.createMany({
    data: [
      { userId: user.id, title: 'Entretien Google', startDate: new Date('2026-04-05T14:00:00'), endDate: new Date('2026-04-05T15:00:00'), color: '#3b97f6', source: 'CANDIDATURE' },
      { userId: user.id, title: 'Salon de l\'alternance', startDate: new Date('2026-04-10T09:00:00'), endDate: new Date('2026-04-10T18:00:00'), color: '#ff5722', allDay: true },
      { userId: user.id, title: 'Date limite bourse CROUS', startDate: new Date('2026-05-15T23:59:00'), color: '#f59e0b', source: 'BOURSE' },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
