# Devtools

The devtools module provides lightweight runtime inspection utilities for debugging signals, stores, custom elements, and event timelines.

```ts
import {
  clearTimeline,
  enableDevtools,
  getDevtoolsState,
  getTimeline,
  inspectComponents,
  inspectSignals,
  inspectStores,
  logTimeline,
} from '@bquery/bquery/devtools';
```

## Enable devtools

```ts
enableDevtools(true, { logToConsole: true, maxTimelineEntries: 200 });
```

Use `isDevtoolsEnabled()` to check whether collection is active.

## Inspect runtime state

```ts
console.log(inspectSignals());
console.log(inspectStores());
console.log(inspectComponents());
console.log(getDevtoolsState());
```

## Timeline events

```ts
const entries = getTimeline();
logTimeline(10);
clearTimeline();
```

Use `recordEvent()` to push custom events into the timeline when you want your own instrumentation entries.

## Signal tracking

```ts
import { signal } from '@bquery/bquery/reactive';
import { trackSignal, untrackSignal } from '@bquery/bquery/devtools';

const count = signal(0);
trackSignal(count, 'counter');
untrackSignal(count);
```

## Notes

- Intended for development and diagnostics, not production analytics.
- Pairs nicely with `@bquery/bquery/testing` when you want assertions over reactive behavior.
