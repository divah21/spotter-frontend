import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV && console && console.error) {
      console.error('ErrorBoundary caught an error:', error, info)
    }
    // Hook: integrate with your monitoring tool here (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Something went wrong.</h1>
            <p className="text-gray-600">Please refresh the page or try again later.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
