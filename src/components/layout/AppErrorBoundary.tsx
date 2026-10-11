import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { failed: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('RupeePulse render failure', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <section className="error-state" role="alert"><span>Something interrupted this view</span><h1>Your saved scenario is safe.</h1><p>Reload the interface and continue from the same browser-stored state.</p><button className="primary-button" onClick={() => window.location.reload()}>Reload RupeePulse</button></section>
  }
}
