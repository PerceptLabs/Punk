# SynthPunk File Structure

Complete overview of all files in @punk/synthpunk package.

```
@punk/synthpunk/
│
├── 📦 Package Configuration
│   ├── package.json                  - NPM package config, dependencies, scripts
│   ├── tsconfig.json                 - TypeScript strict mode configuration
│   ├── .gitignore                    - Git ignore patterns
│   └── README.md                     - Main package documentation
│
├── 📚 Documentation
│   ├── IMPLEMENTATION_SUMMARY.md     - Complete implementation overview
│   ├── QUICK_START.md                - 5-minute quick start guide
│   └── FILE_STRUCTURE.md             - This file
│
├── 🎯 Source Code (src/)
│   │
│   ├── 📋 Core Types
│   │   └── types.ts                  - All TypeScript type definitions
│   │       ├── SchemaPatch, PunkSchema
│   │       ├── ComponentSchema, PropertySchema
│   │       ├── DesignToken, DataModel
│   │       ├── EpochContext, EpochConfig
│   │       ├── ValidationResult, LLMProvider
│   │       └── ErrorCategory, RecoveryAction
│   │
│   ├── 🤖 Main Engine
│   │   └── engine.ts                 - EpochEngine class
│   │       ├── generateSchema()      - Streaming generation
│   │       ├── generateComplete()    - Non-streaming version
│   │       ├── streamFromLLM()       - Provider abstraction
│   │       ├── generateFallbackSchema() - Error recovery
│   │       ├── EpochError            - Custom error class
│   │       └── EpochErrorRecovery    - Recovery strategy
│   │
│   ├── 💬 Prompts
│   │   └── prompts.ts                - System prompts from EPOCH_IMPL.md
│   │       ├── SYSTEM_PROMPT         - Main 200+ line prompt
│   │       ├── buildContextAwarePrompt() - For modifications
│   │       ├── buildRecoveryPrompt() - For retries
│   │       └── buildUserMessage()    - Context enrichment
│   │
│   ├── 🔌 LLM Providers (providers/)
│   │   ├── anthropic.ts              - AnthropicProvider class
│   │   │   └── Claude Sonnet 4.5 streaming
│   │   ├── openai.ts                 - OpenAIProvider class
│   │   │   └── GPT-4 Turbo streaming
│   │   ├── ollama.ts                 - OllamaProvider class
│   │   │   └── Local model support
│   │   └── index.ts                  - LLMProviderFactory
│   │       ├── create()              - Provider instantiation
│   │       └── selectOptimalProvider() - Auto-selection
│   │
│   ├── ✅ Validation
│   │   └── validation.ts             - 8-stage validation pipeline
│   │       ├── validatePatch()       - Main validator
│   │       ├── validateStructure()   - Zod schema validation
│   │       ├── validateAccessibility() - A11y checks
│   │       ├── calculateComplexity() - Budget scoring
│   │       └── containsMaliciousContent() - XSS prevention
│   │
│   ├── 🌐 Context Management
│   │   └── context.ts                - Context building
│   │       ├── createContext()       - Initialize context
│   │       ├── buildComponentRegistry() - 15 components
│   │       ├── buildTokenRegistry()  - Design tokens
│   │       ├── calculateTokenBudget() - Budget tracking
│   │       └── estimateTokens()      - Token estimation
│   │
│   ├── 📡 Streaming
│   │   └── streaming.ts              - JSON Patch streaming
│   │       ├── StreamingPatchExtractor - Real-time parser
│   │       ├── parseStreamChunk()    - Chunk parsing
│   │       ├── applyPatch()          - Single patch application
│   │       ├── applyPatches()        - Multiple patches
│   │       ├── buildSchemaFromPatches() - Schema builder
│   │       ├── deduplicatePatches()  - Deduplication
│   │       ├── sortPatches()         - Optimal ordering
│   │       └── patchesConflict()     - Conflict detection
│   │
│   ├── 📤 Public API
│   │   └── index.ts                  - Main export file
│   │       ├── All type exports
│   │       ├── All function exports
│   │       ├── VERSION constant
│   │       └── ENGINE_NAME constant
│   │
│   └── 🧪 Tests (__tests__/)
│       └── engine.test.ts            - Vitest test suite
│           ├── Initialization tests
│           ├── Validation tests
│           ├── Provider tests
│           ├── Cache tests
│           └── Validation pipeline tests
│
├── 📖 Examples (examples/)
│   ├── basic-usage.ts                - Simple generation example
│   │   ├── Engine initialization
│   │   ├── Context creation
│   │   ├── Schema generation
│   │   └── Result display
│   │
│   └── streaming-progress.ts        - Progress tracking example
│       ├── generateWithProgress()
│       ├── Progress callbacks
│       └── Metrics tracking
│
└── 📁 Build Output (dist/) - Generated
    ├── index.js                      - CommonJS build
    ├── index.mjs                     - ES Module build
    ├── index.d.ts                    - Type definitions
    └── *.map                         - Source maps
```

## File Statistics

| Category | Files | Lines |
|----------|-------|-------|
| Source Code (src/) | 11 | 2,578 |
| - Core Engine | 1 | 450 |
| - Types | 1 | 320 |
| - Prompts | 1 | 240 |
| - Validation | 1 | 480 |
| - Context | 1 | 380 |
| - Streaming | 1 | 280 |
| - Providers | 4 | 348 |
| - Index | 1 | 80 |
| Tests | 1 | 180 |
| Examples | 2 | 120 |
| Documentation | 4 | ~500 |
| **Total** | **18** | **~3,378** |

## Key File Purposes

### Core Files

**types.ts**
- Central type definitions for entire package
- Ensures type safety across all modules
- Exported through index.ts for consumers

**engine.ts**
- Main EpochEngine class
- Orchestrates generation workflow
- Handles streaming, retries, caching
- Error recovery implementation

**prompts.ts**
- System prompts from EPOCH_IMPL.md
- Context-aware prompt building
- Recovery prompts for retries
- User message formatting

### Provider Files

**providers/anthropic.ts**
- Claude API integration
- Streaming response handling
- Token estimation

**providers/openai.ts**
- OpenAI GPT API integration
- Chat completions streaming
- Model validation

**providers/ollama.ts**
- Local Ollama integration
- Free, offline generation
- Custom model support

**providers/index.ts**
- Provider factory pattern
- Automatic provider selection
- Scoring algorithm

### Utility Files

**validation.ts**
- 8-stage validation pipeline
- Component type checking
- Props validation
- Security validation
- Accessibility validation

**context.ts**
- Context initialization
- Component registry (15 components)
- Token registry (5 categories)
- Budget management

**streaming.ts**
- JSON Patch parsing
- Patch application
- Stream buffering
- Conflict detection

### Configuration Files

**package.json**
- Dependencies management
- Build scripts
- Package metadata

**tsconfig.json**
- TypeScript strict mode
- ES2022 target
- Module resolution

## Import Paths

```typescript
// Main exports
import { EpochEngine, createContext } from '@punk/synthpunk'

// Types
import type { SchemaPatch, EpochContext } from '@punk/synthpunk'

// Providers
import { AnthropicProvider, OpenAIProvider } from '@punk/synthpunk'

// Utilities
import { validatePatch, applyPatch } from '@punk/synthpunk'

// Prompts
import { SYSTEM_PROMPT } from '@punk/synthpunk'
```

## Build Process

1. **TypeScript Compilation** (`tsc`)
   - Types → `dist/*.d.ts`
   - Source maps → `dist/*.map`

2. **Bundle Creation** (`tsup`)
   - CommonJS → `dist/index.js`
   - ES Module → `dist/index.mjs`

3. **Testing** (`vitest`)
   - Unit tests → `src/__tests__/*.test.ts`
   - Coverage reports

## Development Workflow

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Type checking
npm run type-check

# Run tests
npm test

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

---

**Package**: @punk/synthpunk v1.0.0
**Total Files**: 18
**Total Code**: ~2,578 lines
**Status**: Production Ready ✅
