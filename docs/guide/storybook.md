# Storybook

Use `@bquery/bquery/storybook` when you want string-based Storybook renderers that stay sanitized and ergonomic for Web Components.

```ts
import { storyHtml, when } from '@bquery/bquery/storybook';
```

## `storyHtml()`

`storyHtml()` is a template tag for authoring Storybook stories safely.

- Sanitizes interpolated markup
- Preserves explicitly authored custom elements and opted-in attributes
- Supports boolean-attribute shorthand such as `?disabled=${true}`

```ts
export const Primary = {
  args: { disabled: false, label: 'Save' },
  render: ({ disabled, label }: { disabled: boolean; label: string }) =>
    storyHtml`
      <ui-card>
        <ui-button ?disabled=${disabled}>${label}</ui-button>
      </ui-card>
    `,
};
```

## `when()`

Use `when()` for readable conditional fragments inside stories.

```ts
export const Status = {
  args: { disabled: true },
  render: ({ disabled }: { disabled: boolean }) =>
    storyHtml`
      <ui-card>
        <ui-button ?disabled=${disabled}>Save</ui-button>
        ${when(disabled, '<small>Currently disabled</small>', '<small>Ready</small>')}
      </ui-card>
    `,
};
```

`when()` accepts a string fragment, `null`/`undefined`, or a callback that returns a fragment.

## Working with trusted fragments

When you intentionally reuse already-sanitized markup, combine `trusted()` with `storyHtml()`.

```ts
import { trusted, sanitizeHtml } from '@bquery/bquery/security';

const badge = trusted(sanitizeHtml('<span class="badge">Stable</span>'));

export const WithBadge = {
  render: () => storyHtml`<ui-card>${badge}</ui-card>`,
};
```

## Best practices

- Keep literal template structure developer-authored.
- Pass user-controlled content as interpolated values so sanitization stays effective.
- Prefer `storyHtml()` over manual string concatenation.
- Use Storybook args for booleans and map them with `?attr=${value}` where possible.
