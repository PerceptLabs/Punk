import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const ScheduledJobParams = z.object({
  jobName: z.string(),
  schedule: z.string().describe("Cron expression (e.g., '0 0 * * *')"),
  task: z.string().describe("Description of what the job does"),
  timeout: z.string().default('5m'),
  retryOnFailure: z.boolean().default(true),
  enableJobHistory: z.boolean().default(true)
})

export const scheduledJobTemplate: BackendTemplate = {
  name: 'scheduledJob',
  category: 'jobs',
  description: 'Cron-like scheduled jobs with error handling and monitoring',
  version: '1.0.0',
  params: ScheduledJobParams,

  generates: (params) => {
    const p = ScheduledJobParams.parse(params)

    const service = `
import { CronJob } from "encore.dev/cron"
${p.enableJobHistory ? `import { SQLDatabase } from "encore.dev/storage/sqldb"` : ''}

${p.enableJobHistory ? `
const db = new SQLDatabase("jobs", { migrations: "./migrations" })
` : ''}

// Schedule: ${p.schedule}
// Task: ${p.task}
const ${p.jobName}Job = new CronJob("${p.jobName}", {
  title: "${p.task}",
  schedule: "${p.schedule}",
  endpoint: async () => {
    const startTime = Date.now()

    try {
      console.log("Starting ${p.jobName} job")

      // TODO: Implement job logic here
      // Example tasks:
      // - Clean up old records
      // - Send scheduled emails
      // - Generate reports
      // - Sync data from external APIs

      const duration = Date.now() - startTime

      ${p.enableJobHistory ? `
      await db.query(
        \`INSERT INTO job_runs (job_name, status, duration_ms, created_at)
         VALUES ($1, $2, $3, NOW())\`,
        ["${p.jobName}", "success", duration]
      )
      ` : ''}

      console.log(\`${p.jobName} completed in \${duration}ms\`)
    } catch (error) {
      const duration = Date.now() - startTime

      ${p.enableJobHistory ? `
      await db.query(
        \`INSERT INTO job_runs (job_name, status, error, duration_ms, created_at)
         VALUES ($1, $2, $3, $4, NOW())\`,
        ["${p.jobName}", "failed", (error as Error).message, duration]
      )
      ` : ''}

      console.error(\`${p.jobName} failed:\`, error)

      ${p.retryOnFailure ? `
      throw error // Encore will retry
      ` : ''}
    }
  }
})

export { ${p.jobName}Job }
`.trim()

    const migrations = p.enableJobHistory ? `
-- Create job runs table

CREATE TABLE IF NOT EXISTS job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_runs_job_name ON job_runs(job_name, created_at DESC);
CREATE INDEX idx_job_runs_status ON job_runs(status);
`.trim() : undefined

    return {
      service,
      ...(migrations && { migrations })
    }
  },

  constraints: {
    forbiddenOperations: [
      'infinite loops',
      'unbounded operations'
    ],
    requiredValidation: [
      'cron expression',
      'error handling'
    ]
  },

  dependencies: {
    npm: ['encore.dev']
  },

  examples: [
    {
      params: {
        jobName: 'cleanupOldRecords',
        schedule: '0 2 * * *',
        task: 'Clean up records older than 30 days',
        retryOnFailure: true
      },
      description: 'Daily cleanup job at 2 AM',
      useCase: 'Database maintenance'
    }
  ]
}
