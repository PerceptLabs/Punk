import React, { useState, useEffect } from 'react'
import { PunkRenderer, DataContext } from '@punk/core'
import { dashboardSchema } from './schema'
import {
  monthlyRevenueData,
  userGrowthData,
  trafficSourcesData,
  metricsTableData,
  metricsTableColumns,
  systemArchitectureDiagram,
  dataFlowDiagram
} from './data'

/**
 * Punk Loadout Dashboard Example Application
 *
 * This app demonstrates the @punk/extended loadout by showcasing:
 * 1. Multiple chart types (bar, line, pie) using @punk/component-chart
 * 2. Interactive data table with sorting and pagination using @punk/component-table
 * 3. System diagrams using @punk/component-mermaid
 * 4. Data binding through DataContext for dynamic updates
 * 5. Responsive layout with production-quality styling
 *
 * All components are defined via JSON schema, demonstrating Punk's
 * declarative approach to UI composition.
 */

function App() {
  // Loading state for smooth initial render
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Simulate loading for demo purposes (in production, this would be real data loading)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Data context that binds string references in schema to actual data
  // This allows the JSON schema to reference data by name (e.g., "monthlyRevenueData")
  // and have it resolved at runtime
  const dataContext = {
    monthlyRevenueData,
    userGrowthData,
    trafficSourcesData,
    metricsTableData,
    metricsTableColumns,
    systemArchitectureDiagram,
    dataFlowDiagram
  }

  // Error boundary handler
  const handleError = (error: Error) => {
    console.error('Dashboard rendering error:', error)
    setHasError(true)
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading Dashboard...</p>
      </div>
    )
  }

  // Error state UI
  if (hasError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Dashboard Error</h2>
        <p style={styles.errorMessage}>
          Failed to load dashboard components. Please check the console for details.
        </p>
        <button
          style={styles.retryButton}
          onClick={() => {
            setHasError(false)
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 500)
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Main dashboard render
  return (
    <DataContext.Provider value={dataContext}>
      <div style={styles.app}>
        <ErrorBoundary onError={handleError}>
          <PunkRenderer schema={dashboardSchema} />
        </ErrorBoundary>
      </div>
    </DataContext.Provider>
  )
}

/**
 * Simple Error Boundary Component
 * Catches rendering errors and displays fallback UI
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return null // Parent will handle error display
    }

    return this.props.children
  }
}

// Styles object for inline styling (keeping it simple for the example)
const styles: { [key: string]: React.CSSProperties } = {
  app: {
    minHeight: '100vh',
    width: '100%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid rgba(255, 255, 255, 0.3)',
    borderTop: '6px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '500',
    marginTop: '1.5rem'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  errorTitle: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem'
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.1rem',
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  retryButton: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
}

// Add spinner animation via style tag
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default App
