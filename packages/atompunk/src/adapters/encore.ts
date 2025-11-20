import { z } from 'zod'

export interface EncoreService {
  name: string
  endpoints: EncoreEndpoint[]
  database?: string
  migrations?: string[]
}

export interface EncoreEndpoint {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  auth: boolean
  requestSchema?: z.ZodSchema
  responseSchema?: z.ZodSchema
  implementation: string
}

export interface DatabaseSchema {
  tables: DatabaseTable[]
  indexes?: DatabaseIndex[]
}

export interface DatabaseTable {
  name: string
  columns: DatabaseColumn[]
  primaryKey?: string
  foreignKeys?: DatabaseForeignKey[]
}

export interface DatabaseColumn {
  name: string
  type: string
  nullable?: boolean
  unique?: boolean
  default?: string
}

export interface DatabaseIndex {
  name: string
  table: string
  columns: string[]
  unique?: boolean
}

export interface DatabaseForeignKey {
  column: string
  references: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
}

export interface SQLMigration {
  version: number
  name: string
  up: string
  down?: string
}

/**
 * Encore.ts Adapter
 * Generates Encore.ts-specific code structures
 */
export class EncoreAdapter {
  /**
   * Generate an Encore service with endpoints
   */
  generateService(
    name: string,
    endpoints: EncoreEndpoint[],
    options: {
      database?: string
      imports?: string[]
    } = {}
  ): string {
    const imports = this.generateImports(options.imports)
    const databaseSetup = options.database
      ? this.generateDatabaseSetup(options.database)
      : ''

    const endpointCode = endpoints
      .map(endpoint => this.generateEndpoint(endpoint))
      .join('\n\n')

    return `
${imports}

${databaseSetup}

${endpointCode}
`.trim()
  }

  /**
   * Generate imports section
   */
  private generateImports(customImports: string[] = []): string {
    const defaultImports = [
      `import { api, APIError } from "encore.dev/api"`,
      `import { z } from "zod"`
    ]

    return [...defaultImports, ...customImports].join('\n')
  }

  /**
   * Generate database setup
   */
  private generateDatabaseSetup(dbName: string): string {
    return `
import { SQLDatabase } from "encore.dev/storage/sqldb"

const db = new SQLDatabase("${dbName}", {
  migrations: "./migrations"
})
`.trim()
  }

  /**
   * Generate a single endpoint
   */
  private generateEndpoint(endpoint: EncoreEndpoint): string {
    const requestType = endpoint.requestSchema
      ? this.generateZodType(endpoint.requestSchema)
      : 'void'

    const responseType = endpoint.responseSchema
      ? this.generateZodType(endpoint.responseSchema)
      : 'void'

    return `
export const ${endpoint.name} = api(
  { method: "${endpoint.method}", path: "${endpoint.path}", auth: ${endpoint.auth} },
  async (req: ${requestType}${endpoint.auth ? ', ctx' : ''}): Promise<${responseType}> => {
    ${endpoint.implementation}
  }
)
`.trim()
  }

  /**
   * Generate TypeScript type from Zod schema
   */
  private generateZodType(schema: z.ZodSchema): string {
    // This is a simplified version
    // In production, you'd use z.infer<typeof schema>
    return `z.infer<typeof ${schema}>`
  }

  /**
   * Generate database migration
   */
  generateMigration(
    name: string,
    schema: DatabaseSchema,
    version: number = 1
  ): SQLMigration {
    const upSQL = this.generateMigrationSQL(schema)
    const downSQL = this.generateMigrationDownSQL(schema)

    return {
      version,
      name,
      up: upSQL,
      down: downSQL
    }
  }

  /**
   * Generate SQL for creating tables
   */
  private generateMigrationSQL(schema: DatabaseSchema): string {
    const tables = schema.tables.map(table => this.generateCreateTable(table))
    const indexes = schema.indexes?.map(index => this.generateCreateIndex(index)) || []

    return [...tables, ...indexes].join('\n\n')
  }

  /**
   * Generate SQL for dropping tables
   */
  private generateMigrationDownSQL(schema: DatabaseSchema): string {
    return schema.tables
      .map(table => `DROP TABLE IF EXISTS ${table.name} CASCADE;`)
      .reverse()
      .join('\n')
  }

  /**
   * Generate CREATE TABLE statement
   */
  private generateCreateTable(table: DatabaseTable): string {
    const columns = table.columns.map(col => this.generateColumnDefinition(col))

    const constraints: string[] = []

    if (table.primaryKey) {
      constraints.push(`PRIMARY KEY (${table.primaryKey})`)
    }

    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        const onDelete = fk.onDelete ? ` ON DELETE ${fk.onDelete}` : ''
        constraints.push(
          `FOREIGN KEY (${fk.column}) REFERENCES ${fk.references}${onDelete}`
        )
      }
    }

    const allDefinitions = [...columns, ...constraints]

    return `
CREATE TABLE IF NOT EXISTS ${table.name} (
  ${allDefinitions.join(',\n  ')}
);
`.trim()
  }

  /**
   * Generate column definition
   */
  private generateColumnDefinition(column: DatabaseColumn): string {
    let def = `${column.name} ${column.type}`

    if (!column.nullable) {
      def += ' NOT NULL'
    }

    if (column.unique) {
      def += ' UNIQUE'
    }

    if (column.default !== undefined) {
      def += ` DEFAULT ${column.default}`
    }

    return def
  }

  /**
   * Generate CREATE INDEX statement
   */
  private generateCreateIndex(index: DatabaseIndex): string {
    const unique = index.unique ? 'UNIQUE ' : ''
    const columns = index.columns.join(', ')

    return `CREATE ${unique}INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${columns});`
  }

  /**
   * Generate Encore cron job
   */
  generateCronJob(
    name: string,
    schedule: string,
    handler: string
  ): string {
    return `
import { CronJob } from "encore.dev/cron"

const ${name}Job = new CronJob("${name}", {
  title: "${name}",
  schedule: "${schedule}",
  endpoint: async () => {
    ${handler}
  }
})
`.trim()
  }

  /**
   * Generate Encore PubSub topic
   */
  generatePubSubTopic(
    name: string,
    messageSchema: z.ZodSchema,
    handler: string
  ): string {
    return `
import { Topic, Subscription } from "encore.dev/pubsub"

const ${name}Topic = new Topic<any>("${name}", {
  deliveryGuarantee: "at-least-once"
})

const ${name}Subscription = new Subscription(
  ${name}Topic,
  "${name}-handler",
  {
    handler: async (message: any): Promise<void> => {
      ${handler}
    }
  }
)

export async function publish${name}(message: any): Promise<string> {
  return ${name}Topic.publish(message)
}
`.trim()
  }

  /**
   * Generate Encore secret reference
   */
  generateSecretReference(secretName: string): string {
    return `
import { secret } from "encore.dev/config"

const ${secretName} = secret("${secretName}")
`.trim()
  }

  /**
   * Generate Encore auth handler
   */
  generateAuthHandler(handler: string): string {
    return `
import { authHandler } from "encore.dev/auth"

interface AuthParams {
  authorization: string
}

interface AuthData {
  userId: string
  email: string
}

export const myAuthHandler = authHandler<AuthParams, AuthData>(
  async (params): Promise<AuthData> => {
    ${handler}
  }
)
`.trim()
  }

  /**
   * Generate complete Encore app structure
   */
  generateApp(services: EncoreService[]): Map<string, string> {
    const files = new Map<string, string>()

    // Generate encore.app
    files.set(
      'encore.app',
      JSON.stringify({ id: 'app', lang: 'ts' }, null, 2)
    )

    // Generate each service
    for (const service of services) {
      const serviceCode = this.generateService(
        service.name,
        service.endpoints,
        { database: service.database }
      )

      files.set(`${service.name}/${service.name}.ts`, serviceCode)

      // Generate migrations
      if (service.migrations) {
        service.migrations.forEach((migration, index) => {
          files.set(
            `${service.name}/migrations/${index + 1}_init.up.sql`,
            migration
          )
        })
      }
    }

    return files
  }
}

/**
 * Default Encore adapter instance
 */
export const defaultEncoreAdapter = new EncoreAdapter()

/**
 * Convenience function for generating Encore service
 */
export function generateEncoreService(
  name: string,
  endpoints: EncoreEndpoint[],
  options?: { database?: string; imports?: string[] }
): string {
  return defaultEncoreAdapter.generateService(name, endpoints, options)
}
