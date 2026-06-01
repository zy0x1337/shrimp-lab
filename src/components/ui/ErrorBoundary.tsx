/**
 * ErrorBoundary — catches render errors inside pages and shows a
 * Torque-styled fallback UI instead of a blank screen.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Shrimp Lab] Render error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="error-boundary">
        <div className="error-boundary__icon">
          <AlertTriangle size={32} aria-hidden="true" />
        </div>
        <h2 className="error-boundary__title">Something went wrong</h2>
        {this.state.message && (
          <pre className="error-boundary__message">{this.state.message}</pre>
        )}
        <button
          className="btn btn-ghost error-boundary__action"
          onClick={this.handleReset}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      </div>
    )
  }
}
