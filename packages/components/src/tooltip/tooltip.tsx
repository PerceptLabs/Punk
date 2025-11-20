import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

export interface TooltipProps {
  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;

  /**
   * Tooltip content
   */
  content: React.ReactNode;

  /**
   * Side to position tooltip
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Distance from trigger
   */
  sideOffset?: number;

  /**
   * Delay before showing (ms)
   */
  delayDuration?: number;

  /**
   * Controlled open state
   */
  open?: boolean;

  /**
   * Default open state
   */
  defaultOpen?: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;

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
 * Tooltip component - Brief informational tooltips on hover
 *
 * Built on @radix-ui/react-tooltip with full ARIA support
 *
 * @example
 * ```tsx
 * <Tooltip content="Click to submit" side="top">
 *   <Button>Submit</Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  children,
  content,
  side = 'top',
  sideOffset = 5,
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
  showArrow = true,
  className,
  arrowClassName,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={delayDuration}
      >
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={sideOffset}
            className={`punk-tooltip-content ${className || ''}`}
          >
            {content}
            {showArrow && (
              <RadixTooltip.Arrow
                className={`punk-tooltip-arrow ${arrowClassName || ''}`}
              />
            )}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

// Re-export Radix primitives
export const TooltipProvider = RadixTooltip.Provider;
export const TooltipRoot = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;
export const TooltipPortal = RadixTooltip.Portal;
export const TooltipContent = RadixTooltip.Content;
export const TooltipArrow = RadixTooltip.Arrow;
