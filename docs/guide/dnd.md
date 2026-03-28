# Drag & Drop

The drag-and-drop module adds pointer-based dragging, droppable zones, and sortable lists with touch support and configurable constraints.

```ts
import { draggable, droppable, sortable } from '@bquery/bquery/dnd';
```

## `draggable()`

```ts
const drag = draggable(document.querySelector('#card')!, {
  axis: 'both',
  bounds: 'parent',
  ghost: true,
  onDragEnd: ({ position }) => {
    console.log(position.x, position.y);
  },
});

// later
drag.destroy();
```

Useful options include axis locking, bounds, handle selectors, ghost previews, and drag callbacks.

## `droppable()`

```ts
const drop = droppable(document.querySelector('#drop-zone')!, {
  accept: '.draggable-card',
  onDrop: ({ dragged, zone }) => {
    console.log('Dropped', dragged, 'into', zone);
  },
});

drop.destroy();
```

Droppable zones can respond to enter, over, leave, and drop phases.

## `sortable()`

```ts
const sort = sortable(document.querySelector('#todo-list')!, {
  items: 'li',
  axis: 'y',
  handle: '.handle',
  onSortEnd: ({ oldIndex, newIndex }) => {
    console.log(`Moved from ${oldIndex} to ${newIndex}`);
  },
});

sort.destroy();
```

## Notes

- Built on pointer events with graceful DOM/environment guards.
- Supports touch devices without requiring external dependencies.
- Ghost offsets and placeholder behavior are covered by the test suite for common edge cases.
