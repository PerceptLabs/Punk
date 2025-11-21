# Mohawk Guide

Complete guide to using the Mohawk - the visual AI-powered application builder.

---

## Table of Contents

1. [What is Mohawk?](#what-is-atompunk-builder)
2. [Getting Started](#getting-started)
3. [Interface Overview](#interface-overview)
4. [Building Your First App](#building-your-first-app)
5. [Using the Chat Interface](#using-the-chat-interface)
6. [Live Preview](#live-preview)
7. [Code Panel](#code-panel)
8. [Revision History](#revision-history)
9. [Deploying Your App](#deploying-your-app)
10. [Advanced Features](#advanced-features)

---

## What is Mohawk?

**Mohawk** is a web-based application similar to Bolt.new or Lovable.dev, but with the safety and reliability of Punk's schema-based approach.

### Key Features

- 🤖 **AI-Powered** - Chat with Claude to build applications
- 👁️ **Live Preview** - See changes in real-time
- 📝 **Full Code Access** - View and edit generated code
- 🔄 **Revision History** - Track all changes
- 🚀 **One-Click Deploy** - Deploy to production instantly
- 🔒 **Guaranteed Safe** - Schema validation prevents bugs

### vs Traditional AI Builders

| Feature | Atompunk | Bolt.new | Lovable |
|---------|----------|----------|---------|
| **Safety** | Validated schemas | Raw code | Raw code |
| **Accessibility** | Built-in WCAG AA | Manual | Manual |
| **Backend** | 6 options | Limited | Supabase only |
| **Determinism** | Guaranteed | No | No |
| **Self-Hosting** | ✅ | ❌ | ❌ |
| **Price** | $99/mo | $20-40/mo | $200+/mo |

---

## Getting Started

### Option 1: SaaS (Recommended)

Visit [app.punk.dev](https://app.punk.dev) and sign up:

```
1. Create account (GitHub or email)
2. Verify email
3. Choose plan (Free trial available)
4. Start building!
```

### Option 2: Self-Hosted (Docker)

```bash
# Clone the repository
git clone https://github.com/punk-framework/atompunk-web
cd atompunk-web

# Configure environment
cp .env.example .env
# Edit .env with your settings:
# - ANTHROPIC_API_KEY
# - DATABASE_URL
# - AUTH_SECRET

# Start with Docker Compose
docker-compose up -d

# Visit http://localhost:3000
```

### Option 3: Self-Hosted (Manual)

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start backend
cd backend
pnpm dev

# Start frontend (new terminal)
cd frontend
pnpm dev

# Visit http://localhost:3000
```

---

## Interface Overview

```
┌────────────────────────────────────────────────────────────────┐
│ Mohawk            [New Project] [Deploy] [Settings]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────────────┬───────────────────────────────────┐  │
│ │  Chat Panel          │  Live Preview Panel              │  │
│ │  (Left)              │  (Right)                          │  │
│ ├──────────────────────┼───────────────────────────────────┤  │
│ │  Code Panel          │  Revision History Panel          │  │
│ │  (Bottom Left)       │  (Bottom Right)                   │  │
│ └──────────────────────┴───────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Top Bar

- **Project Name** - Click to rename
- **New Project** - Start fresh
- **Deploy** - Deploy to production
- **Settings** - Project configuration

### Chat Panel (Top Left)

- Type natural language requests
- See AI responses and progress
- View generation status

### Live Preview (Top Right)

- Real-time preview of your app
- Fully interactive
- Mobile/tablet/desktop views

### Code Panel (Bottom Left)

- View generated code
- Edit directly (changes sync)
- File tree navigation

### Revision History (Bottom Right)

- All generations tracked
- Compare versions
- Restore previous versions

---

## Building Your First App

### 1. Create a New Project

Click **New Project**:

```
Project Name: my-todo-app
Backend: Encore.ts
Database: PostgreSQL (Neon)
Mods: (none for now)
```

### 2. Describe What You Want

In the chat panel, type:

```
Build a todo app with the following features:
- Add new tasks with title and description
- Mark tasks as complete/incomplete
- Delete tasks
- Filter: All, Active, Completed
- Clean, modern design with Tailwind
```

### 3. Watch AI Generate

Claude will:
1. Analyze your request
2. Generate a schema
3. Validate it
4. Render the UI
5. Show progress

```
🤖 Claude:
I'll create a todo app for you with:
• Add task form
• Task list with checkboxes
• Delete buttons
• Filter tabs

Generating schema... ████████░░ 80%
```

### 4. See Live Preview

The right panel updates in real-time showing your todo app.

### 5. Test Interactivity

Try the app:
- Add a task
- Mark it complete
- Delete it
- Switch filters

Everything works because handlers are connected!

---

## Using the Chat Interface

### Effective Prompts

**✅ Good Prompts:**
```
"Add user authentication with email and password"
"Create a product card with image, title, price, and buy button"
"Build a dashboard with stats cards and a chart"
"Make the header sticky and add a dark mode toggle"
```

**❌ Vague Prompts:**
```
"Make it better"
"Add some stuff"
"Fix the design"
```

### Iteration

Continue chatting to refine:

```
You: Add a search bar to filter tasks

🤖 Claude: I'll add a search input that filters tasks by title.

You: Can you add a due date field to each task?

🤖 Claude: Adding date picker to task form and displaying due dates.

You: Make completed tasks have a strikethrough

🤖 Claude: Applying strikethrough style to completed task titles.
```

### Context Awareness

Claude remembers:
- What you've built so far
- Your chosen backend
- Your design preferences
- Previous iterations

### Undo/Redo

- Type "undo that" to revert last change
- Or use Revision History panel

---

## Live Preview

### Interactive Preview

The preview is **fully functional**:
- Forms submit
- Buttons click
- Navigation works
- State persists

### View Modes

Switch between:
- **Desktop** (default)
- **Tablet** (768px)
- **Mobile** (375px)

### Refresh

- Auto-refreshes on schema changes
- Manual refresh button available
- Preserves state when possible

### Console

Open DevTools to:
- See console logs
- Debug issues
- Inspect elements

---

## Code Panel

### File Tree

Navigate your project:

```
my-todo-app/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── schemas/
│   │   │   └── todo.json
│   │   └── components/
│   └── package.json
└── backend/
    └── services/
        └── tasks.ts
```

### Viewing Code

Click any file to view:
- **Schemas** - JSON definitions
- **React** - Generated components
- **Backend** - API endpoints
- **Types** - TypeScript definitions

### Editing Code

Make changes directly:
1. Click file
2. Edit code
3. Changes save automatically
4. Preview updates

### Syntax Highlighting

Full syntax highlighting for:
- TypeScript/JavaScript
- JSON
- CSS/SCSS
- SQL
- YAML

### Download Code

Export entire project:
```
[Download] → Downloads .zip with full codebase
```

---

## Revision History

### Viewing Revisions

Each generation creates a revision:

```
v5 (current) - Added due dates
v4 - Added search functionality
v3 - Improved design
v2 - Added delete functionality
v1 - Initial todo structure
```

### Comparing Revisions

Select two revisions to compare:
- **Side-by-side diff**
- Highlights changes
- Shows what was added/removed

### Restoring Revisions

Click any revision and **Restore**:
- Reverts to that version
- Creates new revision (doesn't delete history)
- All changes preserved

### Branching

Create a branch from any revision:
1. Select revision
2. Click "Branch"
3. Name your branch
4. Work independently

Useful for:
- Trying alternative designs
- A/B testing
- Experimental features

---

## Deploying Your App

### One-Click Deploy

Click **Deploy** button:

1. **Choose Platform:**
   - Encore Cloud (recommended for Encore backends)
   - Vercel (frontend)
   - Netlify (frontend)
   - AWS (full stack)
   - Custom (bring your own)

2. **Configure:**
   - Environment variables
   - Domain name
   - Region

3. **Deploy:**
   - Builds automatically
   - Deploys to production
   - Provides live URL

### Manual Deploy

Export code and deploy yourself:

```bash
# Download code
[Download] → my-todo-app.zip

# Extract and deploy
unzip my-todo-app.zip
cd my-todo-app

# Frontend
cd frontend
npm install
npm run build
# Deploy dist/ to Vercel/Netlify

# Backend
cd backend
npm install
npm run build
# Deploy to Encore Cloud/AWS/etc.
```

### Environment Variables

Set in deployment settings:
- `ANTHROPIC_API_KEY` (if using AI features)
- `DATABASE_URL` (database connection)
- `AUTH_SECRET` (authentication)
- Custom variables

### Custom Domains

Connect your domain:
1. Settings → Domains
2. Add domain
3. Update DNS records
4. SSL auto-configured

---

## Advanced Features

### Collaborative Editing

Invite team members:
- Real-time collaboration
- See who's editing
- Chat with teammates
- Comment on revisions

### Mods Integration

Add mods to extend functionality:

```
Settings → Mods → Add Mod
→ Search for "supabase-backend"
→ Install
→ AI can now use Supabase features
```

### API Integration

Connect external APIs:

```
You: Connect to the Stripe API for payments

🤖 Claude: I'll integrate Stripe. Please provide your API keys in Settings.
```

### Database Management

Visual database tools:
- View tables
- Run queries
- Create migrations
- Seed data

### Testing

Built-in testing:
- Run tests in browser
- See coverage
- Fix failing tests
- CI/CD integration

### Analytics

Track usage:
- Page views
- User interactions
- Performance metrics
- Error tracking

---

## Tips & Tricks

### Speed Up Generation

- Be specific in prompts
- Reference previous work ("use the same style as...")
- Use examples ("like Amazon's product card")

### Better Results

- Iterate in small steps
- Test after each change
- Use descriptive names
- Follow design systems

### Debugging

- Check browser console
- View backend logs
- Use revision history to find when bug was introduced
- Ask Claude to fix specific issues

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Focus chat |
| `Cmd+S` | Save file |
| `Cmd+/` | Toggle preview |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+D` | Deploy |

---

## Pricing

### Free Tier
- 3 projects
- 100 AI generations/month
- Community support
- Deploy to Punk hosting

### Pro ($99/mo)
- Unlimited projects
- Unlimited AI generations
- Priority support
- Deploy anywhere
- Team collaboration (5 seats)
- Custom domains

### Team ($299/mo)
- Everything in Pro
- 20 team seats
- Advanced analytics
- SSO/SAML
- SLA guarantee

### Enterprise
- Custom pricing
- Unlimited everything
- Dedicated support
- On-premise option
- Custom integrations
- Training included

---

## Getting Help

### Documentation
- [docs.punk.dev/builder](https://docs.punk.dev/builder)

### Support
- **Email:** support@punk.dev
- **Discord:** #builder channel
- **Live Chat:** In-app (Pro+)

### Feature Requests
- GitHub Discussions
- In-app feedback button

---

**Start building now at [app.punk.dev](https://app.punk.dev)** 🎸

[Back to README](README.md) • [Getting Started](GETTING_STARTED.md) • [CLI Reference](CLI_REFERENCE.md)
