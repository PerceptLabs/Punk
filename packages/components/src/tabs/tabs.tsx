import * as React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';

export interface TabItem {
  /**
   * Unique value for the tab
   */
  value: string;

  /**
   * Tab label
   */
  label: React.ReactNode;

  /**
   * Tab content
   */
  content: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface TabsProps {
  /**
   * Array of tab items
   */
  tabs: TabItem[];

  /**
   * Default active tab
   */
  defaultValue?: string;

  /**
   * Controlled active tab
   */
  value?: string;

  /**
   * Callback when tab changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Tab list CSS classes
   */
  listClassName?: string;

  /**
   * Tab trigger CSS classes
   */
  triggerClassName?: string;

  /**
   * Tab content CSS classes
   */
  contentClassName?: string;

  /**
   * Accessibility label for tab list
   */
  ariaLabel?: string;
}

/**
 * Tabs component - Tabbed interfaces for organizing content into logical sections
 *
 * Built on @radix-ui/react-tabs with full ARIA support
 *
 * @example
 * ```tsx
 * <Tabs
 *   defaultValue="tab1"
 *   tabs={[
 *     { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *     { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
 *   ]}
 * />
 * ```
 */
export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  ariaLabel = 'Content tabs',
}: TabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={`punk-tabs punk-tabs-${orientation} ${className || ''}`}
    >
      <RadixTabs.List
        className={`punk-tabs-list ${listClassName || ''}`}
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={`punk-tabs-trigger ${triggerClassName || ''}`}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          className={`punk-tabs-content ${contentClassName || ''}`}
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

// Re-export Radix primitives for compound component pattern
export const TabsRoot = RadixTabs.Root;
export const TabsList = RadixTabs.List;
export const TabsTrigger = RadixTabs.Trigger;
export const TabsContent = RadixTabs.Content;
