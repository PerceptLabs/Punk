package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/punk-framework/cli/internal/styles"
)

type WizardStep int

const (
	StepProjectName WizardStep = iota
	StepTier
	StepBackend
	StepNeon
	StepSkills
	StepGit
	StepConfirm
	StepGenerate
	StepComplete
)

type WizardModel struct {
	currentStep WizardStep
	projectName string
	tier        string
	backend     string
	useNeon     bool
	skills      []string
	initGit     bool
	cursor      int
	textInput   textinput.Model
	err         error
	width       int
	height      int
}

func NewWizard() WizardModel {
	ti := textinput.New()
	ti.Placeholder = "my-awesome-app"
	ti.Focus()
	ti.CharLimit = 50
	ti.Width = 40

	return WizardModel{
		currentStep: StepProjectName,
		textInput:   ti,
		tier:        "punk",
		backend:     "none",
		useNeon:     false,
		initGit:     true,
		skills:      []string{},
	}
}

func (m WizardModel) Init() tea.Cmd {
	return textinput.Blink
}

func (m WizardModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			if m.currentStep != StepProjectName || m.projectName != "" {
				return m, tea.Quit
			}

		case "enter":
			return m.handleEnter()

		case "up", "k":
			if m.currentStep != StepProjectName {
				if m.cursor > 0 {
					m.cursor--
				}
			}

		case "down", "j":
			if m.currentStep != StepProjectName {
				m.cursor++
			}

		case " ":
			// Space to toggle selections
			if m.currentStep == StepSkills {
				m.toggleSkill()
			}

		case "backspace":
			if m.currentStep == StepProjectName {
				var cmd tea.Cmd
				m.textInput, cmd = m.textInput.Update(msg)
				return m, cmd
			}
		}
	}

	// Update text input if on project name step
	if m.currentStep == StepProjectName {
		var cmd tea.Cmd
		m.textInput, cmd = m.textInput.Update(msg)
		return m, cmd
	}

	return m, nil
}

func (m WizardModel) handleEnter() (tea.Model, tea.Cmd) {
	switch m.currentStep {
	case StepProjectName:
		m.projectName = m.textInput.Value()
		if m.projectName != "" {
			m.currentStep = StepTier
			m.cursor = 0
		}

	case StepTier:
		tiers := []string{"punk", "synthpunk", "atompunk"}
		if m.cursor < len(tiers) {
			m.tier = tiers[m.cursor]
			m.currentStep = StepBackend
			m.cursor = 0
		}

	case StepBackend:
		backends := []string{"none", "encore", "trpc", "encore-ts", "glyphcase"}
		if m.cursor < len(backends) {
			m.backend = backends[m.cursor]
			m.currentStep = StepNeon
			m.cursor = 0
		}

	case StepNeon:
		m.useNeon = m.cursor == 0
		m.currentStep = StepSkills
		m.cursor = 0

	case StepSkills:
		m.currentStep = StepGit
		m.cursor = 1 // Default to "yes"

	case StepGit:
		m.initGit = m.cursor == 0
		m.currentStep = StepConfirm
		m.cursor = 0

	case StepConfirm:
		if m.cursor == 0 {
			m.currentStep = StepGenerate
			return m, m.generateProject()
		}
		return m, tea.Quit

	case StepComplete:
		return m, tea.Quit
	}

	return m, nil
}

func (m *WizardModel) toggleSkill() {
	availableSkills := []string{"auth", "ui", "db", "api", "storage"}
	if m.cursor < len(availableSkills) {
		skill := availableSkills[m.cursor]
		// Toggle skill in/out of selection
		found := false
		for i, s := range m.skills {
			if s == skill {
				m.skills = append(m.skills[:i], m.skills[i+1:]...)
				found = true
				break
			}
		}
		if !found {
			m.skills = append(m.skills, skill)
		}
	}
}

func (m WizardModel) generateProject() tea.Cmd {
	return func() tea.Msg {
		// TODO: Actually generate the project
		// For now, just simulate
		return projectGeneratedMsg{}
	}
}

type projectGeneratedMsg struct{}

func (m WizardModel) View() string {
	if m.width == 0 {
		return "Loading..."
	}

	var content string

	// Banner
	content += styles.StyledBanner() + "\n\n"

	switch m.currentStep {
	case StepProjectName:
		content += m.viewProjectName()
	case StepTier:
		content += m.viewTierSelection()
	case StepBackend:
		content += m.viewBackendSelection()
	case StepNeon:
		content += m.viewNeonSelection()
	case StepSkills:
		content += m.viewSkillsSelection()
	case StepGit:
		content += m.viewGitSelection()
	case StepConfirm:
		content += m.viewConfirmation()
	case StepGenerate:
		content += m.viewGenerating()
	case StepComplete:
		content += m.viewComplete()
	}

	// Footer with keyboard shortcuts
	footer := "\n\n" + styles.Footer.Render(
		styles.KeyboardHelp("↑↓", "navigate", "enter", "select", "q", "quit"),
	)

	return lipgloss.JoinVertical(lipgloss.Left, content, footer)
}

func (m WizardModel) viewProjectName() string {
	title := styles.Title.Render("✨ Create New Punk Project")
	subtitle := styles.Subtitle.Render("Let's build something awesome")

	label := styles.Label.Render("\nProject Name:")
	input := "\n" + m.textInput.View()

	help := "\n\n" + styles.Muted.Render("Enter a name for your project (lowercase, hyphens allowed)")

	return title + "\n" + subtitle + "\n" + label + input + help
}

func (m WizardModel) viewTierSelection() string {
	title := styles.Title.Render("Select Tier")

	tiers := []struct {
		name string
		desc string
	}{
		{"punk", "Full-stack modern web apps"},
		{"synthpunk", "Backend-focused APIs"},
		{"atompunk", "Lightweight edge functions"},
	}

	var options string
	for i, tier := range tiers {
		cursor := " "
		if i == m.cursor {
			cursor = "❯"
			options += styles.Selected.Render(cursor+" "+tier.name) + " " +
				styles.Muted.Render("("+tier.desc+")") + "\n"
		} else {
			options += styles.Unselected.Render(cursor+" "+tier.name) + " " +
				styles.Muted.Render("("+tier.desc+")") + "\n"
		}
	}

	return title + "\n\n" + options
}

func (m WizardModel) viewBackendSelection() string {
	title := styles.Title.Render("Select Backend")

	backends := []struct {
		name string
		desc string
	}{
		{"none", "Frontend only"},
		{"encore", "Encore (Go)"},
		{"trpc", "tRPC (TypeScript)"},
		{"encore-ts", "Encore.ts (TypeScript)"},
		{"glyphcase", "GlyphCase (Lua skills)"},
	}

	var options string
	for i, backend := range backends {
		cursor := " "
		if i == m.cursor {
			cursor = "❯"
			options += styles.Selected.Render(cursor+" "+backend.name) + " " +
				styles.Muted.Render("("+backend.desc+")") + "\n"
		} else {
			options += styles.Unselected.Render(cursor+" "+backend.name) + " " +
				styles.Muted.Render("("+backend.desc+")") + "\n"
		}
	}

	return title + "\n\n" + options
}

func (m WizardModel) viewNeonSelection() string {
	title := styles.Title.Render("Use Neon Database?")

	options := []string{"Yes", "No"}
	var opts string
	for i, opt := range options {
		cursor := " "
		if i == m.cursor {
			cursor = "❯"
			opts += styles.Selected.Render(cursor+" "+opt) + "\n"
		} else {
			opts += styles.Unselected.Render(cursor+" "+opt) + "\n"
		}
	}

	help := "\n" + styles.Muted.Render("Neon provides serverless Postgres for your app")

	return title + "\n\n" + opts + help
}

func (m WizardModel) viewSkillsSelection() string {
	title := styles.Title.Render("Select Skills (space to toggle)")

	skills := []struct {
		name string
		desc string
	}{
		{"auth", "Authentication & authorization"},
		{"ui", "UI component library"},
		{"db", "Database utilities"},
		{"api", "API client generation"},
		{"storage", "File storage"},
	}

	var options string
	for i, skill := range skills {
		cursor := " "
		selected := ""

		// Check if skill is selected
		isSelected := false
		for _, s := range m.skills {
			if s == skill.name {
				isSelected = true
				selected = "✓"
				break
			}
		}

		if i == m.cursor {
			cursor = "❯"
		}

		checkBox := "[ ]"
		if isSelected {
			checkBox = "[" + styles.Success.Render(selected) + "]"
		}

		line := cursor + " " + checkBox + " " + skill.name + " " +
			styles.Muted.Render("("+skill.desc+")")

		if i == m.cursor {
			options += styles.Selected.Render(line) + "\n"
		} else {
			options += styles.Unselected.Render(line) + "\n"
		}
	}

	help := "\n" + styles.Muted.Render("Press Enter when done")

	return title + "\n\n" + options + help
}

func (m WizardModel) viewGitSelection() string {
	title := styles.Title.Render("Initialize Git Repository?")

	options := []string{"Yes", "No"}
	var opts string
	for i, opt := range options {
		cursor := " "
		if i == m.cursor {
			cursor = "❯"
			opts += styles.Selected.Render(cursor+" "+opt) + "\n"
		} else {
			opts += styles.Unselected.Render(cursor+" "+opt) + "\n"
		}
	}

	return title + "\n\n" + opts
}

func (m WizardModel) viewConfirmation() string {
	title := styles.Title.Render("Confirm Project Settings")

	config := fmt.Sprintf(`
%s %s
%s %s
%s %s
%s %v
%s %s
%s %v
`,
		styles.Label.Render("Project Name:"), styles.Value.Render(m.projectName),
		styles.Label.Render("Tier:"), styles.Value.Render(m.tier),
		styles.Label.Render("Backend:"), styles.Value.Render(m.backend),
		styles.Label.Render("Neon DB:"), styles.Value.Render(fmt.Sprintf("%v", m.useNeon)),
		styles.Label.Render("Skills:"), styles.Value.Render(strings.Join(m.skills, ", ")),
		styles.Label.Render("Init Git:"), styles.Value.Render(fmt.Sprintf("%v", m.initGit)),
	)

	options := []string{"Create Project", "Cancel"}
	var opts string
	for i, opt := range options {
		cursor := " "
		if i == m.cursor {
			cursor = "❯"
			opts += styles.Selected.Render(cursor+" "+opt) + "\n"
		} else {
			opts += styles.Unselected.Render(cursor+" "+opt) + "\n"
		}
	}

	return title + "\n" + config + "\n" + opts
}

func (m WizardModel) viewGenerating() string {
	title := styles.Title.Render("🚀 Generating Project...")

	steps := []string{
		"Creating directory structure",
		"Installing dependencies",
		"Configuring backend",
		"Setting up skills",
		"Initializing git",
	}

	var progress string
	for _, step := range steps {
		progress += styles.StatusIcon("running") + " " + step + "\n"
	}

	return title + "\n\n" + progress
}

func (m WizardModel) viewComplete() string {
	title := styles.Title.Render("✅ Project Created Successfully!")

	nextSteps := fmt.Sprintf(`
%s

  cd %s
  punk dev

%s
`,
		styles.Label.Render("Next steps:"),
		styles.Value.Render(m.projectName),
		styles.Muted.Render("Happy hacking! 🎸"),
	)

	return title + "\n" + nextSteps
}
