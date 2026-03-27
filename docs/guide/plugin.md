# Plugin System

The plugin module lets you register reusable integrations that add custom directives and Web Components globally.

```ts
import { use, isInstalled, getInstalledPlugins, getCustomDirective } from '@bquery/bquery/plugin';
```

## Create a plugin

```ts
const tooltipPlugin = {
  name: 'tooltip',
  install(ctx) {
    ctx.directive('tooltip', (el, expression) => {
      el.setAttribute('title', expression);
    });
  },
};

use(tooltipPlugin);
```

## Register custom components

```ts
class BqHello extends HTMLElement {
  connectedCallback() {
    this.textContent = 'Hello from a plugin';
  }
}

use({
  name: 'hello-component',
  install(ctx) {
    ctx.component('bq-hello', BqHello);
  },
});
```

## Introspection helpers

```ts
console.log(isInstalled('tooltip'));
console.log(getInstalledPlugins());
console.log(getCustomDirective('tooltip'));
```

## Testing and cleanup

`resetPlugins()` is primarily useful for tests so each test can start from a clean plugin registry.

```ts
import { resetPlugins } from '@bquery/bquery/plugin';

resetPlugins();
```

## Notes

- Installation is idempotent per plugin name.
- Custom directives integrate directly with the view module.
- Plugin registration should generally happen before `mount()` or component/router setup.
