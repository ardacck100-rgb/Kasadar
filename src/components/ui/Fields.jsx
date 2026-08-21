import { useId } from 'react';

const CONTROL =
  'w-full bg-panel-2 border border-line-strong/60 rounded-xl px-3 text-ink ' +
  'placeholder:text-ink-faint transition-colors ' +
  'hover:border-line-strong focus:border-brand/70 focus:outline-none ' +
  'focus-visible:outline-none';

function Wrapper({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-ink-dim">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, className = '', ...props }) {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={`${CONTROL} h-11 ${error ? 'border-danger/60' : ''} ${className}`}
        {...props}
      />
    </Wrapper>
  );
}

export function SelectField({ label, hint, error, children, className = '', ...props }) {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className={`${CONTROL} h-11 appearance-none bg-[length:12px] pr-9 ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='%239fb2c6' d='M1 1.5 6 6.5l5-5'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export function TextAreaField({ label, hint, error, className = '', rows = 3, ...props }) {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={`${CONTROL} py-2.5 resize-y leading-relaxed ${className}`}
        {...props}
      />
    </Wrapper>
  );
}
