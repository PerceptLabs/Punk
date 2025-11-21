import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/**
 * Main entry point for the Punk Rigs Dashboard Example
 *
 * This file:
 * 1. Imports @punk/extended which auto-registers all extended components
 * 2. Bootstraps the React application
 * 3. Renders the App component into the DOM
 *
 * When @punk/extended is imported, it automatically registers all component
 * wrappers (Chart, Table, Mermaid, etc.) with the ComponentRegistry, making
 * them available for use in JSON schemas.
 */

// Import the extended rig - this auto-registers all components
// NOTE: In a real implementation, this would be:
// import '@punk/extended'
// For now, we'll import the individual components as they're implemented
// import '@punk/component-chart'
// import '@punk/component-table'
// import '@punk/component-mermaid'

// For this example, we assume the components will be imported and registered
// by the @punk/extended package when it's available

// Mount the React application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Log initialization for debugging
console.log('🎸 Punk Rigs Dashboard initialized')
console.log('📦 Using @punk/extended component rig')
console.log('🎨 Components: Chart, Table, Mermaid')

// Development mode hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept()
}
