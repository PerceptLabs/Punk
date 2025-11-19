# Mohawk - AI-Powered Web Application Builder

Mohawk is an AI-powered web application builder that delivers a seamless chat-to-deployment experience. Users prompt Claude for app schemas, preview updates in real-time, and deploy with one click.

## Features

- **AI-Powered Chat Interface**: Describe your app and watch Claude build it in real-time
- **Live Preview**: See your application update instantly as schemas stream in via Server-Sent Events
- **Schema Inspector**: View and edit generated schemas with JSON and code views
- **Responsive Design**: Preview your app on mobile, tablet, and desktop viewports
- **Database Persistence**: Save projects, revisions, and conversations using GlyphCase
- **One-Click Deployment**: Deploy to Vercel, Cloudflare, or export as static files (coming soon)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude via Epoch Engine (@punk/synthpunk)
- **Database**: SQLite via GlyphCase (@punk/glyphcase)
- **UI Components**: Punk Framework (@punk/components, @punk/tokens)
- **Rendering**: PunkRenderer (@punk/core)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository and navigate to the Mohawk directory:

```bash
cd /home/user/Punk/apps/mohawk
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Create a `.env.local` file with your Anthropic API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

4. Start the development server:

```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
apps/mohawk/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with PunkThemeProvider
│   │   ├── page.tsx             # Home page
│   │   ├── builder/
│   │   │   └── page.tsx         # Main builder interface
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts     # SSE streaming API endpoint
│   ├── components/
│   │   ├── chat-panel.tsx       # Chat interface with streaming
│   │   ├── preview-panel.tsx    # Live preview with viewport toggle
│   │   └── schema-inspector.tsx # Schema viewer and editor
│   └── lib/
│       └── db.ts                # GlyphCase database configuration
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Usage

### Building an App

1. Navigate to the Builder page by clicking "Create New App" on the home page
2. In the chat panel, describe what you want to build (e.g., "Create a dashboard with cards and charts")
3. Watch as Claude generates the schema in real-time
4. See the live preview update as the schema streams in
5. Inspect the generated schema in the Schema Inspector
6. Export or deploy your app (deployment features coming soon)

### Example Prompts

- "Create a dashboard with cards and charts"
- "Build a login form with validation"
- "Make a product catalog with filters"
- "Design a user profile page"

## AI Streaming Architecture

Mohawk uses **Server-Sent Events (SSE)** for real-time schema streaming:

```
User Prompt → API Endpoint → Epoch Engine → Claude AI
                  ↓
            SSE Stream (schema chunks)
                  ↓
         Frontend Updates Preview
```

### Streaming Flow

1. User sends a prompt from the chat panel
2. API endpoint (`/api/generate`) receives the request
3. Epoch Engine initiates streaming with Claude
4. Schema chunks are sent via SSE as they're generated
5. Frontend applies patches and updates the preview in real-time
6. Final schema is saved to the database

### Event Types

- `schema_chunk`: Incremental schema updates
- `message_chunk`: AI assistant message text
- `schema_complete`: Final complete schema
- `error`: Error messages

## Database Schema

Mohawk uses GlyphCase to manage an SQLite database with the following tables:

- **projects**: Store app projects with schemas
- **revisions**: Version history of schema changes
- **conversations**: Chat message history
- **deployments**: Deployment records and status

## Environment Variables

See `.env.example` for all available configuration options.

Required:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

Optional:
- `DATABASE_PATH`: Path to SQLite database (default: `./data/mohawk.db`)
- `NEXT_PUBLIC_APP_URL`: Application URL

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Production

```bash
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `ANTHROPIC_API_KEY` to environment variables
4. Deploy

### Docker (Self-Hosted)

Coming soon - see [MOHAWK_SPEC.md](/home/user/Punk/MOHAWK_SPEC.md) for Docker configuration.

## Contributing

Mohawk is part of the Punk Framework monorepo. See the main repository README for contribution guidelines.

## License

Part of the Punk Framework project.

## Links

- [Mohawk Specification](/home/user/Punk/MOHAWK_SPEC.md)
- [Punk Framework Documentation](../../README.md)
- [Anthropic Claude](https://www.anthropic.com/claude)
