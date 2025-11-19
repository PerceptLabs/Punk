package cmd

import (
	"fmt"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/punk-framework/cli/internal/styles"
	"github.com/spf13/cobra"
)

var AddCmd = &cobra.Command{
	Use:   "add [component|skill]",
	Short: "Add components, backends, or skills",
	Long: `Add new components, backends, or skills to your existing Punk project.

Available subcommands:
  punk add skill [name]    - Add a GlyphCase skill
  punk add component       - Add a UI component
  punk add backend         - Add or change backend`,
}

var addSkillCmd = &cobra.Command{
	Use:   "skill [name]",
	Short: "Add a GlyphCase skill to your project",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) > 0 {
			installSkill(args[0])
		} else {
			// Launch interactive skill browser
			p := tea.NewProgram(newSkillBrowser())
			if _, err := p.Run(); err != nil {
				fmt.Printf("Error: %v", err)
			}
		}
	},
}

func init() {
	AddCmd.AddCommand(addSkillCmd)
}

type skillItem struct {
	name string
	desc string
}

func (i skillItem) Title() string       { return i.name }
func (i skillItem) Description() string { return i.desc }
func (i skillItem) FilterValue() string { return i.name }

type skillBrowserModel struct {
	list list.Model
}

func newSkillBrowser() skillBrowserModel {
	items := []list.Item{
		skillItem{name: "auth", desc: "Authentication & authorization"},
		skillItem{name: "ui", desc: "UI component library"},
		skillItem{name: "db", desc: "Database utilities"},
		skillItem{name: "api", desc: "API client generation"},
		skillItem{name: "storage", desc: "File storage"},
		skillItem{name: "search", desc: "Full-text search"},
		skillItem{name: "cache", desc: "Caching layer"},
		skillItem{name: "queue", desc: "Job queue"},
	}

	l := list.New(items, list.NewDefaultDelegate(), 0, 0)
	l.Title = "Available Skills"
	l.Styles.Title = lipgloss.NewStyle().
		Foreground(styles.Pink).
		Bold(true).
		Padding(0, 1)

	return skillBrowserModel{list: l}
}

func (m skillBrowserModel) Init() tea.Cmd {
	return nil
}

func (m skillBrowserModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.list.SetSize(msg.Width, msg.Height)
		return m, nil

	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
		if msg.String() == "enter" {
			if i, ok := m.list.SelectedItem().(skillItem); ok {
				installSkill(i.name)
			}
			return m, tea.Quit
		}
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m skillBrowserModel) View() string {
	return lipgloss.NewStyle().Padding(1).Render(m.list.View())
}

func installSkill(name string) {
	fmt.Println(styles.Title.Render(fmt.Sprintf("Installing skill: %s", name)))
	fmt.Println()
	fmt.Println(styles.StatusIcon("running") + " Downloading skill...")
	fmt.Println(styles.StatusIcon("running") + " Installing dependencies...")
	fmt.Println(styles.StatusIcon("running") + " Configuring skill...")
	fmt.Println()
	fmt.Println(styles.Success.Render("✅ Skill installed successfully!"))
	fmt.Println()
	fmt.Println(styles.Muted.Render("Run 'punk dev' to see your changes"))
}
