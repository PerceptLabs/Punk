import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../tabs';

describe('Tabs', () => {
  const tabs = [
    { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
  ];

  it('renders all tab triggers', () => {
    render(<Tabs tabs={tabs} defaultValue="tab1" />);

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
  });

  it('shows default tab content', () => {
    render(<Tabs tabs={tabs} defaultValue="tab1" />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultValue="tab1" />);

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onValueChange when tab changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Tabs tabs={tabs} defaultValue="tab1" onValueChange={handleChange} />);

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('has proper ARIA attributes', () => {
    render(<Tabs tabs={tabs} defaultValue="tab1" ariaLabel="Navigation tabs" />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Navigation tabs');
  });

  it('marks selected tab as selected', () => {
    render(<Tabs tabs={tabs} defaultValue="tab2" />);
    const selectedTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(selectedTab).toHaveAttribute('data-state', 'active');
  });

  it('supports vertical orientation', () => {
    render(<Tabs tabs={tabs} defaultValue="tab1" orientation="vertical" />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('can disable individual tabs', () => {
    const tabsWithDisabled = [
      ...tabs,
      { value: 'tab4', label: 'Disabled', content: <div>Content 4</div>, disabled: true },
    ];

    render(<Tabs tabs={tabsWithDisabled} defaultValue="tab1" />);
    expect(screen.getByRole('tab', { name: 'Disabled' })).toBeDisabled();
  });
});
