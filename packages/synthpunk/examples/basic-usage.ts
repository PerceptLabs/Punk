/**
 * SynthPunk - Basic Usage Example
 */

import { EpochEngine, createContext, applyPatches } from '../src'

async function main() {
  // 1. Create engine with Anthropic provider
  const engine = new EpochEngine({
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key',
    maxRetries: 3,
    validateChunks: true,
  })

  // 2. Create context with data models
  const context = createContext([
    {
      name: 'User',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
  ])

  // 3. Generate schema from prompt
  console.log('Generating schema for: "Create a user profile card"')
  console.log('---')

  const patches = []

  for await (const patch of engine.generateSchema(
    'Create a user profile card showing avatar, name, and email',
    context
  )) {
    console.log('Received patch:', {
      op: patch.op,
      path: patch.path,
      type: (patch.value as any)?.type,
    })
    patches.push(patch)
  }

  console.log('---')
  console.log(`Generated ${patches.length} patches`)

  // 4. Build complete schema
  const rootPatch = patches.find((p) => p.path === '/root' && p.op === 'add')
  if (rootPatch && rootPatch.value) {
    console.log('\nComplete Schema:')
    console.log(JSON.stringify(rootPatch.value, null, 2))
  }

  // 5. Provider info
  const info = engine.getProviderInfo()
  console.log('\nProvider:', info.name, '-', info.model)
}

// Run example
if (require.main === module) {
  main().catch(console.error)
}

export { main }
