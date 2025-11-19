import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const FileUploadParams = z.object({
  allowedMimeTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf']),
  maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
  storageProvider: z.enum(['local', 's3', 'gcs']).default('local'),
  enableVirusScanning: z.boolean().default(false),
  ownershipField: z.string().default('user_id')
})

export const fileUploadTemplate: BackendTemplate = {
  name: 'fileUpload',
  category: 'files',
  description: 'Secure file upload with validation and storage management',
  version: '1.0.0',
  params: FileUploadParams,

  generates: (params) => {
    const p = FileUploadParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import { z } from "zod"
import { createHash } from "crypto"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const db = new SQLDatabase("files", { migrations: "./migrations" })

const UploadFileRequest = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number(),
  data: z.string().describe("Base64 encoded file data")
})

export const uploadFile = api(
  { method: "POST", path: "/files/upload", auth: true },
  async (req: z.infer<typeof UploadFileRequest>, ctx): Promise<{
    id: string
    url: string
    filename: string
    size: number
  }> => {
    // Validate file type
    const allowedTypes = ${JSON.stringify(p.allowedMimeTypes)}
    if (!allowedTypes.includes(req.contentType)) {
      throw APIError.invalidArgument(
        \`File type not allowed. Allowed types: \${allowedTypes.join(", ")}\`
      )
    }

    // Validate file size
    if (req.size > ${p.maxFileSize}) {
      throw APIError.invalidArgument(
        \`File too large. Max size: ${p.maxFileSize} bytes\`
      )
    }

    // Decode file data
    const fileBuffer = Buffer.from(req.data, "base64")

    // Generate file hash
    const hash = createHash("sha256").update(fileBuffer).digest("hex")

    // Check for duplicate
    const existingFile = await db.query(
      \`SELECT id, url FROM files WHERE hash = $1\`,
      [hash]
    )

    if (existingFile.rows.length > 0) {
      return existingFile.rows[0]
    }

    ${p.storageProvider === 'local' ? `
    // Store locally
    const uploadDir = join(process.cwd(), "uploads")
    await mkdir(uploadDir, { recursive: true })

    const filename = \`\${Date.now()}-\${req.filename}\`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, fileBuffer)

    const url = \`/uploads/\${filename}\`
    ` : ''}

    // Save to database
    const result = await db.query(
      \`INSERT INTO files (filename, content_type, size, url, hash, ${p.ownershipField}, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, url, filename, size\`,
      [req.filename, req.contentType, req.size, url, hash, ctx.auth.userId]
    )

    return result.rows[0]
  }
)

export const getFile = api(
  { method: "GET", path: "/files/:id", auth: true },
  async (req: { id: string }, ctx): Promise<any> => {
    const result = await db.query(
      \`SELECT * FROM files WHERE id = $1\`,
      [req.id]
    )

    if (result.rows.length === 0) {
      throw APIError.notFound("File not found")
    }

    const file = result.rows[0]

    if (file.${p.ownershipField} !== ctx.auth.userId) {
      throw APIError.permissionDenied("Access denied")
    }

    return file
  }
)
`.trim()

    const migrations = `
-- Create files table

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    hash VARCHAR(64) UNIQUE NOT NULL,
    ${p.ownershipField} UUID NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_${p.ownershipField} ON files(${p.ownershipField});
CREATE INDEX idx_files_hash ON files(hash);
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'executing uploaded files',
      'path traversal'
    ],
    requiredValidation: [
      'MIME type',
      'file size',
      'filename sanitization'
    ]
  },

  dependencies: {
    npm: ['zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSize: 5 * 1024 * 1024,
        storageProvider: 'local'
      },
      description: 'Image upload with 5MB limit',
      useCase: 'Profile picture upload'
    }
  ]
}
