# Demo: What the AI Sees in the Prompt

## Overview
This document shows an example of the context information that Synthpunk now sends to the AI, including the new A11y profile guidance.

## Example AI Prompt Context

```
Available Components:
Container, Box, Text, Button, Input, Select, Form, FormField, DataGrid, Card, Badge, Avatar, Modal, Tabs, Stack, Chart, Table, Mermaid, RichText, Code, FileDrop, DatePicker, Command

Components with A11y Profiles:
- Chart:
  role: img
  required: [label]
  optional: [description]
  hint: This is a chart. Provide a short label describing the chart type and data (e.g., "Sales trend for 2024"), and an optional detailed description for screen readers.

- Table:
  role: table
  required: [caption]
  optional: [summary]
  hint: This is a data table. Provide a caption describing what the table contains (e.g., "Customer list"), and an optional summary explaining the table structure for screen readers.

- Command:
  role: combobox
  required: [label]
  optional: []
  hint: This is a command palette/combobox input. Provide a label describing the search function (e.g., "Search commands" or "Quick action finder").

- RichText:
  role: textbox
  required: [label]
  optional: [description]
  hint: This is a rich text editor. Provide a label describing the content being edited (e.g., "Message body" or "Article content"), and an optional description with usage hints.

- Code:
  role: code
  required: [label]
  optional: [description]
  hint: This is a code block or code editor. Provide a label describing the code (e.g., "TypeScript example" or "API response"), and an optional description of what the code does.

- Mermaid:
  role: img
  required: [label]
  optional: [description]
  hint: This is a Mermaid diagram. Provide a short label describing the diagram type (e.g., "User authentication flow diagram"), and a detailed description explaining the diagram content for screen readers.

- FileDrop:
  role: button
  required: [label]
  optional: [description]
  hint: This is a file drop zone. Provide a label describing the upload action (e.g., "Upload profile image" or "Drop files here"), and an optional description with file type restrictions.

- DatePicker:
  role: combobox
  required: [label]
  optional: [description]
  hint: This is a date picker input. Provide a label describing the date field (e.g., "Start date" or "Birth date"), and an optional description with format or constraints.
```

## System Prompt Additions

The AI also receives these rules in the SYSTEM_PROMPT:

```
## Accessibility Metadata (Rig A11y Profiles)

Some components (called Rigs) have accessibility requirements defined in their a11yProfile.

**Rules:**
1. When creating a schema node with a type that has an a11y profile (e.g., Chart, Table, Command, Mermaid):
   - You MUST add an a11y object to that node
   - You MUST populate all fields listed in the profile's required metadata (e.g., label, caption)
   - Use the component's props, data, and context to infer meaningful, human-readable text
   - Generate labels that describe the purpose and content, not just "chart" or "table"

2. Optional fields (listed in the profile's optional metadata) should be added when they improve clarity for screen reader users.

3. Never add raw aria-* props to component props. Always use the a11y object instead.

4. Use the profile's hint field to understand what makes a good label for that component type.

**Example:**
{
  "type": "Chart",
  "props": {
    "type": "bar",
    "data": "{context.sales}"
  },
  "a11y": {
    "label": "Monthly sales bar chart",
    "description": "Shows sales increasing from 100 in January to 150 in February"
  }
}

**Example:**
{
  "type": "Table",
  "props": {
    "data": "{context.users}",
    "columns": [
      {"key": "name", "label": "Name"},
      {"key": "email", "label": "Email"}
    ]
  },
  "a11y": {
    "caption": "User directory",
    "summary": "Table showing user names and email addresses with sortable columns"
  }
}
```

## Expected AI Behavior

When the AI generates a schema that uses any of the 8 Rig components (Chart, Table, Mermaid, RichText, Code, FileDrop, DatePicker, Command), it will:

1. **Automatically include an `a11y` object** in the node
2. **Populate required fields** based on the profile (e.g., `label` for Chart, `caption` for Table)
3. **Generate meaningful, context-aware labels** by analyzing:
   - The component's props (e.g., chart type, data source)
   - The surrounding context
   - The user's request
4. **Add optional fields** when they provide additional clarity

## Example Generated Schema

User request: "Create a dashboard showing sales data"

AI generates:
```json
{
  "type": "Container",
  "props": {"padding": "lg"},
  "children": [
    {
      "type": "Text",
      "props": {"size": "h1"},
      "text": "Sales Dashboard"
    },
    {
      "type": "Chart",
      "props": {
        "type": "bar",
        "data": "{context.sales}"
      },
      "a11y": {
        "label": "Monthly sales bar chart for 2024",
        "description": "Bar chart showing monthly sales data with revenue in thousands"
      }
    },
    {
      "type": "Table",
      "props": {
        "data": "{context.salesDetails}",
        "columns": [
          {"key": "month", "label": "Month"},
          {"key": "revenue", "label": "Revenue"}
        ]
      },
      "a11y": {
        "caption": "Sales breakdown by month",
        "summary": "Table showing monthly revenue totals with sortable columns"
      }
    }
  ]
}
```

## Benefits

1. **Single-pass generation** - No post-processing needed
2. **Context-aware labels** - AI generates meaningful descriptions based on actual data
3. **Consistent accessibility** - All Rig components always have proper a11y metadata
4. **Developer-friendly** - Clear examples and hints guide the AI
