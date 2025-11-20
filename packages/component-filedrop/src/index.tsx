/**
 * @punk/component-filedrop - File Upload Component
 * Drag and drop file uploads with react-dropzone
 */

import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import { registerComponent, useActionBus } from '@punk/core'
import type { ComponentMeta } from '@punk/core'
import { useDropzone } from 'react-dropzone'

// 1. Zod Schema (for SynthPunk)
export const FileDropPropsSchema = z.object({
  accept: z.string().default('*/*'),
  maxFiles: z.number().default(1),
  maxSize: z.number().default(10485760), // 10MB default
  multiple: z.boolean().default(false),
  onUpload: z.string().optional(), // Action handler name
})

export const FileDropSchemaMap = {
  FileDrop: FileDropPropsSchema,
}

// 2. Metadata (for Mohawk)
export const FileDropMeta: ComponentMeta = {
  displayName: 'File Upload',
  description: 'Drag and drop file uploads',
  icon: 'upload',
  category: 'Input',
  tags: ['upload', 'file', 'drop'],
  complexity: 'simple',
}

// 3. Component (renderer-agnostic)
export function FileDrop({
  accept,
  maxFiles,
  maxSize,
  multiple,
  onUpload,
}: z.infer<typeof FileDropPropsSchema>) {
  const actionBus = useActionBus()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles.map((f) => f.errors.map((e: any) => e.message).join(', '))
        setError(`Upload failed: ${reasons.join('; ')}`)
        return
      }

      if (acceptedFiles.length > 0) {
        setUploadedFiles(acceptedFiles)

        // Trigger action handler if provided
        if (onUpload && actionBus[onUpload]) {
          actionBus[onUpload](acceptedFiles)
        }
      }
    },
    [actionBus, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === '*/*' ? undefined : { [accept]: [] },
    maxFiles,
    maxSize,
    multiple,
  })

  return (
    <div className="punk-filedrop-wrapper">
      <div
        {...getRootProps()}
        className="punk-filedrop-zone"
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
          borderColor: isDragActive ? '#4a90e2' : '#ddd',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ margin: 0, color: '#4a90e2', fontSize: '16px' }}>
            Drop the files here...
          </p>
        ) : (
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
              Drag & drop {multiple ? 'files' : 'a file'} here, or click to select
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              {accept !== '*/*' && `Accepted: ${accept} | `}
              Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              {multiple && ` | Max files: ${maxFiles}`}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          className="punk-filedrop-error"
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="punk-filedrop-files" style={{ marginTop: '12px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
            Uploaded Files:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '14px' }}>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Auto-register on import
registerComponent('FileDrop', FileDrop, {
  schema: FileDropPropsSchema,
  meta: FileDropMeta,
})
