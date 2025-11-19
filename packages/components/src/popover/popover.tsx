import * as React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

export interface PopoverProps {
  /**
   * Controlled open state
   */
  open?: boolean;

  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Trigger element
   */
  trigger: React.ReactNode;

  /**
   * Popover content
   */
  content: React.ReactNode;

  /**
   * Alignment relative to trigger
   */
  align?: 'start' | 'center' | 'end';

  /**
   * Side to position popover
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Distance from trigger
   */
  sideOffset?: number;

  /**
   * Alignment offset
   */
  alignOffset?: number;

  /**
   * Show arrow
   */
  showArrow?: boolean;

  /**
   * Additional CSS classes for content
   */
  className?: string;

  /**
   * Additional CSS classes for arrow
   */
  arrowClassName?: string;
}

/**
 * Popover component - Floating panels for menus, filters, and contextual information
 *
 * Built on @radix-ui/react-popover with full ARIA support
 *
 * @example
 * ```tsx
 * <Popover
 *   trigger={<Button>Open Menu</Button>}
 *   content={<div>Popover content</div>}
 *   side="bottom"
 *   align="start"
 * />
 * ```
 */
export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  content,
  align = 'center',
  side = 'bottom',
  sideOffset = 5,
  alignOffset = 0,
  showArrow = true,
  className,
  arrowClassName,
}: PopoverProps) {
  return (
    <RadixPopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={`punk-popover-content ${className || ''}`}
        >
          {content}
          {showArrow && (
            <RadixPopover.Arrow
              className={`punk-popover-arrow ${arrowClassName || ''}`}
            />
          )}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

// Re-export Radix primitives for compound component pattern
export const PopoverRoot = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverPortal = RadixPopover.Portal;
export const PopoverContent = RadixPopover.Content;
export const PopoverArrow = RadixPopover.Arrow;
export const PopoverClose = RadixPopover.Close;
export const PopoverAnchor = RadixPopover.Anchor;
