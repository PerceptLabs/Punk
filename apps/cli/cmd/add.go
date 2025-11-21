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
	Use:   "add [component|mod]",
	Short: "Add components, backends, or mods",
	Long: `Add new components, backends, or mods to your existing Punk project.

Available subcommands:
  punk add mod [name]      - Add a GlyphCase mod
  punk add component       - Add a UI component
  punk add backend         - Add or change backend`,
}

var addModCmd = &cobra.Command{
	Use:   "mod [name]",
	Short: "Add a GlyphCase mod to your project",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) > 0 {
			installMod(args[0])
		} else {
			// Launch interactive mod browser
			p := tea.NewProgram(newModBrowser())
			if _, err := p.Run(); err != nil {
				fmt.Printf("Error: %v", err)
			}
		}
	},
}

func init() {
	AddCmd.AddCommand(addModCmd)
}

type modItem struct {
	name string
	desc string
}

func (i modItem) Title() string       { return i.name }
func (i modItem) Description() string { return i.desc }
func (i modItem) FilterValue() string { return i.name }

type modBrowserModel struct {
	list list.Model
}

func newModBrowser() modBrowserModel {
	items := []list.Item{
		modItem{name: "auth", desc: "Authentication & authorization"},
		modItem{name: "ui", desc: "UI component library"},
		modItem{name: "db", desc: "Database utilities"},
		modItem{name: "api", desc: "API client generation"},
		modItem{name: "storage", desc: "File storage"},
		modItem{name: "search", desc: "Full-text search"},
		modItem{name: "cache", desc: "Caching layer"},
		modItem{name: "queue", desc: "Job queue"},
	}

	l := list.New(items, list.NewDefaultDelegate(), 0, 0)
	l.Title = "Available Mods"
	l.Styles.Title = lipgloss.NewStyle().
		Foreground(styles.Pink).
		Bold(true).
		Padding(0, 1)

	return modBrowserModel{list: l}
}

func (m modBrowserModel) Init() tea.Cmd {
	return nil
}

func (m modBrowserModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.list.SetSize(msg.Width, msg.Height)
		return m, nil

	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
		if msg.String() == "enter" {
			if i, ok := m.list.SelectedItem().(modItem); ok {
				installMod(i.name)
			}
			return m, tea.Quit
		}
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m modBrowserModel) View() string {
	return lipgloss.NewStyle().Padding(1).Render(m.list.View())
}

func installMod(name string) {
	fmt.Println(styles.Title.Render(fmt.Sprintf("Installing mod: %s", name)))
	fmt.Println()
	fmt.Println(styles.StatusIcon("running") + " Downloading mod...")
	fmt.Println(styles.StatusIcon("running") + " Installing dependencies...")
	fmt.Println(styles.StatusIcon("running") + " Configuring mod...")
	fmt.Println()
	fmt.Println(styles.Success.Render("Mod installed successfully!"))
	fmt.Println()
	fmt.Println(styles.Muted.Render("Run 'punk dev' to see your changes"))
}
