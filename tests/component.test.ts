import { describe, expect, it } from 'bun:test';
import { component, html } from '../src/component/index';

describe('component/html', () => {
  it('creates HTML from template literal', () => {
    const result = html`<div>Hello</div>`;
    expect(result).toBe('<div>Hello</div>');
  });

  it('interpolates values correctly', () => {
    const name = 'World';
    const result = html`<span>Hello ${name}</span>`;
    expect(result).toBe('<span>Hello World</span>');
  });

  it('handles multiple interpolations', () => {
    const first = 'Hello';
    const second = 'World';
    const result = html`<div>${first} ${second}!</div>`;
    expect(result).toBe('<div>Hello World!</div>');
  });

  it('handles null and undefined values', () => {
    const result = html`<div>${null}${undefined}</div>`;
    expect(result).toBe('<div></div>');
  });

  it('handles numeric values', () => {
    const count = 42;
    const result = html`<span>Count: ${count}</span>`;
    expect(result).toBe('<span>Count: 42</span>');
  });

  it('handles boolean values', () => {
    const result = html`<span>${true} ${false}</span>`;
    expect(result).toBe('<span>true false</span>');
  });
});

describe('component/component', () => {
  it('registers a custom element', () => {
    const tagName = `test-component-${Date.now()}`;

    component(tagName, {
      props: {},
      render: () => html`<div>Test</div>`,
    });

    expect(customElements.get(tagName)).toBeDefined();
  });

  it('defines observed attributes from props', () => {
    const tagName = `test-props-${Date.now()}`;

    component(tagName, {
      props: {
        name: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
      render: ({ props }) => html`<div>${props.name}: ${props.count}</div>`,
    });

    const ElementClass = customElements.get(tagName);
    expect(ElementClass).toBeDefined();
    // Check if observedAttributes is defined
    expect(
      (ElementClass as typeof HTMLElement & { observedAttributes?: string[] }).observedAttributes
    ).toBeDefined();
  });

  it('coerces prop types from attributes', () => {
    const tagName = `test-prop-coercion-${Date.now()}`;

    component(tagName, {
      props: {
        count: { type: Number, default: 0 },
        active: { type: Boolean, default: false },
        meta: { type: Object, default: {} },
      },
      render: ({ props }) =>
        html`<div>
          ${typeof props.count}:${props.count}|${props.active}|${(props.meta as { role?: string })
            .role ?? ''}
        </div>`,
    });

    const el = document.createElement(tagName);
    el.setAttribute('count', '3');
    el.setAttribute('active', 'true');
    el.setAttribute('meta', '{"role":"admin"}');
    document.body.appendChild(el);

    const rendered = el.shadowRoot?.innerHTML ?? '';

    expect(rendered).toContain('number:3|true|admin');

    el.remove();
  });

  it('calls beforeMount before the first render', () => {
    const tagName = `test-before-mount-${Date.now()}`;
    const callOrder: string[] = [];

    component(tagName, {
      props: {},
      beforeMount() {
        callOrder.push('beforeMount');
      },
      connected() {
        callOrder.push('connected');
      },
      render: () => {
        callOrder.push('render');
        return html`<div>Test</div>`;
      },
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    expect(callOrder).toEqual(['beforeMount', 'connected', 'render']);

    el.remove();
  });

  it('calls beforeUpdate before re-renders and receives props', () => {
    const tagName = `test-before-update-${Date.now()}`;
    const receivedProps: unknown[] = [];
    let renderCount = 0;

    component<{ count: number }>(tagName, {
      props: {
        count: { type: Number, default: 0 },
      },
      beforeUpdate(props) {
        receivedProps.push({ ...props });
        return true; // allow update
      },
      render: ({ props }) => {
        renderCount++;
        return html`<div>Count: ${props.count}</div>`;
      },
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    expect(renderCount).toBe(1);
    expect(receivedProps).toHaveLength(0); // beforeUpdate not called on initial render

    // Trigger an attribute change after mounting
    el.setAttribute('count', '10');

    expect(renderCount).toBe(2);
    expect(receivedProps).toHaveLength(1);
    expect(receivedProps[0]).toEqual({ count: 10 });

    el.remove();
  });

  it('beforeUpdate returning false prevents re-render', () => {
    const tagName = `test-before-update-prevent-${Date.now()}`;
    let renderCount = 0;

    component<{ count: number }>(tagName, {
      props: {
        count: { type: Number, default: 0 },
      },
      beforeUpdate(props) {
        // Prevent update if count is negative
        if (props.count < 0) return false;
      },
      render: ({ props }) => {
        renderCount++;
        return html`<div>Count: ${props.count}</div>`;
      },
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    expect(renderCount).toBe(1);

    // Valid update - should render
    el.setAttribute('count', '10');
    expect(renderCount).toBe(2);

    // Negative count - should be prevented
    el.setAttribute('count', '-5');
    expect(renderCount).toBe(2); // No additional render

    el.remove();
  });

  it('calls updated after re-renders', () => {
    const tagName = `test-updated-${Date.now()}`;
    const callOrder: string[] = [];

    component<{ count: number }>(tagName, {
      props: {
        count: { type: Number, default: 0 },
      },
      beforeUpdate() {
        callOrder.push('beforeUpdate');
        return true;
      },
      updated() {
        callOrder.push('updated');
      },
      render: () => {
        callOrder.push('render');
        return html`<div>Test</div>`;
      },
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    callOrder.length = 0; // Clear initial render calls

    el.setAttribute('count', '10');

    expect(callOrder).toEqual(['beforeUpdate', 'render', 'updated']);

    el.remove();
  });

  it('calls onError when lifecycle methods throw', () => {
    const tagName = `test-on-error-lifecycle-${Date.now()}`;
    const capturedErrors: Error[] = [];

    component(tagName, {
      props: {},
      connected() {
        throw new Error('Connected error');
      },
      onError(error) {
        capturedErrors.push(error);
      },
      render: () => html`<div>Test</div>`,
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0].message).toBe('Connected error');

    el.remove();
  });

  it('calls onError when render throws', () => {
    const tagName = `test-on-error-render-${Date.now()}`;
    const capturedErrors: Error[] = [];

    component(tagName, {
      props: {},
      onError(error) {
        capturedErrors.push(error);
      },
      render: () => {
        throw new Error('Render error');
      },
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0].message).toBe('Render error');

    el.remove();
  });

  it('calls onError when beforeUpdate throws', () => {
    const tagName = `test-on-error-before-update-${Date.now()}`;
    const capturedErrors: Error[] = [];

    component<{ count: number }>(tagName, {
      props: {
        count: { type: Number, default: 0 },
      },
      beforeUpdate() {
        throw new Error('BeforeUpdate error');
      },
      onError(error) {
        capturedErrors.push(error);
      },
      render: ({ props }) => html`<div>Count: ${props.count}</div>`,
    });

    const el = document.createElement(tagName);
    document.body.appendChild(el);

    // Initial render should work (beforeUpdate not called)
    expect(capturedErrors).toHaveLength(0);

    // Trigger an update to invoke beforeUpdate
    el.setAttribute('count', '10');

    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0].message).toBe('BeforeUpdate error');

    el.remove();
  });

  it('validates prop values using validator function', () => {
    const tagName = `test-prop-validator-${Date.now()}`;
    const capturedErrors: Error[] = [];

    component<{ count: number }>(tagName, {
      props: {
        count: {
          type: Number,
          default: 0,
          validator: (value) => value >= 0 && value <= 100,
        },
      },
      onError(error) {
        capturedErrors.push(error);
      },
      render: ({ props }) => html`<div>Count: ${props.count}</div>`,
    });

    const el = document.createElement(tagName);
    el.setAttribute('count', '50'); // Valid value
    document.body.appendChild(el);

    expect(capturedErrors).toHaveLength(0);

    // Invalid value - should trigger validation error
    el.setAttribute('count', '150');

    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0].message).toContain('validation failed');
    expect(capturedErrors[0].message).toContain('count');

    el.remove();
  });
});
