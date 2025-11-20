package cmd

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/punk-framework/cli/internal/tui"
	"github.com/spf13/cobra"
)

var DevCmd = &cobra.Command{
	Use:   "dev",
	Short: "Start development server",
	Long: `Start the Punk development server with a beautiful multi-pane TUI.

Features:
  - Real-time log streaming for frontend and backend
  - Service status monitoring
  - Hot module replacement (HMR)
  - Keyboard shortcuts for quick actions
  - Multi-pane layout for simultaneous log viewing`,
	Run: func(cmd *cobra.Command, args []string) {
		// Launch multi-pane dev server TUI
		p := tea.NewProgram(
			tui.NewDevModel(),
			tea.WithAltScreen(),
			tea.WithMouseCellMotion(),
		)

		if _, err := p.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error running dev server: %v\n", err)
			os.Exit(1)
		}
	},
}
