package main

import (
	"fmt"
	"os"

	"github.com/punk-framework/cli/cmd"
	"github.com/spf13/cobra"
)

var version = "1.0.0"

var rootCmd = &cobra.Command{
	Use:   "punk",
	Short: "Punk - Build Fast. Break Norms. Ship Code. 🎸",
	Long: `A beautiful CLI for the Punk Framework

Create schema-driven, AI-assisted applications with
stunning TUI interfaces and cyberpunk aesthetics.`,
	Version: version,
}

func main() {
	rootCmd.AddCommand(cmd.CreateCmd)
	rootCmd.AddCommand(cmd.DevCmd)
	rootCmd.AddCommand(cmd.BuildCmd)
	rootCmd.AddCommand(cmd.CheckCmd)
	rootCmd.AddCommand(cmd.AddCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
