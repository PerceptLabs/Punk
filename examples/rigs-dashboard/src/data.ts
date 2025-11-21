/**
 * Sample data for the Punk Rigs Dashboard Example
 *
 * This file contains realistic sample data for:
 * - Monthly revenue metrics
 * - User growth statistics
 * - System architecture diagrams
 */

// Monthly revenue data for bar chart
export const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue ($K)',
      data: [65, 72, 81, 78, 95, 102, 115, 108, 125, 138, 145, 152],
      backgroundColor: 'rgba(102, 126, 234, 0.6)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 8
    },
    {
      label: 'Expenses ($K)',
      data: [45, 48, 52, 50, 58, 62, 68, 65, 72, 78, 82, 85],
      backgroundColor: 'rgba(237, 100, 166, 0.6)',
      borderColor: 'rgba(237, 100, 166, 1)',
      borderWidth: 2,
      borderRadius: 8
    }
  ]
}

// User growth data for line chart
export const userGrowthData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
  datasets: [
    {
      label: 'Active Users',
      data: [1200, 1450, 1680, 1920, 2150, 2480, 2750, 3100],
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(16, 185, 129, 1)'
    },
    {
      label: 'New Signups',
      data: [180, 220, 250, 280, 310, 360, 390, 450],
      borderColor: 'rgba(251, 191, 36, 1)',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(251, 191, 36, 1)'
    }
  ]
}

// Traffic sources data for pie chart
export const trafficSourcesData = {
  labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email', 'Paid Ads'],
  datasets: [
    {
      label: 'Traffic Share (%)',
      data: [35, 25, 18, 12, 6, 4],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(237, 100, 166, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 3,
      hoverOffset: 15
    }
  ]
}

// Metrics table data
export const metricsTableData = [
  {
    id: 1,
    metric: 'Total Revenue',
    value: '$1,245,000',
    change: '+12.5%',
    trend: 'up',
    category: 'Financial'
  },
  {
    id: 2,
    metric: 'Active Users',
    value: '3,100',
    change: '+28.3%',
    trend: 'up',
    category: 'Users'
  },
  {
    id: 3,
    metric: 'Conversion Rate',
    value: '3.8%',
    change: '+0.5%',
    trend: 'up',
    category: 'Marketing'
  },
  {
    id: 4,
    metric: 'Churn Rate',
    value: '2.1%',
    change: '-0.3%',
    trend: 'down',
    category: 'Users'
  },
  {
    id: 5,
    metric: 'Avg. Order Value',
    value: '$89.50',
    change: '+5.2%',
    trend: 'up',
    category: 'Financial'
  },
  {
    id: 6,
    metric: 'Customer LTV',
    value: '$450',
    change: '+8.7%',
    trend: 'up',
    category: 'Financial'
  },
  {
    id: 7,
    metric: 'Support Tickets',
    value: '142',
    change: '-15.4%',
    trend: 'down',
    category: 'Operations'
  },
  {
    id: 8,
    metric: 'Page Load Time',
    value: '1.2s',
    change: '-0.3s',
    trend: 'down',
    category: 'Performance'
  }
]

// Table columns configuration
export const metricsTableColumns = [
  {
    accessorKey: 'metric',
    header: 'Metric',
    cell: (info: any) => info.getValue()
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: (info: any) => info.getValue()
  },
  {
    accessorKey: 'change',
    header: 'Change',
    cell: (info: any) => {
      const value = info.getValue()
      const trend = info.row.original.trend
      const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
      return `<span style="color: ${color}; font-weight: 600;">${value}</span>`
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: (info: any) => info.getValue()
  }
]

// System architecture Mermaid diagram
export const systemArchitectureDiagram = `
graph TB
    subgraph Client["Client Layer"]
        UI[React UI]
        Schema[JSON Schema]
    end

    subgraph Core["Punk Core"]
        Registry[Component Registry]
        Renderer[Punk Renderer]
        DataCtx[Data Context]
    end

    subgraph Extended["@punk/extended Rig"]
        Chart[Chart Component]
        Table[Table Component]
        Mermaid[Mermaid Component]
    end

    subgraph External["External Libraries"]
        ChartJS[Chart.js]
        TanStack[TanStack Table]
        MermaidJS[Mermaid.js]
    end

    UI -->|defines| Schema
    Schema -->|processed by| Renderer
    Renderer -->|looks up| Registry
    Registry -->|provides| Extended

    Chart -->|wraps| ChartJS
    Table -->|wraps| TanStack
    Mermaid -->|wraps| MermaidJS

    Extended -->|uses| DataCtx
    DataCtx -->|binds| Schema

    style Client fill:#667eea,stroke:#5a67d8,color:#fff
    style Core fill:#10b981,stroke:#059669,color:#fff
    style Extended fill:#f59e0b,stroke:#d97706,color:#fff
    style External fill:#8b5cf6,stroke:#7c3aed,color:#fff
`

// Data flow Mermaid diagram
export const dataFlowDiagram = `
sequenceDiagram
    participant User
    participant Schema
    participant Renderer
    participant Registry
    participant Component
    participant Library

    User->>Schema: Define dashboard JSON
    Schema->>Renderer: Pass to PunkRenderer
    Renderer->>Registry: Lookup component type
    Registry->>Component: Instantiate wrapper
    Component->>Library: Render with props
    Library-->>User: Display visualization

    Note over Component,Library: Data binding via<br/>DataContext hook
`
