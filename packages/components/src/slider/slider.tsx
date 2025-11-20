import * as React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

export interface SliderProps {
  /**
   * Field name
   */
  name?: string;

  /**
   * Current value(s)
   */
  value?: number[];

  /**
   * Default value(s)
   */
  defaultValue?: number[];

  /**
   * Callback when value changes
   */
  onValueChange?: (value: number[]) => void;

  /**
   * Callback when value commits (on mouse up)
   */
  onValueCommit?: (value: number[]) => void;

  /**
   * Minimum value
   */
  min?: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Step increment
   */
  step?: number;

  /**
   * Minimum distance between thumbs (for range sliders)
   */
  minStepsBetweenThumbs?: number;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Direction (for RTL support)
   */
  dir?: 'ltr' | 'rtl';

  /**
   * Invert the slider direction
   */
  inverted?: boolean;

  /**
   * Accessibility label
   */
  'aria-label'?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Track CSS classes
   */
  trackClassName?: string;

  /**
   * Range CSS classes
   */
  rangeClassName?: string;

  /**
   * Thumb CSS classes
   */
  thumbClassName?: string;

  /**
   * Show value labels
   */
  showValue?: boolean;

  /**
   * Format value for display
   */
  formatValue?: (value: number) => string;
}

/**
 * Slider component - Range slider for numeric input
 *
 * Built on @radix-ui/react-slider with full ARIA support
 *
 * @example
 * ```tsx
 * // Single value slider
 * <Slider
 *   value={[volume]}
 *   onValueChange={(val) => setVolume(val[0])}
 *   min={0}
 *   max={100}
 *   step={5}
 * />
 *
 * // Range slider
 * <Slider
 *   value={[minPrice, maxPrice]}
 *   onValueChange={(val) => setPriceRange(val)}
 *   min={0}
 *   max={1000}
 * />
 * ```
 */
export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  (
    {
      name,
      value,
      defaultValue = [0],
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      minStepsBetweenThumbs,
      disabled = false,
      orientation = 'horizontal',
      dir = 'ltr',
      inverted = false,
      'aria-label': ariaLabel,
      className,
      trackClassName,
      rangeClassName,
      thumbClassName,
      showValue = false,
      formatValue = (val) => String(val),
    },
    ref
  ) => {
    const currentValue = value || defaultValue;

    return (
      <div className={`punk-slider-wrapper punk-slider-${orientation}`}>
        <RadixSlider.Root
          ref={ref}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
          min={min}
          max={max}
          step={step}
          minStepsBetweenThumbs={minStepsBetweenThumbs}
          disabled={disabled}
          orientation={orientation}
          dir={dir}
          inverted={inverted}
          aria-label={ariaLabel}
          className={`punk-slider ${className || ''}`}
        >
          <RadixSlider.Track
            className={`punk-slider-track ${trackClassName || ''}`}
          >
            <RadixSlider.Range
              className={`punk-slider-range ${rangeClassName || ''}`}
            />
          </RadixSlider.Track>
          {currentValue.map((_, index) => (
            <RadixSlider.Thumb
              key={index}
              className={`punk-slider-thumb ${thumbClassName || ''}`}
              aria-label={
                currentValue.length > 1
                  ? `${ariaLabel || 'Slider'} thumb ${index + 1}`
                  : ariaLabel
              }
            >
              {showValue && (
                <div className="punk-slider-value">
                  {formatValue(currentValue[index])}
                </div>
              )}
            </RadixSlider.Thumb>
          ))}
        </RadixSlider.Root>
        {showValue && (
          <div className="punk-slider-labels">
            <span className="punk-slider-label-min">{formatValue(min)}</span>
            <span className="punk-slider-label-max">{formatValue(max)}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// Re-export Radix primitives
export const SliderRoot = RadixSlider.Root;
export const SliderTrack = RadixSlider.Track;
export const SliderRange = RadixSlider.Range;
export const SliderThumb = RadixSlider.Thumb;
