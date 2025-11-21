package cmd

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/punk-framework/cli/internal/tui"
	"github.com/spf13/cobra"
)

var CreateCmd = &cobra.Command{
	Use:   "create [name]",
	Short: "Create a new Punk project",
	Long: `Create a new Punk Framework project with an interactive wizard.

The wizard will guide you through:
  - Project name
  - Tier selection (punk, synthpunk, atompunk)
  - Backend selection (encore, trpc, etc.)
  - Neon database integration
  - Mods selection
  - Git initialization`,
	Run: func(cmd *cobra.Command, args []string) {
		// Launch interactive TUI wizard
		p := tea.NewProgram(
			tui.NewWizard(),
			tea.WithAltScreen(),
		)

		if _, err := p.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error running wizard: %v\n", err)
			os.Exit(1)
		}
	},
}
