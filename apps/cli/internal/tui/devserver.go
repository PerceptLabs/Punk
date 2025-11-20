package tui

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/punk-framework/cli/internal/styles"
)

type Service struct {
	Name   string
	Status string // "running", "stopped", "error"
	Port   int
	Logs   []string
}

type DevModel struct {
	frontendViewport viewport.Model
	backendViewport  viewport.Model
	servicesViewport viewport.Model
	services         []Service
	selectedPane     int // 0=frontend, 1=backend, 2=services
	width            int
	height           int
	ready            bool
	showHelp         bool
}

func NewDevModel() DevModel {
	return DevModel{
		services: []Service{
			{Name: "vite", Status: "running", Port: 5173, Logs: []string{}},
			{Name: "encore", Status: "running", Port: 4000, Logs: []string{}},
			{Name: "db", Status: "running", Port: 5432, Logs: []string{}},
		},
		selectedPane: 0,
		showHelp:     false,
	}
}

func (m DevModel) Init() tea.Cmd {
	return tea.Batch(
		tickCmd(),
		waitForActivity(),
	)
}

func tickCmd() tea.Cmd {
	return tea.Tick(time.Second*1, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

type tickMsg time.Time

func waitForActivity() tea.Cmd {
	return tea.Tick(time.Millisecond*500, func(t time.Time) tea.Msg {
		return logMsg{
			pane: "frontend",
			msg:  fmt.Sprintf("[%s] Server running at http://localhost:5173", t.Format("15:04:05")),
		}
	})
}

type logMsg struct {
	pane string
	msg  string
}

func (m DevModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var (
		cmd  tea.Cmd
		cmds []tea.Cmd
	)

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		if !m.ready {
			// Calculate viewport dimensions
			paneWidth := (m.width - 4) / 2
			paneHeight := (m.height - 10) / 2

			m.frontendViewport = viewport.New(paneWidth, paneHeight)
			m.backendViewport = viewport.New(paneWidth, paneHeight)
			m.servicesViewport = viewport.New(m.width-4, paneHeight)

			m.frontendViewport.SetContent("Waiting for frontend logs...")
			m.backendViewport.SetContent("Waiting for backend logs...")
			m.servicesViewport.SetContent(m.renderServices())

			m.ready = true
		}
		return m, nil

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit

		case "h":
			m.showHelp = !m.showHelp
			return m, nil

		case "1":
			m.selectedPane = 0
			return m, nil

		case "2":
			m.selectedPane = 1
			return m, nil

		case "3":
			m.selectedPane = 2
			return m, nil

		case "r":
			// Restart selected service
			return m, m.restartService()

		case "c":
			// Clear current pane
			switch m.selectedPane {
			case 0:
				m.frontendViewport.SetContent("Logs cleared")
			case 1:
				m.backendViewport.SetContent("Logs cleared")
			case 2:
				m.servicesViewport.SetContent(m.renderServices())
			}
			return m, nil
		}

	case tickMsg:
		// Simulate log updates
		return m, tickCmd()

	case logMsg:
		// Add log to appropriate pane
		switch msg.pane {
		case "frontend":
			content := m.frontendViewport.View() + "\n" + msg.msg
			m.frontendViewport.SetContent(content)
			m.frontendViewport.GotoBottom()
		case "backend":
			content := m.backendViewport.View() + "\n" + msg.msg
			m.backendViewport.SetContent(content)
			m.backendViewport.GotoBottom()
		}
		return m, waitForActivity()
	}

	// Update viewports
	m.frontendViewport, cmd = m.frontendViewport.Update(msg)
	cmds = append(cmds, cmd)

	m.backendViewport, cmd = m.backendViewport.Update(msg)
	cmds = append(cmds, cmd)

	m.servicesViewport, cmd = m.servicesViewport.Update(msg)
	cmds = append(cmds, cmd)

	return m, tea.Batch(cmds...)
}

func (m DevModel) restartService() tea.Cmd {
	return func() tea.Msg {
		// TODO: Actually restart the service
		return logMsg{pane: "backend", msg: "Service restarted"}
	}
}

func (m DevModel) View() string {
	if !m.ready {
		return "\n  Initializing dev server..."
	}

	if m.showHelp {
		return m.renderHelp()
	}

	// Header
	header := styles.Header.Render("PUNK DEV - my-awesome-app") +
		styles.Info.Render("  [1] Frontend  [2] Backend  [3] Services")

	// Calculate pane dimensions
	paneWidth := (m.width - 4) / 2
	paneHeight := (m.height - 10) / 2

	// Frontend pane
	frontendBorder := lipgloss.RoundedBorder()
	if m.selectedPane == 0 {
		frontendBorder = lipgloss.DoubleBorder()
	}
	frontendStyle := lipgloss.NewStyle().
		Border(frontendBorder).
		BorderForeground(styles.Cyan).
		Width(paneWidth).
		Height(paneHeight)

	frontendTitle := styles.Label.Render("FRONTEND (Vite)")
	frontendPane := frontendStyle.Render(
		frontendTitle + "\n" + m.frontendViewport.View(),
	)

	// Backend pane
	backendBorder := lipgloss.RoundedBorder()
	if m.selectedPane == 1 {
		backendBorder = lipgloss.DoubleBorder()
	}
	backendStyle := lipgloss.NewStyle().
		Border(backendBorder).
		BorderForeground(styles.Purple).
		Width(paneWidth).
		Height(paneHeight)

	backendTitle := styles.Label.Render("BACKEND (Encore)")
	backendPane := backendStyle.Render(
		backendTitle + "\n" + m.backendViewport.View(),
	)

	// Top row with frontend and backend
	topRow := lipgloss.JoinHorizontal(lipgloss.Top, frontendPane, backendPane)

	// Services pane
	servicesBorder := lipgloss.RoundedBorder()
	if m.selectedPane == 2 {
		servicesBorder = lipgloss.DoubleBorder()
	}
	servicesStyle := lipgloss.NewStyle().
		Border(servicesBorder).
		BorderForeground(styles.Pink).
		Width(m.width - 4).
		Height(paneHeight)

	servicesTitle := styles.Label.Render("SERVICES")
	servicesPane := servicesStyle.Render(
		servicesTitle + "\n" + m.renderServices(),
	)

	// Footer
	footer := styles.Footer.Render(
		styles.KeyboardHelp(
			"1/2/3", "switch pane",
			"r", "restart",
			"c", "clear",
			"h", "help",
			"q", "quit",
		),
	)

	// Combine all elements
	content := lipgloss.JoinVertical(
		lipgloss.Left,
		header,
		topRow,
		servicesPane,
		footer,
	)

	return content
}

func (m DevModel) renderServices() string {
	var output strings.Builder

	for _, svc := range m.services {
		var status string
		switch svc.Status {
		case "running":
			status = styles.StatusIcon("success") + " Running"
		case "stopped":
			status = styles.StatusIcon("error") + " Stopped"
		case "error":
			status = styles.StatusIcon("error") + " Error"
		default:
			status = styles.StatusIcon("info") + " Unknown"
		}

		line := fmt.Sprintf("%s  %-10s  %s  Port: %d\n",
			status,
			svc.Name,
			strings.Repeat(" ", 20),
			svc.Port,
		)
		output.WriteString(line)
	}

	return output.String()
}

func (m DevModel) renderHelp() string {
	help := `
╔═══════════════════════════════════════════════════════════════╗
║                      PUNK DEV - HELP                          ║
╚═══════════════════════════════════════════════════════════════╝

Keyboard Shortcuts:

  1, 2, 3       Switch between panes (Frontend, Backend, Services)
  h             Toggle this help screen
  r             Restart selected service
  c             Clear current pane logs
  q, Ctrl+C     Quit dev server

Panes:

  Frontend      Shows Vite dev server logs and HMR updates
  Backend       Shows backend API logs and requests
  Services      Shows status of all running services

Navigation:

  ↑ ↓           Scroll within active pane
  PgUp PgDn     Page up/down in active pane

Press 'h' to close this help screen.
`
	return styles.Box.Render(help)
}
