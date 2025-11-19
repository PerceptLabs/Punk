import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../dialog';

describe('Dialog', () => {
  it('renders when open', () => {
    render(
      <Dialog open={true} title="Test Dialog">
        <div>Dialog content</div>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Dialog open={false} title="Test Dialog">
        <div>Dialog content</div>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <Dialog open={true} title="Test Dialog" description="Test description">
        <div>Content</div>
      </Dialog>
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <Dialog open={true} onOpenChange={handleOpenChange} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    );

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('has proper ARIA attributes', () => {
    render(
      <Dialog open={true} title="Test Dialog" description="Description">
        <div>Content</div>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('applies size class', () => {
    render(
      <Dialog open={true} title="Test" size="lg">
        <div>Content</div>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('punk-dialog-lg');
  });
});
