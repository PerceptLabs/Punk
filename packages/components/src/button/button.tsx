import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /**
   * Size of the button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color tone (for theming)
   */
  tone?: 'accent' | 'neutral' | 'destructive';

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Button component - Native HTML button with Punk styling
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      tone = 'accent',
      disabled = false,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = [
      'punk-button',
      `punk-button-${variant}`,
      `punk-button-${size}`,
      `punk-button-${tone}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
