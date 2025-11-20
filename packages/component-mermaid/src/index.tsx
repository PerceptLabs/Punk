/**
 * @punk/component-mermaid
 * Mermaid diagram wrapper for Punk Framework
 */

import React, { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { registerComponent } from '@punk/core'
import mermaid from 'mermaid'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

// 1. Zod Schema (for SynthPunk)
export const MermaidPropsSchema = z.object({
  diagram: z.string().describe('Mermaid diagram syntax'),
  theme: z.enum(['default', 'dark', 'forest', 'neutral']).optional().default('default'),
})

export const MermaidSchemaMap = {
  Mermaid: MermaidPropsSchema,
}

export type MermaidProps = z.infer<typeof MermaidPropsSchema>

// 2. Metadata (for Mohawk)
export const MermaidMeta = {
  displayName: 'Mermaid Diagram',
  description: 'Flowcharts and diagrams from text',
  icon: 'git-graph',
  category: 'Data Visualization',
  tags: ['diagram', 'flowchart', 'mermaid', 'visualization'],
  complexity: 'simple' as const,
}

// 3. Component (renderer-agnostic)
export function Mermaid({ diagram, theme = 'default' }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagram || !containerRef.current) return

      try {
        // Update mermaid theme
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'loose',
        })

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render diagram
        const { svg: renderedSvg } = await mermaid.render(id, diagram)
        setSvg(renderedSvg)
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setSvg('')
      }
    }

    renderDiagram()
  }, [diagram, theme])

  if (error) {
    return (
      <div
        className="punk-mermaid-error"
        style={{
          padding: '16px',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
        }}
      >
        <strong>Mermaid Error:</strong>
        <pre style={{ marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{error}</pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="punk-mermaid-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// Auto-register on import
registerComponent('Mermaid', Mermaid, {
  schema: MermaidPropsSchema,
  meta: MermaidMeta,
})

// Export everything
export default Mermaid
