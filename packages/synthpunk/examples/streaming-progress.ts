/**
 * SynthPunk - Streaming with Progress Tracking
 */

import { EpochEngine, createContext, GenerationProgress, SchemaPatch } from '../src'

async function generateWithProgress(
  engine: EpochEngine,
  userPrompt: string,
  context: any,
  onProgress: (progress: GenerationProgress) => void
): Promise<SchemaPatch[]> {
  const patches: SchemaPatch[] = []
  const startTime = Date.now()

  for await (const patch of engine.generateSchema(userPrompt, context)) {
    patches.push(patch)

    const elapsed = Date.now() - startTime
    const avgTimePerPatch = elapsed / patches.length
    const estimatedRemaining = avgTimePerPatch * 10 // Assume ~10 more patches

    onProgress({
      patchesGenerated: patches.length,
      tokensUsed: context.tokenUsed,
      complexityUsed: context.complexityUsed,
      startTime,
      estimatedTimeRemaining: estimatedRemaining,
    })
  }

  return patches
}

async function main() {
  const engine = new EpochEngine({
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key',
  })

  const context = createContext()

  console.log('Generating schema with progress tracking...\n')

  const patches = await generateWithProgress(
    engine,
    'Create a login form with email and password',
    context,
    (progress) => {
      console.log(`Progress: ${progress.patchesGenerated} patches generated`)
      console.log(`  Tokens used: ${progress.tokensUsed}`)
      console.log(`  Complexity: ${progress.complexityUsed}`)
      console.log(`  Estimated time remaining: ${Math.round(progress.estimatedTimeRemaining)}ms`)
      console.log('---')
    }
  )

  console.log(`\nComplete! Generated ${patches.length} patches`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { generateWithProgress }
