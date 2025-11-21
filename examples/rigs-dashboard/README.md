# Punk Rigs Dashboard Example

A production-quality example demonstrating the **Punk Framework Extended Rig** with Chart, Table, and Mermaid components.

## Overview

This example showcases how to build a complete analytics dashboard using Punk's JSON-based component system. It demonstrates:

- **Multiple chart types** (bar, line, pie) using `@punk/component-chart`
- **Interactive data tables** with sorting and pagination using `@punk/component-table`
- **System diagrams** using `@punk/component-mermaid`
- **Data binding** through `DataContext` for dynamic updates
- **Responsive layouts** with production-ready styling
- **Error handling** and loading states

## What is a Rig?

A **rig** is a curated collection of pre-wrapped React component libraries bundled as an npm package. The `@punk/extended` rig includes:

- `@punk/component-chart` - Charts powered by Chart.js
- `@punk/component-table` - Tables powered by TanStack Table
- `@punk/component-richtext` - Rich text editing with Lexical
- `@punk/component-code` - Code editing with CodeMirror
- `@punk/component-mermaid` - Diagrams with Mermaid.js
- `@punk/component-filedrop` - File uploads with react-dropzone
- `@punk/component-date` - Date pickers with react-day-picker
- `@punk/component-command` - Command palettes with cmdk

Simply install `@punk/extended` and all components are automatically registered and ready to use via JSON schemas.

## Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
rigs-dashboard/
├── src/
│   ├── main.tsx          # React entry point, imports @punk/extended
│   ├── App.tsx           # Main app component with PunkRenderer
│   ├── schema.ts         # Dashboard JSON schema definition
│   └── data.ts           # Sample data for charts and tables
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## How It Works

### 1. Import the Rig

In `main.tsx`, we import the extended rig which auto-registers all components:

```typescript
import '@punk/extended'
```

This single import makes Chart, Table, Mermaid, and all other extended components available in your schemas.

### 2. Define Your Schema

In `schema.ts`, we define the entire dashboard layout as JSON:

```typescript
export const dashboardSchema = {
  type: 'Container',
  children: [
    {
      type: 'Chart',
      props: {
        chartType: 'bar',
        data: 'monthlyRevenueData',  // References data via DataContext
        options: { /* Chart.js options */ },
        height: 300
      }
    },
    {
      type: 'Table',
      props: {
        data: 'metricsTableData',
        columns: 'metricsTableColumns',
        enableSorting: true,
        enablePagination: true
      }
    },
    {
      type: 'Mermaid',
      props: {
        diagram: 'systemArchitectureDiagram',
        theme: 'default'
      }
    }
  ]
}
```

### 3. Provide Data via Context

In `App.tsx`, we use `DataContext` to bind string references to actual data:

```typescript
const dataContext = {
  monthlyRevenueData,
  metricsTableData,
  metricsTableColumns,
  systemArchitectureDiagram
}

return (
  <DataContext.Provider value={dataContext}>
    <PunkRenderer schema={dashboardSchema} />
  </DataContext.Provider>
)
```

### 4. Render with PunkRenderer

The `PunkRenderer` component from `@punk/core`:
1. Parses the JSON schema
2. Looks up component types in the registry
3. Resolves data references via DataContext
4. Renders the final React tree

## Components Used

### Chart Component

Wraps [Chart.js](https://www.chartjs.org/) for data visualization.

**Props:**
- `chartType`: `'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea'`
- `data`: String reference or object (Chart.js data format)
- `options`: Chart.js configuration object
- `height`: Chart height in pixels
- `width`: Chart width in pixels

**Example:**
```json
{
  "type": "Chart",
  "props": {
    "chartType": "line",
    "data": "userGrowthData",
    "options": {
      "responsive": true,
      "plugins": {
        "legend": { "position": "top" }
      }
    },
    "height": 300
  }
}
```

### Table Component

Wraps [TanStack Table](https://tanstack.com/table) for interactive data tables.

**Props:**
- `data`: String reference or array of objects
- `columns`: Column definitions array
- `enableSorting`: Enable column sorting (default: false)
- `enablePagination`: Enable pagination (default: false)
- `pageSize`: Rows per page (default: 10)

**Example:**
```json
{
  "type": "Table",
  "props": {
    "data": "metricsTableData",
    "columns": "metricsTableColumns",
    "enableSorting": true,
    "enablePagination": true,
    "pageSize": 5
  }
}
```

### Mermaid Component

Wraps [Mermaid.js](https://mermaid.js.org/) for diagrams.

**Props:**
- `diagram`: String reference or mermaid diagram definition
- `theme`: `'default' | 'dark' | 'forest' | 'neutral'`

**Example:**
```json
{
  "type": "Mermaid",
  "props": {
    "diagram": "systemArchitectureDiagram",
    "theme": "default"
  }
}
```

## Data Binding

The dashboard demonstrates three data binding patterns:

### 1. Direct Data References

```typescript
// In schema.ts
{
  type: 'Chart',
  props: {
    data: 'monthlyRevenueData'  // String reference
  }
}

// In App.tsx
const dataContext = {
  monthlyRevenueData: { /* actual data */ }
}
```

### 2. Inline Data

```typescript
{
  type: 'Chart',
  props: {
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [/* ... */]
    }
  }
}
```

### 3. Dynamic Data Updates

```typescript
const [data, setData] = useState(initialData)

const dataContext = {
  chartData: data  // Updates trigger re-renders
}

// Update data
setData(newData)
```

## Styling Approach

This example uses inline styles for simplicity, but you can use:

- **CSS Modules**: Import `.module.css` files
- **Styled Components**: Use styled-components or Emotion
- **Tailwind CSS**: Add Tailwind to Vite config
- **Theme Provider**: Wrap app in theme context

Example with CSS Modules:

```typescript
import styles from './Dashboard.module.css'

{
  type: 'Container',
  props: {
    className: styles.dashboard
  }
}
```

## Production Features

### Error Handling

The app includes a React Error Boundary that catches rendering errors:

```typescript
<ErrorBoundary onError={handleError}>
  <PunkRenderer schema={dashboardSchema} />
</ErrorBoundary>
```

### Loading States

Shows a loading spinner while data is being fetched:

```typescript
const [isLoading, setIsLoading] = useState(true)

if (isLoading) {
  return <LoadingSpinner />
}
```

### Responsive Design

All layouts use CSS Grid with responsive breakpoints:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
gap: 1.5rem;
```

## Extending the Dashboard

### Add a New Chart

1. Add data to `data.ts`:

```typescript
export const salesData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [/* ... */]
}
```

2. Add to schema in `schema.ts`:

```typescript
{
  type: 'Chart',
  props: {
    chartType: 'bar',
    data: 'salesData',
    height: 300
  }
}
```

3. Add to data context in `App.tsx`:

```typescript
const dataContext = {
  salesData,
  // ... other data
}
```

### Add Custom Components

Create your own component wrapper following the pattern:

```typescript
// packages/component-custom/src/index.tsx
import { z } from 'zod'
import { registerComponent } from '@punk/core'

export const CustomPropsSchema = z.object({
  // your props
})

export function Custom(props: z.infer<typeof CustomPropsSchema>) {
  return <YourLibrary {...props} />
}

registerComponent('Custom', Custom, {
  schema: CustomPropsSchema,
  meta: {
    displayName: 'Custom',
    description: 'Your component',
    icon: 'star',
    category: 'Custom'
  }
})
```

## What You Should See

When you run `pnpm dev`, you'll see:

1. **Header Section**: Title and description with gradient text
2. **Charts Grid**: Three responsive cards containing:
   - Bar chart showing monthly revenue vs expenses
   - Line chart showing user growth trends
   - Pie chart showing traffic source distribution
3. **Metrics Table**: Sortable, paginated table with 8 key metrics
4. **Architecture Diagrams**: Two Mermaid diagrams showing:
   - System architecture with colored nodes
   - Data flow sequence diagram

All cards have white backgrounds with shadows, rounded corners, and smooth hover effects.

## Common Issues

### Components Not Rendering

**Problem**: Chart/Table/Mermaid components not showing.

**Solution**: Ensure `@punk/extended` is imported in `main.tsx` before the app renders.

### Data Not Binding

**Problem**: Charts show empty or undefined data.

**Solution**: Check that data keys in schema match keys in `dataContext` exactly.

### TypeScript Errors

**Problem**: Type errors for component props.

**Solution**: Install `@types/` packages or add type declarations.

### Build Errors

**Problem**: Vite build fails.

**Solution**: Run `pnpm clean` and `pnpm build` from repository root to ensure all packages are built.

## Performance Tips

1. **Memoize Data**: Use `useMemo` for expensive data transformations
2. **Lazy Load Charts**: Load chart libraries only when needed
3. **Virtual Scrolling**: For large tables, enable virtualization
4. **Code Splitting**: Split schema files by page/section

```typescript
const chartData = useMemo(() => processData(rawData), [rawData])
```

## Learn More

- **Punk Framework Docs**: See `/packages/core/README.md`
- **Extended Rig**: See `/packages/extended/README.md`
- **Custom Components**: See `/examples/custom-component/`
- **Chart.js Docs**: https://www.chartjs.org/docs/
- **TanStack Table**: https://tanstack.com/table/latest
- **Mermaid.js**: https://mermaid.js.org/intro/

## Next Steps

1. **Explore SynthPunk**: Generate schemas with AI
2. **Try Mohawk**: Visually edit schemas
3. **Build Custom Rig**: Create your own component collection
4. **Deploy**: Build and deploy to Vercel/Netlify

## License

MIT

---

**Built with Punk Framework** - Declarative UIs powered by JSON schemas.
