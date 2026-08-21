const VARIANTS = {
  primary:
    'bg-brand text-brand-ink hover:bg-brand/90 active:bg-brand/80 border border-transparent font-semibold',
  secondary:
    'bg-panel-2 text-ink hover:bg-panel-3 border border-line-strong/60',
  ghost:
    'bg-transparent text-ink-dim hover:text-ink hover:bg-panel-2 border border-transparent',
  danger:
    'bg-danger-dim/60 text-danger hover:bg-danger-dim border border-danger/30',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-base rounded-xl gap-2',
  icon: 'h-9 w-9 text-base rounded-lg justify-center',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center whitespace-nowrap select-none',
        'transition-colors duration-150',
        'disabled:opacity-45 disabled:pointer-events-none',
        SIZES[size] ?? SIZES.md,
        VARIANTS[variant] ?? VARIANTS.secondary,
        className,
      ].join(' ')}
      {...props}
    />
  );
}

/** Sadece ikon taşıyan kare buton — dokunmatikte de rahat basılsın diye 36px. */
export function IconButton({ label, className = '', ...props }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      className={className}
      {...props}
    />
  );
}
