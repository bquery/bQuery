# Testing

The testing module provides focused helpers for mounting components, mocking reactive state, dispatching events, and waiting for async conditions.

```ts
import {
  fireEvent,
  flushEffects,
  mockRouter,
  mockSignal,
  renderComponent,
  waitFor,
} from '@bquery/bquery/testing';
```

## Mount a component

```ts
const rendered = renderComponent('ui-button', {
  props: { variant: 'primary' },
  slots: { default: 'Save' },
});

console.log(rendered.el.outerHTML);
rendered.unmount();
```

## Mock signals

```ts
const count = mockSignal(0);
count.set(2);
count.reset();
console.log(count.initialValue);
```

## Mock the router

```ts
const router = mockRouter({
  routes: [{ path: '/' }, { path: '/docs' }],
  initialPath: '/',
});

router.push('/docs');
console.log(router.currentRoute.value.path);
router.destroy();
```

## Fire events and flush effects

```ts
const button = document.createElement('button');
document.body.appendChild(button);

fireEvent(button, 'click', { detail: { source: 'test' } });
flushEffects();

button.remove();
```

## Wait for async conditions

```ts
await waitFor(() => document.querySelector('[data-ready="true"]') !== null, {
  timeout: 1000,
  interval: 20,
});
```

These helpers keep tests concise without introducing extra runtime dependencies.
