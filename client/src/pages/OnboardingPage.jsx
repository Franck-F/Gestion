import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, GraduationCap, Target, FileText, ArrowRight, ArrowLeft, Check, Sparkles, BookOpen, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../api/auth.js'
import { candidaturesApi } from '../api/candidatures.js'
import { objectivesApi } from '../api/objectives.js'
import { documentsApi } from '../api/documents.js'
import { boursesApi } from '../api/bourses.js'
import { eventsApi } from '../api/events.js'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const GOALS = [
  { id: 'alternance', icon: Briefcase, label: 'Alternance', desc: 'Trouver une entreprise d\'accueil' },
  { id: 'stage', icon: Target, label: 'Stage', desc: 'Décrocher un stage' },
  { id: 'emploi', icon: Briefcase, label: 'Premier emploi', desc: 'Trouver mon premier poste' },
  { id: 'bourses', icon: GraduationCap, label: 'Bourses & aides', desc: 'Suivre mes demandes de financement' },
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

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6 sm:mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
          i === current ? 'w-8 bg-primary-500' : i < current ? 'w-8 bg-primary-300' : 'w-8 bg-surface-200'
        }`} />
      ))}
    </div>
  )
}

function SelectableChip({ selected, onClick, icon: Icon, label, desc }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer w-full ${
        selected
          ? 'border-primary-500 bg-primary-50 shadow-sm'
          : 'border-surface-200 hover:border-surface-300 bg-white'
      }`}
    >
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        selected ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500'
      }`}>
        {selected ? <Check size={16} /> : <Icon size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-surface-800 text-xs sm:text-sm">{label}</p>
        {desc && <p className="text-[10px] sm:text-xs text-surface-500 mt-0.5 truncate">{desc}</p>}
      </div>
    </button>
  )
}

function CheckItem({ selected, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-left transition-all cursor-pointer ${
        selected
          ? 'bg-primary-50 border border-primary-300 text-primary-700'
          : 'bg-surface-50 border border-surface-200 text-surface-600 hover:border-surface-300'
      }`}
    >
      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0 ${
        selected ? 'bg-primary-500 text-white' : 'bg-surface-200'
      }`}>
        {selected && <Check size={10} />}
      </div>
      <span className="truncate">{label}</span>
    </button>
  )
}

// --- STEP 1 : Welcome ---
function StepWelcome({ user, onNext }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-5">
        <Sparkles size={28} className="text-primary-600 sm:hidden" />
        <Sparkles size={36} className="text-primary-600 hidden sm:block" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold font-heading text-surface-900 mb-3">
        Bienvenue, {user?.firstName} !
      </h1>
      <p className="text-surface-500 text-sm sm:text-base mb-2">
        MyCheckList va vous aider à tout organiser.
      </p>
      <p className="text-surface-400 text-xs sm:text-sm mb-8">
        Quelques questions pour personnaliser votre espace.
      </p>
      <Button onClick={onNext} className="px-6 sm:px-8 py-2.5 sm:py-3">
        C'est parti <ArrowRight size={16} />
      </Button>
    </div>
  )
}

// --- STEP 2 : Goals (multi-select) ---
function StepGoals({ selectedGoals, toggleGoal, onNext, onBack }) {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-surface-900 text-center mb-1">
        Quels sont vos objectifs ?
      </h2>
      <p className="text-surface-400 text-xs sm:text-sm text-center mb-5 sm:mb-8">
        Sélectionnez tout ce qui vous concerne.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-8">
        {GOALS.map(g => (
          <SelectableChip
            key={g.id}
            selected={selectedGoals.includes(g.id)}
            onClick={() => toggleGoal(g.id)}
            icon={g.icon}
            label={g.label}
            desc={g.desc}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
        <Button onClick={onNext} disabled={selectedGoals.length === 0}>
          Continuer <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// --- STEP 3 : Config ---
function StepConfig({ selectedGoals, firstCompany, setFirstCompany, firstJob, setFirstJob, selectedDocs, toggleDoc, selectedBourses, toggleBourse, onNext, onBack, loading }) {
  const needsCandidature = selectedGoals.some(g => ['alternance', 'stage', 'emploi'].includes(g))
  const needsBourses = selectedGoals.includes('bourses')

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-surface-900 text-center mb-1">
        Configurons votre espace
      </h2>
      <p className="text-surface-400 text-xs sm:text-sm text-center mb-5 sm:mb-6">
        Tout est optionnel. Vous pourrez compléter plus tard.
      </p>

      {/* Candidature */}
      {needsCandidature && (
        <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Briefcase size={15} className="text-primary-500" />
            <h3 className="font-semibold text-surface-800 text-xs sm:text-sm">Première candidature</h3>
            <span className="text-[10px] text-surface-400 ml-auto">Optionnel</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input placeholder="Entreprise" value={firstCompany} onChange={e => setFirstCompany(e.target.value)} autoComplete="organization" />
            <Input placeholder="Poste visé" value={firstJob} onChange={e => setFirstJob(e.target.value)} />
          </div>
        </div>
      )}

      {/* Bourses */}
      {needsBourses && (
        <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <GraduationCap size={15} className="text-accent-500" />
            <h3 className="font-semibold text-surface-800 text-xs sm:text-sm">Bourses & aides à suivre</h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {SUGGESTED_BOURSES.map(b => (
              <CheckItem key={b.name} selected={selectedBourses.includes(b.name)} onClick={() => toggleBourse(b.name)} label={b.name} />
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <FileText size={15} className="text-success-600" />
          <h3 className="font-semibold text-surface-800 text-xs sm:text-sm">Documents à préparer</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {SUGGESTED_DOCS.map(doc => (
            <CheckItem key={doc.name} selected={selectedDocs.includes(doc.name)} onClick={() => toggleDoc(doc.name)} label={doc.name} />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
        <Button onClick={onNext} disabled={loading}>
          {loading ? 'Création...' : 'Terminer'}
          {!loading && <Check size={16} />}
        </Button>
      </div>
    </div>
  )
}

// --- MAIN ---
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
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }
  const toggleDoc = (name) => {
    setSelectedDocs(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name])
  }
  const toggleBourse = (name) => {
    setSelectedBourses(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name])
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // 1. Create candidature if filled
      if (firstCompany.trim()) {
        const jobLabel = selectedGoals.includes('stage') ? 'Stage' : selectedGoals.includes('emploi') ? 'Emploi' : 'Alternance'
        await candidaturesApi.create({
          companyName: firstCompany.trim(),
          jobTitle: firstJob.trim() || jobLabel,
          status: 'A_POSTULER',
        })
      }

      // 2. Create selected bourses
      for (const bourseName of selectedBourses) {
        const b = SUGGESTED_BOURSES.find(s => s.name === bourseName)
        await boursesApi.create({
          name: bourseName,
          organism: b?.organism || '',
          type: b?.type || 'bourse',
          status: 'RECHERCHE',
        })
      }

      // 3. Create selected documents
      for (const docName of selectedDocs) {
        const doc = SUGGESTED_DOCS.find(d => d.name === docName)
        await documentsApi.create({
          name: docName,
          category: doc?.category || 'professional',
          status: 'A_FAIRE',
        })
      }

      // 4. Create objectives based on selected goals
      for (const goal of selectedGoals) {
        const objectiveMap = {
          alternance: { title: 'Trouver une alternance', description: 'Décrocher un contrat d\'alternance', category: 'career' },
          stage: { title: 'Trouver un stage', description: 'Obtenir une convention de stage', category: 'career' },
          emploi: { title: 'Décrocher un premier emploi', description: 'Signer un contrat de travail', category: 'career' },
          bourses: { title: 'Obtenir mes bourses et aides', description: 'Compléter et soumettre tous les dossiers', category: 'financial' },
        }
        const obj = objectiveMap[goal]
        if (obj) {
          await objectivesApi.create({ ...obj, status: 'IN_PROGRESS' })
        }
      }

      // 5. Complete onboarding
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
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl">
        {step > 0 && <StepIndicator current={step - 1} total={2} />}

        {step === 0 && <StepWelcome user={user} onNext={() => setStep(1)} />}
        {step === 1 && (
          <StepGoals
            selectedGoals={selectedGoals}
            toggleGoal={toggleGoal}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepConfig
            selectedGoals={selectedGoals}
            firstCompany={firstCompany}
            setFirstCompany={setFirstCompany}
            firstJob={firstJob}
            setFirstJob={setFirstJob}
            selectedDocs={selectedDocs}
            toggleDoc={toggleDoc}
            selectedBourses={selectedBourses}
            toggleBourse={toggleBourse}
            onNext={handleComplete}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
