import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Page render failed:', error, info)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="min-h-screen bg-[#f7f9ff] px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
          <AlertTriangle className="mx-auto mb-5 h-12 w-12 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-950">This page could not be loaded</h1>
          <p className="mt-3 text-gray-600">
            Something on this page failed to render. Try refreshing the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mx-auto mt-6 inline-flex items-center rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh page
          </button>
        </div>
      </div>
    )
  }
}
