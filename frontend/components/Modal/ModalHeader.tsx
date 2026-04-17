import Image from "next/image";
import { ReactNode, useEffect, useRef } from "react";

type ModalSize =
  | "2xlarge"
  | "xlarge"
  | "large"
  | "medium"
  | "small"
  | "auto";

type ModalHeaderProps = {
  showModal: boolean;
  onClose: () => void;
  children: ReactNode;
  sizeModal?: ModalSize;

  // ── Header content ──
  title: string;
  subtitle?: string;       // e.g. "Patient: Xyryl Pedrosa"
  meta?: string;           // e.g. "Last Consultation – 2026-03-30"
  icon?: ReactNode;        // custom icon; defaults to document icon
  actions?: ReactNode;     // slot for toggle pills, buttons, etc.
};

export default function ModalHeader({
  showModal,
  onClose,
  children,
  sizeModal = "xlarge",
  title,
  subtitle,
  meta,
  icon,
  actions,
}: ModalHeaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const getSizeClass = (): string => {
    switch (sizeModal) {
      case "2xlarge": return "w-[92vw] max-w-7xl h-auto max-h-[90vh]";
      case "xlarge":  return "w-[90vw] max-w-6xl h-auto max-h-[85vh]";
      case "large":   return "w-[78vw] max-w-4xl h-auto max-h-[80vh]";
      case "medium":  return "w-[90vw] max-w-2xl h-auto max-h-[75vh]";
      case "small":   return "w-[92vw] max-w-sm  h-auto max-h-[60vh]";
      case "auto":    return "w-[92vw] max-w-3xl h-auto";
      default:        return "w-[90vw] max-w-4xl h-auto max-h-[85vh]";
    }
  };

  if (!showModal) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15,34,68,0.55)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(15,34,68,0.22)] ${getSizeClass()}`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-center justify-between gap-4 px-7 py-5"
          style={{
            background: "linear-gradient(90deg, #0f2244 0%, #1a3560 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Left: icon + title block */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_8px_24px_rgba(15,34,68,0.18)]">
              <Image
                src="/images/serviamus.jpeg"
                alt="Serviamus logo"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              {icon ?? (
                <svg
                  className="w-5 h-5"
                  style={{ fill: "rgba(255,255,255,0.7)" }}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Title + subtitle + meta */}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                Serviamus Medical Clinic and Laboratory
              </p>
              <h2
                className="text-white text-lg leading-tight truncate"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                {subtitle && (
                  <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {subtitle}
                  </p>
                )}
                {subtitle && meta && (
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>·</span>
                )}
                {meta && (
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}
                  >
                    {meta}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions slot + close button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Actions slot (e.g. type toggle pills) */}
            {actions && (
              <div>{actions}</div>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                color: "rgba(255,255,255,0.45)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable content area ── */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
