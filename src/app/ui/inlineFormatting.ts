import { remark } from 'remark';
import type { Nodes } from 'mdast';

/**
 * Minimal formatting for short author text, such as a description.
 *
 * Markdown emphasis, and nothing else: `*italic*` or `_italic_` sets a work
 * title or a stressed word in the Serif italic; `**bold**` or `__bold__`
 * marks it strong; a backslash keeps a literal asterisk or underscore (`\*`).
 * Everything else stays the text the author typed. Asterisks that do not
 * pair, such as "2 * 3", and underscores inside a word, such as "snake_case",
 * stay as they are.
 */

/** A piece of formatted text: plain, or emphasised around its own pieces. */
export type FormattedRun = string | { kind: 'emphasis' | 'strong'; children: FormattedRun[] };

// Every other Markdown construct is switched off, so text that happens to
// look like Markdown stays plain: "1989. A year" is not a list, "# 3" is not
// a heading, and brackets, backticks, angle brackets and entities are kept
// as typed. Emphasis, backslash escapes and line endings remain.
const DISABLED_CONSTRUCTS = [
  'autolink',
  'blockQuote',
  'characterReference',
  'codeFenced',
  'codeIndented',
  'codeText',
  'definition',
  'headingAtx',
  'htmlFlow',
  'htmlText',
  'labelEnd',
  'labelStartImage',
  'labelStartLink',
  'list',
  'setextUnderline',
  'thematicBreak',
];

const parser = remark().data('micromarkExtensions', [
  { disable: { null: DISABLED_CONSTRUCTS } },
]);

function toRuns(node: Nodes): FormattedRun[] {
  switch (node.type) {
    case 'text':
      return [node.value];
    case 'emphasis':
    case 'strong':
      return [{ kind: node.type, children: node.children.flatMap(toRuns) }];
    // A hard line break (two trailing spaces or a trailing backslash) is
    // kept as the line break the author typed.
    case 'break':
      return ['\n'];
    // With the constructs above disabled, nothing else should appear; if
    // something does, its text is kept and its formatting is dropped.
    default:
      if ('children' in node) return node.children.flatMap(toRuns);
      if ('value' in node) return [node.value];
      return [];
  }
}

/**
 * Parses short author text into runs. Paragraphs, separated by a blank line,
 * are joined by one blank line, which a `white-space: pre-line` container
 * shows as typed.
 */
export function parseFormattedText(source: string): FormattedRun[] {
  return parser
    .parse(source)
    .children.flatMap((block, index) => (index > 0 ? ['\n\n', ...toRuns(block)] : toRuns(block)));
}

function toPlain(run: FormattedRun): string {
  return typeof run === 'string' ? run : run.children.map(toPlain).join('');
}

/**
 * The same text without its formatting marks, for places that take plain
 * text: the page's meta description and its structured data. Blank or
 * missing text gives `undefined`.
 */
export function formattedTextToPlain(source: string | null | undefined): string | undefined {
  const text = source?.trim();
  if (!text) return undefined;
  return parseFormattedText(text).map(toPlain).join('').trim() || undefined;
}
