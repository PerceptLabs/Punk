/**
 * Custom Component Example - App
 *
 * This demonstrates how to use a custom component wrapper (Kanban) with Punk Framework.
 * It shows:
 * 1. Importing a custom wrapper (auto-registers the component)
 * 2. Using PunkRenderer with DataContext
 * 3. Wiring up action handlers via ActionBus
 * 4. Managing state with React hooks
 */

import { useState } from 'react'
import { PunkRenderer } from '@punk/core'
import './kanban-wrapper' // Import registers the Kanban component
import { kanbanSchema, exampleTasks } from './schema'
import './index.css'

function App() {
  // -------------------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------------------
  // Manage tasks in React state so we can update them when cards move
  const [tasks, setTasks] = useState(exampleTasks)

  // -------------------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------------------
  // These are registered in the ActionBus and can be referenced by name in schemas

  /**
   * Handle card movement between columns
   * This is called when a user drags a card to a new column
   */
  const handleCardMove = (payload: any) => {
    console.log('Card moved:', payload)

    const { cardId, toColumn } = payload

    // Update the card's columnId
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === cardId
          ? { ...task, columnId: toColumn }
          : task
      )
    )

    // In a real app, you would also:
    // - Update the backend via API
    // - Show a success notification
    // - Handle errors gracefully
    // - Optimistic UI updates with rollback
  }

  /**
   * Add a new task (example of additional functionality)
   */
  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: `New Task ${tasks.length + 1}`,
      description: 'This is a new task created via the UI',
      tags: ['new'],
      columnId: 'todo',
    }

    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  // -------------------------------------------------------------------------
  // DATA CONTEXT
  // -------------------------------------------------------------------------
  // All data that components need access to
  // Components can reference this via useDataContext()
  const data = {
    tasks, // The Kanban schema references this as "cards": "tasks"
  }

  // -------------------------------------------------------------------------
  // ACTION BUS
  // -------------------------------------------------------------------------
  // All action handlers that schemas can reference by name
  // Components can call these via useActionBus()
  const actions = {
    handleCardMove, // The Kanban schema references this as "onCardMove": "handleCardMove"
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Custom Component Example</h1>
            <p>Creating a Kanban Board wrapper for Punk Framework</p>
          </div>
          <button onClick={addTask} className="add-button">
            + Add Task
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Schema-driven Kanban Board */}
        <PunkRenderer
          schema={kanbanSchema}
          data={data}
          actions={actions}
        />

        {/* Information Panel */}
        <div className="info-panel">
          <h2>How This Works</h2>

          <div className="info-section">
            <h3>1. Custom Component Wrapper</h3>
            <p>
              The Kanban board is a custom component wrapper that follows the canonical pattern:
            </p>
            <ul>
              <li><strong>Zod Schema:</strong> Defines props structure for validation</li>
              <li><strong>Metadata:</strong> Describes component for UI builders</li>
              <li><strong>React Component:</strong> Implements the actual functionality</li>
              <li><strong>Auto-registration:</strong> Registers on import</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>2. Data Integration</h3>
            <p>
              The component reads data from <code>DataContext</code>:
            </p>
            <pre><code>{`// In schema.ts
{
  type: 'Kanban',
  props: {
    cards: 'tasks',  // References data.tasks
    ...
  }
}`}</code></pre>
          </div>

          <div className="info-section">
            <h3>3. Action Handling</h3>
            <p>
              Events are wired via <code>ActionBus</code>:
            </p>
            <pre><code>{`// In schema.ts
{
  type: 'Kanban',
  props: {
    onCardMove: 'handleCardMove',  // Calls actions.handleCardMove
    ...
  }
}`}</code></pre>
          </div>

          <div className="info-section">
            <h3>4. Try It!</h3>
            <p>
              Drag cards between columns to see the action handler in action.
              Check the browser console to see the event payloads.
            </p>
          </div>

          <div className="info-section">
            <h3>Next Steps</h3>
            <ul>
              <li>Read <code>src/kanban-wrapper.tsx</code> for detailed comments</li>
              <li>Check <code>PATTERN_GUIDE.md</code> for the complete pattern</li>
              <li>Create your own wrapper following the same structure</li>
              <li>Integrate with SynthPunk for AI-generated boards</li>
              <li>Use in Mohawk for visual board building</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with Punk Framework |{' '}
          <a href="https://github.com/punk-framework" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
