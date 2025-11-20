# Quick Start Guide

Get the Punk Loadout Dashboard running in 2 minutes.

## Installation

```bash
# From the repository root
cd examples/loadout-dashboard

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dashboard will open automatically at `http://localhost:3000`

## What You'll See

1. **Header**: Purple gradient title
2. **3 Charts**: Bar, line, and pie charts showing sample data
3. **Metrics Table**: Sortable table with 8 KPIs
4. **2 Diagrams**: System architecture and data flow
5. **Footer**: Credits and component info

## Quick Customization

### Change Chart Data

Edit `/src/data.ts`:

```typescript
export const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar'],  // Your labels
  datasets: [{
    label: 'Sales',
    data: [100, 200, 150]  // Your data
  }]
}
```

### Add a New Chart

1. Add data to `/src/data.ts`
2. Add chart to schema in `/src/schema.ts`:

```typescript
{
  type: 'Chart',
  props: {
    chartType: 'line',
    data: 'yourDataName',
    height: 300
  }
}
```

3. Add to context in `/src/App.tsx`:

```typescript
const dataContext = {
  yourDataName,
  // ... other data
}
```

### Change Colors

Edit chart colors in `/src/data.ts`:

```typescript
backgroundColor: 'rgba(YOUR_COLOR, 0.6)',
borderColor: 'rgba(YOUR_COLOR, 1)'
```

Or edit the gradient background in `/index.html`:

```css
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);
```

## File Quick Reference

- **index.html** - HTML template, global styles
- **src/main.tsx** - React entry point
- **src/App.tsx** - Main component with DataContext
- **src/schema.ts** - Dashboard layout (JSON schema)
- **src/data.ts** - All sample data
- **package.json** - Dependencies and scripts
- **vite.config.ts** - Build configuration

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm preview          # Preview production build

# Utilities
pnpm clean            # Remove build artifacts (if available)
```

## Next Steps

1. Read the full [README.md](./README.md) for detailed documentation
2. Check [STRUCTURE.md](./STRUCTURE.md) for architecture overview
3. Explore `/src/schema.ts` to see how components are defined
4. Modify `/src/data.ts` to use your own data
5. Learn about other @punk/extended components

## Getting Help

- **Punk Core Docs**: `/packages/core/README.md`
- **Extended Loadout**: `/packages/extended/README.md`
- **Chart.js**: https://www.chartjs.org/
- **TanStack Table**: https://tanstack.com/table/
- **Mermaid**: https://mermaid.js.org/

## Troubleshooting

**Charts not showing?**
- Check browser console for errors
- Verify data is exported from `data.ts`
- Ensure data keys match in schema and context

**Build errors?**
- Run `pnpm install` from repo root
- Check that all workspace packages are built
- Try `pnpm clean && pnpm build`

**TypeScript errors?**
- Check `tsconfig.json` is present
- Ensure all type imports are correct
- Restart your editor/IDE

---

Happy building with Punk Framework!
