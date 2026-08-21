import { useEffect, useRef } from 'react';
import { IconButton } from './Button.jsx';

/**
 * Masaüstünde ortalanmış pencere, mobilde alttan açılan sayfa (bottom sheet).
 * Escape ile kapanır, arka plan kaydırması kilitlenir.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    // İlk odaklanabilir alana geç; yoksa pencerenin kendisine.
    const focusTarget =
      panelRef.current?.querySelector('[data-autofocus]') ??
      panelRef.current?.querySelector('input, select, textarea, button');
    focusTarget?.focus?.();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px] cursor-default"
      />

      <div
        ref={panelRef}
        className={[
          'relative w-full bg-panel border border-line-strong/70 shadow-2xl shadow-black/60',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[92dvh] sm:max-h-[85dvh] flex flex-col',
          widths[size] ?? widths.md,
        ].join(' ')}
      >
        <header className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-line">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight truncate">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-dim leading-snug">{description}</p>
            ) : null}
          </div>
          <IconButton label="Kapat" onClick={onClose} className="-mr-1 -mt-1 shrink-0">
            ✕
          </IconButton>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="px-5 py-4 border-t border-line bg-panel-2/40 rounded-b-2xl [padding-bottom:calc(1rem+env(safe-area-inset-bottom))] sm:[padding-bottom:1rem]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
