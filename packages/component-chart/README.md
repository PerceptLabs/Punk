# @punk/component-chart

Chart.js wrapper for Punk Framework - Interactive data visualization components.

## Installation

```bash
pnpm add @punk/component-chart
```

## Features

- **Multiple Chart Types**: Bar, Line, Pie, Doughnut, Radar
- **Auto-Registration**: Automatically registers with Punk's ComponentRegistry
- **Renderer-Agnostic**: Works in DOM, GPU, and XR modes
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **DataContext Integration**: Seamlessly integrates with Punk's data system

## Usage

### Programmatic (React)

```tsx
import { Chart } from '@punk/component-chart'

function MyApp() {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  }

  return (
    <Chart
      type="bar"
      data={JSON.stringify(chartData)}
      height={400}
    />
  )
}
```

### JSON Schema (SynthPunk)

```json
{
  "type": "Chart",
  "props": {
    "type": "line",
    "data": "salesData",
    "height": 300,
    "options": {
      "plugins": {
        "legend": {
          "display": true
        }
      }
    }
  }
}
```

### With DataContext

```tsx
import { PunkRenderer } from '@punk/core'
import '@punk/component-chart'

const schema = {
  type: "Chart",
  props: {
    type: "pie",
    data: "revenue"
  }
}

const data = {
  revenue: JSON.stringify({
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      data: [30, 25, 20, 25],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ]
    }]
  })
}

<PunkRenderer schema={schema} data={data} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'bar' \| 'line' \| 'pie' \| 'doughnut' \| 'radar'` | `'bar'` | Chart type |
| `data` | `string` | required | JSON string or DataContext path |
| `options` | `object` | `{}` | Chart.js options |
| `height` | `number` | `300` | Chart height in pixels |
| `width` | `number` | auto | Chart width in pixels |

## Chart Types

### Bar Chart
```json
{ "type": "bar", "data": "barData" }
```

### Line Chart
```json
{ "type": "line", "data": "lineData" }
```

### Pie Chart
```json
{ "type": "pie", "data": "pieData" }
```

### Doughnut Chart
```json
{ "type": "doughnut", "data": "doughnutData" }
```

### Radar Chart
```json
{ "type": "radar", "data": "radarData" }
```

## Data Format

Chart data follows the Chart.js data format:

```typescript
{
  labels: string[],
  datasets: Array<{
    label: string,
    data: number[],
    backgroundColor?: string | string[],
    borderColor?: string | string[],
    // ... other Chart.js dataset options
  }>
}
```

## Advanced Options

Pass Chart.js options to customize appearance and behavior:

```json
{
  "type": "Chart",
  "props": {
    "type": "line",
    "data": "metrics",
    "options": {
      "scales": {
        "y": {
          "beginAtZero": true
        }
      },
      "plugins": {
        "title": {
          "display": true,
          "text": "Monthly Metrics"
        }
      }
    }
  }
}
```

## Component Metadata

- **Category**: Data Visualization
- **Icon**: bar-chart-2 (Lucide)
- **Complexity**: Medium
- **Tags**: chart, graph, visualization, data

## Related

- [@punk/component-table](../component-table) - Data tables
- [@punk/component-mermaid](../component-mermaid) - Diagrams and flowcharts
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

## License

MIT
