# bQuery.js - Copilot Instructions

## Project Overview

bQuery.js is a TypeScript-first, zero-build-capable DOM library combining jQuery-style chainable APIs with modern features (reactivity, Web Components, animations). The library is **modular** - users can import specific modules to minimize bundle size.

## Architecture

### Module Structure (`src/`)

- **core/** - DOM selection (`$`, `$$`), manipulation, events (`BQueryElement`, `BQueryCollection`)
- **reactive/** - Signals system (`signal`, `computed`, `effect`, `batch`) for fine-grained reactivity
- **component/** - Web Components helper with typed props, shadow DOM, lifecycle hooks
- **motion/** - View Transitions API, FLIP animations, spring physics
- **security/** - HTML sanitization (enabled by default), Trusted Types, CSP support
- **platform/** - Storage adapters, caching, notifications, buckets

Entry points: `index.ts` (default exports all), `full.ts` (explicit full bundle)

### Key Design Patterns

1. **Security by default**: All `.html()` methods sanitize input via `sanitizeHtml()` from security module
2. **Chainable APIs**: Mutating methods return `this` for jQuery-style chaining
3. **Wrapper classes**: `BQueryElement` (single), `BQueryCollection` (multiple) wrap raw DOM elements
4. **Getter/setter overloading**: Methods like `.text()`, `.attr()`, `.css()` act as getters when called without args

## Build & Dev Commands (Bun)

```bash
bun install           # Install dependencies
bun test              # Run tests (uses happy-dom for DOM simulation)
bun test --watch      # Watch mode
bun run build         # Build library (lib + UMD + types)
bun run playground    # Start dev playground at playground/
bun run dev           # Start VitePress docs server
bun run lint          # ESLint with auto-fix
bun run lint:types    # TypeScript type checking only
```

## Testing Conventions

- Tests in `tests/` use **Bun's test runner** with `bun:test` imports
- DOM environment provided by `happy-dom` via `tests/setup.ts`
- Test file naming: `<module>.test.ts` (e.g., `core.test.ts`, `signal.test.ts`)
- Pattern: Create DOM elements inline, test wrapper methods, clean up with `.remove()`

```ts
import { describe, expect, it } from 'bun:test';
it('example', () => {
  const div = document.createElement('div');
  // test...
  div.remove();
});
```

## Code Patterns

### Module Exports

Each module has an `index.ts` that re-exports public APIs. Keep exports minimal and explicit.

### Selector Functions

- `$(selector)` → `BQueryElement` (throws if not found)
- `$$(selector)` → `BQueryCollection` (never throws, may be empty)

### Reactive Primitives

```ts
const count = signal(0); // Reactive value
const doubled = computed(() => count.value * 2); // Derived value
effect(() => console.log(count.value)); // Side effect
batch(() => {
  /* multiple updates, one notification */
});
```

### Security Integration

```ts
// HTML is always sanitized by default
$('#el').html('<script>bad</script>'); // Script stripped automatically

// For trusted content, use raw DOM
$('#el').raw.innerHTML = trustedContent;
```

### Component Definition

```ts
// Sanitize untrusted props before interpolating into html templates
component('my-element', {
  props: { name: { type: String, required: true } },
  styles: `.host { color: blue; }`,
  render: ({ props }) => html`<span>${sanitizeHtml(String(props.name))}</span>`,
});
```

## Important Files

- `vite.config.ts` - Library build config with multiple entry points
- `vite.umd.config.ts` - UMD bundle for CDN/script tags
- `src/security/sanitize.ts` - Core sanitization logic, Trusted Types
- `tests/setup.ts` - DOM polyfills for test environment

## Conventions

- **Strict TypeScript**: `strict: true`, no unused locals/params
- **Pure ESM**: `"type": "module"`, use `.mjs` extensions in dist
- **No side effects**: `"sideEffects": false` - tree-shakeable
- **JSDoc comments**: All public APIs have documentation with `@example` blocks
- **Internal markers**: Use `@internal` JSDoc tag for non-public helpers

## Common Pitfalls

1. Don't forget `$()` throws for missing elements - use `$$()` for optional queries
2. Always use `sanitizeHtml()` for any user HTML in new DOM-writing methods
3. Signal `.value` triggers tracking - use `.peek()` to read without subscribing
4. Test with `bun test`, not Node - Bun-specific APIs are used
