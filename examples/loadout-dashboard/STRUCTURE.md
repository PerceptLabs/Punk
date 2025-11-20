# Dashboard Structure Overview

This document provides a visual overview of the loadout-dashboard example structure.

## Component Hierarchy

```
App (DataContext Provider)
└── PunkRenderer
    └── Container (Dashboard Root)
        ├── Container (Header Section)
        │   ├── Text (Title: "Punk Framework Dashboard")
        │   └── Text (Subtitle: "Demonstrating @punk/extended...")
        │
        ├── Container (Charts Grid - 3 columns)
        │   ├── Container (Card 1)
        │   │   ├── Text (Title: "Monthly Revenue & Expenses")
        │   │   └── Chart (type: bar, data: monthlyRevenueData)
        │   │
        │   ├── Container (Card 2)
        │   │   ├── Text (Title: "User Growth Trends")
        │   │   └── Chart (type: line, data: userGrowthData)
        │   │
        │   └── Container (Card 3)
        │       ├── Text (Title: "Traffic Sources")
        │       └── Chart (type: pie, data: trafficSourcesData)
        │
        ├── Container (Metrics Section)
        │   ├── Text (Title: "Key Performance Metrics")
        │   └── Table (data: metricsTableData, columns: metricsTableColumns)
        │
        ├── Container (Diagrams Grid - 2 columns)
        │   ├── Container (Diagram 1)
        │   │   ├── Text (Title: "System Architecture")
        │   │   └── Mermaid (diagram: systemArchitectureDiagram)
        │   │
        │   └── Container (Diagram 2)
        │       ├── Text (Title: "Data Flow Sequence")
        │       └── Mermaid (diagram: dataFlowDiagram)
        │
        └── Container (Footer)
            ├── Text ("Built with Punk Framework...")
            └── Text ("Powered by @punk/component-...")
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         data.ts                              │
│  - monthlyRevenueData                                        │
│  - userGrowthData                                            │
│  - trafficSourcesData                                        │
│  - metricsTableData                                          │
│  - metricsTableColumns                                       │
│  - systemArchitectureDiagram                                 │
│  - dataFlowDiagram                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│                                                              │
│  const dataContext = {                                       │
│    monthlyRevenueData,                                       │
│    userGrowthData,                                           │
│    ...                                                       │
│  }                                                           │
│                                                              │
│  <DataContext.Provider value={dataContext}>                 │
│    <PunkRenderer schema={dashboardSchema} />                │
│  </DataContext.Provider>                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      schema.ts                               │
│                                                              │
│  {                                                           │
│    type: 'Chart',                                            │
│    props: {                                                  │
│      data: 'monthlyRevenueData' ← string reference          │
│    }                                                         │
│  }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  PunkRenderer                                │
│                                                              │
│  1. Reads schema.type = 'Chart'                             │
│  2. Looks up Chart in ComponentRegistry                     │
│  3. Resolves 'monthlyRevenueData' via DataContext           │
│  4. Renders: <Chart data={actualData} />                    │
└─────────────────────────────────────────────────────────────┘
```

## File Organization

```
loadout-dashboard/
│
├── Configuration Files
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript config
│   ├── tsconfig.node.json     # TypeScript for Vite
│   ├── vite.config.ts         # Vite bundler config
│   └── .gitignore             # Git ignore rules
│
├── HTML Entry
│   └── index.html             # HTML template with gradient background
│
├── Source Code
│   ├── main.tsx               # React entry, imports @punk/extended
│   ├── App.tsx                # Main component with DataContext
│   ├── schema.ts              # Dashboard JSON schema (350+ lines)
│   ├── data.ts                # Sample data for all visualizations
│   └── vite-env.d.ts          # Vite TypeScript declarations
│
└── Documentation
    ├── README.md              # Comprehensive usage guide
    └── STRUCTURE.md           # This file
```

## Component Props Summary

### Chart Component
```typescript
{
  type: 'Chart',
  props: {
    chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
    data: string | ChartData
    options: ChartOptions  // Chart.js configuration
    height: number         // Height in pixels
    width?: number         // Optional width
  }
}
```

### Table Component
```typescript
{
  type: 'Table',
  props: {
    data: string | Array<any>
    columns: string | ColumnDef[]
    enableSorting?: boolean      // Default: false
    enablePagination?: boolean   // Default: false
    pageSize?: number            // Default: 10
    style?: CSSProperties
  }
}
```

### Mermaid Component
```typescript
{
  type: 'Mermaid',
  props: {
    diagram: string              // Diagram definition or reference
    theme: 'default' | 'dark' | 'forest' | 'neutral'
    style?: CSSProperties
  }
}
```

## Visual Layout (Desktop View)

```
┌─────────────────────────────────────────────────────────────┐
│                    PUNK FRAMEWORK DASHBOARD                  │
│        Demonstrating @punk/extended loadout with...         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────────┐
│ Monthly Revenue  │  User Growth     │  Traffic Sources     │
│                  │                  │                      │
│  [Bar Chart]     │  [Line Chart]    │  [Pie Chart]        │
│                  │                  │                      │
└──────────────────┴──────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              KEY PERFORMANCE METRICS                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Metric  │ Value      │ Change  │ Category            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Revenue │ $1,245,000 │ +12.5%  │ Financial          │  │
│  │ Users   │ 3,100      │ +28.3%  │ Users              │  │
│  │ ...     │ ...        │ ...     │ ...                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [< Previous] [1] [2] [Next >]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬───────────────────────────────┐
│   SYSTEM ARCHITECTURE       │   DATA FLOW SEQUENCE          │
│                             │                               │
│   [Mermaid Graph Diagram]   │   [Mermaid Sequence Diagram]  │
│                             │                               │
└─────────────────────────────┴───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          Built with Punk Framework Extended Loadout         │
│  Powered by @punk/component-chart, table, and mermaid       │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

The dashboard uses CSS Grid with `auto-fit` for responsive layouts:

- **Desktop (>1200px)**: 3-column grid for charts, 2-column for diagrams
- **Tablet (768px-1200px)**: 2-column grid for charts and diagrams
- **Mobile (<768px)**: 1-column stack layout

```css
/* Charts Grid */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
gap: 1.5rem;

/* Diagrams Grid */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
gap: 1.5rem;
```

## Color Scheme

The dashboard uses a professional gradient color scheme:

- **Primary Gradient**: `#667eea` → `#764ba2` (Purple)
- **Chart Colors**:
  - Blue: `rgba(102, 126, 234, 0.6)`
  - Pink: `rgba(237, 100, 166, 0.6)`
  - Green: `rgba(16, 185, 129, 1)`
  - Yellow: `rgba(251, 191, 36, 1)`
- **Card Background**: `rgba(255, 255, 255, 0.95)`
- **Text Colors**:
  - Headings: `#1f2937`
  - Subtext: `#6b7280`
  - Muted: `#9ca3af`

## State Management

The example demonstrates three types of state:

1. **Loading State**: Shows spinner during initialization
2. **Error State**: Displays error UI if rendering fails
3. **Data State**: Binds static data via DataContext

For dynamic data, you would add:

```typescript
const [metrics, setMetrics] = useState(initialMetrics)

// Update metrics triggers re-render
useEffect(() => {
  fetchMetrics().then(setMetrics)
}, [])

const dataContext = {
  metricsTableData: metrics  // Live data
}
```

## Key Concepts Demonstrated

1. **Declarative UI**: Entire dashboard defined as JSON
2. **Component Registry**: Types resolved at render time
3. **Data Binding**: String references to actual data
4. **Loadout Pattern**: Multiple components from one package
5. **Production Quality**: Error handling, loading, responsive
6. **Real-world Data**: Realistic metrics and visualizations
7. **Clean Architecture**: Separation of schema, data, and rendering

---

For more details, see the main [README.md](./README.md).
