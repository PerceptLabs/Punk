# Punk CLI

A beautiful, fast TUI (Terminal User Interface) for the Punk Framework built with Go and Charm Bracelet tools.

## Overview

Punk CLI provides an interactive, visual experience for creating and managing Punk projects with stunning cyberpunk aesthetics and modern TUI components.

## Features

- **Interactive Project Wizard** - Create new projects with guided selections
- **Multi-pane Dev Server** - Real-time log streaming with beautiful layout
- **Progress Indicators** - Visual feedback for long-running operations
- **Punk Aesthetic** - Neon pink, purple, and cyan color scheme
- **Keyboard Shortcuts** - Fast navigation and actions
- **Beautiful UI** - Built with Charm Bracelet's Bubble Tea and Lip Gloss

## Commands

### `punk create`

Interactive wizard for creating new Punk projects.

```bash
punk create
```

Features:
- Project name input with validation
- Tier selection (Punk, Synthpunk, Atompunk)
- Backend selection (Encore, tRPC, GlyphCase, etc.)
- Neon database integration
- Skills selection (multi-select)
- Git initialization

### `punk dev`

Start development server with multi-pane TUI dashboard.

```bash
punk dev
```

Features:
- Three-pane layout (Frontend | Backend | Services)
- Real-time log streaming
- Service status monitoring
- Keyboard shortcuts (1/2/3 to switch panes)
- Help overlay (press 'h')

### `punk build`

Build project for production with progress visualization.

```bash
punk build
```

Features:
- Multi-stage progress bar
- Real-time build status
- Optimization summary

### `punk check`

Validate project configuration and setup.

```bash
punk check
```

Checks:
- Project structure validity
- Config schema validation
- Environment variables
- Port availability
- Skill compatibility

### `punk add`

Add components, backends, or skills to existing project.

```bash
punk add skill [name]    # Add a GlyphCase skill
punk add component       # Add a UI component
punk add backend         # Add or change backend
```

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/punk-framework/punk-cli.git
cd punk-cli

# Build
go build -o punk

# Install to PATH
go install
```

### Verify Installation

```bash
punk --version
punk --help
```

## Color Scheme

The Punk CLI uses a cyberpunk-inspired color palette:

- **Neon Pink** (#FF006E) - Primary highlights, titles
- **Neon Purple** (#8338EC) - Secondary elements, labels
- **Neon Cyan** (#00D9FF) - Active states, info
- **Neon Green** (#00FF41) - Success states, checkmarks
- **Dark Background** (#0A0A0A) - Near-black base
- **Light Gray** (#E0E0E0) - Primary text

## Architecture

```
apps/cli/
├── main.go              # Entry point
├── cmd/                 # Command implementations
│   ├── create.go        # Create command
│   ├── dev.go           # Dev server command
│   ├── build.go         # Build command
│   ├── check.go         # Validation command
│   └── add.go           # Add command
├── internal/
│   ├── styles/          # Lip Gloss styles
│   │   └── styles.go
│   ├── tui/             # Bubble Tea models
│   │   ├── wizard.go    # Create wizard
│   │   └── devserver.go # Dev server TUI
│   └── template/        # Project templates
│       └── generator.go
└── templates/           # Embedded templates
    ├── punk/
    ├── synthpunk/
    └── atompunk/
```

## Dependencies

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI framework
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) - Styling library
- [Bubbles](https://github.com/charmbracelet/bubbles) - TUI components
- [Cobra](https://github.com/spf13/cobra) - CLI framework

## Development

### Run Locally

```bash
go run main.go create
go run main.go dev
go run main.go build
```

### Build

```bash
go build -o punk
```

### Test

```bash
go test ./...
```

## Keyboard Shortcuts

### Create Wizard
- `↑↓` - Navigate options
- `Enter` - Select/confirm
- `Space` - Toggle (for multi-select)
- `q` - Quit

### Dev Server
- `1/2/3` - Switch between panes
- `h` - Toggle help
- `r` - Restart selected service
- `c` - Clear current pane
- `q` - Quit

### Skill Browser
- `↑↓` - Navigate skills
- `/` - Filter/search
- `Enter` - Install selected skill
- `q` - Quit

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Credits

Built with ❤️ using:
- Go 1.21+
- Charm Bracelet tools
- The awesome open source community

---

**Build Fast. Break Norms. Ship Code.** 🎸
