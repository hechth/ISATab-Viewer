/**
 * Renderer Module Exports
 */

export {
  studyListTemplate,
  tableTemplate,
  sampleDistributionTemplate,
  investigationTemplate,
  studyTemplate
} from './templates.js';

export {
  $,
  $$,
  setHtml,
  getHtml,
  addClass,
  removeClass,
  createElement,
  appendChildren,
  findElementByAttr,
  exists,
  clear
} from './dom-renderer.js';
