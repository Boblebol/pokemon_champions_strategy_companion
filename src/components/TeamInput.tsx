import { useId, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

function teamExportHref(value: string): string {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`;
}

function readTeamFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Lecture du fichier impossible.')));
    reader.readAsText(file);
  });
}

export function TeamInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textareaId = useId();
  const [importedFileName, setImportedFileName] = useState<string>();
  const exportHref = useMemo(() => teamExportHref(value), [value]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const content = await readTeamFile(file);
    onChange(content);
    setImportedFileName(file.name);
    input.value = '';
  }

  return (
    <div className="field team-input">
      <label htmlFor={textareaId}>Équipe Showdown</label>
      <div className="team-file-actions">
        <label className="team-file-action">
          Importer un fichier
          <input
            aria-label="Importer un fichier équipe"
            className="visually-hidden"
            type="file"
            accept=".txt,.showdown,text/plain"
            onChange={handleFileChange}
          />
        </label>
        <a className="team-file-action" href={exportHref} download="pokemon-champions-team.txt">
          Exporter l'équipe
        </a>
      </div>
      <textarea id={textareaId} value={value} onChange={(event) => onChange(event.target.value)} />
      <small>Colle un export Pokémon Showdown : objet, talent, points d'entraînement, nature et attaques.</small>
      {importedFileName ? <small aria-live="polite">Fichier importé : {importedFileName}</small> : null}
    </div>
  );
}
