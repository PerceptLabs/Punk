# PUNK CLI Specification

A beautiful, fast TUI for the Punk framework built with Go and Charm Bracelet tools.

## Overview

Punk CLI is a command-line interface that provides an interactive, visual experience for creating and managing Punk projects. It uses modern TUI components for a sleek, responsive developer experience inspired by cyberpunk aesthetics.

---

## Core Commands

### `punk create`

Interactive wizard for scaffold new Punk projects with guided selections.

**Flow:**
1. Project name input
2. Tier selection (single choice)
3. Backend selection (single choice)
4. Neon integration (yes/no)
5. Skills selection (multi-select)
6. Git initialization (yes/no)
7. Project generation and folder creation

**TUI Mockup:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ✨ PUNK CLI - Create New Project                               │
│                                                                  │
│  Project Name: [my-awesome-app________________]                 │
│                                                                  │
│  Select Tier:                                                   │
│  ❯ Punk          (Full-stack modern web apps)                  │
│    Synthpunk     (Backend-focused APIs)                        │
│    Atompunk      (Lightweight edge functions)                  │
│                                                                  │
│  Press ↓↑ to navigate, Enter to select, q to quit              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time validation (project name uniqueness, reserved words)
- Help text for each selection
- Previous/Next navigation
- Preview of selections before confirmation

---

### `punk dev`

Multi-pane TUI dashboard showing logs and status of running services.

**TUI Mockup:**

```
┌──────────────────────────────────────────────────────────────────┐
│ PUNK DEV - my-awesome-app                          [1] [2] [3]  │
├─────────────────────────────┬─────────────────────────────────────┤
│ FRONTEND (Vite)             │ BACKEND (Encore)                    │
├─────────────────────────────┼─────────────────────────────────────┤
│ ✓ Server running at         │ ✓ API running on :4000              │
│   http://localhost:5173     │                                     │
│                             │ POST /auth/login (200ms)            │
│ 10:25:14 [HMR] connected    │ GET /users/:id (45ms)               │
│ 10:25:15 [vite] ✓ compiled  │                                     │
│ 10:25:16 [App.tsx] updated  │ 10:25:20 [DB] Connected             │
│                             │ 10:25:21 [Encore] Ready ✓           │
│                             │                                     │
│ ┌─────────────────────────────┬─────────────────────────────────┐ │
│ │ 1:vite  2:encore  3:db      │ h=help  r=restart  q=quit      │ │
│ └─────────────────────────────┴─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Three-pane layout: Frontend | Backend | Services
- Real-time log streaming with timestamps
- Status indicators (✓/✗/◐)
- Tab navigation (1, 2, 3 keys)
- Keyboard shortcuts:
  - `h` - show help overlay
  - `r` - restart selected service
  - `c` - clear current pane logs
  - `q` - quit
  - `1/2/3` - switch between panes
- Syntax highlighting for log levels (error, warn, info, debug)
- Auto-scroll with manual scroll capability

---

### `punk add`

Add components or skills to existing project.

**Usage:**
```bash
punk add [component|skill]
```

**Interactive Selection:**
- List available components/skills with descriptions
- Filter/search by name
- Show dependencies
- Confirm before adding

---

### `punk check`

Validate project configuration and schemas.

**Checks:**
- Project structure validity
- `punk.config.ts` schema validation
- Skill compatibility
- Backend configuration
- Database connection (if Neon enabled)
- Environment variables

**Output:**
```
┌──────────────────────────────────────────────────┐
│ PUNK CHECK - Validating project...               │
│                                                  │
│ ✓ Project structure valid                        │
│ ✓ Config schema valid                            │
│ ⚠ Missing NEON_DATABASE_URL in .env              │
│ ✓ Skills compatible                              │
│ ✗ Backend port 4000 already in use               │
│                                                  │
│ Result: 1 warning, 1 error                       │
└──────────────────────────────────────────────────┘
```

---

### `punk build`

Production build with progress visualization.

**Features:**
- Multi-stage progress bar
- Real-time build logs
- Optimization summary
- Output size analysis

---

## Color Scheme

### Punk Aesthetic Palette

```
Primary Colors:
  Neon Pink:      #FF006E / #ff006e
  Neon Purple:    #8338EC / #8338ec
  Neon Cyan:      #00D9FF / #00d9ff
  Neon Green:     #00FF41 / #00ff41

Neutrals:
  Dark BG:        #0A0A0A / #0a0a0a (near black)
  Light Gray:     #E0E0E0 / #e0e0e0
  Medium Gray:    #666666 / #666666

Semantic:
  Success:        #00FF41 (neon green)
  Warning:        #FFB700 (neon orange)
  Error:          #FF006E (neon pink)
  Info:           #00D9FF (neon cyan)
```

### Usage in Components

- **Borders**: Neon Pink / Neon Cyan (alternating)
- **Active Elements**: Neon Green
- **Focus Indicators**: Neon Purple with underline
- **Progress Bars**: Gradient Cyan → Pink
- **Text**: Light Gray on dark background
- **Accents**: Neon Pink for icons and highlights

---

## Project Structure

```
punk-cli/
├── cmd/
│   └── punk/
│       └── main.go              # CLI entry point
├── internal/
│   ├── cli/
│   │   ├── create.go            # Create command logic
│   │   ├── dev.go               # Dev command logic
│   │   ├── add.go               # Add command logic
│   │   ├── check.go             # Check command logic
│   │   └── build.go             # Build command logic
│   ├── tui/
│   │   ├── screens.go           # Screen definitions
│   │   ├── models.go            # Bubble Tea models
│   │   ├── styles.go            # Lip Gloss styles
│   │   └── components.go        # Reusable TUI components
│   ├── templates/
│   │   ├── project.go           # Project template logic
│   │   ├── tier_punk.go         # Punk tier templates
│   │   ├── tier_synthpunk.go    # Synthpunk tier templates
│   │   └── tier_atompunk.go     # Atompunk tier templates
│   ├── config/
│   │   ├── parser.go            # Config parsing
│   │   └── validator.go         # Config validation
│   ├── backend/
│   │   ├── manifest.go
│   │   ├── trpc.go
│   │   ├── encore_ts.go
│   │   ├── encore.go
│   │   └── glyphcase.go         # Backend implementations
│   ├── logger/
│   │   └── logger.go            # Log streaming
│   └── utils/
│       ├── git.go               # Git operations
│       ├── ports.go             # Port availability checks
│       └── files.go             # File operations
├── pkg/
│   ├── styles/
│   │   └── theme.go             # Global theme/colors
│   └── icons/
│       └── icons.go             # Unicode icons
├── assets/
│   ├── templates/               # Project scaffold templates
│   │   ├── punk-base/
│   │   ├── synthpunk-base/
│   │   └── atompunk-base/
│   └── banners/                 # ASCII art
├── go.mod
├── go.sum
└── README.md
```

---

## Template System

### Template Resolution

Templates are resolved based on selections:

```
tier + backend + skills = final_template
```

**Template Structure:**
```
assets/templates/
├── punk-base/
│   ├── frontend/
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   └── package.json
│   ├── backend/
│   │   ├── [backend-specific-files]
│   │   └── .env.example
│   ├── punk.config.ts
│   └── .gitignore
├── skills/
│   ├── auth/
│   │   ├── auth.ts
│   │   └── integration.md
│   ├── ui/
│   └── ... (other skills)
└── .punk-meta.json          # Metadata for validation
```

### Generation Flow

1. **Load base template** for selected tier
2. **Apply backend template** overlays
3. **Inject skill files** and configuration patches
4. **Substitute variables** (project name, ports, etc.)
5. **Initialize git** if requested
6. **Output summary** with next steps

### Key Variables

- `{{PROJECT_NAME}}` - User-provided project name
- `{{BACKEND_TYPE}}` - Selected backend (encore, trpc, etc.)
- `{{NEON_ENABLED}}` - Boolean for Neon setup
- `{{PORT_FRONTEND}}` - Default 5173
- `{{PORT_BACKEND}}` - Default 4000

---

## Installation

### From Source

```bash
# Clone and build
git clone https://github.com/punk-framework/punk-cli.git
cd punk-cli
go build -o punk ./cmd/punk

# Install to PATH
go install ./cmd/punk@latest
```

### Homebrew (macOS/Linux)

```bash
brew tap punk-framework/cli
brew install punk
```

### Direct Download

Pre-built binaries available at: `github.com/punk-framework/releases`

### Verify Installation

```bash
punk --version
punk --help
```

---

## Dependencies

**Go Version:** 1.21+

**Key Libraries:**
- `github.com/charmbracelet/bubbletea` - TUI framework
- `github.com/charmbracelet/lipgloss` - Styling
- `github.com/charmbracelet/bubbles` - Components (list, spinner, progress, textarea)
- `github.com/charmbracelet/log` - Logging with colors
- `github.com/spf13/cobra` - CLI framework
- `github.com/tidwall/gjson` - JSON parsing

---

## Key Design Decisions

### TUI Over Web UI
- **Rationale**: Faster, no browser overhead, works over SSH, native OS integration
- **Trade-off**: Limited visual complexity, text-based navigation

### Bubble Tea + Lip Gloss
- **Rationale**: Mature Charm projects with excellent Go integration
- **Trade-off**: Learning curve for component composition

### Multi-pane Dev Dashboard
- **Rationale**: See all logs simultaneously without context switching
- **Trade-off**: Requires terminal width ≥ 120 characters

### Interactive Create Wizard
- **Rationale**: Guides users through safe defaults while allowing customization
- **Trade-off**: Can't script easily (mitigation: `--non-interactive` flag with JSON config)

---

## Future Enhancements

- Deploy command with cloud provider integration
- Interactive debugger with breakpoints
- Real-time error overlays in dev mode
- Plugin system for custom skills
- Terminal theme customization
- Dark/light mode auto-detection

---

## Version

**Current:** 1.0.0
**Status:** Specification Phase
**Last Updated:** 2025-11-19
