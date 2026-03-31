import { Component } from 'react'
import { Button } from './Button.jsx'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <p className="text-4xl font-bold text-surface-200 mb-4">Oups</p>
            <h2 className="text-lg font-semibold text-surface-800 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-surface-500 mb-6">Essayez de recharger la page.</p>
            <Button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
              Recharger
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
