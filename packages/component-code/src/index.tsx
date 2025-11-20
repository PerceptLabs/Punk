/**
 * @punk/component-code - Code Editor Component
 * Syntax-highlighted code editing with CodeMirror
 */

import React, { useMemo } from 'react'
import { z } from 'zod'
import { registerComponent, useDataContext } from '@punk/core'
import type { ComponentMeta } from '@punk/core'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { go } from '@codemirror/lang-go'
import { rust } from '@codemirror/lang-rust'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

// 1. Zod Schema (for SynthPunk)
export const CodePropsSchema = z.object({
  code: z.string().default(''),
  language: z.enum(['javascript', 'typescript', 'python', 'go', 'rust', 'html', 'css']).default('javascript'),
  theme: z.string().default('light'),
  readOnly: z.boolean().default(false),
  lineNumbers: z.boolean().default(true),
  data: z.string().optional(),
})

export const CodeSchemaMap = {
  Code: CodePropsSchema,
}

// 2. Metadata (for Mohawk)
export const CodeMeta: ComponentMeta = {
  displayName: 'Code Editor',
  description: 'Syntax-highlighted code editing',
  icon: 'code',
  category: 'Content',
  tags: ['code', 'editor', 'syntax'],
  complexity: 'medium',
}

// Language extension mapper
function getLanguageExtension(language: string) {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return javascript({ typescript: language === 'typescript' })
    case 'python':
      return python()
    case 'go':
      return go()
    case 'rust':
      return rust()
    case 'html':
      return html()
    case 'css':
      return css()
    default:
      return javascript()
  }
}

// 3. Component (renderer-agnostic)
export function Code({
  code,
  language,
  theme,
  readOnly,
  lineNumbers,
  data,
}: z.infer<typeof CodePropsSchema>) {
  const dataContext = useDataContext()

  // Resolve code from data context if data path provided
  const resolvedCode = data && dataContext[data] ? String(dataContext[data]) : code

  // Get language extension
  const extensions = useMemo(() => [getLanguageExtension(language)], [language])

  return (
    <div className="punk-code-wrapper" style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      <CodeMirror
        value={resolvedCode}
        theme={theme}
        extensions={extensions}
        editable={!readOnly}
        basicSetup={{
          lineNumbers,
          highlightActiveLineGutter: lineNumbers,
          highlightActiveLine: !readOnly,
          foldGutter: true,
          dropCursor: !readOnly,
          allowMultipleSelections: !readOnly,
          indentOnInput: !readOnly,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: !readOnly,
          autocompletion: !readOnly,
          rectangularSelection: !readOnly,
          crosshairCursor: !readOnly,
          highlightSelectionMatches: !readOnly,
          closeBracketsKeymap: !readOnly,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: !readOnly,
          lintKeymap: true,
        }}
        style={{
          fontSize: '14px',
          fontFamily: 'monospace',
        }}
      />
    </div>
  )
}

// Auto-register on import
registerComponent('Code', Code, {
  schema: CodePropsSchema,
  meta: CodeMeta,
})
