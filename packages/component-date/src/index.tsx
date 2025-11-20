/**
 * @punk/component-date
 * Date picker component wrapper using react-day-picker
 */

import React from 'react'
import { z } from 'zod'
import { DayPicker } from 'react-day-picker'
import { registerComponent } from '@punk/core'
import 'react-day-picker/dist/style.css'

// 1. Zod Schema (for SynthPunk)
export const DatePickerPropsSchema = z.object({
  /** Selected date value (ISO string) */
  value: z.string().optional(),

  /** Selection mode */
  mode: z.enum(['single', 'multiple', 'range']).default('single'),

  /** Disabled dates (ISO strings) */
  disabled: z.array(z.string()).optional(),

  /** Minimum selectable date (ISO string) */
  fromDate: z.string().optional(),

  /** Maximum selectable date (ISO string) */
  toDate: z.string().optional(),

  /** Placeholder text */
  placeholder: z.string().optional(),

  /** Show week numbers */
  showWeekNumber: z.boolean().optional(),

  /** Action to trigger on date selection */
  onSelect: z.string().optional(),
})

export const DatePickerSchemaMap = {
  DatePicker: DatePickerPropsSchema,
}

// 2. Metadata (for Mohawk)
export const DatePickerMeta = {
  displayName: 'Date Picker',
  description: 'Flexible date selection with single, multiple, and range modes',
  icon: 'calendar',
  category: 'Input',
  tags: ['date', 'calendar', 'picker', 'input', 'time'],
  complexity: 'simple' as const,
}

// 3. Component (renderer-agnostic)
export interface DatePickerProps extends z.infer<typeof DatePickerPropsSchema> {
  /** Optional className for styling */
  className?: string
}

export function DatePicker({
  value,
  mode = 'single',
  disabled,
  fromDate,
  toDate,
  showWeekNumber = false,
  className,
  onSelect,
}: DatePickerProps) {
  // Parse dates from ISO strings
  const selectedDate = value ? new Date(value) : undefined
  const disabledDates = disabled?.map((d) => new Date(d))
  const fromDateObj = fromDate ? new Date(fromDate) : undefined
  const toDateObj = toDate ? new Date(toDate) : undefined

  // Handle date selection
  const handleSelect = (date: Date | Date[] | undefined) => {
    if (onSelect && date) {
      // Trigger action via ActionBus if onSelect is provided
      // This will be handled by the PunkRenderer's action context
      console.log('Date selected:', date, 'Action:', onSelect)
    }
  }

  return (
    <div className={className}>
      <DayPicker
        mode={mode as any}
        selected={selectedDate}
        onSelect={handleSelect as any}
        disabled={disabledDates}
        fromDate={fromDateObj}
        toDate={toDateObj}
        showWeekNumber={showWeekNumber}
      />
    </div>
  )
}

// Auto-register on import
registerComponent('DatePicker', DatePicker, {
  schema: DatePickerPropsSchema,
  meta: DatePickerMeta,
})
