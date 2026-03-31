import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, GraduationCap, Target, FileText, ArrowRight, ArrowLeft, Check, Sparkles, Calendar, BarChart3, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../api/auth.js'
import { candidaturesApi } from '../api/candidatures.js'
import { objectivesApi } from '../api/objectives.js'
import { documentsApi } from '../api/documents.js'
import { boursesApi } from '../api/bourses.js'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const GOALS = [
  { id: 'alternance', icon: Briefcase, label: 'Alternance', desc: 'Je cherche une entreprise d\'accueil pour mon alternance' },
  { id: 'stage', icon: Target, label: 'Stage', desc: 'Je recherche un stage en entreprise' },
  { id: 'emploi', icon: BarChart3, label: 'Premier emploi', desc: 'Je cherche mon premier poste après mes études' },
  { id: 'bourses', icon: GraduationCap, label: 'Bourses & aides', desc: 'Je veux suivre mes demandes de financement' },
  { id: 'personnel', icon: Heart, label: 'Personnel', desc: 'Permis, logement, sport, bien-être...' },
]

const SUGGESTED_DOCS = [
  { name: 'CV', category: 'professional' },
  { name: 'Lettre de motivation', category: 'professional' },
  { name: 'Relevés de notes', category: 'academic' },
  { name: 'Pièce d\'identité', category: 'identity' },
  { name: 'RIB', category: 'financial' },
  { name: 'Attestation de scolarité', category: 'academic' },
  { name: 'Photo d\'identité', category: 'identity' },
  { name: 'Justificatif de domicile', category: 'identity' },
]

const SUGGESTED_BOURSES = [
  { name: 'Bourse CROUS', organism: 'CROUS', type: 'bourse' },
  { name: 'Aide au logement (APL)', organism: 'CAF', type: 'aide_logement' },
  { name: 'Aide Mobili-Jeune', organism: 'Action Logement', type: 'aide_logement' },
  { name: 'Bourse régionale', organism: 'Région', type: 'bourse' },
  { name: 'Aide au permis', organism: 'Région / Pôle Emploi', type: 'aide_mobilite' },
  { name: 'Prime d\'activité', organism: 'CAF', type: 'aide_financiere' },
]

const SUGGESTED_PERSONAL = [
  { title: 'Passer le permis de conduire', desc: 'Code + conduite' },
  { title: 'Trouver un logement', desc: 'Recherche appartement' },
  { title: 'Faire du sport régulièrement', desc: '3 séances par semaine' },
  { title: 'Apprendre une nouvelle compétence', desc: 'Formation, certif, langue...' },
  { title: 'Améliorer mon anglais', desc: 'TOEIC, conversation...' },
  { title: 'Gérer mon budget', desc: 'Suivi des dépenses' },
  { title: 'Lire plus', desc: '1 livre par mois' },
  { title: 'Prendre soin de ma santé', desc: 'Rendez-vous médicaux, sommeil...' },
]

// ─── Shared UI ───

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
          i < current ? 'w-10 bg-primary-500' : i === current ? 'w-10 bg-primary-300' : 'w-6 bg-surface-200'
        }`} />
      ))}
    </div>
  )
}

function OnboardingShell({ children, step, totalSteps }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
      <div className="p-4 md:p-6">
        <span className="text-sm font-bold font-heading text-primary-600">MyCheckList</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8 md:pb-12">
        <div className="w-full max-w-2xl">
          {step > 0 && <StepIndicator current={step - 1} total={totalSteps - 1} />}
          {children}
        </div>
      </div>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Continuer', nextDisabled = false, loading = false }) {
  return (
    <div className="flex items-center justify-between mt-8">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
      ) : <div />}
      <Button onClick={onNext} disabled={nextDisabled || loading} size="lg">
        {loading ? 'Chargement...' : nextLabel}
        {!loading && <ArrowRight size={16} />}
      </Button>
    </div>
  )
}

function CheckItem({ selected, onClick, label, sub }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all cursor-pointer ${
        selected
          ? 'bg-primary-50 border-2 border-primary-400 text-primary-800 shadow-sm'
          : 'bg-white border-2 border-surface-200 text-surface-700 hover:border-surface-300'
      }`}
    >
      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
        selected ? 'bg-primary-500 text-white' : 'bg-surface-100 border border-surface-300'
      }`}>
        {selected && <Check size={14} />}
      </div>
      <div className="min-w-0">
        <span className="text-sm font-medium">{label}</span>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  )
}

// ─── STEP 0 : Welcome ───
function StepWelcome({ user, onNext }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
        <Sparkles size={36} className="text-primary-600" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold font-heading text-surface-900 mb-4">
        Bienvenue, {user?.firstName} !
      </h1>
      <p className="text-surface-500 text-lg mb-2 max-w-md mx-auto">
        MyCheckList organise toutes vos démarches au même endroit.
      </p>
      <p className="text-surface-400 mb-10 max-w-sm mx-auto">
        Répondez à quelques questions pour personnaliser votre espace.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-lg mx-auto">
        {[
          { icon: Briefcase, label: 'Candidatures' },
          { icon: GraduationCap, label: 'Bourses' },
          { icon: FileText, label: 'Documents' },
          { icon: Heart, label: 'Personnel' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/70 border border-surface-200/50">
            <Icon size={22} className="text-primary-500" />
            <span className="text-xs font-medium text-surface-600">{label}</span>
          </div>
        ))}
      </div>
      <Button onClick={onNext} size="lg" className="px-10">
        C'est parti <ArrowRight size={18} />
      </Button>
    </div>
  )
}

// ─── STEP 1 : Goals (multi-select) ───
function StepGoals({ selectedGoals, toggleGoal, onNext, onBack }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-surface-900 mb-2">
          Quels sont vos objectifs ?
        </h2>
        <p className="text-surface-400">Sélectionnez tout ce qui vous concerne. Plusieurs choix possibles.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selectedGoals.includes(g.id)
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              selectedGoals.includes(g.id) ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500'
            }`}>
              {selectedGoals.includes(g.id) ? <Check size={22} /> : <g.icon size={22} />}
            </div>
            <div>
              <p className="font-semibold text-surface-900">{g.label}</p>
              <p className="text-sm text-surface-500 mt-1">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={selectedGoals.length === 0} />
    </div>
  )
}

// ─── STEP 2 : First candidature ───
function StepCandidature({ firstCompany, setFirstCompany, firstJob, setFirstJob, onNext, onBack }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={26} className="text-primary-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-surface-900 mb-2">
          Votre première candidature
        </h2>
        <p className="text-surface-400">Avez-vous déjà une entreprise en tête ?</p>
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <Input label="Nom de l'entreprise" placeholder="ex: Google, Capgemini..." value={firstCompany} onChange={e => setFirstCompany(e.target.value)} autoComplete="organization" />
        <Input label="Poste visé" placeholder="ex: Développeur Full Stack..." value={firstJob} onChange={e => setFirstJob(e.target.value)} />
        <p className="text-xs text-surface-400 text-center">Optionnel. Vous pourrez en ajouter d'autres après.</p>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─── STEP 3 : Bourses ───
function StepBourses({ selectedBourses, toggleBourse, onNext, onBack }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-accent-100 flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={26} className="text-accent-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-surface-900 mb-2">
          Bourses & aides financières
        </h2>
        <p className="text-surface-400">Sélectionnez les aides que vous souhaitez suivre.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
        {SUGGESTED_BOURSES.map(b => (
          <CheckItem key={b.name} selected={selectedBourses.includes(b.name)} onClick={() => toggleBourse(b.name)} label={b.name} sub={b.organism} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─── STEP 4 : Personal objectives ───
function StepPersonal({ selectedPersonal, togglePersonal, onNext, onBack }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
          <Heart size={26} className="text-pink-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-surface-900 mb-2">
          Objectifs personnels
        </h2>
        <p className="text-surface-400">Quels projets personnels souhaitez-vous suivre ?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
        {SUGGESTED_PERSONAL.map(p => (
          <CheckItem key={p.title} selected={selectedPersonal.includes(p.title)} onClick={() => togglePersonal(p.title)} label={p.title} sub={p.desc} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─── STEP 5 : Documents ───
function StepDocuments({ selectedDocs, toggleDoc, onNext, onBack, loading }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-success-50 flex items-center justify-center mx-auto mb-4">
          <FileText size={26} className="text-success-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-surface-900 mb-2">
          Documents à préparer
        </h2>
        <p className="text-surface-400">Créez votre checklist. On suit l'avancement pour vous.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
        {SUGGESTED_DOCS.map(doc => (
          <CheckItem key={doc.name} selected={selectedDocs.includes(doc.name)} onClick={() => toggleDoc(doc.name)} label={doc.name} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
        <Button onClick={onNext} disabled={loading} size="lg">
          {loading ? 'Création de votre espace...' : 'Terminer'}
          {!loading && <Check size={18} />}
        </Button>
      </div>
    </div>
  )
}

// ─── MAIN ───
export function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [firstCompany, setFirstCompany] = useState('')
  const [firstJob, setFirstJob] = useState('')
  const [selectedDocs, setSelectedDocs] = useState(['CV', 'Lettre de motivation'])
  const [selectedBourses, setSelectedBourses] = useState([])
  const [selectedPersonal, setSelectedPersonal] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id) => setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  const toggleDoc = (name) => setSelectedDocs(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name])
  const toggleBourse = (name) => setSelectedBourses(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name])
  const togglePersonal = (title) => setSelectedPersonal(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title])

  const needsCandidature = selectedGoals.some(g => ['alternance', 'stage', 'emploi'].includes(g))
  const needsBourses = selectedGoals.includes('bourses')
  const needsPersonal = selectedGoals.includes('personnel')

  // Build dynamic step list
  const steps = ['welcome', 'goals']
  if (needsCandidature) steps.push('candidature')
  if (needsBourses) steps.push('bourses')
  if (needsPersonal) steps.push('personal')
  steps.push('documents')

  const currentStepName = steps[step] || 'welcome'

  const goNext = () => setStep(prev => Math.min(prev + 1, steps.length - 1))
  const goBack = () => setStep(prev => Math.max(prev - 1, 0))

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Candidature
      if (firstCompany.trim()) {
        const jobLabel = selectedGoals.includes('stage') ? 'Stage' : selectedGoals.includes('emploi') ? 'Emploi' : 'Alternance'
        await candidaturesApi.create({ companyName: firstCompany.trim(), jobTitle: firstJob.trim() || jobLabel, status: 'A_POSTULER' })
      }

      // Bourses
      for (const bourseName of selectedBourses) {
        const b = SUGGESTED_BOURSES.find(s => s.name === bourseName)
        await boursesApi.create({ name: bourseName, organism: b?.organism || '', type: b?.type || 'bourse', status: 'RECHERCHE' })
      }

      // Documents
      for (const docName of selectedDocs) {
        const doc = SUGGESTED_DOCS.find(d => d.name === docName)
        await documentsApi.create({ name: docName, category: doc?.category || 'professional', status: 'A_FAIRE' })
      }

      // Objectives from goals
      const goalObjectives = {
        alternance: { title: 'Trouver une alternance', description: 'Décrocher un contrat d\'alternance', category: 'career' },
        stage: { title: 'Trouver un stage', description: 'Obtenir une convention de stage', category: 'career' },
        emploi: { title: 'Décrocher un premier emploi', description: 'Signer un contrat de travail', category: 'career' },
        bourses: { title: 'Obtenir mes bourses et aides', description: 'Compléter et soumettre tous les dossiers', category: 'financial' },
      }
      for (const goal of selectedGoals) {
        if (goal !== 'personnel' && goalObjectives[goal]) {
          await objectivesApi.create({ ...goalObjectives[goal], status: 'IN_PROGRESS' })
        }
      }

      // Personal objectives
      for (const title of selectedPersonal) {
        const p = SUGGESTED_PERSONAL.find(s => s.title === title)
        await objectivesApi.create({ title, description: p?.desc || '', category: 'personal', status: 'IN_PROGRESS' })
      }

      // Complete onboarding
      const { data: updatedUser } = await authApi.completeOnboarding({ goalType: selectedGoals.join(',') })
      updateUser(updatedUser)
      toast('Votre espace est prêt !', 'success')
      navigate('/')
    } catch {
      toast('Erreur lors de la configuration', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingShell step={step} totalSteps={steps.length}>
      {currentStepName === 'welcome' && <StepWelcome user={user} onNext={goNext} />}
      {currentStepName === 'goals' && <StepGoals selectedGoals={selectedGoals} toggleGoal={toggleGoal} onNext={goNext} onBack={goBack} />}
      {currentStepName === 'candidature' && <StepCandidature firstCompany={firstCompany} setFirstCompany={setFirstCompany} firstJob={firstJob} setFirstJob={setFirstJob} onNext={goNext} onBack={goBack} />}
      {currentStepName === 'bourses' && <StepBourses selectedBourses={selectedBourses} toggleBourse={toggleBourse} onNext={goNext} onBack={goBack} />}
      {currentStepName === 'personal' && <StepPersonal selectedPersonal={selectedPersonal} togglePersonal={togglePersonal} onNext={goNext} onBack={goBack} />}
      {currentStepName === 'documents' && <StepDocuments selectedDocs={selectedDocs} toggleDoc={toggleDoc} onNext={handleComplete} onBack={goBack} loading={loading} />}
    </OnboardingShell>
  )
}
