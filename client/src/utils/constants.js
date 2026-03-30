export const CANDIDATURE_STATUS = {
  A_POSTULER: { label: 'À postuler', color: 'bg-surface-200 text-surface-700', dot: 'bg-surface-400' },
  POSTULE: { label: 'Postulé', color: 'bg-primary-100 text-primary-700', dot: 'bg-primary-500' },
  RELANCE: { label: 'Relance', color: 'bg-warning-50 text-warning-600', dot: 'bg-warning-500' },
  ENTRETIEN: { label: 'Entretien', color: 'bg-accent-100 text-accent-700', dot: 'bg-accent-500' },
  OFFRE: { label: 'Offre', color: 'bg-success-50 text-success-600', dot: 'bg-success-500' },
  REFUS: { label: 'Refus', color: 'bg-danger-50 text-danger-600', dot: 'bg-danger-500' },
}

export const CANDIDATURE_COLUMNS = ['A_POSTULER', 'POSTULE', 'RELANCE', 'ENTRETIEN', 'OFFRE', 'REFUS']

export const BOURSE_STATUS = {
  RECHERCHE: { label: 'Recherche', color: 'bg-surface-200 text-surface-700' },
  ELIGIBLE: { label: 'Éligible', color: 'bg-primary-100 text-primary-700' },
  DOSSIER_EN_COURS: { label: 'Dossier en cours', color: 'bg-warning-50 text-warning-600' },
  SOUMIS: { label: 'Soumis', color: 'bg-accent-100 text-accent-700' },
  ACCEPTE: { label: 'Accepté', color: 'bg-success-50 text-success-600' },
  REFUSE: { label: 'Refusé', color: 'bg-danger-50 text-danger-600' },
}

export const DOCUMENT_STATUS = {
  A_FAIRE: { label: 'À faire', color: 'bg-surface-200 text-surface-700' },
  EN_COURS: { label: 'En cours', color: 'bg-warning-50 text-warning-600' },
  PRET: { label: 'Prêt', color: 'bg-success-50 text-success-600' },
}

export const OBJECTIVE_STATUS = {
  NOT_STARTED: { label: 'Non commencé', color: 'bg-surface-200 text-surface-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-primary-100 text-primary-700' },
  COMPLETED: { label: 'Terminé', color: 'bg-success-50 text-success-600' },
  ABANDONED: { label: 'Abandonné', color: 'bg-danger-50 text-danger-600' },
}

export const OBJECTIVE_CATEGORIES = [
  { value: 'career', label: 'Carrière' },
  { value: 'academic', label: 'Académique' },
  { value: 'personal', label: 'Personnel' },
  { value: 'financial', label: 'Financier' },
]

export const DOCUMENT_CATEGORIES = [
  { value: 'identity', label: 'Identité' },
  { value: 'academic', label: 'Académique' },
  { value: 'professional', label: 'Professionnel' },
  { value: 'financial', label: 'Financier' },
]

export const NOTE_TYPES = [
  { value: 'interview_prep', label: 'Prépa entretien' },
  { value: 'debrief', label: 'Débrief' },
  { value: 'reflection', label: 'Réflexion' },
  { value: 'free', label: 'Libre' },
]
