# Punk Framework - Loadout System Implementation Plan

**Status:** Ready for implementation
**Created:** 2025-11-19
**Context:** Continuation from LogTape integration session

---

## 🎯 What We're Building

A **loadout system** for Punk Framework - curated collections of pre-wrapped React component libraries that work via JSON schemas (like Puck).

### Key Principles:
- **Loadouts = npm packages** bundling component wrappers
- **NOT rendering engines** - just convenience collections
- **Renderer-agnostic** - works in DOM/GPU/XR modes
- **Easy extension** - clear pattern for custom components

---

## 📦 Architecture Overview

```
@punk/core (existing)
  ├── ComponentRegistry - maps type → component
  └── PunkRenderer - renders schemas

@punk/extended (NEW meta-package)
  ├── @punk/component-chart
  ├── @punk/component-table
  ├── @punk/component-richtext
  ├── @punk/component-code
  ├── @punk/component-mermaid
  ├── @punk/component-filedrop
  ├── @punk/component-date
  └── @punk/component-command

Each wrapper exports:
  1. Zod schema (for SynthPunk AI)
  2. Component metadata (for Mohawk UI)
  3. React component (renderer-agnostic)
```

---

## 🔧 Component Wrapper Pattern

Every wrapper follows this canonical structure:

```typescript
// packages/component-{name}/src/index.tsx
import { z } from 'zod'
import { registerComponent } from '@punk/core'

// 1. Zod Schema (for SynthPunk)
export const {Name}PropsSchema = z.object({
  // props definition
})

export const {Name}SchemaMap = {
  {Name}: {Name}PropsSchema
}

// 2. Metadata (for Mohawk)
export const {Name}Meta = {
  displayName: 'Name',
  description: 'Description',
  icon: 'icon-name', // Lucide icon
  category: 'Category',
  tags: ['tag1', 'tag2'],
  complexity: 'simple' // simple | medium | advanced
}

// 3. Component (renderer-agnostic)
export function {Name}({ ...props }: z.infer<typeof {Name}PropsSchema>) {
  const data = useData(props.data) // DataContext hook
  return <ActualLibrary {...props} data={data} />
}

// Auto-register on import
registerComponent('{Name}', {Name}, {
  schema: {Name}PropsSchema,
  meta: {Name}Meta
})
```

---

## 📋 Implementation Tasks

### Phase 1: Core Infrastructure
- [ ] **Task 1.1:** Update `@punk/core/src/registry.ts`
  - Add support for component metadata storage
  - Extend `registerComponent()` to accept `{ schema, meta }`
  - Create `ComponentRegistry.getMeta(type)` method

- [ ] **Task 1.2:** Create component metadata types
  - File: `@punk/core/src/types.ts`
  - Add `ComponentMeta` interface
  - Add `ComponentRegistration` interface

### Phase 2: Component Wrappers (Can Parallelize)

#### 2.1: Chart Component
- [ ] **Create:** `packages/component-chart/`
- [ ] **Files:**
  - `package.json` - Dependencies: `react-chartjs-2`, `chart.js`, `zod`
  - `tsconfig.json` - Extends root config
  - `src/index.tsx` - Chart wrapper with ChartPropsSchema, ChartMeta
  - `README.md` - Usage examples
- [ ] **Schema:** `{ type: enum, data: string, options: object, height: number, width: number }`
- [ ] **Meta:** Category: "Data Visualization", Icon: "bar-chart-2"

#### 2.2: Table Component
- [ ] **Create:** `packages/component-table/`
- [ ] **Files:** Same structure as Chart
- [ ] **Dependencies:** `@tanstack/react-table`, `zod`
- [ ] **Schema:** `{ data: string, columns: array, pagination: boolean, sorting: boolean }`
- [ ] **Meta:** Category: "Data Visualization", Icon: "table"

#### 2.3: RichText Component
- [ ] **Create:** `packages/component-richtext/`
- [ ] **Dependencies:** `lexical`, `@lexical/react`, `zod`
- [ ] **Schema:** `{ content: string, editable: boolean, placeholder: string }`
- [ ] **Meta:** Category: "Content", Icon: "file-text"

#### 2.4: Code Component
- [ ] **Create:** `packages/component-code/`
- [ ] **Dependencies:** `@uiw/react-codemirror`, `zod`
- [ ] **Schema:** `{ code: string, language: enum, theme: string, readOnly: boolean }`
- [ ] **Meta:** Category: "Content", Icon: "code"

#### 2.5: Mermaid Component
- [ ] **Create:** `packages/component-mermaid/`
- [ ] **Dependencies:** `mermaid`, `zod`
- [ ] **Schema:** `{ diagram: string, theme: string }`
- [ ] **Meta:** Category: "Data Visualization", Icon: "git-graph"

#### 2.6: FileDrop Component
- [ ] **Create:** `packages/component-filedrop/`
- [ ] **Dependencies:** `react-dropzone`, `zod`
- [ ] **Schema:** `{ accept: string, maxFiles: number, maxSize: number }`
- [ ] **Meta:** Category: "Input", Icon: "upload"

#### 2.7: DatePicker Component
- [ ] **Create:** `packages/component-date/`
- [ ] **Dependencies:** `react-day-picker`, `zod`
- [ ] **Schema:** `{ value: string, mode: enum, disabled: array }`
- [ ] **Meta:** Category: "Input", Icon: "calendar"

#### 2.8: Command Component
- [ ] **Create:** `packages/component-command/`
- [ ] **Dependencies:** `cmdk`, `zod`
- [ ] **Schema:** `{ placeholder: string, items: array }`
- [ ] **Meta:** Category: "Navigation", Icon: "terminal"

### Phase 3: Meta-Package
- [ ] **Task 3.1:** Create `packages/extended/package.json`
  - Add all 8 component wrappers as dependencies
  - Version: `^1.0.0`

- [ ] **Task 3.2:** Create `packages/extended/src/index.ts`
  - Re-export all component wrappers
  - Export preset configurations:
    ```typescript
    export const DashboardPreset = {
      name: 'Dashboard',
      description: 'Charts, tables, data visualization',
      components: ['Chart', 'Table', 'Mermaid', 'DateRange']
    }

    export const ChatPreset = {
      name: 'Chat',
      description: 'Rich text, code, file uploads',
      components: ['RichText', 'Code', 'FileDrop', 'Command']
    }
    ```

- [ ] **Task 3.3:** Update root `pnpm-workspace.yaml`
  - Add all new component package paths

### Phase 4: SynthPunk Integration
- [ ] **Task 4.1:** Update `packages/synthpunk/src/context.ts`
  - Import schema maps from component wrappers
  - Update `buildComponentRegistry()` to use imported Zod schemas
  - Example:
    ```typescript
    import { ChartSchemaMap } from '@punk/component-chart'

    export function buildComponentRegistry() {
      return new Map([
        ['Chart', {
          type: 'Chart',
          label: 'Chart',
          props: ChartSchemaMap.Chart, // Zod schema
          // ...
        }]
      ])
    }
    ```

- [ ] **Task 4.2:** Export schema aggregation
  - File: `packages/extended/src/schemas.ts`
  - Aggregate all component schemas for easy import

### Phase 5: Mohawk Integration
- [ ] **Task 5.1:** Create `apps/mohawk/src/components/component-palette.tsx`
  - Use `useComponentRegistry()` hook
  - Display components grouped by `meta.category`
  - Show `meta.icon`, `meta.displayName`, `meta.description`
  - Add search/filter functionality

- [ ] **Task 5.2:** Create component categories UI
  - Tabs for: All, Layout, Data Visualization, Content, Input, Navigation
  - Filter components by `meta.category`

- [ ] **Task 5.3:** Update Mohawk canvas drag-drop
  - Use `meta.icon` for component buttons
  - Use `meta.complexity` for beginner/advanced filtering

### Phase 6: Examples
- [ ] **Task 6.1:** Create `examples/loadout-dashboard/`
  - Show `@punk/extended` usage
  - Demonstrate Chart + Table + Mermaid
  - Include README with installation instructions

- [ ] **Task 6.2:** Create `examples/custom-component/`
  - Show how to create a custom wrapper (e.g., Kanban board)
  - Follow the canonical pattern
  - Document the extension process

### Phase 7: Documentation
- [ ] **Task 7.1:** Write `packages/extended/README.md`
  - Installation instructions
  - Available components list
  - Preset configurations
  - Extension guide

- [ ] **Task 7.2:** Create individual component READMEs
  - Usage examples with JSON schemas
  - Props documentation
  - Integration with DataContext/ActionBus

- [ ] **Task 7.3:** Update main `README.md`
  - Add loadout system overview
  - Link to component documentation

---

## 🚀 Agent Execution Plan

### Parallel Execution Strategy:

**Round 1: Core (Sequential)**
1. **Core Agent** - Tasks 1.1, 1.2

**Round 2: Wrappers (3 Agents in Parallel)**
1. **Wrapper Agent 1** - Chart, Table, Mermaid
2. **Wrapper Agent 2** - RichText, Code, FileDrop
3. **Wrapper Agent 3** - DatePicker, Command

**Round 3: Integration (Sequential)**
1. **Meta Agent** - Task 3.1, 3.2, 3.3
2. **SynthPunk Agent** - Task 4.1, 4.2
3. **Mohawk Agent** - Task 5.1, 5.2, 5.3

**Round 4: Examples (2 Agents in Parallel)**
1. **Example Agent 1** - Task 6.1
2. **Example Agent 2** - Task 6.2

**Round 5: Docs (Sequential)**
1. **Docs Agent** - Task 7.1, 7.2, 7.3

---

## 📝 Code Templates

### Component Package.json Template
```json
{
  "name": "@punk/component-{name}",
  "version": "1.0.0",
  "description": "Punk wrapper for {Library}",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.tsx --format cjs,esm --dts",
    "dev": "tsup src/index.tsx --format cjs,esm --dts --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@punk/core": "workspace:*",
    "{library}": "^x.x.x",
    "zod": "^3.22.4"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

### Component tsconfig.json Template
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## ✅ Success Criteria

1. ✅ All 8 component wrappers build successfully
2. ✅ `@punk/extended` meta-package installs all wrappers
3. ✅ Components auto-register on import
4. ✅ SynthPunk AI uses Zod schemas for generation
5. ✅ Mohawk UI displays components with metadata
6. ✅ Example apps demonstrate usage
7. ✅ Documentation is complete and clear
8. ✅ Pattern is obvious for custom component extension

---

## 🔄 How to Continue This Work

**In a new Claude Code session:**

1. Say: **"Continue implementing LOADOUT_IMPLEMENTATION_PLAN.md"**
2. Claude will read this file + the todo list
3. Execution will begin following the agent plan above

**Current Status:**
- ✅ LogTape integration complete (committed: d97a454)
- ✅ Architecture finalized (documented in this plan)
- ⏳ Implementation ready to begin

---

## 📚 References

- **Puck Component Pattern:** https://github.com/measuredco/puck
- **Zod Documentation:** https://zod.dev
- **Current Punk Packages:** See `/packages/*` in this repo
- **Previous Discussion:** See git log and commit d97a454

---

## 🎯 Final Architecture Diagram

```
User App
  ↓ imports
@punk/extended
  ↓ bundles
[Chart, Table, RichText, Code, Mermaid, FileDrop, Date, Command]
  ↓ each auto-registers via
@punk/core ComponentRegistry
  ↓ used by
Mohawk (visual picker) + SynthPunk (AI generation) + PunkRenderer (schema→React)
```

---

**End of Implementation Plan**
