# Mohawk Specification

## Overview
A web-based AI application builder delivering a seamless chat-to-deployment experience. Users prompt Claude for app schemas, preview updates in real-time, and deploy with one click.

**Core Flow:** Chat → AI Stream Schemas → Live Preview → Deploy

---

## 1. UI Layout Architecture

### Main Interface (Split View)
```
┌─────────────────────────────────────────────────────────┐
│                    Header & Controls                     │
├──────────────────┬──────────────────────────────────────┤
│                  │                                        │
│   Chat Panel     │       Live Preview Panel               │
│  (Left: 35%)     │       (Right: 65%)                    │
│                  │                                        │
│  - Message list  │  - Component canvas                   │
│  - Input field   │  - Component tree (collapsible)       │
│  - Model select  │  - Props inspector                    │
│                  │  - Real-time feedback                 │
│                  │                                        │
├──────────────────┴──────────────────────────────────────┤
│  Schema Inspector | Deployment Panel | Settings         │
│  (Bottom Tabbed Interface)                               │
└─────────────────────────────────────────────────────────┘
```

### Component Regions

**Chat Panel (Left)**
- Conversation history with streaming messages
- User input field with prompt suggestions
- Model selector (Claude 3.5, etc.)
- Context/memory indicators
- Export chat as JSON

**Preview Panel (Right)**
- Live component rendering
- Schema visualization tree
- Props/state inspector with edit capability
- Responsive device preview (mobile/desktop toggle)
- Error boundary with recovery UI

**Bottom Tabs**
- **Schema Inspector:** Raw JSON schema, validation status, edit mode
- **Deployment:** Target selection, environment config, one-click deploy
- **Settings:** Theme, code generation options, mod plugins

---

## 2. Tech Stack Recommendations

### Frontend Layer
- **Framework:** Next.js 15+ (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** Zustand (lightweight, composable)
- **Code Editor:** Monaco Editor with schema validation
- **Real-time Updates:** Use Server-Sent Events (SSE) client library

### Backend Layer
**Option A (SaaS):**
- **Runtime:** Node.js 22+ (Express/Hono)
- **Database:** PostgreSQL with Drizzle ORM
- **Cache:** Redis for session/schema cache
- **Job Queue:** Bull/Bullmq for async deployments

**Option B (Docker Self-Hosted):**
- **Runtime:** Go (Fiber framework) for efficiency
- **Database:** SQLite with WAL mode
- **Embedded LLM:** Optional Ollama container

### AI Integration
- **LLM:** Anthropic Claude via Epoch engine
- **Streaming:** Server-Sent Events (SSE) for schema streaming
- **Context:** System prompt + conversation history management
- **Tokens:** Implement token counting with `js-tiktoken`

### Additional Services
- **Authentication:** NextAuth.js or Auth0
- **Deployment Adapter:** Vercel SDK, Cloudflare Workers API
- **Monitoring:** OpenTelemetry for streaming performance
- **Schema Validation:** Zod + JSON Schema standard

---

## 3. AI Integration Flow

### Schema Streaming via Epoch

```
User Prompt
    ↓
[Backend] Epoch Client
    ↓
Initiate streaming to /api/stream-schema
    ↓
[Claude] Generate schema incrementally
    ↓
[Server] Validate JSON chunks, buffer partial schemas
    ↓
[SSE] Stream event: { type: 'schema_chunk', data: {...} }
    ↓
[Frontend] Update Preview in real-time
    ↓
On complete: type: 'schema_complete'
```

### Validation Pipeline
1. **Schema Validation:** JSON schema validation on each chunk
2. **Component Validation:** Verify referenced components exist
3. **Props Validation:** Type-check against component signatures
4. **Dependency Resolution:** Load required mods/plugins
5. **Error Recovery:** Present validation errors with AI suggestions

### Error Recovery Strategy
- Partial schema rendering with error overlay
- Offer AI-assisted fixes ("Fix this error")
- Fallback to previous working schema on fatal errors
- Toast notifications for non-fatal warnings
- Retry button for failed streaming connections

### Context Management
- **Conversation Memory:** Store last 10 exchanges for context
- **Implicit Context:** Current schema, selected components, target platform
- **Explicit Context:** User-provided system instructions
- **Token Budget:** Track input tokens, warn at 90% capacity
- **Clear Context:** Button to reset conversation and schema

---

## 4. Docker Self-Hosted Deployment

### docker-compose.yml Structure
```yaml
version: '3.9'
services:
  app:
    build: ./app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=sqlite:///data/app.db
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - app_data:/app/data
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: atompunk
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

  # Optional: Local LLM fallback
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

volumes:
  app_data:
  db_data:
  ollama_data:
```

### Key Configuration
- **Volume Mounts:**
  - `/data` - SQLite/schema persistence
  - `.env.local` - Secrets management (not versioned)
  - `/exports` - Deployed app outputs

- **Network Mode:** Bridge (default) with explicit port mapping
- **Restart Policy:** `unless-stopped` for production
- **Health Checks:** `/health` endpoint with dependency probes

### Self-Hosted Considerations
- Postgres optional if using SQLite
- Ollama container for offline LLM fallback
- ANTHROPIC_API_KEY required for cloud Claude usage
- Ngrok/Cloudflare Tunnel support for public access

---

## 5. Deployment Targets

### Supported Platforms

| Target | Method | Features |
|--------|--------|----------|
| **Vercel** | Next.js native | Serverless, auto-scaling, preview URLs |
| **Cloudflare Pages** | Worker functions | Edge deployment, zero cold start |
| **Docker** | docker-compose | Self-hosted, full control |
| **Static** | HTML/CSS/JS export | GitHub Pages, Netlify, S3 |

### One-Click Deploy Flow

```
1. User clicks "Deploy"
2. System generates app bundle:
   - Export schema to component code
   - Generate CSS from Tailwind config
   - Create .env.example
3. Target selection modal opens
4. Auth verification (OAuth for Vercel/Cloudflare)
5. Create GitHub repo or direct upload
6. Deploy and stream logs to UI
7. Post-deploy: Show live URL + deployment stats
```

### Deployment Configuration
- **Environment Variables:** Auto-generated from schema context
- **Build Output:** Optimized production bundle
- **Preview:** Deploy to staging environment first
- **Rollback:** One-click revert to previous version

---

## 6. Mods Integration (Plugin System)

### GlyphCase-Based Architecture

**Mod Discovery:**
- Plugins register via mod manifest (JSON)
- Installed to `/plugins` directory
- Loaded at startup with dependency resolution

**Plugin Structure:**
```
plugins/
  ├── mod-ui-kit/
  │   ├── manifest.json (name, version, exports)
  │   ├── index.js (exports)
  │   └── components/
  │       ├── Button.tsx
  │       └── Card.tsx
  │
  └── mod-analytics/
      ├── manifest.json
      └── hooks.js
```

### Installation UI
- **Mod Browser:** Searchable registry with previews
- **One-Click Install:** Download + register automatically
- **Dependency Management:** Resolve transitive dependencies
- **Conflict Detection:** Warn on version mismatches
- **Enable/Disable Toggle:** Without uninstalling

### Configuration Panel
- **Per-Mod Settings:** API keys, theme options, etc.
- **Prompt Engineering:** Customize how mods are suggested to Claude
- **Usage Statistics:** Track which mods are used
- **Update Check:** Notify when updates available

### AI Prompt Injection
When streaming schemas, include available mods:
```
Available mods:
- @ui-kit/components (Button, Card, Modal, ...)
- @analytics/tracking (usePageView, useEvent, ...)
- @auth/oauth (LoginButton, ProtectedRoute, ...)

Use these in your schema generation. Reference as:
{ "component": "ui-kit:Button", "props": {...} }
```

---

## 7. Key Architecture Decisions

### Why Server-Sent Events?
- Simpler than WebSocket for unidirectional streaming
- Works through HTTP proxies and load balancers
- Native browser support, no additional libraries needed
- Better suited for long-running schema generation

### Why Zod + JSON Schema?
- Zod provides runtime validation for frontend
- JSON Schema standard for spec portability
- Shared validation rules between frontend/backend
- Type-safe TypeScript integration

### Why Zustand over Redux?
- Minimal boilerplate
- Direct store mutations (no actions/reducers)
- Built-in immer support for immutability
- Smaller bundle size (~2KB)

### Streaming vs Batch Generation?
- **Streaming:** Shows progress, feels more responsive
- **Batch:** Simpler to implement, easier to validate atomically
- **Recommendation:** Hybrid - stream to frontend, validate at end

---

## 8. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React + Next.js)                                   │
│ ┌──────────────┐    ┌──────────────────────────────────────┐
│ │ Chat Panel   │    │ Live Preview                         │
│ │              │    │ ┌──────────────────────────────────┐ │
│ │ User message │───→│ Component Canvas (Real-time)       │ │
│ │              │    │ └──────────────────────────────────┘ │
│ └──────────────┘    └──────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
        │
        │ POST /api/stream-schema + SSE listener
        │
┌─────────────────────────────────────────────────────────────┐
│ Backend (Node.js/Go)                                         │
│ ┌──────────────────────────────────────────────────────────┐
│ │ Stream Controller                                        │
│ │ - Manage Epoch streaming                               │
│ │ - Buffer schema chunks                                 │
│ │ - Validate incrementally                               │
│ └──────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
        │
        │ Anthropic API (Epoch)
        │
┌─────────────────────────────────────────────────────────────┐
│ Anthropic Claude (LLM)                                       │
│ - Generate component schemas                                │
│ - Understand context from history                           │
│ - Stream tokens in real-time                                │
└─────────────────────────────────────────────────────────────┘
        │
        │ Persistence
        │
┌─────────────────────────────────────────────────────────────┐
│ Database Layer                                               │
│ - SQLite (self-hosted) / Postgres (SaaS)                    │
│ - Conversation history                                       │
│ - Generated schemas                                          │
│ - Deployment records                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Priorities

### Phase 1 (MVP)
- Chat interface with Claude streaming
- Basic component preview
- Manual schema editing
- Deploy to Vercel

### Phase 2
- Auto-complete suggestions from mods
- Multi-device preview
- Environment configuration UI
- Docker self-hosted option

### Phase 3
- Real-time collaboration
- Version control integration
- Advanced error recovery
- Depot integration (Rigs & Mods)

---

## 10. Success Metrics

- **Time to First Deploy:** < 5 minutes from "Start"
- **Schema Streaming Latency:** First token in < 1 second
- **Preview Update:** < 200ms from schema change
- **Uptime:** 99.9% availability
- **User Retention:** 30-day return rate > 60%

---

## References

- [Anthropic Epoch Engine](https://docs.anthropic.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [JSON Schema Specification](https://json-schema.org/)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
