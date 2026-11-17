import type { ReactNode } from 'react';
import { parseFormattedText } from './inlineFormatting';
import type { FormattedRun } from './inlineFormatting';

function renderRuns(runs: readonly FormattedRun[]): ReactNode[] {
  // Runs come from fixed text and never reorder, so a position is a stable key.
  return runs.map((run, index) => {
    if (typeof run === 'string') return run;
    const children = renderRuns(run.children);
    return run.kind === 'strong' ? (
      <strong key={index}>{children}</strong>
    ) : (
      <em key={index}>{children}</em>
    );
  });
}

/**
 * Short author text, such as a description, with its minimal formatting
 * (see inlineFormatting.ts) as `em` and `strong`. Rendered on the server; the
 * design system sets them in the real Plex Serif italic and bold (ui.css).
 * The caller supplies the block element.
 */
export function FormattedText({ source }: { source: string }) {
  return <>{renderRuns(parseFormattedText(source))}</>;
}
