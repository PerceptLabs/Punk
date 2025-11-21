package template

import (
	"embed"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

//go:embed templates/*
var templates embed.FS

type ProjectConfig struct {
	Name         string
	Tier         string
	Backend      string
	UseNeon      bool
	Mods       []string
	InitGit      bool
	PortFrontend int
	PortBackend  int
}

// GenerateProject creates a new Punk project with the given configuration
func GenerateProject(config ProjectConfig) error {
	// Set default ports if not specified
	if config.PortFrontend == 0 {
		config.PortFrontend = 5173
	}
	if config.PortBackend == 0 {
		config.PortBackend = 4000
	}

	// Create project directory
	projectPath := filepath.Join(".", config.Name)
	if err := os.MkdirAll(projectPath, 0755); err != nil {
		return fmt.Errorf("failed to create project directory: %w", err)
	}

	// Generate base structure
	if err := generateBaseStructure(projectPath, config); err != nil {
		return fmt.Errorf("failed to generate base structure: %w", err)
	}

	// Generate tier-specific files
	if err := generateTierFiles(projectPath, config); err != nil {
		return fmt.Errorf("failed to generate tier files: %w", err)
	}

	// Generate backend files
	if config.Backend != "none" {
		if err := generateBackendFiles(projectPath, config); err != nil {
			return fmt.Errorf("failed to generate backend files: %w", err)
		}
	}

	// Generate mod files
	if err := generateModFiles(projectPath, config); err != nil {
		return fmt.Errorf("failed to generate mod files: %w", err)
	}

	// Initialize git if requested
	if config.InitGit {
		if err := initializeGit(projectPath); err != nil {
			return fmt.Errorf("failed to initialize git: %w", err)
		}
	}

	return nil
}

func generateBaseStructure(projectPath string, config ProjectConfig) error {
	// Create base directories
	dirs := []string{
		"frontend/src",
		"backend",
		"shared",
		"mods",
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(filepath.Join(projectPath, dir), 0755); err != nil {
			return err
		}
	}

	// Generate punk.config.ts
	configContent := renderPunkConfig(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "punk.config.ts"),
		[]byte(configContent),
		0644,
	); err != nil {
		return err
	}

	// Generate .gitignore
	gitignoreContent := renderGitignore()
	if err := os.WriteFile(
		filepath.Join(projectPath, ".gitignore"),
		[]byte(gitignoreContent),
		0644,
	); err != nil {
		return err
	}

	// Generate README.md
	readmeContent := renderReadme(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "README.md"),
		[]byte(readmeContent),
		0644,
	); err != nil {
		return err
	}

	return nil
}

func generateTierFiles(projectPath string, config ProjectConfig) error {
	switch config.Tier {
	case "punk":
		return generatePunkTier(projectPath, config)
	case "synthpunk":
		return generateSynthpunkTier(projectPath, config)
	case "atompunk":
		return generateAtompunkTier(projectPath, config)
	}
	return nil
}

func generatePunkTier(projectPath string, config ProjectConfig) error {
	// Generate frontend package.json
	packageJSON := renderFrontendPackageJSON(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "frontend/package.json"),
		[]byte(packageJSON),
		0644,
	); err != nil {
		return err
	}

	// Generate vite.config.ts
	viteConfig := renderViteConfig(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "frontend/vite.config.ts"),
		[]byte(viteConfig),
		0644,
	); err != nil {
		return err
	}

	// Generate index.html
	indexHTML := renderIndexHTML(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "frontend/index.html"),
		[]byte(indexHTML),
		0644,
	); err != nil {
		return err
	}

	// Generate App.tsx
	appTsx := renderAppTsx(config)
	if err := os.WriteFile(
		filepath.Join(projectPath, "frontend/src/App.tsx"),
		[]byte(appTsx),
		0644,
	); err != nil {
		return err
	}

	return nil
}

func generateSynthpunkTier(projectPath string, config ProjectConfig) error {
	// Synthpunk is backend-focused, minimal frontend
	return generatePunkTier(projectPath, config)
}

func generateAtompunkTier(projectPath string, config ProjectConfig) error {
	// Atompunk is lightweight edge functions
	return nil
}

func generateBackendFiles(projectPath string, config ProjectConfig) error {
	switch config.Backend {
	case "encore":
		return generateEncoreBackend(projectPath, config)
	case "trpc":
		return generateTRPCBackend(projectPath, config)
	case "encore-ts":
		return generateEncoreTSBackend(projectPath, config)
	case "glyphcase":
		return generateGlyphCaseBackend(projectPath, config)
	}
	return nil
}

func generateEncoreBackend(projectPath string, config ProjectConfig) error {
	// Generate encore.app
	encoreApp := `module ` + config.Name + `

require (
    encore.dev v1.0.0
)
`
	return os.WriteFile(
		filepath.Join(projectPath, "backend/encore.app"),
		[]byte(encoreApp),
		0644,
	)
}

func generateTRPCBackend(projectPath string, config ProjectConfig) error {
	return nil
}

func generateEncoreTSBackend(projectPath string, config ProjectConfig) error {
	return nil
}

func generateGlyphCaseBackend(projectPath string, config ProjectConfig) error {
	return nil
}

func generateModFiles(projectPath string, config ProjectConfig) error {
	for _, mod := range config.Mods {
		modDir := filepath.Join(projectPath, "mods", mod)
		if err := os.MkdirAll(modDir, 0755); err != nil {
			return err
		}

		// Create mod placeholder
		modContent := fmt.Sprintf("// Mod: %s\n// TODO: Implement mod\n", mod)
		if err := os.WriteFile(
			filepath.Join(modDir, "index.ts"),
			[]byte(modContent),
			0644,
		); err != nil {
			return err
		}
	}
	return nil
}

func initializeGit(projectPath string) error {
	// TODO: Use git commands to initialize repository
	return nil
}

// Template rendering functions

func renderPunkConfig(config ProjectConfig) string {
	tmpl := `export default {
  name: "{{.Name}}",
  tier: "{{.Tier}}",
  backend: "{{.Backend}}",
  neon: {{.UseNeon}},
  mods: [{{range .Mods}}"{{.}}",{{end}}],
  ports: {
    frontend: {{.PortFrontend}},
    backend: {{.PortBackend}},
  },
};
`
	return executeTemplate(tmpl, config)
}

func renderGitignore() string {
	return `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.punk/cache
`
}

func renderReadme(config ProjectConfig) string {
	return fmt.Sprintf(`# %s

A Punk Framework project.

## Get Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
punk dev

# Build for production
punk build
\`\`\`

## Configuration

- **Tier:** %s
- **Backend:** %s
- **Mods:** %s

Built with ❤️ using Punk Framework
`, config.Name, config.Tier, config.Backend, strings.Join(config.Mods, ", "))
}

func renderFrontendPackageJSON(config ProjectConfig) string {
	return fmt.Sprintf(`{
  "name": "%s-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
`, config.Name)
}

func renderViteConfig(config ProjectConfig) string {
	return fmt.Sprintf(`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: %d,
  },
});
`, config.PortFrontend)
}

func renderIndexHTML(config ProjectConfig) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>%s</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`, config.Name)
}

func renderAppTsx(config ProjectConfig) string {
	return `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Welcome to Punk 🎸</h1>
      <p>Build Fast. Break Norms. Ship Code.</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
`
}

func executeTemplate(tmpl string, data interface{}) string {
	t := template.Must(template.New("").Parse(tmpl))
	var buf strings.Builder
	if err := t.Execute(&buf, data); err != nil {
		return ""
	}
	return buf.String()
}
