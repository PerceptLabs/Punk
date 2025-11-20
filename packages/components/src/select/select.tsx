import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';

export interface SelectOption {
  /**
   * Option value
   */
  value: string;

  /**
   * Option label
   */
  label: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface SelectGroup {
  /**
   * Group label
   */
  label: string;

  /**
   * Group options
   */
  items: SelectOption[];
}

export interface SelectProps {
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
   * Select options (flat array or grouped)
   */
  options: SelectOption[] | SelectGroup[];

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Required state
   */
  required?: boolean;

  /**
   * Accessibility label
   */
  'aria-label'?: string;

  /**
   * Additional CSS classes for trigger
   */
  className?: string;

  /**
   * Additional CSS classes for content
   */
  contentClassName?: string;

  /**
   * Show scroll buttons
   */
  showScrollButtons?: boolean;
}

/**
 * Chevron down icon
 */
const ChevronDownIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Check icon for selected item
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
 * Check if options are grouped
 */
function isGrouped(
  options: SelectOption[] | SelectGroup[]
): options is SelectGroup[] {
  return options.length > 0 && 'items' in options[0];
}

/**
 * Select component - Dropdown selection list
 *
 * Built on @radix-ui/react-select with full ARIA support
 *
 * @example
 * ```tsx
 * <Select
 *   name="country"
 *   value={country}
 *   onValueChange={setCountry}
 *   placeholder="Select a country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      name,
      value,
      defaultValue,
      onValueChange,
      options,
      placeholder = 'Select an option',
      disabled = false,
      required = false,
      'aria-label': ariaLabel,
      className,
      contentClassName,
      showScrollButtons = true,
    },
    ref
  ) => {
    const grouped = isGrouped(options);

    return (
      <RadixSelect.Root
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <RadixSelect.Trigger
          ref={ref}
          aria-label={ariaLabel}
          className={`punk-select-trigger ${className || ''}`}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className="punk-select-icon">
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className={`punk-select-content ${contentClassName || ''}`}
          >
            {showScrollButtons && (
              <RadixSelect.ScrollUpButton className="punk-select-scroll-button">
                ▲
              </RadixSelect.ScrollUpButton>
            )}

            <RadixSelect.Viewport className="punk-select-viewport">
              {grouped ? (
                // Render grouped options
                (options as SelectGroup[]).map((group) => (
                  <RadixSelect.Group key={group.label}>
                    <RadixSelect.Label className="punk-select-group-label">
                      {group.label}
                    </RadixSelect.Label>
                    {group.items.map((option) => (
                      <RadixSelect.Item
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className="punk-select-item"
                      >
                        <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                        <RadixSelect.ItemIndicator className="punk-select-item-indicator">
                          <CheckIcon />
                        </RadixSelect.ItemIndicator>
                      </RadixSelect.Item>
                    ))}
                  </RadixSelect.Group>
                ))
              ) : (
                // Render flat options
                (options as SelectOption[]).map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="punk-select-item"
                  >
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className="punk-select-item-indicator">
                      <CheckIcon />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))
              )}
            </RadixSelect.Viewport>

            {showScrollButtons && (
              <RadixSelect.ScrollDownButton className="punk-select-scroll-button">
                ▼
              </RadixSelect.ScrollDownButton>
            )}
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    );
  }
);

Select.displayName = 'Select';

// Re-export Radix primitives
export const SelectRoot = RadixSelect.Root;
export const SelectTrigger = RadixSelect.Trigger;
export const SelectValue = RadixSelect.Value;
export const SelectIcon = RadixSelect.Icon;
export const SelectPortal = RadixSelect.Portal;
export const SelectContent = RadixSelect.Content;
export const SelectViewport = RadixSelect.Viewport;
export const SelectGroup = RadixSelect.Group;
export const SelectLabel = RadixSelect.Label;
export const SelectItem = RadixSelect.Item;
export const SelectItemText = RadixSelect.ItemText;
export const SelectItemIndicator = RadixSelect.ItemIndicator;
export const SelectScrollUpButton = RadixSelect.ScrollUpButton;
export const SelectScrollDownButton = RadixSelect.ScrollDownButton;
export const SelectSeparator = RadixSelect.Separator;
