# Punk Examples

Example projects demonstrating different Punk Framework features.

---

## Available Examples

### [Hello World](hello-world/)

**Difficulty:** Beginner
**Tier:** Punk (Free)
**Backend:** None

The simplest possible Punk application. Perfect for understanding basic concepts.

**What you'll learn:**
- Basic schema structure
- Component rendering
- Event handlers
- Accessibility

**Time:** 5 minutes

---

### Todo App *(Coming Soon)*

**Difficulty:** Beginner
**Tier:** Synthpunk
**Backend:** None (LocalStorage)

Classic todo application with AI generation.

**What you'll learn:**
- State management with DataContext
- List rendering with itemTemplate
- AI schema generation
- CRUD operations

**Time:** 15 minutes

---

### Dashboard *(Coming Soon)*

**Difficulty:** Intermediate
**Tier:** Synthpunk
**Backend:** Encore.ts

Data visualization dashboard with charts and stats.

**What you'll learn:**
- Data fetching from API
- Chart components
- Grid layouts
- Backend integration

**Time:** 30 minutes

---

### E-commerce *(Coming Soon)*

**Difficulty:** Intermediate
**Tier:** Atompunk
**Backend:** Encore.ts + PostgreSQL

Full shopping cart with products, cart, and checkout.

**What you'll learn:**
- Product catalog
- Shopping cart state
- Payment integration (Stripe)
- Database persistence

**Time:** 1 hour

---

### SaaS App *(Coming Soon)*

**Difficulty:** Advanced
**Tier:** Atompunk
**Backend:** Encore.ts + PostgreSQL + Neon

Complete SaaS application with authentication, billing, and team features.

**What you'll learn:**
- User authentication
- Multi-tenancy
- Subscription billing
- Team collaboration
- Email integration

**Time:** 2-3 hours

---

## Running Examples

### Method 1: Clone and Run

```bash
# Clone the repository
git clone https://github.com/punk-framework/punk
cd punk/docs/examples/hello-world

# Install dependencies
npm install

# Run
punk dev
```

### Method 2: Create from Template

```bash
# Use Punk CLI to create from example
punk create my-app --example hello-world
cd my-app
npm install
punk dev
```

### Method 3: Manual Setup

Copy the schema and integrate into your own project.

---

## Contributing Examples

Want to contribute an example? We'd love that!

**Requirements:**
- ✅ Complete README with instructions
- ✅ Working schema (validated)
- ✅ Well-commented code
- ✅ Screenshots or demo video
- ✅ Accessibility compliant

**Submit via Pull Request:**

```bash
# Create your example
cd docs/examples
mkdir my-example
cd my-example

# Add files
touch README.md schema.json App.tsx

# Create PR
git checkout -b example/my-example
git add .
git commit -m "docs: add my-example"
git push origin example/my-example
```

---

## Getting Help

- **Discord:** #examples channel
- **Discussions:** GitHub Discussions
- **Issues:** Report problems with examples

---

[Back to Main README](../../README.md) • [Getting Started](../../GETTING_STARTED.md)
