# @punk/component-table

TanStack Table wrapper for Punk Framework - Powerful data tables with sorting and pagination.

## Installation

```bash
pnpm add @punk/component-table
```

## Features

- **Sorting**: Click column headers to sort data
- **Pagination**: Navigate through large datasets
- **Auto-Registration**: Automatically registers with Punk's ComponentRegistry
- **Renderer-Agnostic**: Works in DOM, GPU, and XR modes
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **DataContext Integration**: Seamlessly integrates with Punk's data system

## Usage

### Programmatic (React)

```tsx
import { Table } from '@punk/component-table'

function MyApp() {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'User' },
  ]

  return (
    <Table
      data={JSON.stringify(users)}
      columns={[
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'role', header: 'Role' },
      ]}
      pagination={true}
      sorting={true}
      pageSize={10}
    />
  )
}
```

### JSON Schema (SynthPunk)

```json
{
  "type": "Table",
  "props": {
    "data": "users",
    "columns": [
      { "accessorKey": "id", "header": "ID" },
      { "accessorKey": "name", "header": "Name" },
      { "accessorKey": "email", "header": "Email" },
      { "accessorKey": "role", "header": "Role" }
    ],
    "pagination": true,
    "sorting": true,
    "pageSize": 10
  }
}
```

### With DataContext

```tsx
import { PunkRenderer } from '@punk/core'
import '@punk/component-table'

const schema = {
  type: "Table",
  props: {
    data: "employees",
    columns: [
      { accessorKey: "id", header: "Employee ID" },
      { accessorKey: "name", header: "Full Name" },
      { accessorKey: "department", header: "Department" },
      { accessorKey: "salary", header: "Salary" }
    ],
    pagination: true,
    sorting: true,
    pageSize: 25
  }
}

const data = {
  employees: JSON.stringify([
    { id: 1, name: "John Doe", department: "Engineering", salary: 90000 },
    { id: 2, name: "Jane Smith", department: "Design", salary: 85000 },
    // ... more data
  ])
}

<PunkRenderer schema={schema} data={data} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `string` | required | JSON string or DataContext path (array of objects) |
| `columns` | `ColumnDef[]` | required | Column definitions |
| `pagination` | `boolean` | `true` | Enable pagination |
| `sorting` | `boolean` | `true` | Enable column sorting |
| `pageSize` | `number` | `10` | Rows per page |

## Column Definition

Each column definition object supports:

| Property | Type | Description |
|----------|------|-------------|
| `accessorKey` | `string` | Property key to access in data objects |
| `header` | `string` | Column header text |
| `cell` | `string` (optional) | Custom cell renderer expression |

### Example Column Definitions

```json
{
  "columns": [
    { "accessorKey": "name", "header": "Name" },
    { "accessorKey": "email", "header": "Email" },
    {
      "accessorKey": "status",
      "header": "Status",
      "cell": "info.getValue().toUpperCase()"
    }
  ]
}
```

## Features

### Sorting

Click on any column header to sort by that column. Click again to reverse sort order.

```json
{
  "type": "Table",
  "props": {
    "data": "products",
    "columns": [
      { "accessorKey": "name", "header": "Product Name" },
      { "accessorKey": "price", "header": "Price" }
    ],
    "sorting": true
  }
}
```

### Pagination

Navigate through large datasets with pagination controls:

```json
{
  "type": "Table",
  "props": {
    "data": "orders",
    "columns": [
      { "accessorKey": "orderId", "header": "Order ID" },
      { "accessorKey": "customer", "header": "Customer" },
      { "accessorKey": "total", "header": "Total" }
    ],
    "pagination": true,
    "pageSize": 25
  }
}
```

### Disable Features

You can disable sorting and/or pagination:

```json
{
  "type": "Table",
  "props": {
    "data": "settings",
    "columns": [
      { "accessorKey": "key", "header": "Setting" },
      { "accessorKey": "value", "header": "Value" }
    ],
    "sorting": false,
    "pagination": false
  }
}
```

## Data Format

Table data should be an array of objects:

```typescript
[
  { id: 1, name: "Item 1", value: 100 },
  { id: 2, name: "Item 2", value: 200 },
  { id: 3, name: "Item 3", value: 300 }
]
```

The `accessorKey` in column definitions should match the property names in your data objects.

## Styling

The Table component includes basic styling. You can customize appearance using CSS:

```css
.punk-table-container {
  /* Container styles */
}

.punk-table {
  /* Table styles */
}

.punk-table thead th {
  /* Header cell styles */
}

.punk-table tbody td {
  /* Body cell styles */
}

.punk-table-pagination {
  /* Pagination controls styles */
}
```

## Component Metadata

- **Category**: Data Visualization
- **Icon**: table (Lucide)
- **Complexity**: Medium
- **Tags**: table, data, grid, list

## Advanced Usage

### Custom Cell Renderers

Use the `cell` property for custom formatting:

```json
{
  "columns": [
    {
      "accessorKey": "price",
      "header": "Price",
      "cell": "'$' + info.getValue().toFixed(2)"
    },
    {
      "accessorKey": "date",
      "header": "Date",
      "cell": "new Date(info.getValue()).toLocaleDateString()"
    }
  ]
}
```

## Related

- [@punk/component-chart](../component-chart) - Data visualization
- [@punk/component-mermaid](../component-mermaid) - Diagrams and flowcharts
- [TanStack Table Documentation](https://tanstack.com/table/v8)

## License

MIT
