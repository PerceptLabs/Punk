# Backend Guide

Complete guide to backend options in Punk Framework.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Comparison](#backend-comparison)
3. [Encore.ts (Recommended)](#encorets-recommended)
4. [Encore (Go)](#encore-go)
5. [tRPC](#trpc)
6. [GlyphCase (Local SQLite)](#glyphcase-local-sqlite)
7. [Manifest (Declarative)](#manifest-declarative)
8. [Custom Backends](#custom-backends)
9. [Database Integration](#database-integration)
10. [Authentication](#authentication)
11. [Deployment](#deployment)

---

## Overview

Punk supports multiple backend options, allowing you to choose based on your needs:

- **Encore.ts** - TypeScript, infrastructure-from-code, recommended for most
- **Encore** - Go, high-performance, for production systems
- **tRPC** - End-to-end type safety, for TypeScript purists
- **GlyphCase** - Local SQLite, for offline-first apps
- **Manifest** - YAML-based, for declarative backends
- **Custom** - Bring your own backend

---

## Backend Comparison

| Feature | Encore.ts | Encore | tRPC | GlyphCase | Manifest |
|---------|-----------|--------|------|-----------|----------|
| **Language** | TypeScript | Go | TypeScript | SQL | YAML → TS |
| **Type Safety** | ✅ Full | ✅ Full | ✅ Full | Queries | ✅ Full |
| **Learning Curve** | Low | Medium | Low | Low | Very Low |
| **Performance** | High | Very High | Medium | High | Medium |
| **Infrastructure** | Automatic | Automatic | Manual | None | Manual |
| **Deployment** | Encore Cloud | Encore Cloud | Any | Local | Any |
| **Local-First** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Cost** | Pay-per-use | Pay-per-use | Free | Free | Free |
| **Best For** | Production | Scale | Simplicity | Offline | Prototypes |

---

## Encore.ts (Recommended)

**Infrastructure-from-code TypeScript backend framework.**

### Why Encore.ts?

- ✅ **Type-safe** - End-to-end TypeScript
- ✅ **Automatic infrastructure** - Databases, queues, caches
- ✅ **Built-in dev tools** - Dashboard, tracing, testing
- ✅ **Deploy anywhere** - AWS, GCP, Azure
- ✅ **Local development** - Full stack runs locally

### Installation

```bash
punk add backend encore-ts
```

### Project Structure

```
backend/
├── services/              # API services
│   ├── users.ts          # User service
│   ├── tasks.ts          # Task service
│   └── auth.ts           # Auth service
├── shared/               # Shared types/utils
├── encore.app            # App configuration
└── package.json
```

### Example Service

```typescript
// backend/services/tasks.ts
import { api } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"

const db = new SQLDatabase("tasks", {
  migrations: "./migrations",
})

interface Task {
  id: number
  title: string
  completed: boolean
}

interface CreateTaskRequest {
  title: string
}

interface CreateTaskResponse {
  task: Task
}

// POST /tasks
export const createTask = api(
  { method: "POST", path: "/tasks", auth: true },
  async (req: CreateTaskRequest): Promise<CreateTaskResponse> => {
    const result = await db.query`
      INSERT INTO tasks (title, completed, user_id)
      VALUES (${req.title}, false, ${auth.userId()})
      RETURNING id, title, completed
    `

    return { task: result.rows[0] }
  }
)

// GET /tasks
export const listTasks = api(
  { method: "GET", path: "/tasks", auth: true },
  async (): Promise<{ tasks: Task[] }> => {
    const result = await db.query`
      SELECT id, title, completed
      FROM tasks
      WHERE user_id = ${auth.userId()}
      ORDER BY created_at DESC
    `

    return { tasks: result.rows }
  }
)

// DELETE /tasks/:id
export const deleteTask = api(
  { method: "DELETE", path: "/tasks/:id", auth: true },
  async (params: { id: number }): Promise<void> => {
    await db.query`
      DELETE FROM tasks
      WHERE id = ${params.id}
      AND user_id = ${auth.userId()}
    `
  }
)
```

### Database Migrations

```sql
-- backend/services/migrations/1_create_tasks.up.sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Running Locally

```bash
punk dev
# Encore.ts runs on http://localhost:4000
# Dashboard: http://localhost:9400
```

### Frontend Integration

```typescript
// frontend/src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function createTask(title: string) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) throw new Error('Failed to create task')
  return await response.json()
}

export async function listTasks() {
  const response = await fetch(`${API_URL}/tasks`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) throw new Error('Failed to list tasks')
  return await response.json()
}
```

### Deployment

```bash
# Deploy to Encore Cloud
encore deploy

# Or export to AWS/GCP/Azure
encore deploy --cloud aws
```

---

## Encore (Go)

**High-performance Go backend with infrastructure-from-code.**

### When to Use

- Need maximum performance
- Building large-scale systems
- Team experienced with Go
- Microservices architecture

### Installation

```bash
punk add backend encore
```

### Example Service

```go
// backend/services/tasks/tasks.go
package tasks

import (
  "context"
  "encore.dev/storage/sqldb"
)

var db = sqldb.NewDatabase("tasks", sqldb.DatabaseConfig{
  Migrations: "./migrations",
})

type Task struct {
  ID        int    `json:"id"`
  Title     string `json:"title"`
  Completed bool   `json:"completed"`
}

type CreateTaskParams struct {
  Title string `json:"title"`
}

type CreateTaskResponse struct {
  Task Task `json:"task"`
}

//encore:api public method=POST path=/tasks
func CreateTask(ctx context.Context, req *CreateTaskParams) (*CreateTaskResponse, error) {
  var task Task
  err := db.QueryRow(ctx, `
    INSERT INTO tasks (title, completed, user_id)
    VALUES ($1, false, $2)
    RETURNING id, title, completed
  `, req.Title, auth.UserID()).Scan(&task.ID, &task.Title, &task.Completed)

  if err != nil {
    return nil, err
  }

  return &CreateTaskResponse{Task: task}, nil
}

//encore:api public method=GET path=/tasks
func ListTasks(ctx context.Context) (*ListTasksResponse, error) {
  rows, err := db.Query(ctx, `
    SELECT id, title, completed
    FROM tasks
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, auth.UserID())

  if err != nil {
    return nil, err
  }
  defer rows.Close()

  var tasks []Task
  for rows.Next() {
    var task Task
    if err := rows.Scan(&task.ID, &task.Title, &task.Completed); err != nil {
      return nil, err
    }
    tasks = append(tasks, task)
  }

  return &ListTasksResponse{Tasks: tasks}, nil
}
```

---

## tRPC

**End-to-end type-safe APIs with TypeScript.**

### Why tRPC?

- ✅ **Type safety** - Types flow from backend to frontend
- ✅ **No code generation** - Direct import of types
- ✅ **React hooks** - Built-in React Query integration
- ✅ **Lightweight** - Minimal overhead

### Installation

```bash
punk add backend trpc
```

### Project Structure

```
backend/
├── routers/              # tRPC routers
│   ├── tasks.ts
│   ├── users.ts
│   └── _app.ts          # Root router
├── server.ts            # Server setup
└── package.json
```

### Example Router

```typescript
// backend/routers/tasks.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'

export const tasksRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const task = await db.task.create({
        data: {
          title: input.title,
          userId: ctx.user.id,
        },
      })
      return task
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const tasks = await db.task.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      })
      return tasks
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.task.deleteMany({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })
    }),
})
```

### Frontend Integration

```typescript
// frontend/src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../backend/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

// Use in components
function TaskList() {
  const { data: tasks } = trpc.tasks.list.useQuery()
  const createTask = trpc.tasks.create.useMutation()

  const handleCreate = async (title: string) => {
    await createTask.mutateAsync({ title })
  }

  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  )
}
```

---

## GlyphCase (Local SQLite)

**Local-first SQLite database with portable .gcasex files.**

### Why GlyphCase?

- ✅ **Offline-first** - Works without internet
- ✅ **Portable** - Database is a single file
- ✅ **Fast** - Local queries, no network latency
- ✅ **Simple** - Just SQL, no ORM needed
- ✅ **Version control** - Database can be committed

### Installation

```bash
punk add backend glyphcase
```

### Project Structure

```
backend/
├── database/
│   ├── schema.sql       # Database schema
│   ├── queries.sql      # Named queries
│   └── app.db          # SQLite database (gitignored)
├── glyphcase.config.js
└── package.json
```

### Example Schema

```sql
-- backend/database/schema.sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

### Example Queries

```sql
-- backend/database/queries.sql

-- name: CreateTask
INSERT INTO tasks (title) VALUES (:title)
RETURNING *;

-- name: ListTasks
SELECT * FROM tasks ORDER BY created_at DESC;

-- name: UpdateTask
UPDATE tasks
SET completed = :completed
WHERE id = :id;

-- name: DeleteTask
DELETE FROM tasks WHERE id = :id;
```

### Frontend Integration

```typescript
// frontend/src/lib/db.ts
import { GlyphCase } from '@punk/glyphcase'

const db = new GlyphCase({
  filename: 'app.db',
  schema: './database/schema.sql',
  queries: './database/queries.sql',
})

export async function createTask(title: string) {
  return await db.query('CreateTask', { title })
}

export async function listTasks() {
  return await db.query('ListTasks')
}

export async function updateTask(id: number, completed: boolean) {
  return await db.query('UpdateTask', { id, completed })
}

export async function deleteTask(id: number) {
  return await db.query('DeleteTask', { id })
}
```

---

## Manifest (Declarative)

**YAML-based declarative backend definition.**

### Why Manifest?

- ✅ **Simple** - Define APIs in YAML
- ✅ **Visual** - Easy to understand structure
- ✅ **Generated code** - TypeScript stubs auto-generated
- ✅ **Fast prototyping** - Get started quickly

### Installation

```bash
punk add backend manifest
```

### Example Manifest

```yaml
# backend/manifest.yml
name: my-app-api
version: 1.0.0

database:
  type: postgresql
  tables:
    tasks:
      columns:
        - name: id
          type: serial
          primary: true
        - name: title
          type: text
          required: true
        - name: completed
          type: boolean
          default: false
        - name: created_at
          type: timestamp
          default: now()

endpoints:
  - name: createTask
    method: POST
    path: /tasks
    auth: required
    input:
      title: string
    output:
      task: Task
    implementation: |
      const task = await db.tasks.insert({
        title: input.title,
      })
      return { task }

  - name: listTasks
    method: GET
    path: /tasks
    auth: required
    output:
      tasks: Task[]
    implementation: |
      const tasks = await db.tasks.findAll({
        orderBy: { createdAt: 'desc' }
      })
      return { tasks }
```

### Generated Code

```typescript
// Auto-generated: backend/generated/api.ts
export async function createTask(input: CreateTaskInput): Promise<CreateTaskOutput> {
  // Implementation from manifest
}

export async function listTasks(): Promise<ListTasksOutput> {
  // Implementation from manifest
}
```

---

## Database Integration

### PostgreSQL (Encore.ts/Encore)

```typescript
import { SQLDatabase } from "encore.dev/storage/sqldb"

const db = new SQLDatabase("mydb", {
  migrations: "./migrations",
})
```

### Prisma (tRPC)

```typescript
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())
}
```

### Neon Integration

```bash
# Add Neon database
punk add database neon

# Configure
DATABASE_URL=postgresql://user:pass@neon.tech/db
```

---

## Authentication

### Encore.ts Auth

```typescript
import { authHandler } from "encore.dev/auth"

interface AuthData {
  userId: number
}

export const auth = authHandler(
  async (token: string): Promise<AuthData> => {
    // Verify JWT
    const payload = verifyJWT(token)
    return { userId: payload.sub }
  }
)
```

### Add Auth

```bash
punk add auth --provider email --features oauth,2fa
```

---

## Deployment

### Encore Cloud

```bash
encore deploy
```

### Vercel/Netlify (tRPC)

```bash
punk deploy --target vercel
```

### Docker

```bash
punk add deployment docker
docker build -t my-app .
docker run -p 4000:4000 my-app
```

---

[Back to README](README.md) • [Mods Guide](SKILLS_GUIDE.md) • [API Reference](API_REFERENCE.md)
