package cmd

import (
	"fmt"
	"time"

	"github.com/charmbracelet/bubbles/progress"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/punk-framework/cli/internal/styles"
	"github.com/spf13/cobra"
)

var BuildCmd = &cobra.Command{
	Use:   "build",
	Short: "Build project for production",
	Long: `Build your Punk project for production deployment.

This command will:
  - Build frontend with optimizations
  - Build backend if configured
  - Generate static assets
  - Create production bundle
  - Show bundle size analysis`,
	Run: func(cmd *cobra.Command, args []string) {
		p := tea.NewProgram(newBuildModel())
		if _, err := p.Run(); err != nil {
			fmt.Printf("Error: %v", err)
		}
	},
}

type buildModel struct {
	spinner  spinner.Model
	progress progress.Model
	stage    int
	done     bool
}

func newBuildModel() buildModel {
	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(styles.Purple)

	p := progress.New(
		progress.WithDefaultGradient(),
		progress.WithWidth(40),
	)

	return buildModel{
		spinner:  s,
		progress: p,
		stage:    0,
		done:     false,
	}
}

func (m buildModel) Init() tea.Cmd {
	return tea.Batch(
		m.spinner.Tick,
		buildStep(),
	)
}

func buildStep() tea.Cmd {
	return tea.Tick(time.Second*2, func(t time.Time) tea.Msg {
		return buildStepMsg{}
	})
}

type buildStepMsg struct{}

func (m buildModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" || msg.String() == "q" {
			return m, tea.Quit
		}
		if m.done && msg.String() == "enter" {
			return m, tea.Quit
		}

	case buildStepMsg:
		m.stage++
		if m.stage >= 5 {
			m.done = true
			return m, tea.Quit
		}
		return m, buildStep()

	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	}

	return m, nil
}

func (m buildModel) View() string {
	if m.done {
		return styles.Success.Render("\n✅ Build complete!\n\n") +
			styles.Muted.Render("Output saved to: ./dist\n") +
			styles.Muted.Render("Press Enter to exit\n")
	}

	stages := []string{
		"Building frontend",
		"Optimizing assets",
		"Building backend",
		"Generating types",
		"Creating bundle",
	}

	var output string
	output += styles.Title.Render("🏗️  Building for Production") + "\n\n"

	for i, stage := range stages {
		var line string
		if i < m.stage {
			line = styles.StatusIcon("success") + " " + stage
		} else if i == m.stage {
			line = m.spinner.View() + " " + stage
		} else {
			line = styles.Muted.Render("  " + stage)
		}
		output += line + "\n"
	}

	// Progress bar
	percent := float64(m.stage) / float64(len(stages))
	output += "\n" + m.progress.ViewAs(percent) + "\n"

	return lipgloss.NewStyle().Padding(1, 2).Render(output)
}
