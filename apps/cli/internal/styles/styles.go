package styles

import (
	"github.com/charmbracelet/lipgloss"
)

// Punk color palette - cyberpunk aesthetics
var (
	// Primary neon colors
	Pink   = lipgloss.Color("#FF006E")
	Purple = lipgloss.Color("#8338EC")
	Cyan   = lipgloss.Color("#00D9FF")
	Green  = lipgloss.Color("#00FF41")

	// Neutrals
	DarkBG     = lipgloss.Color("#0A0A0A")
	LightGray  = lipgloss.Color("#E0E0E0")
	MediumGray = lipgloss.Color("#666666")

	// Semantic colors
	Success = Green
	Warning = lipgloss.Color("#FFB700")
	Error   = Pink
	Info    = Cyan
)

// Text styles
var (
	Title = lipgloss.NewStyle().
		Foreground(Pink).
		Bold(true).
		MarginLeft(2).
		MarginTop(1).
		MarginBottom(1)

	Subtitle = lipgloss.NewStyle().
		Foreground(Cyan).
		Italic(true).
		MarginLeft(2)

	Label = lipgloss.NewStyle().
		Foreground(Purple).
		Bold(true)

	Value = lipgloss.NewStyle().
		Foreground(LightGray)

	Success = lipgloss.NewStyle().
		Foreground(Green).
		Bold(true)

	Warning = lipgloss.NewStyle().
		Foreground(Warning).
		Bold(true)

	Error = lipgloss.NewStyle().
		Foreground(Error).
		Bold(true)

	Info = lipgloss.NewStyle().
		Foreground(Info)

	Muted = lipgloss.NewStyle().
		Foreground(MediumGray).
		Italic(true)
)

// Interactive element styles
var (
	Selected = lipgloss.NewStyle().
		Foreground(Cyan).
		Bold(true).
		PaddingLeft(2).
		Background(lipgloss.Color("#1A1A2E"))

	Unselected = lipgloss.NewStyle().
		Foreground(LightGray).
		PaddingLeft(2)

	Active = lipgloss.NewStyle().
		Foreground(Green).
		Bold(true).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(Green).
		Padding(0, 1)

	Inactive = lipgloss.NewStyle().
		Foreground(MediumGray).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(MediumGray).
		Padding(0, 1)

	Input = lipgloss.NewStyle().
		Foreground(Pink).
		Border(lipgloss.NormalBorder()).
		BorderForeground(Purple).
		Padding(0, 1)

	Focused = lipgloss.NewStyle().
		Border(lipgloss.DoubleBorder()).
		BorderForeground(Cyan).
		Padding(0, 1)
)

// Layout styles
var (
	Box = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(Pink).
		Padding(1, 2)

	Panel = lipgloss.NewStyle().
		Border(lipgloss.NormalBorder()).
		BorderForeground(Purple).
		Padding(1)

	Header = lipgloss.NewStyle().
		Background(Purple).
		Foreground(LightGray).
		Bold(true).
		Padding(0, 2).
		Width(80)

	Footer = lipgloss.NewStyle().
		Foreground(MediumGray).
		BorderTop(true).
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(MediumGray).
		Padding(1, 2)
)

// Progress and status indicators
var (
	Spinner = lipgloss.NewStyle().
		Foreground(Purple)

	ProgressBar = lipgloss.NewStyle().
		Foreground(Cyan)

	ProgressEmpty = lipgloss.NewStyle().
		Foreground(MediumGray)

	StatusRunning = lipgloss.NewStyle().
		Foreground(Cyan).
		Bold(true)

	StatusSuccess = lipgloss.NewStyle().
		Foreground(Green).
		Bold(true)

	StatusError = lipgloss.NewStyle().
		Foreground(Error).
		Bold(true)
)

// ASCII Art banner
var Banner = `
  ██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗
  ██╔══██╗██║   ██║████╗  ██║██║ ██╔╝
  ██████╔╝██║   ██║██╔██╗ ██║█████╔╝
  ██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗
  ██║     ╚██████╔╝██║ ╚████║██║  ██╗
  ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
`

// Helper function to render banner with style
func StyledBanner() string {
	return lipgloss.NewStyle().
		Foreground(Pink).
		Bold(true).
		Render(Banner)
}

// Helper function for bordered content
func BorderedContent(content string, title string) string {
	style := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(Cyan).
		Padding(1, 2).
		Width(70)

	if title != "" {
		titleStyle := lipgloss.NewStyle().
			Foreground(Pink).
			Bold(true)
		content = titleStyle.Render(title) + "\n\n" + content
	}

	return style.Render(content)
}

// Helper for status indicators
func StatusIcon(status string) string {
	switch status {
	case "success":
		return lipgloss.NewStyle().Foreground(Green).Render("✓")
	case "error":
		return lipgloss.NewStyle().Foreground(Error).Render("✗")
	case "warning":
		return lipgloss.NewStyle().Foreground(Warning).Render("⚠")
	case "running":
		return lipgloss.NewStyle().Foreground(Cyan).Render("◐")
	case "info":
		return lipgloss.NewStyle().Foreground(Info).Render("ℹ")
	default:
		return "•"
	}
}

// Helper for keyboard shortcuts display
func KeyboardHelp(keys ...string) string {
	var help string
	for i := 0; i < len(keys); i += 2 {
		if i > 0 {
			help += "  "
		}
		key := lipgloss.NewStyle().Foreground(Pink).Bold(true).Render(keys[i])
		desc := lipgloss.NewStyle().Foreground(MediumGray).Render(keys[i+1])
		help += key + "=" + desc
	}
	return help
}
