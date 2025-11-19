# Philosophy: Punk Pragmatism

**"Constrain AI. Guarantee Quality. Ship Faster."**

---

## Table of Contents

1. [What is Punk Pragmatism?](#what-is-punk-pragmatism)
2. [The Five Tenets](#the-five-tenets)
3. [Why Constrain AI?](#why-constrain-ai)
4. [The Schema Manifesto](#the-schema-manifesto)
5. [Templates vs Raw Code](#templates-vs-raw-code)
6. [Validation as a Safety Net](#validation-as-a-safety-net)
7. [Determinism Enables Trust](#determinism-enables-trust)
8. [Safety Over Flexibility](#safety-over-flexibility)
9. [Comparison with Alternatives](#comparison-with-alternatives)
10. [Common Objections & Responses](#common-objections--responses)

---

## What is Punk Pragmatism?

**Punk Pragmatism** is the philosophical foundation of the Punk Framework. It's a radical approach to AI-powered development that rejects the industry's current trajectory toward unconstrained probabilistic code generation.

### The Core Belief

> "AI code generation must be constrained by deterministic, verifiable rules. Unconstrained probability leads to chaos. Constrained creativity leads to reliable systems."

### The Problem We're Solving

Current AI development tools operate on a fundamentally flawed premise:

**They treat AI as a replacement for developers.**

This leads to:
- ❌ Raw code generation (HTML, CSS, JS, SQL)
- ❌ Probabilistic outputs (different every time)
- ❌ No validation (hoping AI got it right)
- ❌ Accessibility as an afterthought (if at all)
- ❌ Security vulnerabilities baked in
- ❌ Inconsistent patterns across the codebase

### The Punk Approach

**We treat AI as a powerful tool that works within validated frameworks.**

This leads to:
- ✅ Schema generation (validated JSON)
- ✅ Deterministic outputs (same input = same output)
- ✅ Automatic validation (Zod schemas)
- ✅ Accessibility built-in (WCAG 2.1 AA)
- ✅ Security by design (vetted templates)
- ✅ Consistent patterns everywhere

---

## The Five Tenets

### 1. Schemas Over Code

**Principle:** AI should generate data structures, not executable code.

**Why?**
- Schemas are **validatable** with static analysis
- Schemas **cannot execute** arbitrary operations
- Schemas render **deterministically**
- Schemas are **portable** across implementations

**Example:**

```typescript
// ✅ GOOD: AI generates schema
const schema = {
  type: "button",
  props: {
    variant: "primary",
    onClick: "handleSubmit",
    children: "Submit Form",
    "aria-label": "Submit the registration form"
  }
}

// Renderer converts to safe code
function render(schema: PunkSchema) {
  const Component = ComponentMap[schema.type]
  const handler = handlers[schema.props.onClick]

  return <Component {...schema.props} onClick={handler} />
}

// ❌ BAD: AI generates code directly
const code = `
<button onClick={() => {
  // Who knows what's in here?
  // Could be:
  //   - fetch('/api/delete-everything')
  //   - eval(userInput)
  //   - document.write(maliciousCode)
}}>
  Submit
</button>
`
```

### 2. Templates Over Generation

**Principle:** For backend logic, AI should fill templates, not generate raw code.

**Why?**
- Templates are **peer-reviewed** and tested
- Templates enforce **security best practices**
- Templates handle **edge cases** comprehensively
- Templates prevent **common vulnerabilities**

**Example:**

```typescript
// ✅ GOOD: AI fills template
const template = loadTemplate("authEndpoint")
const filled = template.fill({
  provider: "email",
  features: ["oauth", "2fa"],
  sessionType: "jwt"
})

// Template ensures:
// - Password hashing (bcrypt)
// - Rate limiting
// - CSRF protection
// - Input validation
// - Secure session management

// ❌ BAD: AI generates backend code
const code = `
export async function login(email, password) {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [email])
  if (user.password === password) {
    return { success: true, token: createToken(user.id) }
  }
  return { success: false }
}
`
// Problems:
// - Plaintext password comparison
// - SQL injection risk (if query changes)
// - No rate limiting
// - No CSRF protection
// - createToken implementation unknown
```

### 3. Validation Over Trust

**Principle:** All AI outputs must be validated before execution.

**Why?**
- AI models are **probabilistic** and can hallucinate
- Malformed schemas could **crash** the renderer
- Invalid templates could create **security holes**
- Validation provides a **safety net**

**Example:**

```typescript
import { z } from 'zod'

// Define what's valid
const PunkSchemaZod = z.object({
  type: z.string(),
  id: z.string().optional(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => PunkSchemaZod)).optional()
})

// AI generates schema
const aiOutput = await claude.generate(prompt)

// Validate before using
try {
  const validated = PunkSchemaZod.parse(aiOutput)
  // ✅ Safe to render
  render(validated)
} catch (error) {
  // ❌ Invalid schema, reject and regenerate
  console.error("AI generated invalid schema:", error)
  throw new Error("Schema validation failed")
}
```

### 4. Determinism Over Probability

**Principle:** The same input should always produce the same output.

**Why?**
- **Predictability** enables testing
- **Consistency** enables maintenance
- **Reproducibility** enables debugging
- **Reliability** enables production use

**Example:**

```typescript
// ✅ GOOD: Deterministic rendering
const schema = {
  type: "button",
  props: { children: "Click Me" }
}

render(schema) // → <button>Click Me</button>
render(schema) // → <button>Click Me</button> (identical)
render(schema) // → <button>Click Me</button> (identical)

// Tests are reliable
expect(render(schema)).toMatchSnapshot() // ✅ Always passes

// ❌ BAD: Probabilistic generation
ai.generate("Create a button that says Click Me")
// Try 1: <button onclick="...">Click Me</button>
// Try 2: <div class="btn">Click Me</div>
// Try 3: <input type="button" value="Click Me" />
// Try 4: <a href="#" class="button">Click Me</a>

// Tests are unreliable
expect(ai.generate("button")).toMatchSnapshot() // ❌ Fails randomly
```

### 5. Safety Over Flexibility

**Principle:** Restrict capabilities to ensure safety, even if it limits flexibility.

**Why?**
- Developers can **always write custom code** if needed
- Most use cases fit within **safe patterns**
- Safety violations are **catastrophic**
- **Constraints breed creativity**

**Example:**

```typescript
// ✅ GOOD: Restricted event handlers
const schema = {
  type: "button",
  props: {
    onClick: "handleSubmit" // ← String reference
  }
}

const handlers = {
  handleSubmit: () => {
    // Validated, safe handler
    submitForm()
  }
}

// ❌ BAD: Arbitrary code execution
const schema = {
  type: "button",
  props: {
    onClick: "eval('alert(document.cookie)')" // ← DANGEROUS!
  }
}

// Or even worse:
const schema = {
  type: "button",
  props: {
    onClick: () => {
      // What's in here? Who knows!
      // Could be malicious
      fetch('/api/delete-all-users', { method: 'DELETE' })
    }
  }
}
```

---

## Why Constrain AI?

### The Unconstrained AI Problem

When AI generates raw code without constraints:

1. **Accessibility Violations**
   ```html
   <!-- AI might generate: -->
   <div onclick="handleClick()">Click me</div>

   <!-- Problems:
      - Not keyboard accessible
      - No ARIA labels
      - Screen readers can't use it
      - Violates WCAG standards
   -->
   ```

2. **Security Vulnerabilities**
   ```javascript
   // AI might generate:
   function searchUsers(query) {
     return db.query(`SELECT * FROM users WHERE name LIKE '%${query}%'`)
   }

   // SQL injection vulnerability!
   // Input: "'; DROP TABLE users; --"
   ```

3. **Inconsistent Patterns**
   ```javascript
   // Generation 1: Class components
   class Button extends React.Component { ... }

   // Generation 2: Function components + useState
   function Button() { const [state, setState] = useState() ... }

   // Generation 3: Function components + useReducer
   function Button() { const [state, dispatch] = useReducer() ... }

   // Result: Unmaintainable codebase
   ```

4. **Type Unsafety**
   ```typescript
   // AI generates:
   function fetchUser(id: any): any {
     return fetch(`/api/users/${id}`).then(r => r.json())
   }

   // No type safety!
   ```

### The Constrained AI Solution

When AI works within Punk's constraints:

1. **Guaranteed Accessibility**
   ```json
   {
     "type": "button",
     "props": {
       "onClick": "handleClick",
       "children": "Click me",
       "aria-label": "Perform action"
     }
   }
   ```
   Renderer ensures:
   - Semantic HTML (`<button>`)
   - Keyboard navigation
   - ARIA labels
   - Focus management

2. **Security by Design**
   ```typescript
   // Template ensures safe database access
   authEndpoint({
     provider: "email",
     sessionType: "jwt"
   })
   ```
   Template includes:
   - Parameterized queries
   - Input validation
   - Rate limiting
   - CSRF protection

3. **Consistent Patterns**
   ```typescript
   // Every schema renders the same way
   const schema = { type: "button", ... }

   // Always uses the same Button component
   // Always follows the same patterns
   // Always has the same behavior
   ```

4. **Full Type Safety**
   ```typescript
   // Schema is fully typed
   const schema: PunkSchema = {
     type: "button",
     props: ButtonProps
   }

   // Render function is fully typed
   function render(schema: PunkSchema): React.ReactElement
   ```

---

## The Schema Manifesto

### Why Schemas Are Superior to Raw Code

1. **Schemas are Data**
   - Can be **serialized** (JSON, YAML, etc.)
   - Can be **stored** in databases
   - Can be **versioned** easily
   - Can be **diffed** with standard tools

2. **Schemas are Validatable**
   - **Static analysis** without execution
   - **Type checking** before rendering
   - **Structure verification** with Zod
   - **Constraint enforcement** automatically

3. **Schemas are Portable**
   - **Render to React** (current)
   - **Render to Vue** (future)
   - **Render to Svelte** (future)
   - **Render to native** (React Native, Flutter)

4. **Schemas are Composable**
   - **Merge** schemas
   - **Override** properties
   - **Extend** with new nodes
   - **Transform** programmatically

5. **Schemas are Safe**
   - **Cannot execute** arbitrary code
   - **Cannot access** file system
   - **Cannot make** network requests
   - **Cannot modify** global state

### The Schema-First Development Model

```
Traditional Development:
  Write Code → Test → Debug → Refactor → Ship

Schema-First Development:
  Generate Schema → Validate → Render → Ship

  ↓

  If invalid: Regenerate
  If valid: Automatically working, accessible, type-safe
```

---

## Templates vs Raw Code

### The Backend Generation Problem

**Question:** If schemas work for frontend, why not use them for backend?

**Answer:** Backend logic is fundamentally different:
- Contains **business logic** (complex, domain-specific)
- Interacts with **databases** (queries, transactions)
- Handles **authentication** (sessions, tokens, permissions)
- Manages **state** (caching, consistency)

Schemas can't express all of this. **But templates can.**

### How Templates Work

1. **Identify Common Patterns**
   ```
   - User authentication (login, signup, logout)
   - CRUD operations (create, read, update, delete)
   - File uploads (storage, validation)
   - Payment processing (Stripe, PayPal)
   - Email sending (transactional, marketing)
   ```

2. **Create Vetted Templates**
   ```typescript
   // templates/authEndpoint.ts

   export function authEndpoint(params: AuthParams) {
     // Template includes:
     // ✅ Password hashing (bcrypt)
     // ✅ Rate limiting (5 attempts/min)
     // ✅ CSRF protection
     // ✅ Input validation (Zod)
     // ✅ Secure session management
     // ✅ Error handling
     // ✅ Logging
     // ✅ Tests
   }
   ```

3. **AI Selects and Fills Templates**
   ```typescript
   // User prompt: "Add user authentication with email and Google OAuth"

   // AI selects: authEndpoint template
   // AI fills parameters:
   {
     provider: "email",
     oauth: ["google"],
     sessionType: "jwt",
     features: ["2fa", "magic_link"]
   }

   // Result: Fully working, secure auth system
   ```

### Benefits of Templates

1. **Security**
   - Reviewed by security experts
   - Tested against common attacks
   - Updated when vulnerabilities discovered
   - Cannot be bypassed by AI

2. **Completeness**
   - Edge cases handled
   - Error handling included
   - Logging built-in
   - Tests provided

3. **Consistency**
   - Same patterns everywhere
   - Easy to understand
   - Easy to maintain
   - Easy to debug

4. **Performance**
   - Optimized queries
   - Efficient algorithms
   - Caching strategies
   - Resource management

---

## Validation as a Safety Net

### Why Validation Matters

AI models are **probabilistic**. They can and will:
- Generate invalid JSON
- Hallucinate component types
- Mix up prop names
- Forget required fields
- Create circular references

**Validation catches all of this before it reaches production.**

### Validation Layers

```
Layer 1: JSON Parsing
  ├─ Is it valid JSON?
  └─ Can we parse it?

Layer 2: Schema Structure
  ├─ Does it match PunkSchema shape?
  ├─ Are required fields present?
  └─ Are types correct?

Layer 3: Component Validation
  ├─ Does the component type exist?
  ├─ Are props valid for this component?
  └─ Are required ARIA labels present?

Layer 4: Business Rules
  ├─ Does it meet constraints?
  ├─ Is it within size limits?
  └─ Does it follow best practices?
```

### Example: Multi-Layer Validation

```typescript
// AI output (string)
const aiOutput = `{
  "type": "button",
  "props": {
    "variant": "primary",
    "onClick": "handleClick"
  }
}`

// Layer 1: JSON parsing
let parsed
try {
  parsed = JSON.parse(aiOutput)
} catch (error) {
  throw new Error("Invalid JSON from AI")
}

// Layer 2: Schema structure
const PunkSchemaZod = z.object({
  type: z.string(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => PunkSchemaZod)).optional()
})

const validated = PunkSchemaZod.parse(parsed)

// Layer 3: Component validation
if (!ComponentMap[validated.type]) {
  throw new Error(`Unknown component: ${validated.type}`)
}

const ButtonPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'outline']),
  onClick: z.string(),
  children: z.string(),
  'aria-label': z.string().min(1) // ← REQUIRED!
})

const validatedProps = ButtonPropsSchema.parse(validated.props)
// ❌ Fails! Missing aria-label

// Layer 4: Business rules
if (getNodeCount(validated) > 100) {
  throw new Error("Schema too large (max 100 nodes)")
}

// All layers passed → Safe to render
```

---

## Determinism Enables Trust

### The Problem with Probabilistic Systems

When the same input produces different outputs:
- **Testing is impossible** (snapshot tests fail randomly)
- **Debugging is hard** (can't reproduce issues)
- **Maintenance is difficult** (behavior changes unexpectedly)
- **Users lose trust** (app behaves differently each time)

### How Punk Achieves Determinism

1. **Same Schema → Same Render**
   ```typescript
   const schema = { type: "button", props: { children: "Click" } }

   render(schema) === render(schema) // Always true
   ```

2. **AI Temperature: 0.3**
   ```typescript
   const response = await claude.messages.create({
     model: 'claude-sonnet-4-20250514',
     temperature: 0.3, // ← Low temperature = more deterministic
     messages: [{ role: 'user', content: prompt }]
   })
   ```

3. **Structured Prompts**
   ```typescript
   // Instead of: "Create a login form"
   // Use: "Create a login form with:
   //   - Email input (type='email', required, aria-label='Email address')
   //   - Password input (type='password', required, aria-label='Password')
   //   - Submit button (children='Sign In', aria-label='Sign in to account')
   // "
   ```

4. **Validation Retries**
   ```typescript
   let validated: PunkSchema
   let attempts = 0

   while (attempts < 3) {
     const schema = await ai.generate(prompt)
     const result = PunkSchemaZod.safeParse(schema)

     if (result.success) {
       validated = result.data
       break
     }

     attempts++
   }
   ```

---

## Safety Over Flexibility

### The Freedom Paradox

**Paradox:** Unlimited freedom leads to paralysis and danger.

**In code:** When AI can generate anything, it often generates:
- Security vulnerabilities
- Accessibility violations
- Performance issues
- Maintenance nightmares

**Solution:** Constrain AI to safe, proven patterns.

### What We Restrict

1. **No Arbitrary Code Execution**
   - Event handlers are string references, not functions
   - No `eval()`, no `Function()`, no `new Function()`
   - No inline scripts

2. **No Direct DOM Manipulation**
   - No `document.write()`
   - No `innerHTML` assignment
   - React manages the DOM

3. **No Arbitrary Network Requests**
   - Backend calls go through typed APIs
   - No raw `fetch()` in schemas
   - Action handlers are controlled

4. **No File System Access**
   - Schemas are pure data
   - No reading/writing files
   - No accessing environment

### What We Enable

1. **All Common UI Patterns**
   - Forms, buttons, inputs
   - Lists, tables, grids
   - Dialogs, popovers, tooltips
   - Tabs, accordions, carousels

2. **Rich Interactions**
   - Click handlers
   - Form submissions
   - State management
   - Data binding

3. **Extensibility**
   - Custom components via Skills
   - Custom handlers
   - Custom styling
   - Custom templates

4. **Escape Hatches**
   - Write custom components
   - Override renderers
   - Add custom logic
   - Extend the framework

**Philosophy:** Make the safe path the easy path. Make the unsafe path possible but deliberate.

---

## Comparison with Alternatives

### Punk vs v0.dev

| Aspect | Punk | v0.dev |
|--------|------|--------|
| **Generation** | Validated schemas | Raw React code |
| **Determinism** | Same input = same output | Non-deterministic |
| **Accessibility** | Guaranteed WCAG AA | Must fix manually |
| **Security** | Template-based backend | N/A (frontend only) |
| **Extensibility** | Skill system | Limited |
| **Self-hosting** | ✅ | ❌ |

### Punk vs Bolt.new

| Aspect | Punk | Bolt.new |
|--------|------|----------|
| **Generation** | Schemas + templates | Raw code |
| **Backend** | Multiple options | Limited |
| **Validation** | Automatic | None |
| **Consistency** | Enforced | Varies |
| **Open source** | ✅ MIT | ❌ |
| **CLI** | ✅ Beautiful TUI | ❌ |

### Punk vs Lovable.dev

| Aspect | Punk | Lovable |
|--------|------|---------|
| **Backend** | 6 options | Supabase only |
| **AI Model** | Claude Sonnet 4 | Proprietary |
| **Constraints** | Schema validation | None |
| **Accessibility** | Built-in | After thought |
| **Price** | $29-99/mo | $200+/mo |
| **Local-first** | ✅ GlyphCase | ❌ |

---

## Common Objections & Responses

### "Schemas are too limiting"

**Response:** Schemas cover 95% of common UI patterns. For the other 5%, you can:
- Write custom components
- Use Skills to extend component library
- Drop down to React for complex cases

**Counter-question:** How often do you need UI that can't be expressed as:
- Containers (divs, sections)
- Text (headings, paragraphs)
- Forms (inputs, selects, buttons)
- Lists (ordered, unordered, grids)
- Interactives (dialogs, tooltips, tabs)

Answer: Almost never.

### "Templates don't cover all backend needs"

**Response:** True! Templates cover common patterns:
- Authentication
- CRUD operations
- File uploads
- Payment processing
- Email sending

For custom business logic:
- Write custom endpoints
- Use templates as starting points
- Create your own templates

**Philosophy:** Templates handle 80% of boilerplate, you write 20% of unique logic.

### "Why not just let developers write code?"

**Response:** **You can!** Punk is a **framework**, not a straitjacket.

Use it when:
- Scaffolding a new project
- Prototyping quickly
- Ensuring accessibility
- Maintaining consistency

Skip it when:
- Building highly custom UI
- Implementing complex algorithms
- Integrating unique systems

**Best of both worlds:** Use Punk for structure, write code for uniqueness.

### "AI will get better, making constraints unnecessary"

**Response:** This misses the point. Even if AI becomes perfect:

1. **Validation is still necessary** (hardware errors, network corruption)
2. **Determinism is still valuable** (testing, debugging, trust)
3. **Consistency is still important** (maintenance, collaboration)
4. **Security is still critical** (templates prevent vulnerabilities)

**Constraints aren't a workaround for bad AI. They're good engineering.**

### "This feels like going backward to XML/XAML"

**Response:** Yes! And that's a feature, not a bug.

XML/XAML/QML were **right** about:
- Separating structure from logic
- Declarative UI definition
- Tooling-friendly formats
- Validation and type safety

They were **wrong** about:
- Verbose syntax (JSON is cleaner)
- Poor developer experience (we have Synthpunk)
- Manual authoring (we have AI generation)
- Limited ecosystems (we have React)

**Punk takes the good ideas and fixes the bad ones.**

---

## Conclusion: Why Punk Pragmatism Matters

The AI revolution in software development is here. We can either:

1. **Embrace chaos:** Let AI generate whatever it wants, hope it works, debug endlessly
2. **Embrace constraints:** Guide AI within proven frameworks, guarantee quality, ship confidently

**Punk chooses constraint.**

Not because we fear AI. But because we **respect engineering**.

Good software is:
- **Accessible** (everyone can use it)
- **Secure** (data is protected)
- **Maintainable** (future developers understand it)
- **Reliable** (it works consistently)
- **Performant** (it's fast and efficient)

Unconstrained AI **cannot guarantee** any of these.
Constrained AI **guarantees all of them**.

**That's Punk Pragmatism.**

---

**Build Fast. Break Norms. Ship Code.** 🎸

[Back to README](README.md) • [Architecture](ARCHITECTURE.md) • [Getting Started](GETTING_STARTED.md)
