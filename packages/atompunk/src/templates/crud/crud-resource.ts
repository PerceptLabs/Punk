import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const FieldSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'date', 'uuid', 'json']),
  required: z.boolean().default(false),
  unique: z.boolean().default(false)
})

const CRUDResourceParams = z.object({
  resourceName: z.string().describe("Name of the resource (e.g., 'Post', 'Product')"),
  fields: z.array(FieldSchema),
  enableSoftDelete: z.boolean().default(true),
  enableAuditLog: z.boolean().default(false),
  ownershipField: z.string().optional().describe("Field that identifies owner (e.g., 'user_id')")
})

export const crudResourceTemplate: BackendTemplate = {
  name: 'crudResource',
  category: 'crud',
  description: 'Full CRUD operations for a database resource with validation, pagination, and soft deletes',
  version: '1.0.0',
  params: CRUDResourceParams,

  generates: (params) => {
    const p = CRUDResourceParams.parse(params)
    const resourceLower = p.resourceName.toLowerCase()

    const fieldTypes = p.fields.map(f => {
      const zodType = {
        string: 'z.string()',
        number: 'z.number()',
        boolean: 'z.boolean()',
        date: 'z.string().datetime()',
        uuid: 'z.string().uuid()',
        json: 'z.record(z.any())'
      }[f.type]
      return `${f.name}: ${zodType}${f.required ? '' : '.optional()'}`
    }).join(',\n  ')

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import { z } from "zod"

const db = new SQLDatabase("${resourceLower}", { migrations: "./migrations" })

// ===== Schemas =====

const ${p.resourceName}Schema = z.object({
  ${fieldTypes}
})

const Create${p.resourceName}Request = ${p.resourceName}Schema

const Update${p.resourceName}Request = ${p.resourceName}Schema.partial()

const Get${p.resourceName}Request = z.object({
  id: z.string().uuid()
})

const List${p.resourceName}Request = z.object({
  page: z.number().default(1),
  limit: z.number().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
})

const Delete${p.resourceName}Request = z.object({
  id: z.string().uuid()
})

// ===== Create =====

export const create${p.resourceName} = api(
  { method: "POST", path: "/${resourceLower}", auth: true },
  async (req: z.infer<typeof Create${p.resourceName}Request>, ctx): Promise<any> => {
    const validated = Create${p.resourceName}Request.parse(req)

    const fieldNames = [${p.fields.map(f => `"${f.name}"`).join(', ')}]
    const fieldValues = [${p.fields.map(f => `validated.${f.name}`).join(', ')}]

    const result = await db.query(
      \`INSERT INTO ${p.resourceName} (
        ${p.fields.map(f => f.name).join(', ')}${p.ownershipField ? `, ${p.ownershipField}` : ''},
        created_at,
        updated_at
      ) VALUES (
        ${p.fields.map((_, i) => `$${i + 1}`).join(', ')}${p.ownershipField ? `, $${p.fields.length + 1}` : ''},
        NOW(),
        NOW()
      ) RETURNING *\`,
      [...fieldValues${p.ownershipField ? ', ctx.auth.userId' : ''}]
    )

    ${p.enableAuditLog ? `
    await logAudit(ctx.auth.userId, "create", "${p.resourceName}", result.rows[0].id)
    ` : ''}

    return result.rows[0]
  }
)

// ===== Read (Get by ID) =====

export const get${p.resourceName} = api(
  { method: "GET", path: "/${resourceLower}/:id", auth: true },
  async (req: z.infer<typeof Get${p.resourceName}Request>, ctx): Promise<any> => {
    const result = await db.query(
      \`SELECT * FROM ${p.resourceName}
       WHERE id = $1 ${p.enableSoftDelete ? 'AND deleted_at IS NULL' : ''}\`,
      [req.id]
    )

    if (result.rows.length === 0) {
      throw APIError.notFound("${p.resourceName} not found")
    }

    const resource = result.rows[0]

    ${p.ownershipField ? `
    if (resource.${p.ownershipField} !== ctx.auth.userId) {
      throw APIError.permissionDenied("Access denied")
    }
    ` : ''}

    return resource
  }
)

// ===== List (with pagination) =====

export const list${p.resourceName} = api(
  { method: "GET", path: "/${resourceLower}", auth: true },
  async (req: z.infer<typeof List${p.resourceName}Request>, ctx): Promise<{
    data: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> => {
    const offset = (req.page - 1) * req.limit
    const sortBy = req.sortBy || "created_at"
    const sortOrder = req.sortOrder

    const countResult = await db.query(
      \`SELECT COUNT(*) as total FROM ${p.resourceName}
       WHERE 1=1 ${p.enableSoftDelete ? 'AND deleted_at IS NULL' : ''}
       ${p.ownershipField ? \`AND ${p.ownershipField} = $1\` : ''}\`,
      ${p.ownershipField ? '[ctx.auth.userId]' : '[]'}
    )

    const total = parseInt(countResult.rows[0].total)

    const result = await db.query(
      \`SELECT * FROM ${p.resourceName}
       WHERE 1=1 ${p.enableSoftDelete ? 'AND deleted_at IS NULL' : ''}
       ${p.ownershipField ? \`AND ${p.ownershipField} = $1\` : ''}
       ORDER BY \${sortBy} \${sortOrder}
       LIMIT $${p.ownershipField ? '2' : '1'} OFFSET $${p.ownershipField ? '3' : '2'}\`,
      ${p.ownershipField ? '[ctx.auth.userId, req.limit, offset]' : '[req.limit, offset]'}
    )

    return {
      data: result.rows,
      pagination: {
        page: req.page,
        limit: req.limit,
        total,
        totalPages: Math.ceil(total / req.limit)
      }
    }
  }
)

// ===== Update =====

export const update${p.resourceName} = api(
  { method: "PATCH", path: "/${resourceLower}/:id", auth: true },
  async (req: z.infer<typeof Update${p.resourceName}Request> & { id: string }, ctx): Promise<any> => {
    const validated = Update${p.resourceName}Request.parse(req)

    const existing = await db.query(
      \`SELECT * FROM ${p.resourceName} WHERE id = $1 ${p.enableSoftDelete ? 'AND deleted_at IS NULL' : ''}\`,
      [req.id]
    )

    if (existing.rows.length === 0) {
      throw APIError.notFound("${p.resourceName} not found")
    }

    ${p.ownershipField ? `
    if (existing.rows[0].${p.ownershipField} !== ctx.auth.userId) {
      throw APIError.permissionDenied("Access denied")
    }
    ` : ''}

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    ${p.fields.map(f => `
    if (validated.${f.name} !== undefined) {
      updates.push(\`${f.name} = $\${paramIndex++}\`)
      values.push(validated.${f.name})
    }
    `).join('\n')}

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update")
    }

    updates.push(\`updated_at = NOW()\`)
    values.push(req.id)

    const result = await db.query(
      \`UPDATE ${p.resourceName} SET \${updates.join(", ")}
       WHERE id = $\${paramIndex}
       RETURNING *\`,
      values
    )

    ${p.enableAuditLog ? `
    await logAudit(ctx.auth.userId, "update", "${p.resourceName}", req.id)
    ` : ''}

    return result.rows[0]
  }
)

// ===== Delete =====

export const delete${p.resourceName} = api(
  { method: "DELETE", path: "/${resourceLower}/:id", auth: true },
  async (req: z.infer<typeof Delete${p.resourceName}Request>, ctx): Promise<{ success: boolean }> => {
    const existing = await db.query(
      \`SELECT * FROM ${p.resourceName} WHERE id = $1 ${p.enableSoftDelete ? 'AND deleted_at IS NULL' : ''}\`,
      [req.id]
    )

    if (existing.rows.length === 0) {
      throw APIError.notFound("${p.resourceName} not found")
    }

    ${p.ownershipField ? `
    if (existing.rows[0].${p.ownershipField} !== ctx.auth.userId) {
      throw APIError.permissionDenied("Access denied")
    }
    ` : ''}

    ${p.enableSoftDelete ? `
    await db.query(
      \`UPDATE ${p.resourceName} SET deleted_at = NOW() WHERE id = $1\`,
      [req.id]
    )
    ` : `
    await db.query(
      \`DELETE FROM ${p.resourceName} WHERE id = $1\`,
      [req.id]
    )
    `}

    ${p.enableAuditLog ? `
    await logAudit(ctx.auth.userId, "delete", "${p.resourceName}", req.id)
    ` : ''}

    return { success: true }
  }
)

${p.enableAuditLog ? `
async function logAudit(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
): Promise<void> {
  await db.query(
    \`INSERT INTO audit_log (user_id, action, resource_type, resource_id, created_at)
     VALUES ($1, $2, $3, $4, NOW())\`,
    [userId, action, resourceType, resourceId]
  )
}
` : ''}
`.trim()

    const sqlTypeMap: Record<string, string> = {
      string: 'VARCHAR(255)',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      uuid: 'UUID',
      json: 'JSONB'
    }

    const migrations = `
-- Create ${p.resourceName} table

CREATE TABLE IF NOT EXISTS ${p.resourceName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ${p.fields.map(f => {
      const sqlType = sqlTypeMap[f.type]
      const nullable = f.required ? ' NOT NULL' : ''
      const unique = f.unique ? ' UNIQUE' : ''
      return `${f.name} ${sqlType}${nullable}${unique}`
    }).join(',\n    ')},
    ${p.ownershipField ? `${p.ownershipField} UUID NOT NULL REFERENCES User(id) ON DELETE CASCADE,` : ''}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP${p.enableSoftDelete ? ',\n    deleted_at TIMESTAMP' : ''}
);

${p.ownershipField ? `CREATE INDEX idx_${resourceLower}_${p.ownershipField} ON ${p.resourceName}(${p.ownershipField});` : ''}

${p.enableSoftDelete ? `CREATE INDEX idx_${resourceLower}_deleted_at ON ${p.resourceName}(deleted_at);` : ''}

${p.enableAuditLog ? `
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
` : ''}
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'SQL injection',
      'unbounded queries'
    ],
    requiredValidation: [
      'input schemas',
      'ownership checks'
    ],
    rateLimiting: {
      maxAttempts: 1000,
      windowMs: 60000
    }
  },

  dependencies: {
    npm: ['zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        resourceName: 'Post',
        fields: [
          { name: 'title', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'published', type: 'boolean', required: false }
        ],
        enableSoftDelete: true,
        ownershipField: 'user_id'
      },
      description: 'Blog post CRUD with soft deletes and ownership',
      useCase: 'Blog platform'
    }
  ]
}
