# SSR

The SSR module renders bQuery templates to HTML strings, serializes store state, and hydrates the client-side DOM back into a live app.

```ts
import {
  deserializeStoreState,
  hydrateMount,
  hydrateStores,
  renderToString,
  serializeStoreState,
} from '@bquery/bquery/ssr';
```

## Render on the server

```ts
const { html, storeState } = renderToString(
  '<div id="app"><h1 bq-text="title"></h1></div>',
  { title: 'Hello SSR' },
  {
    stripDirectives: true,
    includeStoreState: true,
  }
);

console.log(html);
console.log(storeState);
```

Supported SSR directives include `bq-text`, `bq-if`, `bq-show`, `bq-for`, `bq-class`, `bq-style`, `bq-html`, and `bq-bind:*`.

## Serialize store state

```ts
const payload = serializeStoreState({
  scriptId: '__BQUERY_STORE_STATE__',
  globalKey: '__BQUERY_INITIAL_STATE__',
});

console.log(payload.scriptTag);
```

## Hydrate on the client

```ts
const state = deserializeStoreState();
hydrateStores(state);

hydrateMount('#app', { title: 'Hello SSR' }, { hydrate: true });
```

## Single-store hydration

```ts
hydrateStore('settings', { theme: 'dark' });
```

## Notes

- Serialized script output escapes dangerous content to avoid XSS when embedding state into HTML.
- `globalKey` can be customized when integrating with existing server frameworks.
- Hydration reuses existing markup and attaches view bindings instead of replacing the DOM wholesale.
