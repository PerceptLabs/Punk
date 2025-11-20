/**
 * @punk/component-chart
 * Chart.js wrapper for Punk Framework
 */

import React, { useMemo } from 'react'
import { z } from 'zod'
import { registerComponent } from '@punk/core'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

// 1. Zod Schema (for SynthPunk)
export const ChartPropsSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'doughnut', 'radar']).default('bar'),
  data: z.string().describe('Data source path from DataContext'),
  options: z.record(z.any()).optional().describe('Chart.js options object'),
  height: z.number().optional().default(300),
  width: z.number().optional(),
})

export const ChartSchemaMap = {
  Chart: ChartPropsSchema,
}

export type ChartProps = z.infer<typeof ChartPropsSchema>

// 2. Metadata (for Mohawk)
export const ChartMeta = {
  displayName: 'Chart',
  description: 'Interactive data visualization with Chart.js',
  icon: 'bar-chart-2',
  category: 'Data Visualization',
  tags: ['chart', 'graph', 'visualization', 'data'],
  complexity: 'medium' as const,
}

// 3. Component (renderer-agnostic)
export function Chart({ type, data, options, height, width }: ChartProps) {
  // Parse data - if it's a string, assume it's JSON
  const chartData = useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse chart data:', e)
        return {
          labels: [],
          datasets: [],
        }
      }
    }
    return data
  }, [data])

  const chartOptions: ChartOptions<any> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      ...options,
    }),
    [options]
  )

  const commonProps = {
    data: chartData,
    options: chartOptions,
    height,
    width,
  }

  // Render appropriate chart type
  switch (type) {
    case 'line':
      return <Line {...commonProps} />
    case 'pie':
      return <Pie {...commonProps} />
    case 'doughnut':
      return <Doughnut {...commonProps} />
    case 'radar':
      return <Radar {...commonProps} />
    case 'bar':
    default:
      return <Bar {...commonProps} />
  }
}

// Auto-register on import
registerComponent('Chart', Chart, {
  schema: ChartPropsSchema,
  meta: ChartMeta,
})

// Export everything
export default Chart
