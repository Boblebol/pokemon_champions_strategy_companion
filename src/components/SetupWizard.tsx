import { FormatSelector } from './FormatSelector';
import { TeamInput } from './TeamInput';
import type { AnalysisResult } from '../domain/analysis';
import type { FormatId } from '../domain/types';

export function SetupWizard({
  format,
  onFormatChange,
  paste,
  onPasteChange,
  analysis,
}: {
  format: FormatId;
  onFormatChange: (format: FormatId) => void;
  paste: string;
  onPasteChange: (paste: string) => void;
  analysis: AnalysisResult;
}) {
  return (
    <section className="setup-wizard" aria-label="Assistant de configuration">
      <article className="wizard-step">
        <span className="step-kicker">1 Format</span>
        <h2>Choisir le ladder cible</h2>
        <FormatSelector value={format} onChange={onFormatChange} />
        <p>Le format ajuste le niveau, le style de combat et le snapshot méta utilisé.</p>
      </article>

      <article className="wizard-step wide">
        <span className="step-kicker">2 Équipe</span>
        <h2>Importer le paste Showdown</h2>
        <TeamInput value={paste} onChange={onPasteChange} />
      </article>

      <article className="wizard-step">
        <span className="step-kicker">3 Sélection</span>
        <h2>Verrouiller le plan de match</h2>
        <dl className="wizard-metrics">
          <div>
            <dt>Joués</dt>
            <dd>
              {analysis.selectedTeam.members.length}/{analysis.pickSize}
            </dd>
          </div>
          <div>
            <dt>Roster</dt>
            <dd>{analysis.team.members.length}/6</dd>
          </div>
        </dl>
        <p>Le diagnostic de résistances se recalcule sur les Pokémon cochés dans le constructeur.</p>
      </article>

      <article className="wizard-step">
        <span className="step-kicker">4 Analyse</span>
        <h2>Lire les priorités</h2>
        <dl className="wizard-metrics">
          <div>
            <dt>Pokémon</dt>
            <dd>{analysis.team.members.length}/6</dd>
          </div>
          <div>
            <dt>Menaces</dt>
            <dd>{analysis.threats.length}</dd>
          </div>
          <div>
            <dt>Données</dt>
            <dd>{analysis.snapshotStatus.isDemo ? 'Démo' : 'Live'}</dd>
          </div>
        </dl>
        <p>Corrige les alertes fortes avant d'optimiser les détails de set.</p>
      </article>
    </section>
  );
}
