export function TeamInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="field team-input">
      <span>Équipe Showdown</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      <small>Colle un export Showdown complet : objet, talent, EV, nature et attaques.</small>
    </label>
  );
}
