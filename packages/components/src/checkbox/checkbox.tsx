import * as React from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';

export interface CheckboxProps {
  /**
   * Field name
   */
  name?: string;

  /**
   * Checked state
   */
  checked?: boolean | 'indeterminate';

  /**
   * Default checked state
   */
  defaultChecked?: boolean;

  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;

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
   * Custom indicator icon
   */
  indicator?: React.ReactNode;
}

/**
 * Default check indicator icon
 */
const CheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Indeterminate indicator icon
 */
const IndeterminateIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.5 7.5C3.5 7.22386 3.72386 7 4 7H11C11.2761 7 11.5 7.22386 11.5 7.5C11.5 7.77614 11.2761 8 11 8H4C3.72386 8 3.5 7.77614 3.5 7.5Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Checkbox component - Single or multiple checkboxes for boolean selections
 *
 * Built on @radix-ui/react-checkbox with full ARIA support
 *
 * @example
 * ```tsx
 * <Checkbox
 *   name="agree"
 *   label="I agree to terms and conditions"
 *   checked={agreed}
 *   onCheckedChange={setAgreed}
 * />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      name,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      required = false,
      label,
      'aria-label': ariaLabel,
      className,
      labelClassName,
      indicator,
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <div className="punk-checkbox-wrapper">
        <RadixCheckbox.Root
          ref={ref}
          id={id}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          className={`punk-checkbox ${className || ''}`}
        >
          <RadixCheckbox.Indicator className="punk-checkbox-indicator">
            {indicator !== undefined ? (
              indicator
            ) : checked === 'indeterminate' ? (
              <IndeterminateIcon />
            ) : (
              <CheckIcon />
            )}
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {label && (
          <label
            htmlFor={id}
            className={`punk-checkbox-label ${labelClassName || ''}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Re-export Radix primitives
export const CheckboxRoot = RadixCheckbox.Root;
export const CheckboxIndicator = RadixCheckbox.Indicator;
