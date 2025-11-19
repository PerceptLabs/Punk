import * as React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

export interface DialogProps {
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
   * Dialog title (required for accessibility)
   */
  title?: React.ReactNode;

  /**
   * Dialog description (required for accessibility)
   */
  description?: React.ReactNode;

  /**
   * Dialog content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Overlay CSS classes
   */
  overlayClassName?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Dialog component - Modal dialogs for confirmations, alerts, and important interactions
 *
 * Built on @radix-ui/react-dialog with full ARIA support
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 * >
 *   <Button onClick={handleConfirm}>Confirm</Button>
 * </Dialog>
 * ```
 */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  className,
  overlayClassName,
  size = 'md',
}: DialogProps) {
  return (
    <RadixDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={`punk-dialog-overlay ${overlayClassName || ''}`}
        />
        <RadixDialog.Content
          className={`punk-dialog-content punk-dialog-${size} ${className || ''}`}
        >
          {title && (
            <RadixDialog.Title className="punk-dialog-title">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="punk-dialog-description">
              {description}
            </RadixDialog.Description>
          )}
          <div className="punk-dialog-body">{children}</div>
          <RadixDialog.Close className="punk-dialog-close" aria-label="Close">
            <span aria-hidden>×</span>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

// Re-export Radix primitives for advanced use cases
export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogOverlay = RadixDialog.Overlay;
export const DialogContent = RadixDialog.Content;
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
export const DialogClose = RadixDialog.Close;
