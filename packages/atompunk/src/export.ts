import type { GeneratedCode } from './registry'

export type ExportTargetName = 'vercel' | 'cloudflare' | 'docker' | 'static' | 'encore'

export interface ExportConfig {
  target: ExportTargetName
  outputDir?: string
  envVars?: Record<string, string>
  buildCommand?: string
  startCommand?: string
}

export interface ExportArtifacts {
  files: Map<string, string>
  config?: any
  instructions?: string
}

export interface GeneratedApp {
  name: string
  services: Map<string, GeneratedCode>
  dependencies: string[]
  envVars: string[]
}

/**
 * Export Generator
 * Generates deployment artifacts for different platforms
 */
export class ExportGenerator {
  /**
   * Generate export artifacts for a target platform
   */
  async generateExport(
    target: ExportTargetName,
    app: GeneratedApp,
    config: Partial<ExportConfig> = {}
  ): Promise<ExportArtifacts> {
    switch (target) {
      case 'vercel':
        return this.generateVercelExport(app, config)
      case 'cloudflare':
        return this.generateCloudflareExport(app, config)
      case 'docker':
        return this.generateDockerExport(app, config)
      case 'static':
        return this.generateStaticExport(app, config)
      case 'encore':
        return this.generateEncoreExport(app, config)
      default:
        throw new Error(`Unknown export target: ${target}`)
    }
  }

  /**
   * Generate Vercel deployment
   */
  private async generateVercelExport(
    app: GeneratedApp,
    config: Partial<ExportConfig>
  ): Promise<ExportArtifacts> {
    const files = new Map<string, string>()

    // Generate vercel.json
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/node'
        }
      ],
      routes: [
        {
          src: '/(.*)',
          dest: '/api/$1'
        }
      ],
      env: this.generateEnvConfig(app.envVars)
    }

    files.set('vercel.json', JSON.stringify(vercelConfig, null, 2))

    // Generate package.json
    files.set('package.json', this.generatePackageJson(app))

    // Generate API routes
    for (const [name, code] of app.services) {
      files.set(`api/${name}.ts`, code.service)
    }

    return {
      files,
      config: vercelConfig,
      instructions: this.getVercelInstructions()
    }
  }

  /**
   * Generate Cloudflare Workers deployment
   */
  private async generateCloudflareExport(
    app: GeneratedApp,
    config: Partial<ExportConfig>
  ): Promise<ExportArtifacts> {
    const files = new Map<string, string>()

    // Generate wrangler.toml
    const wranglerConfig = `
name = "${app.name}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
${app.envVars.map(v => `${v} = ""`).join('\n')}
`

    files.set('wrangler.toml', wranglerConfig.trim())

    // Generate package.json
    files.set('package.json', this.generatePackageJson(app, {
      scripts: {
        dev: 'wrangler dev',
        deploy: 'wrangler deploy'
      }
    }))

    // Generate worker entry point
    const workerCode = this.generateCloudflareWorker(app)
    files.set('src/index.ts', workerCode)

    return {
      files,
      instructions: this.getCloudflareInstructions()
    }
  }

  /**
   * Generate Docker deployment
   */
  private async generateDockerExport(
    app: GeneratedApp,
    config: Partial<ExportConfig>
  ): Promise<ExportArtifacts> {
    const files = new Map<string, string>()

    // Generate Dockerfile
    const dockerfile = `
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
`

    files.set('Dockerfile', dockerfile.trim())

    // Generate docker-compose.yml
    const dockerCompose = `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
${app.envVars.map(v => `      - ${v}=\${${v}}`).join('\n')}
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=${app.name}
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`

    files.set('docker-compose.yml', dockerCompose.trim())

    // Generate .dockerignore
    const dockerignore = `
node_modules
npm-debug.log
.git
.env
dist
*.md
`

    files.set('.dockerignore', dockerignore.trim())

    return {
      files,
      instructions: this.getDockerInstructions()
    }
  }

  /**
   * Generate static file export
   */
  private async generateStaticExport(
    app: GeneratedApp,
    config: Partial<ExportConfig>
  ): Promise<ExportArtifacts> {
    const files = new Map<string, string>()

    // Generate all service files
    for (const [name, code] of app.services) {
      files.set(`src/services/${name}.ts`, code.service)

      if (code.tests) {
        files.set(`src/services/${name}.test.ts`, code.tests)
      }

      if (code.migrations) {
        files.set(`migrations/${name}.sql`, code.migrations)
      }
    }

    // Generate package.json
    files.set('package.json', this.generatePackageJson(app))

    // Generate tsconfig.json
    files.set('tsconfig.json', this.generateTsConfig())

    // Generate .env.example
    files.set('.env.example', app.envVars.join('\n'))

    return {
      files,
      instructions: this.getStaticInstructions()
    }
  }

  /**
   * Generate Encore.ts deployment
   */
  private async generateEncoreExport(
    app: GeneratedApp,
    config: Partial<ExportConfig>
  ): Promise<ExportArtifacts> {
    const files = new Map<string, string>()

    // Generate encore.app
    const encoreApp = `
{
  "id": "${app.name}",
  "lang": "ts"
}
`

    files.set('encore.app', encoreApp.trim())

    // Generate all service files
    for (const [name, code] of app.services) {
      files.set(`${name}/${name}.ts`, code.service)

      if (code.tests) {
        files.set(`${name}/${name}.test.ts`, code.tests)
      }

      if (code.migrations) {
        files.set(`${name}/migrations/1_init.up.sql`, code.migrations)
      }
    }

    // Generate package.json
    files.set('package.json', this.generatePackageJson(app, {
      scripts: {
        dev: 'encore run',
        test: 'encore test',
        build: 'encore build'
      }
    }))

    return {
      files,
      config: { encoreApp },
      instructions: this.getEncoreInstructions()
    }
  }

  /**
   * Helper: Generate package.json
   */
  private generatePackageJson(
    app: GeneratedApp,
    overrides: any = {}
  ): string {
    const pkg = {
      name: app.name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'vitest',
        ...overrides.scripts
      },
      dependencies: {
        ...this.getDependenciesFromList(app.dependencies)
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'typescript': '^5.0.0',
        'tsx': '^4.0.0',
        'vitest': '^1.0.0'
      }
    }

    return JSON.stringify(pkg, null, 2)
  }

  /**
   * Helper: Generate TypeScript config
   */
  private generateTsConfig(): string {
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    }

    return JSON.stringify(tsconfig, null, 2)
  }

  /**
   * Helper: Generate env config
   */
  private generateEnvConfig(envVars: string[]): Record<string, string> {
    const config: Record<string, string> = {}
    for (const varName of envVars) {
      config[varName] = `@${varName.toLowerCase()}`
    }
    return config
  }

  /**
   * Helper: Generate Cloudflare Worker
   */
  private generateCloudflareWorker(app: GeneratedApp): string {
    return `
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url)

    // Router
    const routes = {
      // Add your routes here
    }

    return new Response('Hello from ${app.name}', {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
`.trim()
  }

  /**
   * Helper: Get dependencies from list
   */
  private getDependenciesFromList(deps: string[]): Record<string, string> {
    const versions: Record<string, string> = {
      'encore.dev': '^1.0.0',
      'zod': '^3.22.0',
      'bcrypt': '^5.1.1',
      'jsonwebtoken': '^9.0.2',
      'stripe': '^14.0.0'
    }

    const result: Record<string, string> = {}
    for (const dep of deps) {
      result[dep] = versions[dep] || 'latest'
    }
    return result
  }

  /**
   * Instructions for Vercel
   */
  private getVercelInstructions(): string {
    return `
# Deploy to Vercel

1. Install Vercel CLI:
   npm i -g vercel

2. Deploy:
   vercel

3. Set environment variables in Vercel dashboard
`.trim()
  }

  /**
   * Instructions for Cloudflare
   */
  private getCloudflareInstructions(): string {
    return `
# Deploy to Cloudflare Workers

1. Install Wrangler:
   npm i -g wrangler

2. Login:
   wrangler login

3. Deploy:
   wrangler deploy
`.trim()
  }

  /**
   * Instructions for Docker
   */
  private getDockerInstructions(): string {
    return `
# Deploy with Docker

1. Build:
   docker-compose build

2. Run:
   docker-compose up -d

3. View logs:
   docker-compose logs -f
`.trim()
  }

  /**
   * Instructions for static export
   */
  private getStaticInstructions(): string {
    return `
# Static Export

1. Install dependencies:
   npm install

2. Build:
   npm run build

3. Run:
   npm start
`.trim()
  }

  /**
   * Instructions for Encore
   */
  private getEncoreInstructions(): string {
    return `
# Deploy with Encore

1. Install Encore CLI:
   curl -L https://encore.dev/install.sh | bash

2. Run locally:
   encore run

3. Deploy:
   encore deploy
`.trim()
  }
}

/**
 * Default export generator instance
 */
export const defaultExportGenerator = new ExportGenerator()

/**
 * Convenience function for quick export
 */
export async function exportApp(
  target: ExportTargetName,
  app: GeneratedApp,
  config?: Partial<ExportConfig>
): Promise<ExportArtifacts> {
  return defaultExportGenerator.generateExport(target, app, config)
}
