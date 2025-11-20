import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders without visible label but with aria-label', () => {
    render(<Checkbox aria-label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
  });

  it('handles checked state', () => {
    render(<Checkbox checked={true} label="Checked" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('handles unchecked state', () => {
    render(<Checkbox checked={false} label="Unchecked" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Checkbox onCheckedChange={handleChange} label="Click me" />);

    await user.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Checkbox disabled label="Disabled" />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('supports indeterminate state', () => {
    render(<Checkbox checked="indeterminate" label="Indeterminate" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
  });

  it('associates label with checkbox', () => {
    render(<Checkbox label="Click label" />);
    const label = screen.getByText('Click label');
    const checkbox = screen.getByRole('checkbox');
    expect(label).toHaveAttribute('for', checkbox.id);
  });
});
