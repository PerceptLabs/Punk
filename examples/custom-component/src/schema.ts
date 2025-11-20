/**
 * Example Kanban Board Schema
 *
 * This demonstrates how to define data for the Kanban component.
 * The schema can be used with PunkRenderer to create a fully functional board.
 */

import type { PunkSchema } from '@punk/core'

/**
 * Example task data
 * In a real app, this would come from an API or database
 */
export const exampleTasks = [
  // TODO Column
  {
    id: 'task-1',
    title: 'Design new landing page',
    description: 'Create mockups for the new product landing page',
    tags: ['design', 'high-priority'],
    columnId: 'todo',
  },
  {
    id: 'task-2',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    tags: ['devops', 'infrastructure'],
    columnId: 'todo',
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    tags: ['documentation', 'backend'],
    columnId: 'todo',
  },

  // IN PROGRESS Column
  {
    id: 'task-4',
    title: 'Implement user authentication',
    description: 'Add JWT-based auth with refresh tokens',
    tags: ['backend', 'security', 'high-priority'],
    columnId: 'in-progress',
  },
  {
    id: 'task-5',
    title: 'Create component library',
    description: 'Build reusable React components for the design system',
    tags: ['frontend', 'components'],
    columnId: 'in-progress',
  },

  // DONE Column
  {
    id: 'task-6',
    title: 'Set up project structure',
    description: 'Initialize monorepo with pnpm workspaces',
    tags: ['setup', 'infrastructure'],
    columnId: 'done',
  },
  {
    id: 'task-7',
    title: 'Configure ESLint and Prettier',
    description: 'Add code quality and formatting tools',
    tags: ['tooling', 'dx'],
    columnId: 'done',
  },
  {
    id: 'task-8',
    title: 'Install dependencies',
    description: 'Add React, TypeScript, and build tools',
    tags: ['setup'],
    columnId: 'done',
  },
]

/**
 * Column definitions for the Kanban board
 */
export const kanbanColumns = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#3b82f6', // Blue
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#f59e0b', // Orange
  },
  {
    id: 'done',
    title: 'Done',
    color: '#10b981', // Green
  },
]

/**
 * Full Punk schema for the Kanban board example
 * This shows how to use the Kanban component in a declarative schema
 */
export const kanbanSchema: PunkSchema = {
  punkVersion: '1.0.0',
  schemaVersion: '1.0.0',
  root: {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
      },
    },
    children: [
      // Header
      {
        type: 'div',
        props: {
          style: {
            marginBottom: '24px',
          },
        },
        children: [
          {
            type: 'h1',
            props: {
              style: {
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#1f2937',
              },
              children: 'Project Task Board',
            },
          },
          {
            type: 'p',
            props: {
              style: {
                fontSize: '16px',
                color: '#6b7280',
              },
              children: 'Drag and drop tasks between columns to update their status',
            },
          },
        ],
      },

      // Kanban Board
      {
        type: 'Kanban',
        props: {
          columns: kanbanColumns,
          cards: 'tasks', // References data.tasks from DataContext
          onCardMove: 'handleCardMove', // References action from ActionBus
          height: '600px',
        },
      },
    ],
  },
}
