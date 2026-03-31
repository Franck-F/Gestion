import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { OnboardingPage } from './pages/OnboardingPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { CandidaturesPage } from './pages/CandidaturesPage.jsx'
import { CandidatureDetailPage } from './pages/CandidatureDetailPage.jsx'
import { BoursesPage } from './pages/BoursesPage.jsx'
import { BourseDetailPage } from './pages/BourseDetailPage.jsx'
import { ObjectivesPage } from './pages/ObjectivesPage.jsx'
import { DocumentsPage } from './pages/DocumentsPage.jsx'
import { AgendaPage } from './pages/AgendaPage.jsx'
import { JournalPage } from './pages/JournalPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { ChatPage } from './pages/ChatPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
            <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="candidatures" element={<CandidaturesPage />} />
                <Route path="candidatures/:id" element={<CandidatureDetailPage />} />
                <Route path="bourses" element={<BoursesPage />} />
                <Route path="bourses/:id" element={<BourseDetailPage />} />
                <Route path="objectives" element={<ObjectivesPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="journal" element={<JournalPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
