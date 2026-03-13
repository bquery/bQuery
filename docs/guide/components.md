# Components

Components are lightweight Web Components with typed props, optional state, and a render function.
Internally, the component module is now split into focused submodules (types, props coercion, render helpers), with no breaking API changes.

```ts
import { component, html, safeHtml } from '@bquery/bquery/component';

component('user-card', {
  props: {
    username: { type: String, required: true },
    avatar: { type: String, default: '/default-avatar.png' },
    active: { type: Boolean, default: false },
  },
  state: { clicks: 0 },
  styles: `
    .card { display: grid; gap: 0.5rem; padding: 1rem; }
    .active { border: 1px solid #4f46e5; }
  `,
  connected() {
    console.log('mounted');
  },
  updated() {
    console.log('updated');
  },
  render({ props, state }) {
    return html`
      <div class="card ${props.active ? 'active' : ''}">
        <img src="${props.avatar}" alt="${props.username}" />
        <strong>${safeHtml`${props.username}`}</strong>
        <div>Clicks: ${state.clicks}</div>
      </div>
    `;
  },
});
```

## Default component library

`registerDefaultComponents()` registers a small, dependency-free set of native UI primitives that are ready for Storybook previews and zero-build usage.

```ts
import { defineBqueryConfig } from '@bquery/bquery/platform';
import { registerDefaultComponents } from '@bquery/bquery/component';

defineBqueryConfig({
  components: { prefix: 'ui' },
});

const tags = registerDefaultComponents();

console.log(tags);
// {
//   button: 'ui-button',
//   card: 'ui-card',
//   input: 'ui-input',
//   textarea: 'ui-textarea',
//   checkbox: 'ui-checkbox'
// }
```

Available defaults:

- `button` – pill-shaped button with `variant`, `size`, `type`, and `disabled` props
- `card` – simple container with optional `title`, `footer`, and `elevated`
- `input` – labeled text input emitting `input` events with `{ value }`
- `textarea` – labeled textarea emitting `input` events with `{ value }`
- `checkbox` – labeled checkbox emitting `change` events with `{ checked }`

### Slots and events

The default components expose regular slots and bubble composed custom events so they work well inside forms, routers, or shadow boundaries.

```html
<ui-card title="Profile">
  <ui-input label="Name"></ui-input>
  <ui-button variant="secondary">Save</ui-button>
</ui-card>
```

```ts
const field = document.querySelector('ui-input');
field?.addEventListener('input', (event) => {
  console.log((event as CustomEvent<{ value: string }>).detail.value);
});
```

## Props

Props are defined with a `type` and optional `required`/`default`/`validator`.

```ts
props: {
  count: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
  meta: { type: Object, default: {} },
  age: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0 && v <= 150
  },
}
```

### Prop validation

Add a `validator` function to validate prop values:

```ts
props: {
  email: {
    type: String,
    required: true,
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  },
}
```

If validation fails, the component throws an error (caught by `onError` if defined).

### Prop coercion

- `String` → raw string
- `Number` → `Number(value)` (fallback to raw string on `NaN`)
- `Boolean` → `'true' | '' | '1'` => `true`, `'false' | '0'` => `false`
- `Object`/`Array` → `JSON.parse` (fallback to raw string)
- Custom function/constructor → called or constructed

If you need to force constructor semantics for custom classes or value objects, set `construct: true` on the prop definition.

```ts
props: {
  publishedAt: {
    type: Date,
    construct: true,
  },
}
```

Missing required props without a default throw an error at runtime.

## State

State is a simple internal object that can be updated via `setState`.

```ts
const el = document.querySelector('user-card') as HTMLElement & {
  setState: (key: string, value: unknown) => void;
};

el.setState('clicks', 1);
```

## Lifecycle hooks

- `beforeMount()` – runs before the element renders (can modify initial state)
- `connected()` – runs when the element mounts
- `beforeUpdate(props)` – runs before re-render; return `false` to prevent update
- `updated()` – runs after re-render on prop changes
- `disconnected()` – runs on teardown
- `onError(error)` – handles errors during lifecycle/render

```ts
component('my-element', {
  props: { count: { type: Number, default: 0 } },
  beforeMount() {
    console.log('About to mount');
  },
  connected() {
    console.log('Mounted');
  },
  beforeUpdate(props) {
    // Prevent update if count is negative
    if (props.count < 0) return false;
  },
  updated() {
    console.log('Updated');
  },
  disconnected() {
    console.log('Disconnected');
  },
  onError(error) {
    console.error('Error:', error);
  },
  render({ props }) {
    return html`<div>Count: ${props.count}</div>`;
  },
});
```

## Rendering helpers

- `html` – template literal helper for building HTML strings
- `safeHtml` – escapes interpolated values for safety

Rendered component output is sanitized before it is written into the Shadow DOM. That keeps custom elements aligned with bQuery's security-by-default model while still allowing standard form attributes used by the default component library.

If a component needs a few additional safe tags or attributes, add a `sanitize` option to extend the component render allowlist without changing global sanitization defaults:

```ts
component('bq-dialog', {
  sanitize: {
    allowAttributes: ['open', 'style'],
  },
  render: () => html`<div role="dialog" open style="--offset: 12px">Hello</div>`,
});
```

## Manual element class creation

If you need access to the element class (e.g., to register manually or extend behavior), use `defineComponent`:

```ts
import { defineComponent } from '@bquery/bquery/component';

const UserCard = defineComponent('user-card', {
  props: {
    username: { type: String, required: true },
  },
  render: ({ props }) => html`<div>${props.username}</div>`,
});

customElements.define('user-card', UserCard);
```

## Emitting events

The render function receives `emit` for custom events:

```ts
render({ emit }) {
  emit('change', { value: 1 });
  return html`<div>...</div>`;
}
```
