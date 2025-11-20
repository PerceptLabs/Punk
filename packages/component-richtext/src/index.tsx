/**
 * @punk/component-richtext - Rich Text Editor Component
 * Powerful rich text editing with Lexical
 */

import React, { useEffect } from 'react'
import { z } from 'zod'
import { registerComponent, useDataContext } from '@punk/core'
import type { ComponentMeta } from '@punk/core'

// Lexical imports
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical'

// 1. Zod Schema (for SynthPunk)
export const RichTextPropsSchema = z.object({
  content: z.string().default(''),
  editable: z.boolean().default(true),
  placeholder: z.string().default('Enter text...'),
  data: z.string().optional(),
})

export const RichTextSchemaMap = {
  RichText: RichTextPropsSchema,
}

// 2. Metadata (for Mohawk)
export const RichTextMeta: ComponentMeta = {
  displayName: 'Rich Text Editor',
  description: 'Powerful rich text editing with Lexical',
  icon: 'file-text',
  category: 'Content',
  tags: ['editor', 'text', 'richtext'],
  complexity: 'advanced',
}

// Content initializer plugin
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (content) {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(content))
        root.append(paragraph)
      })
    }
  }, [content, editor])

  return null
}

// 3. Component (renderer-agnostic)
export function RichText({
  content,
  editable,
  placeholder,
  data,
}: z.infer<typeof RichTextPropsSchema>) {
  const dataContext = useDataContext()

  // Resolve content from data context if data path provided
  const resolvedContent = data && dataContext[data] ? String(dataContext[data]) : content

  const initialConfig = {
    namespace: 'PunkRichText',
    theme: {
      paragraph: 'punk-richtext-paragraph',
      text: {
        bold: 'punk-richtext-bold',
        italic: 'punk-richtext-italic',
        underline: 'punk-richtext-underline',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    editable,
  }

  return (
    <div className="punk-richtext-wrapper" style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px',
      minHeight: '150px',
    }}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="punk-richtext-editor"
              style={{
                outline: 'none',
                minHeight: '100px',
              }}
            />
          }
          placeholder={
            <div
              className="punk-richtext-placeholder"
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                color: '#999',
                pointerEvents: 'none',
              }}
            >
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={(editorState) => {
          // You can emit onChange events here via ActionBus if needed
        }} />
        <InitialContentPlugin content={resolvedContent} />
      </LexicalComposer>
    </div>
  )
}

// Auto-register on import
registerComponent('RichText', RichText, {
  schema: RichTextPropsSchema,
  meta: RichTextMeta,
})
