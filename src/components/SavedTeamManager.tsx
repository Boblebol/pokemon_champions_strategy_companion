import { useState } from 'react';
import { getFormatDefinition } from '../domain/formatRules';
import { deleteSavedTeam, readSavedTeams, saveCurrentTeam, type SavedTeam } from '../domain/savedTeams';
import type { FormatId } from '../domain/types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function SavedTeamManager({
  paste,
  format,
  onLoad,
}: {
  paste: string;
  format: FormatId;
  onLoad: (team: SavedTeam) => void;
}) {
  const [name, setName] = useState('');
  const [teams, setTeams] = useState<SavedTeam[]>(() => readSavedTeams(window.localStorage));
  const [message, setMessage] = useState<string>();

  function handleSave() {
    const saved = saveCurrentTeam({ storage: window.localStorage, name, paste, format });
    setTeams(readSavedTeams(window.localStorage));
    setName('');
    setMessage(`Équipe sauvegardée localement : ${saved.name}.`);
  }

  function handleLoad(team: SavedTeam) {
    onLoad(team);
    setMessage('Équipe chargée depuis les sauvegardes locales.');
  }

  function handleDelete(team: SavedTeam) {
    setTeams(deleteSavedTeam(window.localStorage, team.id));
    setMessage(`Sauvegarde supprimée : ${team.name}.`);
  }

  return (
    <section className="panel saved-teams" aria-label="Sauvegardes locales">
      <div className="panel-heading">
        <div>
          <h2>Équipes sauvegardées</h2>
          <p>Les équipes restent dans ce navigateur, sans compte ni serveur.</p>
        </div>
      </div>
      <div className="saved-team-form">
        <label htmlFor="saved-team-name">Nom de sauvegarde</label>
        <input
          id="saved-team-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex. Ladder BO1"
        />
        <button type="button" onClick={handleSave} disabled={paste.trim().length === 0}>
          Sauvegarder l'équipe
        </button>
      </div>
      {message ? (
        <p role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {teams.length === 0 ? <p>Aucune équipe sauvegardée.</p> : null}
      <div className="saved-team-list">
        {teams.map((team) => (
          <article className="saved-team-card" key={team.id}>
            <div>
              <strong>{team.name}</strong>
              <span>
                {getFormatDefinition(team.format)?.label ?? team.format} · {formatDate(team.updatedAt)}
              </span>
            </div>
            <div className="saved-team-actions">
              <button type="button" onClick={() => handleLoad(team)}>
                Charger {team.name}
              </button>
              <button type="button" onClick={() => handleDelete(team)}>
                Supprimer {team.name}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
