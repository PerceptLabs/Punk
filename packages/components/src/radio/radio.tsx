import * as React from 'react';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';

export interface RadioOption {
  /**
   * Option value
   */
  value: string;

  /**
   * Option label
   */
  label: React.ReactNode;

  /**
   * Option description
   */
  description?: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface RadioProps {
  /**
   * Field name
   */
  name?: string;

  /**
   * Selected value
   */
  value?: string;

  /**
   * Default selected value
   */
  defaultValue?: string;

  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Radio options
   */
  options: RadioOption[];

  /**
   * Disabled state for entire group
   */
  disabled?: boolean;

  /**
   * Required state
   */
  required?: boolean;

  /**
   * Accessibility label for the group
   */
  'aria-label'?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Item wrapper CSS classes
   */
  itemClassName?: string;

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
 * Radio indicator icon
 */
const RadioIndicator = () => (
  <div className="punk-radio-indicator-dot" aria-hidden />
);

/**
 * Radio component - Single-selection from multiple options
 *
 * Built on @radix-ui/react-radio-group with full ARIA support
 *
 * @example
 * ```tsx
 * <Radio
 *   name="plan"
 *   value={selectedPlan}
 *   onValueChange={setSelectedPlan}
 *   options={[
 *     { value: 'free', label: 'Free Plan' },
 *     { value: 'pro', label: 'Pro Plan' },
 *   ]}
 * />
 * ```
 */
export const Radio = React.forwardRef<HTMLDivElement, RadioProps>(
  (
    {
      name,
      value,
      defaultValue,
      onValueChange,
      options,
      disabled = false,
      required = false,
      'aria-label': ariaLabel,
      className,
      itemClassName,
      labelClassName,
      descriptionClassName,
    },
    ref
  ) => {
    return (
      <RadixRadioGroup.Root
        ref={ref}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        className={`punk-radio-group ${className || ''}`}
      >
        {options.map((option) => {
          const itemId = `radio-${name}-${option.value}`;

          return (
            <div
              key={option.value}
              className={`punk-radio-item ${itemClassName || ''}`}
            >
              <RadixRadioGroup.Item
                value={option.value}
                id={itemId}
                disabled={option.disabled}
                className="punk-radio"
              >
                <RadixRadioGroup.Indicator className="punk-radio-indicator">
                  <RadioIndicator />
                </RadixRadioGroup.Indicator>
              </RadixRadioGroup.Item>
              <div className="punk-radio-label-group">
                <label
                  htmlFor={itemId}
                  className={`punk-radio-label ${labelClassName || ''}`}
                >
                  {option.label}
                </label>
                {option.description && (
                  <div
                    className={`punk-radio-description ${descriptionClassName || ''}`}
                  >
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </RadixRadioGroup.Root>
    );
  }
);

Radio.displayName = 'Radio';

// Re-export Radix primitives
export const RadioGroupRoot = RadixRadioGroup.Root;
export const RadioGroupItem = RadixRadioGroup.Item;
export const RadioGroupIndicator = RadixRadioGroup.Indicator;
