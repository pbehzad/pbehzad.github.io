import { getPublicMediaUrl } from '@/lib/media-storage';

type PdfReaderProps = {
  pdfUrl: string;
  /** Names the document, so the frame's accessible name says which PDF it is. */
  title: string;
  startPage?: number;
};

const HEADING_ID = 'reader-heading';

/**
 * The vendored flip viewer on a flat surface. The reader itself needs
 * JavaScript, so the file's own link sits beside it at all times: that is the
 * no-script path and the failure state if the frame does not load.
 */
export function PdfReader({ pdfUrl, title, startPage = 1 }: PdfReaderProps) {
  const fileUrl = getPublicMediaUrl(pdfUrl);
  const query = new URLSearchParams({
    pdf: fileUrl,
    page: String(Math.max(1, Math.floor(startPage))),
  });

  return (
    <section className="ui-reader" aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className="ui-label">
        reader
      </h2>
      <div className="ui-reader__frame">
        <iframe
          className="ui-reader__frame-inner"
          src={`/zaya/index.html?${query.toString()}`}
          title={`${title} (PDF reader)`}
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="ui-meta">
        <a className="ui-link" href={fileUrl} target="_blank" rel="noopener noreferrer">
          Open the PDF
          <span className="ui-visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </section>
  );
}
