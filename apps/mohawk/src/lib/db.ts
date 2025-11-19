import { GlyphCase } from '@punk/glyphcase'
import path from 'path'

/**
 * Database configuration for Mohawk
 * Using GlyphCase for schema-based SQLite management
 */
export const db = new GlyphCase({
  dbPath: path.join(process.cwd(), 'data', 'mohawk.db'),
  schema: {
    tables: [
      {
        name: 'projects',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
          { name: 'name', type: 'TEXT', notNull: true },
          { name: 'description', type: 'TEXT' },
          { name: 'schema', type: 'TEXT' }, // JSON schema stored as TEXT
          { name: 'userId', type: 'INTEGER' },
          { name: 'createdAt', type: 'INTEGER', notNull: true },
          { name: 'updatedAt', type: 'INTEGER', notNull: true }
        ],
        indexes: [
          { name: 'idx_projects_user', columns: ['userId'] },
          { name: 'idx_projects_created', columns: ['createdAt'] }
        ]
      },
      {
        name: 'revisions',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
          { name: 'projectId', type: 'INTEGER', notNull: true },
          { name: 'schema', type: 'TEXT', notNull: true }, // JSON schema stored as TEXT
          { name: 'actor', type: 'TEXT' }, // 'user' or 'ai'
          { name: 'prompt', type: 'TEXT' }, // User prompt that generated this revision
          { name: 'createdAt', type: 'INTEGER', notNull: true }
        ],
        indexes: [
          { name: 'idx_revisions_project', columns: ['projectId'] },
          { name: 'idx_revisions_created', columns: ['createdAt'] }
        ],
        foreignKeys: [
          {
            columns: ['projectId'],
            references: { table: 'projects', columns: ['id'] },
            onDelete: 'CASCADE'
          }
        ]
      },
      {
        name: 'conversations',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
          { name: 'projectId', type: 'INTEGER', notNull: true },
          { name: 'role', type: 'TEXT', notNull: true }, // 'user' or 'assistant'
          { name: 'content', type: 'TEXT', notNull: true },
          { name: 'createdAt', type: 'INTEGER', notNull: true }
        ],
        indexes: [
          { name: 'idx_conversations_project', columns: ['projectId'] },
          { name: 'idx_conversations_created', columns: ['createdAt'] }
        ],
        foreignKeys: [
          {
            columns: ['projectId'],
            references: { table: 'projects', columns: ['id'] },
            onDelete: 'CASCADE'
          }
        ]
      },
      {
        name: 'deployments',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true, autoIncrement: true },
          { name: 'projectId', type: 'INTEGER', notNull: true },
          { name: 'revisionId', type: 'INTEGER' },
          { name: 'platform', type: 'TEXT', notNull: true }, // 'vercel', 'cloudflare', 'docker', 'static'
          { name: 'url', type: 'TEXT' },
          { name: 'status', type: 'TEXT', notNull: true }, // 'pending', 'building', 'success', 'failed'
          { name: 'logs', type: 'TEXT' }, // Deployment logs
          { name: 'createdAt', type: 'INTEGER', notNull: true },
          { name: 'completedAt', type: 'INTEGER' }
        ],
        indexes: [
          { name: 'idx_deployments_project', columns: ['projectId'] },
          { name: 'idx_deployments_status', columns: ['status'] }
        ],
        foreignKeys: [
          {
            columns: ['projectId'],
            references: { table: 'projects', columns: ['id'] },
            onDelete: 'CASCADE'
          },
          {
            columns: ['revisionId'],
            references: { table: 'revisions', columns: ['id'] },
            onDelete: 'SET NULL'
          }
        ]
      }
    ]
  }
})

/**
 * Initialize database and ensure tables exist
 */
export async function initializeDatabase() {
  try {
    await db.initialize()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Project operations
 */
export const projectOperations = {
  async create(name: string, description?: string, userId?: number) {
    const now = Date.now()
    return await db.insert('projects', {
      name,
      description,
      userId,
      createdAt: now,
      updatedAt: now
    })
  },

  async get(id: number) {
    return await db.query('projects', { where: { id } }).first()
  },

  async update(id: number, updates: { name?: string; description?: string; schema?: string }) {
    return await db.update('projects', {
      ...updates,
      updatedAt: Date.now()
    }, { where: { id } })
  },

  async delete(id: number) {
    return await db.delete('projects', { where: { id } })
  },

  async list(userId?: number) {
    const where = userId ? { userId } : {}
    return await db.query('projects', { where, orderBy: { createdAt: 'DESC' } })
  }
}

/**
 * Revision operations
 */
export const revisionOperations = {
  async create(projectId: number, schema: string, actor: 'user' | 'ai', prompt?: string) {
    return await db.insert('revisions', {
      projectId,
      schema,
      actor,
      prompt,
      createdAt: Date.now()
    })
  },

  async listByProject(projectId: number) {
    return await db.query('revisions', {
      where: { projectId },
      orderBy: { createdAt: 'DESC' }
    })
  },

  async get(id: number) {
    return await db.query('revisions', { where: { id } }).first()
  }
}

/**
 * Conversation operations
 */
export const conversationOperations = {
  async add(projectId: number, role: 'user' | 'assistant', content: string) {
    return await db.insert('conversations', {
      projectId,
      role,
      content,
      createdAt: Date.now()
    })
  },

  async listByProject(projectId: number, limit?: number) {
    return await db.query('conversations', {
      where: { projectId },
      orderBy: { createdAt: 'ASC' },
      limit
    })
  }
}

/**
 * Deployment operations
 */
export const deploymentOperations = {
  async create(projectId: number, platform: string, revisionId?: number) {
    return await db.insert('deployments', {
      projectId,
      revisionId,
      platform,
      status: 'pending',
      createdAt: Date.now()
    })
  },

  async updateStatus(id: number, status: string, logs?: string, url?: string) {
    const updates: any = { status }
    if (logs) updates.logs = logs
    if (url) updates.url = url
    if (status === 'success' || status === 'failed') {
      updates.completedAt = Date.now()
    }
    return await db.update('deployments', updates, { where: { id } })
  },

  async listByProject(projectId: number) {
    return await db.query('deployments', {
      where: { projectId },
      orderBy: { createdAt: 'DESC' }
    })
  }
}

export default db
