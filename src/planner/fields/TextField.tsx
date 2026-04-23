export function TextField({ value, onChange, autoFocus = false }: { value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  return (
    <textarea
      autoFocus={autoFocus}
      className="field"
      onChange={(event) => onChange(event.target.value)}
      rows={5}
      value={value}
    />
  );
}
