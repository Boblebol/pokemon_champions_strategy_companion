import { useEffect, useMemo, useState } from 'react';
import { AuditPanel } from './components/AuditPanel';
import { CombatCalculator } from './components/CombatCalculator';
import { HelpPanel } from './components/HelpPanel';
import { PossibleThreatPanel } from './components/PossibleThreatPanel';
import { SetupWizard } from './components/SetupWizard';
import { SnapshotStatus } from './components/SnapshotStatus';
import { TeamBuilder } from './components/TeamBuilder';
import { TeamPreview } from './components/TeamPreview';
import { ThreatPanel } from './components/ThreatPanel';
import { demoDataBundle } from './data/demoSnapshots';
import { getPkmnReferenceSnapshot } from './data/pkmnReference';
import { analyzeTeam } from './domain/analysis';
import { createDataStore } from './domain/dataStore';
import { getPickSize } from './domain/matchSelection';
import { pokemonDisplayName } from './domain/referenceDisplay';
import { refreshSnapshots } from './domain/snapshotRefresh';
import { parseShowdownTeam } from './domain/teamImport';
import {
  builderStateFromMembers,
  builderStateToShowdownPaste,
  updateBuilderSlot,
} from './domain/teamBuilder';
import type { BuilderSlot } from './domain/teamBuilder';
import type { DataBundle, FormatId } from './domain/types';

type PageId = 'landing' | 'app' | 'docs';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function pageHref(page: PageId): string {
  return `${basePath}/${page}` || `/${page}`;
}

function routePath(): string {
  const redirectedPath = new URLSearchParams(window.location.search).get('path');
  const currentPath = redirectedPath ?? window.location.pathname;

  if (basePath && currentPath.startsWith(basePath)) {
    return currentPath.slice(basePath.length) || '/';
  }

  return currentPath;
}

function resolvePage(): PageId {
  const path = routePath().replace(/\/$/, '');

  if (path.endsWith('/docs')) {
    return 'docs';
  }

  if (path.endsWith('/landing')) {
    return 'landing';
  }

  if (path.endsWith('/app')) {
    return 'app';
  }

  return import.meta.env.DEV ? 'app' : 'landing';
}

const initialPaste = `Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam`;

function AppPage() {
  const [format, setFormat] = useState<FormatId>('champions-bss');
  const [paste, setPaste] = useState(initialPaste);
  const [builderState, setBuilderState] = useState(() => builderStateFromMembers(parseShowdownTeam(initialPaste).members));
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1]);
  const [dataBundle, setDataBundle] = useState<DataBundle>(demoDataBundle);
  const [referenceStatus, setReferenceStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const [refreshMessage, setRefreshMessage] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPkmnReferenceSnapshot()
      .then((reference) => {
        if (!mounted) {
          return;
        }

        setDataBundle((currentBundle) => ({
          ...currentBundle,
          reference,
        }));
        setReferenceStatus('complete');
      })
      .catch(() => {
        if (mounted) {
          setReferenceStatus('error');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const store = useMemo(() => createDataStore(dataBundle), [dataBundle]);
  const pickSize = getPickSize(format);
  const pokemonOptions = useMemo(() => {
    return Object.values(dataBundle.reference.pokemon).sort((left, right) => left.name.localeCompare(right.name));
  }, [dataBundle]);
  const moveOptions = useMemo(() => {
    return Object.values(dataBundle.reference.moves).sort((left, right) => left.name.localeCompare(right.name));
  }, [dataBundle]);
  const analysis = useMemo(() => {
    return analyzeTeam({ paste, format, store, selectedSlots });
  }, [paste, format, store, selectedSlots]);
  const selectedNames = analysis.selectedTeam.members.map((member) =>
    pokemonDisplayName(dataBundle.reference, member.species),
  );
  const topThreat = analysis.threats[0];

  function handleFormatChange(nextFormat: FormatId) {
    const nextPickSize = getPickSize(nextFormat);
    setFormat(nextFormat);
    setSelectedSlots((currentSlots) => currentSlots.slice(0, nextPickSize));
  }

  function handlePasteChange(nextPaste: string) {
    const parsedTeam = parseShowdownTeam(nextPaste);
    setPaste(nextPaste);
    setBuilderState(builderStateFromMembers(parsedTeam.members));
    setSelectedSlots((currentSlots) => {
      const nextSlots = currentSlots.filter((slotId) => slotId <= parsedTeam.members.length).slice(0, pickSize);
      return nextSlots.length > 0 || parsedTeam.members.length === 0 ? nextSlots : [1];
    });
  }

  function handleBuilderSlotChange(slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) {
    const nextState = updateBuilderSlot(builderState, slotId, patch);
    setBuilderState(nextState);
    setPaste(builderStateToShowdownPaste(nextState));
  }

  function handleToggleSelection(slotId: number, selected: boolean) {
    setSelectedSlots((currentSlots) => {
      if (selected) {
        return currentSlots.includes(slotId) ? currentSlots : [...currentSlots, slotId].slice(0, pickSize);
      }

      return currentSlots.filter((currentSlot) => currentSlot !== slotId);
    });
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    const result = await refreshSnapshots({ format, useProxy: import.meta.env.DEV });
    if (result.ok) {
      setDataBundle((currentBundle) => ({
        ...currentBundle,
        meta: {
          ...currentBundle.meta,
          [result.snapshot.format]: result.snapshot,
        },
      }));
    }
    setRefreshMessage(result.message);
    setIsRefreshing(false);
  }

  return (
    <main className="product-shell app-only-shell app-redesign">
      <PageNav tone="light" />
      <section className="app-shell" id="app" aria-label="Cockpit d'analyse">
        <header className="top-bar">
          <div className="cockpit-intro">
            <span className="eyebrow">Cockpit local · 3v3 / 4v4</span>
            <h1>Cockpit stratégique</h1>
            <p>Importe, ajuste et valide ton équipe avec une lecture pensée pour le bring 6 pick 3 niveau 100.</p>
            <dl className="cockpit-kpis">
              <div>
                <dt>Roster complet</dt>
                <dd>{analysis.team.members.length}/6</dd>
              </div>
              <div>
                <dt>Sélection jouée</dt>
                <dd>
                  {selectedSlots.length}/{pickSize}
                </dd>
              </div>
              <div>
                <dt>Menace haute</dt>
                <dd>{topThreat ? pokemonDisplayName(dataBundle.reference, topThreat.species) : 'À compléter'}</dd>
              </div>
            </dl>
          </div>
          <SnapshotStatus
            label={analysis.snapshotStatus.label}
            source={analysis.snapshotStatus.source}
            onRefresh={handleRefresh}
            refreshMessage={refreshMessage}
            isRefreshing={isRefreshing}
          />
        </header>

        <SetupWizard
          format={format}
          onFormatChange={handleFormatChange}
          paste={paste}
          onPasteChange={handlePasteChange}
          analysis={analysis}
        />

        <TeamBuilder
          state={builderState}
          pokemonOptions={pokemonOptions}
          moveOptions={moveOptions}
          itemOptions={dataBundle.reference.items}
          natureOptions={dataBundle.reference.natures}
          reference={dataBundle.reference}
          referenceStatus={referenceStatus}
          referenceSource={dataBundle.reference.source}
          selectedSlots={selectedSlots}
          pickSize={pickSize}
          onSlotChange={handleBuilderSlotChange}
          onToggleSelection={handleToggleSelection}
        />

        <CombatCalculator format={format} selectedTeam={analysis.selectedTeam.members} reference={dataBundle.reference} />

        <div className="dashboard">
          <TeamPreview reference={dataBundle.reference} team={analysis.team} />
          <AuditPanel audit={analysis.audit} />
          <section className="panel selected-analysis">
            <h2>Plan de match 3v3</h2>
            <h3>Analyse sélection jouée</h3>
            <p>
              Sélection de match : {analysis.pickSize} Pokémon à choisir au niveau{' '}
              {analysis.selectedAudit.format.defaultLevel}.
            </p>
            {analysis.selectionWarnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
            <p>
              Joués : {selectedNames.join(', ') || 'aucun'}
            </p>
            <div className="speed-tier-list" aria-label="Speed tiers sélection">
              {analysis.selectedAudit.speed.map((speed) => (
                <article className="speed-tier" key={speed.species}>
                  <strong>
                    {pokemonDisplayName(dataBundle.reference, speed.species)}: {speed.speed}{' '}
                    {speed.estimated ? 'estimé' : 'exact'}
                  </strong>
                  <span>
                    {speed.benchmarks
                      .filter((benchmark) => benchmark.label !== 'Base')
                      .map((benchmark) => `${benchmark.label} ${benchmark.speed}`)
                      .join(' · ')}
                  </span>
                </article>
              ))}
            </div>
            <div className="finding-list">
              {[...analysis.selectedAudit.defensive, ...analysis.selectedAudit.offensive].map((finding) => (
                <article className={`finding ${finding.severity}`} key={finding.title}>
                  <strong>{finding.title}</strong>
                  {finding.evidence.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </article>
              ))}
            </div>
          </section>
          <ThreatPanel reference={dataBundle.reference} threats={analysis.threats} />
          <PossibleThreatPanel
            reference={dataBundle.reference}
            threats={analysis.selectedPossibleThreats}
            selectedCount={analysis.selectedTeam.members.length}
            pickSize={analysis.pickSize}
          />
          <HelpPanel />
        </div>
      </section>

      <footer className="app-footer">
        <span>Assistant stratégique Pokémon Champions · outil local de préparation d'équipe</span>
        <a href="https://alexandre-enouf.fr" target="_blank" rel="noreferrer">
          Alexandre Enouf
        </a>
      </footer>
    </main>
  );
}

function PageNav({ tone = 'dark', compact = false }: { tone?: 'dark' | 'light'; compact?: boolean }) {
  return (
    <nav className={`site-nav ${tone}`} aria-label="Navigation principale">
      <a className="brand-link" href={pageHref('landing')}>
        Champions Companion
      </a>
      <div>
        <a href={pageHref('app')}>{compact ? 'App' : "Ouvrir l'app"}</a>
        <a href={pageHref('docs')}>{compact ? 'Doc' : 'Ouvrir la doc'}</a>
      </div>
    </nav>
  );
}

function LandingHeroVisual() {
  return (
    <div className="hero-visual landing-product-shot" aria-hidden="true">
      <div className="match-strip">
        <span>Team preview</span>
        <strong>6 vers 3</strong>
      </div>
      <div className="match-board">
        {['Great Tusk', 'Dragonite', 'Gholdengo', 'Slot libre', 'Slot libre', 'Slot libre'].map((slot, index) => (
          <div className={`board-slot ${index < 3 ? 'picked' : ''}`} key={`${slot}-${index}`}>
            <span>{index + 1}</span>
            <strong>{slot}</strong>
            <small>{index < 3 ? 'Pick recommandé' : 'Option roster'}</small>
          </div>
        ))}
      </div>
      <div className="threat-radar">
        <span>Menace possible</span>
        <strong>Flutter Mane</strong>
        <small>Moonblast · Vitesse max 405</small>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="product-shell marketing-page">
      <section className="marketing-hero standalone-landing" aria-label="Présentation marketing">
        <PageNav compact />
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">Pokémon Champions · bring 6 pick 3 / VGC 4v4</span>
            <h1>Gagne du temps au team preview</h1>
            <p>
              Construis ton roster, verrouille tes picks joués et repère immédiatement les pressions qui comptent :
              dégâts Combat, couverture offensive, faiblesses défensives, speed tiers exacts et menaces hors méta.
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href={pageHref('app')}>
                Ouvrir l'app
              </a>
              <a className="secondary-cta" href={pageHref('docs')}>
                Ouvrir la doc
              </a>
            </div>
            <dl className="hero-proof">
              <div>
                <dt>Roster de 6</dt>
                <dd>sets, EV, images, noms FR et commentaires centralisés</dd>
              </div>
              <div>
                <dt>Analyse 3v3 niveau 100</dt>
                <dd>sélection jouée, faiblesses réelles et speed tiers +1/+2</dd>
              </div>
              <div>
                <dt>Combat rapide</dt>
                <dd>dégâts sortants et entrants avec boosts, terrain, météo et Tera</dd>
              </div>
              <div>
                <dt>Menaces hors méta</dt>
                <dd>coverage possible depuis les learnsets complets</dd>
              </div>
            </dl>
          </div>
          <LandingHeroVisual />
        </div>
      </section>

      <section className="landing-band">
        <div className="landing-section-heading">
          <span className="eyebrow">Workflow</span>
          <h2>De l'idée de team au plan de match</h2>
          <p>La landing reste marketing. L'app reste un cockpit de travail, sans friction locale inutile.</p>
        </div>
        <div className="landing-feature-grid">
          <article>
            <strong>Construit pour Champions 3v3</strong>
            <p>Le roster complet reste visible, mais les alertes critiques se recalculent sur les 3 Pokémon joués.</p>
          </article>
          <article>
            <strong>Données exploitables</strong>
            <p>Usages Smogon, snapshots locaux, refresh live et fallback offline restent lisibles dans le cockpit.</p>
          </article>
          <article>
            <strong>Décision rapide</strong>
            <p>Tu vois les types couverts, les trous défensifs, les vitesses exactes et les sets probables à préparer.</p>
          </article>
        </div>
      </section>

      <section className="landing-band landing-band-contrast">
        <div className="landing-section-heading">
          <span className="eyebrow">Pourquoi l'utiliser</span>
          <h2>Moins de tableurs, plus de décisions</h2>
        </div>
        <div className="landing-metrics">
          <div>
            <strong>3v3</strong>
            <span>lecture adaptée au match réel</span>
          </div>
          <div>
            <strong>Niveau 100</strong>
            <span>calculs vitesse alignés Champions</span>
          </div>
          <div>
            <strong>Learnsets</strong>
            <span>menaces possibles non limitées au top usage</span>
          </div>
          <div>
            <strong>Local-first</strong>
            <span>fonctionne même sans refresh réseau</span>
          </div>
        </div>
        <div className="landing-final-cta">
          <a className="primary-cta" href={pageHref('app')}>
            Ouvrir l'app
          </a>
          <a className="secondary-cta" href={pageHref('docs')}>
            Ouvrir la doc
          </a>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}

function DocsPage() {
  return (
    <main className="product-shell docs-page">
      <PageNav tone="light" />
      <section className="docs-shell" aria-label="Documentation">
        <header className="docs-hero">
          <span className="eyebrow">Guide utilisateur</span>
          <h1>Documentation Champions Companion</h1>
          <p>
            Une référence courte pour comprendre le workflow, les formats, le calcul Combat, les données utilisées et
            les limites actuelles.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href={pageHref('app')}>
              Ouvrir l'app
            </a>
            <a className="secondary-cta" href={pageHref('landing')}>
              Voir la landing
            </a>
          </div>
        </header>

        <div className="docs-grid">
          <article>
            <h2>1. Démarrer avec l'assistant</h2>
            <p>
              L'assistant de départ est optionnel et repliable. Il garde sous les yeux le format, le roster, les picks
              joués, le Combat et les priorités d'analyse sans bloquer le cockpit.
            </p>
          </article>
          <article>
            <h2>2. Choisir le format</h2>
            <p>
              Champions 3v3 est le mode par défaut : équipe de 6, sélection de 3, calculs au niveau 100. Champions
              VGC 4v4 Duo couvre le format en duo avec 4 picks sur 6, et OU reste disponible pour comparer d'autres
              lectures.
            </p>
          </article>
          <article>
            <h2>3. Construire l'équipe</h2>
            <p>
              Utilise les menus du constructeur pour choisir un Pokémon, son talent, son objet, sa nature, ses EV et ses
              quatre attaques disponibles dans la source complète. Les libellés sont affichés en français quand PokéAPI
              les fournit, mais l'export reste en anglais Showdown.
            </p>
          </article>
          <article>
            <h2>4. Verrouiller les picks</h2>
            <p>
              Les panneaux défensifs, offensifs, menaces méta, speed tiers et menaces hors méta deviennent beaucoup plus
              utiles quand la sélection jouée est complète : 3 en Champions 3v3, 4 en Champions VGC 4v4 Duo, 6 en OU.
            </p>
          </article>
          <article>
            <h2>5. Simuler le combat</h2>
            <p>
              Le panneau Combat calcule les dégâts sortants et les dégâts entrants les plus dangereux avec
              <code>@smogon/calc</code>. Il prend en compte niveau du format, boosts, météo, terrain, protections par
              côté, brûlure, critique, Tera et attaques apprenables.
            </p>
          </article>
          <article>
            <h2>6. Lire coverage possible</h2>
            <p>
              Le panneau hors méta scanne les learnsets complets pour trouver les Pokémon capables de toucher ta
              sélection super efficacement, puis propose une vitesse max et des archétypes de sets.
            </p>
          </article>
          <article>
            <h2>Données locales</h2>
            <p>
              La référence de construction vient de <code>@pkmn/dex</code> et <code>@pkmn/data</code>. Les images et
              noms localisés viennent d'un snapshot PokéAPI stocké en métadonnées, sans vendorer les fichiers image.
            </p>
          </article>
          <article>
            <h2>Données et refresh</h2>
            <p>
              Le refresh Smogon peut échouer si le réseau, Smogon ou CORS bloque la requête. Les noms localisés et URLs
              d'images viennent d'un snapshot PokéAPI local, donc l'app garde le snapshot local et reste utilisable
              offline côté données.
            </p>
          </article>
          <article>
            <h2>Limites connues</h2>
            <p>
              Le calcul Combat couvre les modificateurs essentiels, mais les IV ne sont pas encore éditables dans le
              constructeur et certains cas ultra spécifiques peuvent demander une vérification Showdown.
            </p>
          </article>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}

function MarketingFooter() {
  return (
    <footer className="app-footer">
      <span>Assistant stratégique Pokémon Champions · outil local de préparation d'équipe</span>
      <a href="https://alexandre-enouf.fr" target="_blank" rel="noreferrer">
        Alexandre Enouf
      </a>
    </footer>
  );
}

export default function App() {
  const page = resolvePage();

  if (page === 'docs') {
    return <DocsPage />;
  }

  if (page === 'landing') {
    return <LandingPage />;
  }

  return <AppPage />;
}
