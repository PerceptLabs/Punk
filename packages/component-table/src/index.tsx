/**
 * @punk/component-table
 * TanStack Table wrapper for Punk Framework
 */

import React, { useMemo } from 'react'
import { z } from 'zod'
import { registerComponent } from '@punk/core'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'

// 1. Zod Schema (for SynthPunk)
export const TablePropsSchema = z.object({
  data: z.string().describe('Data source path from DataContext (array of objects)'),
  columns: z
    .array(
      z.object({
        accessorKey: z.string().describe('Property key to access in data'),
        header: z.string().describe('Column header text'),
        cell: z.string().optional().describe('Custom cell renderer expression'),
      })
    )
    .describe('Column definitions'),
  pagination: z.boolean().optional().default(true),
  sorting: z.boolean().optional().default(true),
  pageSize: z.number().optional().default(10),
})

export const TableSchemaMap = {
  Table: TablePropsSchema,
}

export type TableProps = z.infer<typeof TablePropsSchema>

// 2. Metadata (for Mohawk)
export const TableMeta = {
  displayName: 'Table',
  description: 'Powerful data tables with sorting and pagination',
  icon: 'table',
  category: 'Data Visualization',
  tags: ['table', 'data', 'grid', 'list'],
  complexity: 'medium' as const,
}

// 3. Component (renderer-agnostic)
export function Table({ data, columns, pagination, sorting, pageSize }: TableProps) {
  const [sortingState, setSortingState] = React.useState<SortingState>([])

  // Parse data
  const tableData = useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (e) {
        console.error('Failed to parse table data:', e)
        return []
      }
    }
    return Array.isArray(data) ? data : []
  }, [data])

  // Convert column definitions to TanStack format
  const columnDefs = useMemo<ColumnDef<any>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        cell: col.cell
          ? (info: any) => {
              // Simple expression evaluation
              try {
                return eval(col.cell || '')
              } catch {
                return info.getValue()
              }
            }
          : undefined,
      })),
    [columns]
  )

  const table = useReactTable({
    data: tableData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSortingState,
    state: {
      sorting: sortingState,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className="punk-table-container">
      <div className="punk-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="punk-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #e5e7eb',
                      fontWeight: 600,
                      cursor: sorting ? 'pointer' : 'default',
                    }}
                    onClick={sorting ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {sorting && (
                      <span style={{ marginLeft: '4px' }}>
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '12px',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div
          className="punk-table-pagination"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '8px',
          }}
        >
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
              opacity: table.getCanPreviousPage() ? 1 : 0.5,
            }}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
              opacity: table.getCanPreviousPage() ? 1 : 0.5,
            }}
          >
            {'<'}
          </button>
          <span style={{ padding: '0 8px' }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
              opacity: table.getCanNextPage() ? 1 : 0.5,
            }}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
              opacity: table.getCanNextPage() ? 1 : 0.5,
            }}
          >
            {'>>'}
          </button>
        </div>
      )}
    </div>
  )
}

// Auto-register on import
registerComponent('Table', Table, {
  schema: TablePropsSchema,
  meta: TableMeta,
})

// Export everything
export default Table
