import * as React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';

export interface SwitchProps {
  /**
   * Field name
   */
  name?: string;

  /**
   * Checked state
   */
  checked?: boolean;

  /**
   * Default checked state
   */
  defaultChecked?: boolean;

  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Required state
   */
  required?: boolean;

  /**
   * Visible label
   */
  label?: React.ReactNode;

  /**
   * Description text
   */
  description?: React.ReactNode;

  /**
   * Accessibility label (required if no visible label)
   */
  'aria-label'?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Label CSS classes
   */
  labelClassName?: string;

  /**
   * Description CSS classes
   */
  descriptionClassName?: string;
}

/**
 * Switch component - Toggle switch for binary states
 *
 * Built on @radix-ui/react-switch with full ARIA support
 *
 * @example
 * ```tsx
 * <Switch
 *   name="notifications"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   label="Enable notifications"
 *   description="Receive email updates"
 * />
 * ```
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      name,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      required = false,
      label,
      description,
      'aria-label': ariaLabel,
      className,
      labelClassName,
      descriptionClassName,
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <div className="punk-switch-wrapper">
        <RadixSwitch.Root
          ref={ref}
          id={id}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          className={`punk-switch ${className || ''}`}
        >
          <RadixSwitch.Thumb className="punk-switch-thumb" />
        </RadixSwitch.Root>
        {(label || description) && (
          <div className="punk-switch-label-group">
            {label && (
              <label
                htmlFor={id}
                className={`punk-switch-label ${labelClassName || ''}`}
              >
                {label}
              </label>
            )}
            {description && (
              <div
                className={`punk-switch-description ${descriptionClassName || ''}`}
              >
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// Re-export Radix primitives
export const SwitchRoot = RadixSwitch.Root;
export const SwitchThumb = RadixSwitch.Thumb;
