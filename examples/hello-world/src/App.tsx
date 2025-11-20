/**
 * Hello World - Punk Framework Example
 *
 * This example demonstrates:
 * - Basic Punk renderer setup
 * - Simple component usage
 * - Schema-driven UI rendering
 */

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Hello World - Punk Framework</h1>
        <p>A simple example application built with Punk</p>
      </header>

      <main className="main">
        <div className="card">
          <h2>Welcome to Punk Framework</h2>
          <p>
            This is a simple example application demonstrating the basics of
            the Punk Framework.
          </p>
        </div>

        <div className="info">
          <h3>Next Steps:</h3>
          <ul>
            <li>Install dependencies: <code>pnpm install</code></li>
            <li>Build packages: <code>pnpm build</code></li>
            <li>Start dev server: <code>pnpm dev</code></li>
          </ul>
        </div>
      </main>

      <footer className="footer">
        <p>Built with Punk Framework</p>
      </footer>
    </div>
  )
}

export default App
