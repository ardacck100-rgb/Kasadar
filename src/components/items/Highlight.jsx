/** Eşleşen aralığı vurgular. range yoksa metni olduğu gibi basar. */
export function Highlight({ text, range }) {
  if (!range) return text;
  const [start, end] = range;
  if (start < 0 || end > text.length || start >= end) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-brand/20 px-0.5 text-inherit">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}
