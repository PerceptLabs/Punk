import * as React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';

export interface AccordionItem {
  /**
   * Unique value for the item
   */
  value: string;

  /**
   * Item title/header
   */
  title: React.ReactNode;

  /**
   * Item content
   */
  content: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface AccordionProps {
  /**
   * Accordion type - single or multiple items open
   */
  type: 'single' | 'multiple';

  /**
   * Array of accordion items
   */
  items: AccordionItem[];

  /**
   * Can all items be closed (single mode only)
   */
  collapsible?: boolean;

  /**
   * Default open value(s)
   */
  defaultValue?: string | string[];

  /**
   * Controlled value(s)
   */
  value?: string | string[];

  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | string[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Item CSS classes
   */
  itemClassName?: string;

  /**
   * Trigger CSS classes
   */
  triggerClassName?: string;

  /**
   * Content CSS classes
   */
  contentClassName?: string;
}

/**
 * Accordion component - Collapsible sections for FAQs, settings, and grouped content
 *
 * Built on @radix-ui/react-accordion with full ARIA support
 *
 * @example
 * ```tsx
 * <Accordion
 *   type="single"
 *   collapsible
 *   items={[
 *     { value: 'item-1', title: 'Section 1', content: 'Content 1' },
 *     { value: 'item-2', title: 'Section 2', content: 'Content 2' },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  type,
  items,
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
}: AccordionProps) {
  const rootProps =
    type === 'single'
      ? {
          type: 'single' as const,
          collapsible,
          defaultValue: defaultValue as string | undefined,
          value: value as string | undefined,
          onValueChange: onValueChange as ((value: string) => void) | undefined,
        }
      : {
          type: 'multiple' as const,
          defaultValue: defaultValue as string[] | undefined,
          value: value as string[] | undefined,
          onValueChange: onValueChange as ((value: string[]) => void) | undefined,
        };

  return (
    <RadixAccordion.Root
      {...rootProps}
      className={`punk-accordion ${className || ''}`}
    >
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={`punk-accordion-item ${itemClassName || ''}`}
        >
          <RadixAccordion.Header className="punk-accordion-header">
            <RadixAccordion.Trigger
              className={`punk-accordion-trigger ${triggerClassName || ''}`}
            >
              <span className="punk-accordion-trigger-text">{item.title}</span>
              <span className="punk-accordion-trigger-icon" aria-hidden>
                ▼
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content
            className={`punk-accordion-content ${contentClassName || ''}`}
          >
            <div className="punk-accordion-content-inner">{item.content}</div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}

// Re-export Radix primitives for compound component pattern
export const AccordionRoot = RadixAccordion.Root;
export const AccordionItem = RadixAccordion.Item;
export const AccordionHeader = RadixAccordion.Header;
export const AccordionTrigger = RadixAccordion.Trigger;
export const AccordionContent = RadixAccordion.Content;
