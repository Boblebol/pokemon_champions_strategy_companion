import { useState } from 'react';
import { FormatSelector } from './FormatSelector';
import { TeamInput } from './TeamInput';
import type { AnalysisResult } from '../domain/analysis';
import type { FormatId } from '../domain/types';

const SETUP_WIZARD_STORAGE_KEY = 'champions-companion.setup-wizard';

function shouldShowWizardByDefault(): boolean {
  return window.localStorage.getItem(SETUP_WIZARD_STORAGE_KEY) !== 'hidden';
}

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
  const [isOpen, setIsOpen] = useState(shouldShowWizardByDefault);

  function handleToggle() {
    setIsOpen((current) => {
      const next = !current;
      window.localStorage.setItem(SETUP_WIZARD_STORAGE_KEY, next ? 'visible' : 'hidden');
      return next;
    });
  }

  return (
    <section className={`setup-guide ${isOpen ? '' : 'collapsed'}`} aria-label="Assistant de départ">
      <div className="setup-guide-header">
        <div>
          <span className="eyebrow">Assistant optionnel</span>
          <h2>Préparer une partie</h2>
          <p>Un parcours court pour passer du format au calcul Combat sans perdre le contexte de la sélection.</p>
        </div>
        <button type="button" onClick={handleToggle} aria-expanded={isOpen}>
          {isOpen ? "Masquer l'assistant" : "Afficher l'assistant"}
        </button>
      </div>

      {isOpen ? (
        <div className="setup-wizard" aria-label="Étapes de départ">
          <article className="wizard-step">
            <span className="step-kicker">1 Format</span>
            <h3>Choisir le ladder cible</h3>
            <FormatSelector value={format} onChange={onFormatChange} />
            <p>Le format ajuste niveau, style de combat, nombre de picks et snapshot méta.</p>
          </article>

          <article className="wizard-step wide">
            <span className="step-kicker">2 Équipe</span>
            <h3>Importer ou éditer</h3>
            <TeamInput value={paste} onChange={onPasteChange} />
          </article>

          <article className="wizard-step">
            <span className="step-kicker">3 Sélection</span>
            <h3>Verrouiller le plan</h3>
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
            <p>Le diagnostic se recalcule sur les Pokémon cochés dans le constructeur.</p>
          </article>

          <article className="wizard-step">
            <span className="step-kicker">4 Combat</span>
            <h3>Tester le matchup</h3>
            <dl className="wizard-metrics">
              <div>
                <dt>Actifs</dt>
                <dd>{analysis.selectedAudit.format.battleStyle === 'doubles' ? '2v2' : '1v1'}</dd>
              </div>
              <div>
                <dt>Niveau</dt>
                <dd>{analysis.selectedAudit.format.defaultLevel}</dd>
              </div>
            </dl>
            <p>Le panneau Combat compare dégâts sortants et entrants sur les adversaires choisis.</p>
          </article>

          <article className="wizard-step">
            <span className="step-kicker">5 Analyse</span>
            <h3>Lire les priorités</h3>
            <dl className="wizard-metrics">
              <div>
                <dt>Menaces</dt>
                <dd>{analysis.threats.length}</dd>
              </div>
              <div>
                <dt>Données</dt>
                <dd>{analysis.snapshotStatus.isDemo ? 'Démo' : 'Live'}</dd>
              </div>
            </dl>
            <p>Traite les alertes fortes avant d'optimiser les détails de set.</p>
          </article>
        </div>
      ) : (
        <dl className="setup-guide-summary" aria-label="Résumé assistant">
          <div>
            <dt>Sélection</dt>
            <dd>
              {analysis.selectedTeam.members.length}/{analysis.pickSize}
            </dd>
          </div>
          <div>
            <dt>Roster</dt>
            <dd>{analysis.team.members.length}/6</dd>
          </div>
          <div>
            <dt>Données</dt>
            <dd>{analysis.snapshotStatus.isDemo ? 'Démo' : 'Live'}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
