import type { TheorySnippet } from '@/types';
import { ALLOWED_INLINE_TAGS, STOP_HEADINGS } from './constants';

type TheorySectionLimiter = {
  sectionIndex: number;
  maxSectionIndex: number;
};

const normalizeHeadingText = (text: string) =>
  text
    .replace(/\[edit]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const isStopHeading = (text: string) => STOP_HEADINGS.has(normalizeHeadingText(text));

const getHeadingText = (element: Element) => {
  if (/^H[1-6]$/.test(element.tagName)) {
    return element.textContent || '';
  }

  if (element.classList.contains('mw-heading')) {
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    return heading?.textContent || element.textContent || '';
  }

  return '';
};

const isNoisyElement = (element: Element) =>
  [
    'toc',
    'mw-empty-elt',
    'thumb',
    'hatnote',
    'metadata',
    'navbox',
    'ambox',
    'infobox',
    'shortdescription',
    'mw-references-wrap',
    'reflist',
    'noprint',
  ].some((className) => element.classList.contains(className));

const normalizeExtractText = (rawText: string) =>
  rawText
    .replace(/\[\d+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const stripHeadingArtifacts = (text: string) =>
  text
    .replace(/\[edit]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const unwrapElement = (element: Element) => {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
};

const sanitizeInlineMarkup = (element: Element) => {
  const clone = element.cloneNode(true) as Element;
  clone
    .querySelectorAll(
      'sup, .reference, .mw-editsection, .mw-editsection-bracket, .mw-editsection-like, .mw-cite-backlink, .mw-ext-cite-error, .error, style, script',
    )
    .forEach((node) => node.remove());

  const descendants = Array.from(clone.querySelectorAll('*')).reverse();
  descendants.forEach((node) => {
    if (
      node.classList.contains('mw-editsection')
      || node.classList.contains('mw-editsection-bracket')
      || node.classList.contains('mw-editsection-like')
    ) {
      node.remove();
      return;
    }

    const tagName = node.tagName;
    if (tagName === 'A') {
      unwrapElement(node);
      return;
    }
    if (!ALLOWED_INLINE_TAGS.has(tagName)) {
      unwrapElement(node);
      return;
    }
    Array.from(node.attributes).forEach((attr) => node.removeAttribute(attr.name));
  });

  return {
    text: normalizeExtractText(clone.textContent || ''),
    html: clone.innerHTML.trim(),
  };
};

const toHeadingSnippet = (headingText: string): TheorySnippet | null => {
  const text = stripHeadingArtifacts(headingText);
  if (!text) return null;
  return {
    kind: 'heading',
    text,
    html: escapeHtml(text),
  };
};

const toParagraphSnippet = (element: Element): TheorySnippet | null => {
  const { text, html } = sanitizeInlineMarkup(element);
  if (!text || !html) return null;
  return {
    kind: 'paragraph',
    text,
    html,
  };
};

const isReadableTheoryParagraph = (text: string) => {
  const words = text.split(' ').filter(Boolean);
  if (words.length < 8) return false;
  if (text.length < 56) return false;
  if (/(isbn|doi|retrieved|archived|citation needed|https?:\/\/|www\.)/i.test(text)) return false;
  return true;
};

const shouldStopAtHeading = (headingText: string, limiter: TheorySectionLimiter) => {
  if (isStopHeading(headingText)) return true;
  limiter.sectionIndex += 1;
  return limiter.sectionIndex > limiter.maxSectionIndex;
};

export const extractTheorySnippets = (html: string, extraSections: number) => {
  if (!html) return null;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('.mw-parser-output');
  if (!root) return null;

  const snippets: TheorySnippet[] = [];
  const seen = new Set<string>();
  const limiter: TheorySectionLimiter = {
    sectionIndex: 0,
    maxSectionIndex: Math.max(0, extraSections),
  };
  let paragraphCount = 0;

  for (const child of Array.from(root.children)) {
    if (isNoisyElement(child)) continue;

    const headingText = getHeadingText(child);
    if (headingText) {
      if (shouldStopAtHeading(headingText, limiter)) break;
      const headingSnippet = toHeadingSnippet(headingText);
      if (headingSnippet && !seen.has(`h:${headingSnippet.text}`)) {
        seen.add(`h:${headingSnippet.text}`);
        snippets.push(headingSnippet);
      }
      continue;
    }

    if (limiter.sectionIndex > limiter.maxSectionIndex) break;
    if (child.tagName === 'TABLE' || child.querySelector('table')) continue;
    if (child.tagName !== 'P') continue;

    const paragraphSnippet = toParagraphSnippet(child);
    if (!paragraphSnippet) continue;
    if (!isReadableTheoryParagraph(paragraphSnippet.text)) continue;
    if (seen.has(`p:${paragraphSnippet.text}`)) continue;

    seen.add(`p:${paragraphSnippet.text}`);
    snippets.push(paragraphSnippet);
    paragraphCount += 1;
  }

  if (paragraphCount === 0) return null;
  return snippets.length ? snippets : null;
};

