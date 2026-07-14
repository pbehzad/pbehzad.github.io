type PdfFlipViewerProps = {
  pdfUrl: string;
  title: string;
  startPage?: number;
};

export default function PdfFlipViewer({
  pdfUrl,
  title,
  startPage = 1,
}: PdfFlipViewerProps) {
  const viewerPdfUrl = getPublicMediaUrl(pdfUrl);
  const query = new URLSearchParams({
    pdf: viewerPdfUrl,
    page: String(Math.max(1, Math.floor(startPage))),
  });

  return (
    <section className="my-12" aria-labelledby="pdf-viewer-heading">
      <div className="mb-3 flex items-baseline gap-4">
        <h2
          id="pdf-viewer-heading"
          className="text-xs uppercase tracking-[0.2em] opacity-45"
        >
          Reader
        </h2>
      </div>

      <div className="overflow-hidden border border-white/15 bg-[#151515] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <iframe
          src={`/zaya/index.html?${query.toString()}`}
          title={`${title} PDF reader`}
          className="block h-[72svh] min-h-[32rem] w-full border-0"
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
import { getPublicMediaUrl } from '@/lib/media-storage';
