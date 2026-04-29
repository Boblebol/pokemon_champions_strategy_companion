export function TeamInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="field team-input">
      <span>Showdown paste</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
