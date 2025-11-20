/**
 * @punk/core - Renderer Tests
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PunkRenderer, useDataContext, useActionBus } from '../renderer'
import { ComponentRegistry } from '../registry'
import type { PunkNode, PunkSchema } from '../types'

// Mock components for testing
const MockText = ({ children, ...props }: any) => <span {...props}>{children}</span>
const MockContainer = ({ children, ...props }: any) => <div {...props}>{children}</div>
const MockButton = ({ children, onClick, ...props }: any) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
)

describe('PunkRenderer', () => {
  it('should render a simple node', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      props: {
        children: 'Hello World',
      },
    }

    render(<PunkRenderer schema={node} registry={registry} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should render nested children', () => {
    const registry = new ComponentRegistry()
    registry.register('container', MockContainer)
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'container',
      children: [
        {
          type: 'text',
          props: { children: 'Child 1' },
        },
        {
          type: 'text',
          props: { children: 'Child 2' },
        },
      ],
    }

    render(<PunkRenderer schema={node} registry={registry} />)
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('should interpolate data in props', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      props: {
        children: 'Hello {{user.name}}',
      },
    }

    const data = {
      user: { name: 'Alice' },
    }

    render(<PunkRenderer schema={node} data={data} registry={registry} />)
    expect(screen.getByText('Hello Alice')).toBeInTheDocument()
  })

  it('should bind action handlers', () => {
    const registry = new ComponentRegistry()
    registry.register('button', MockButton)

    const handleClick = vi.fn()

    const node: PunkNode = {
      type: 'button',
      props: {
        children: 'Click Me',
        onClick: 'handleClick',
      },
    }

    render(
      <PunkRenderer
        schema={node}
        actions={{ handleClick }}
        registry={registry}
      />
    )

    const button = screen.getByText('Click Me')
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render full PunkSchema', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const schema: PunkSchema = {
      punkVersion: '1.0.0',
      schemaVersion: '1.0.0',
      root: {
        type: 'text',
        props: {
          children: 'From schema',
        },
      },
    }

    render(<PunkRenderer schema={schema} registry={registry} />)
    expect(screen.getByText('From schema')).toBeInTheDocument()
  })

  it('should render array of nodes', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const nodes: PunkNode[] = [
      { type: 'text', props: { children: 'First' } },
      { type: 'text', props: { children: 'Second' } },
    ]

    render(<PunkRenderer schema={nodes} registry={registry} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('should apply testId prop', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      testId: 'my-text',
      props: {
        children: 'Test',
      },
    }

    render(<PunkRenderer schema={node} registry={registry} />)
    expect(screen.getByTestId('my-text')).toBeInTheDocument()
  })

  it('should apply className prop', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      className: 'custom-class',
      props: {
        children: 'Test',
      },
    }

    const { container } = render(<PunkRenderer schema={node} registry={registry} />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should apply style prop', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      style: {
        color: 'red',
        fontSize: 20,
      },
      props: {
        children: 'Styled',
      },
    }

    const { container } = render(<PunkRenderer schema={node} registry={registry} />)
    const element = container.querySelector('span')
    expect(element).toHaveStyle({ color: 'red', fontSize: '20px' })
  })

  it('should handle unknown component types', () => {
    const registry = new ComponentRegistry()

    const node: PunkNode = {
      type: 'unknown-component',
      props: {},
    }

    render(<PunkRenderer schema={node} registry={registry} />)
    expect(screen.getByText(/Unknown component: unknown-component/)).toBeInTheDocument()
  })

  it('should handle conditional rendering', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'text',
      condition: 'user.isLoggedIn',
      props: {
        children: 'Welcome',
      },
    }

    const { rerender } = render(
      <PunkRenderer
        schema={node}
        data={{ user: { isLoggedIn: true } }}
        registry={registry}
      />
    )
    expect(screen.getByText('Welcome')).toBeInTheDocument()

    rerender(
      <PunkRenderer
        schema={node}
        data={{ user: { isLoggedIn: false } }}
        registry={registry}
      />
    )
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument()
  })

  it('should render lists from dataSource', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockText)

    const node: PunkNode = {
      type: 'list',
      dataSource: 'items',
      itemTemplate: {
        type: 'text',
        props: {
          children: '{{item.title}}',
        },
      },
    }

    const data = {
      items: [
        { id: 1, title: 'Item 1' },
        { id: 2, title: 'Item 2' },
        { id: 3, title: 'Item 3' },
      ],
    }

    render(<PunkRenderer schema={node} data={data} registry={registry} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('should show error for invalid schema', () => {
    const registry = new ComponentRegistry()

    const invalid = {
      type: '', // Invalid - empty type
    }

    render(<PunkRenderer schema={invalid as any} registry={registry} />)
    expect(screen.getByText(/Rendering Error/)).toBeInTheDocument()
  })

  it('should call onError for validation failures', () => {
    const registry = new ComponentRegistry()
    const onError = vi.fn()

    const invalid = {
      type: '',
    }

    render(
      <PunkRenderer
        schema={invalid as any}
        registry={registry}
        onError={onError}
      />
    )

    expect(onError).toHaveBeenCalled()
  })

  it('should prevent excessive nesting', () => {
    const registry = new ComponentRegistry()
    registry.register('container', MockContainer)

    // Create deeply nested structure
    let deepNode: PunkNode = { type: 'container', props: {} }
    for (let i = 0; i < 105; i++) {
      deepNode = {
        type: 'container',
        children: [deepNode],
      }
    }

    // Should render but stop at max depth
    const { container } = render(
      <PunkRenderer schema={deepNode} registry={registry} />
    )
    // Should still render outer containers
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})

describe('useDataContext', () => {
  it('should provide data context to components', () => {
    const TestComponent = () => {
      const data = useDataContext()
      return <div>{data.value}</div>
    }

    const registry = new ComponentRegistry()
    registry.register('test', TestComponent)

    const node: PunkNode = {
      type: 'test',
      props: {},
    }

    render(<PunkRenderer schema={node} data={{ value: 'test-value' }} registry={registry} />)
    expect(screen.getByText('test-value')).toBeInTheDocument()
  })
})

describe('useActionBus', () => {
  it('should provide action bus to components', () => {
    const handleAction = vi.fn()

    const TestComponent = () => {
      const actions = useActionBus()
      return <button onClick={() => actions.handleAction?.()}>Test</button>
    }

    const registry = new ComponentRegistry()
    registry.register('test', TestComponent)

    const node: PunkNode = {
      type: 'test',
      props: {},
    }

    render(
      <PunkRenderer
        schema={node}
        actions={{ handleAction }}
        registry={registry}
      />
    )

    screen.getByText('Test').click()
    expect(handleAction).toHaveBeenCalled()
  })
})
