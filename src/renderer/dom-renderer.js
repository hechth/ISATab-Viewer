/**
 * DOM Rendering Utilities
 *
 * Handles DOM manipulation for the ISATab viewer without jQuery dependency.
 */

/**
 * Select an element by CSS selector
 * @param {string} selector - CSS selector
 * @returns {Element|null} Selected element
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Select all elements matching a CSS selector
 * @param {string} selector - CSS selector
 * @returns {NodeList} All matching elements
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Set HTML content of an element
 * @param {string|Element} selectorOrElement - Selector or element reference
 * @param {string} html - HTML to set
 */
export function setHtml(selectorOrElement, html) {
  const element = typeof selectorOrElement === 'string'
    ? $(selectorOrElement)
    : selectorOrElement;
  if (element) {
    element.innerHTML = html;
  }
}

/**
 * Get HTML content of an element
 * @param {string|Element} selectorOrElement - Selector or element reference
 * @returns {string} HTML content
 */
export function getHtml(selectorOrElement) {
  const element = typeof selectorOrElement === 'string'
    ? $(selectorOrElement)
    : selectorOrElement;
  return element ? element.innerHTML : '';
}

/**
 * Add a class to an element
 * @param {Element} element - Element to modify
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element
 * @param {Element} element - Element to modify
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Create a new element
 * @param {string} tagName - Tag name
 * @param {Object} attributes - Attributes to set
 * @returns {Element} Created element
 */
export function createElement(tagName, attributes = {}) {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }
  return element;
}

/**
 * Append children to a parent element
 * @param {Element} parent - Parent element
 * @param {...Element} children - Children to append
 */
export function appendChildren(parent, ...children) {
  for (const child of children) {
    if (child) {
      parent.appendChild(child);
    }
  }
}

/**
 * Find element by attribute value
 * @param {string} selector - Base selector
 * @param {string} attr - Attribute name
 * @param {string} value - Attribute value
 * @returns {Element|null} Found element
 */
export function findElementByAttr(selector, attr, value) {
  const elements = $$(selector);
  for (const el of elements) {
    if (el.getAttribute(attr) === value) {
      return el;
    }
  }
  return null;
}

/**
 * Check if an element exists
 * @param {string|Element} selectorOrElement - Selector or element reference
 * @returns {boolean} True if element exists
 */
export function exists(selectorOrElement) {
  if (typeof selectorOrElement === 'string') {
    return $(selectorOrElement) !== null;
  }
  return !!selectorOrElement;
}

/**
 * Clear all children from an element
 * @param {string|Element} selectorOrElement - Selector or element reference
 */
export function clear(selectorOrElement) {
  const element = typeof selectorOrElement === 'string'
    ? $(selectorOrElement)
    : selectorOrElement;
  if (element) {
    element.innerHTML = '';
  }
}
