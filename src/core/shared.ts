/**
 * Shared helpers for element wrappers.
 */
export type ElementList = Element[];

export const toElementList = (input: Element | ElementList): ElementList =>
  Array.isArray(input) ? input : [input];

export const applyAll = (elements: ElementList, action: (el: Element) => void) => {
  for (const el of elements) {
    action(el);
  }
};

/**
 * Gets an element's outer size, optionally including margins.
 *
 * @internal
 */
export const getOuterSize = (
  element: HTMLElement,
  dimension: 'width' | 'height',
  includeMargin: boolean
): number => {
  const size = dimension === 'width' ? element.offsetWidth : element.offsetHeight;
  if (!includeMargin) {
    return size;
  }

  const view = element.ownerDocument?.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') {
    return size;
  }

  const computedStyle = view.getComputedStyle(element);
  const startMargin = Number.parseFloat(
    computedStyle.getPropertyValue(dimension === 'width' ? 'margin-left' : 'margin-top')
  );
  const endMargin = Number.parseFloat(
    computedStyle.getPropertyValue(dimension === 'width' ? 'margin-right' : 'margin-bottom')
  );

  return size + (Number.isNaN(startMargin) ? 0 : startMargin) + (Number.isNaN(endMargin) ? 0 : endMargin);
};
