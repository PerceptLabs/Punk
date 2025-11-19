/**
 * @punk/core - Basic Usage Examples
 * Demonstrates core functionality of the Punk renderer
 */

import React from 'react'
import { PunkRenderer, registerComponent } from '../index'
import type { PunkNode, PunkSchema } from '../types'

// Example 1: Simple Text Rendering
// ================================

export function SimpleTextExample() {
  const schema: PunkNode = {
    type: 'text',
    props: {
      children: 'Hello, Punk!',
    },
  }

  return <PunkRenderer schema={schema} />
}

// Example 2: Data Interpolation
// ==============================

export function DataInterpolationExample() {
  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'heading',
        props: {
          level: 1,
          children: 'Welcome, {{user.name}}!',
        },
      },
      {
        type: 'text',
        props: {
          children: 'Email: {{user.email}}',
        },
      },
    ],
  }

  const data = {
    user: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  }

  return <PunkRenderer schema={schema} data={data} />
}

// Example 3: Action Handlers
// ===========================

export function ActionHandlerExample() {
  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'button',
        props: {
          onClick: 'handleSubmit',
          children: 'Submit Form',
        },
      },
      {
        type: 'button',
        props: {
          onClick: 'handleCancel',
          children: 'Cancel',
        },
      },
    ],
  }

  const actions = {
    handleSubmit: () => {
      console.log('Form submitted!')
    },
    handleCancel: () => {
      console.log('Form cancelled!')
    },
  }

  return <PunkRenderer schema={schema} actions={actions} />
}

// Example 4: List Rendering
// ==========================

export function ListRenderingExample() {
  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'heading',
        props: {
          level: 2,
          children: 'User List',
        },
      },
      {
        type: 'list',
        dataSource: 'users',
        itemTemplate: {
          type: 'card',
          props: {
            title: '{{item.name}}',
            subtitle: '{{item.role}}',
            description: '{{item.email}}',
          },
        },
      },
    ],
  }

  const data = {
    users: [
      { id: 1, name: 'Alice', role: 'Admin', email: 'alice@example.com' },
      { id: 2, name: 'Bob', role: 'User', email: 'bob@example.com' },
      { id: 3, name: 'Carol', role: 'User', email: 'carol@example.com' },
    ],
  }

  return <PunkRenderer schema={schema} data={data} />
}

// Example 5: Conditional Rendering
// =================================

export function ConditionalRenderingExample() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'text',
        condition: 'user.isLoggedIn',
        props: {
          children: 'Welcome back, {{user.name}}!',
        },
      },
      {
        type: 'text',
        condition: '!user.isLoggedIn',
        props: {
          children: 'Please log in to continue.',
        },
      },
      {
        type: 'button',
        props: {
          onClick: 'toggleLogin',
          children: '{{user.isLoggedIn ? "Logout" : "Login"}}',
        },
      },
    ],
  }

  const data = {
    user: {
      isLoggedIn,
      name: 'Alice',
    },
  }

  const actions = {
    toggleLogin: () => setIsLoggedIn(!isLoggedIn),
  }

  return <PunkRenderer schema={schema} data={data} actions={actions} />
}

// Example 6: Full PunkSchema
// ===========================

export function FullSchemaExample() {
  const schema: PunkSchema = {
    punkVersion: '1.0.0',
    schemaVersion: '1.0.0',
    root: {
      type: 'container',
      id: 'app-root',
      className: 'app-container',
      children: [
        {
          type: 'heading',
          id: 'main-heading',
          props: {
            level: 1,
            children: 'Punk Framework Demo',
          },
        },
        {
          type: 'text',
          props: {
            children: 'This is a complete schema example.',
          },
        },
      ],
    },
    metadata: {
      author: 'Punk Team',
      created: '2025-11-19',
    },
  }

  return <PunkRenderer schema={schema} />
}

// Example 7: Custom Component Registration
// =========================================

// Define a custom component
const CustomAlert = ({ message, type = 'info' }: { message: string; type?: string }) => {
  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: colors[type as keyof typeof colors] + '20',
        border: `1px solid ${colors[type as keyof typeof colors]}`,
        borderRadius: '4px',
        color: colors[type as keyof typeof colors],
      }}
    >
      {message}
    </div>
  )
}

export function CustomComponentExample() {
  // Register the custom component
  registerComponent('alert', CustomAlert)

  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'alert',
        props: {
          message: 'This is a custom alert component!',
          type: 'success',
        },
      },
    ],
  }

  return <PunkRenderer schema={schema} />
}

// Example 8: Error Handling
// ==========================

export function ErrorHandlingExample() {
  const [error, setError] = React.useState<Error | null>(null)

  const invalidSchema = {
    type: '', // Invalid: empty type
    props: {},
  }

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error caught: {error.message}
        </div>
      )}
      <PunkRenderer
        schema={invalidSchema as any}
        onError={setError}
        errorBoundary={true}
      />
    </div>
  )
}

// Example 9: Nested Data Access
// ==============================

export function NestedDataExample() {
  const schema: PunkNode = {
    type: 'container',
    children: [
      {
        type: 'text',
        props: {
          children: 'Name: {{user.profile.personal.firstName}} {{user.profile.personal.lastName}}',
        },
      },
      {
        type: 'text',
        props: {
          children: 'Company: {{user.profile.work.company}}',
        },
      },
      {
        type: 'text',
        props: {
          children: 'First hobby: {{user.hobbies[0]}}',
        },
      },
    ],
  }

  const data = {
    user: {
      profile: {
        personal: {
          firstName: 'Alice',
          lastName: 'Johnson',
        },
        work: {
          company: 'Acme Corp',
          position: 'Developer',
        },
      },
      hobbies: ['Reading', 'Cycling', 'Photography'],
    },
  }

  return <PunkRenderer schema={schema} data={data} />
}

// Example 10: Complete Form
// ==========================

export function CompleteFormExample() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  })

  const schema: PunkNode = {
    type: 'form',
    props: {
      onSubmit: 'handleSubmit',
    },
    children: [
      {
        type: 'heading',
        props: {
          level: 2,
          children: 'Contact Form',
        },
      },
      {
        type: 'input',
        props: {
          name: 'name',
          type: 'text',
          placeholder: 'Your name',
          value: '{{form.name}}',
          onChange: 'handleNameChange',
        },
      },
      {
        type: 'input',
        props: {
          name: 'email',
          type: 'email',
          placeholder: 'your@email.com',
          value: '{{form.email}}',
          onChange: 'handleEmailChange',
        },
      },
      {
        type: 'textarea',
        props: {
          name: 'message',
          placeholder: 'Your message',
          value: '{{form.message}}',
          onChange: 'handleMessageChange',
        },
      },
      {
        type: 'button',
        props: {
          type: 'submit',
          children: 'Send Message',
        },
      },
    ],
  }

  const actions = {
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, name: e.target.value })
    },
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, email: e.target.value })
    },
    handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData({ ...formData, message: e.target.value })
    },
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Form submitted:', formData)
    },
  }

  return (
    <PunkRenderer
      schema={schema}
      data={{ form: formData }}
      actions={actions}
    />
  )
}
