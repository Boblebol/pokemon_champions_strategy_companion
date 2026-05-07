
// ── Shared data, helpers and small components ─────────────────────────────

// ── i18n ──────────────────────────────────────────────────────────────────
const LABELS = {
  fr: {
    nav_team: 'Team', nav_build: 'Build', nav_actifs: 'Actifs', nav_match: 'Match',
    team_title: 'Mon équipe', team_empty: 'Team vide', team_count: (n) => `${n}/6 Pokémon`,
    team_actifs_ready: (n, t) => `${n}/${t} actifs prêts`,
    mode_1v1: '1v1 · 3 Pokémon', mode_2v2: '2v2 · 4 Pokémon',
    btn_continue: 'Continuer le build', btn_new: 'Créer une team vide',
    btn_save: 'Sauvegarder', btn_load: 'Charger', btn_export: 'Exporter',
    saves_title: 'Sauvegardes', saves_search: 'Rechercher une sauvegarde…',
    saves_empty: 'Aucune sauvegarde trouvée',
    offline_on: 'Disponible hors ligne',
    build_title: 'Build', slot_label: (n) => `Slot ${n}`,
    search_pokemon: 'Rechercher un Pokémon…',
    search_item: 'Rechercher un objet…',
    search_move: (n) => `Attaque ${n}…`,
    details_toggle: 'Détails avancés',
    talent_label: 'Talent', tera_label: 'Tera', nature_label: 'Nature',
    ev_label: 'EV', comment_label: 'Note',
    ev_total: 'Total EV',
    ev_presets: 'Présets',
    actifs_title: 'Actifs', actifs_ready: (n, t) => `${n}/${t} actifs prêts`,
    search_actif: (n) => `Actif ${n}…`,
    btn_match: 'Ouvrir le match',
    match_title: 'Match',
    combat_title: 'Combat', search_opp: 'Rechercher un adversaire…',
    dmg_given: 'Dégâts donnés', dmg_taken: 'Dégâts reçus',
    advanced_opts: 'Options avancées',
    cov_offense: 'Couverture offensive', cov_defense: 'Couverture défensive',
    cov_strong: 'Fort contre', cov_missing: 'Manque',
    cov_weak: 'Faiblesses', cov_resists: 'Résistances', cov_immune: 'Immunités',
    cov_shared_weak: 'Faiblesse commune',
    threats_title: 'Menaces',
    freq_threats: 'Adversaires fréquents', rare_threats: 'Adversaires rares',
    export_analysis: "Exporter l'analyse",
    threat_why_def: 'Menace défensive', threat_why_off: 'Passe les résistances',
    threat_why_speed: 'Plus rapide', threat_why_coverage: 'Couvre plusieurs actifs',
  },
  en: {
    nav_team: 'Team', nav_build: 'Build', nav_actifs: 'Active', nav_match: 'Match',
    team_title: 'My Team', team_empty: 'Empty team', team_count: (n) => `${n}/6 Pokémon`,
    team_actifs_ready: (n, t) => `${n}/${t} active ready`,
    mode_1v1: '1v1 · 3 Pokémon', mode_2v2: '2v2 · 4 Pokémon',
    btn_continue: 'Continue build', btn_new: 'New empty team',
    btn_save: 'Save', btn_load: 'Load', btn_export: 'Export',
    saves_title: 'Saves', saves_search: 'Search a save…',
    saves_empty: 'No saves found',
    offline_on: 'Available offline',
    build_title: 'Build', slot_label: (n) => `Slot ${n}`,
    search_pokemon: 'Search Pokémon…',
    search_item: 'Search item…',
    search_move: (n) => `Move ${n}…`,
    details_toggle: 'Advanced details',
    talent_label: 'Ability', tera_label: 'Tera', nature_label: 'Nature',
    ev_label: 'EVs', comment_label: 'Note',
    ev_total: 'Total EVs',
    ev_presets: 'Presets',
    actifs_title: 'Active', actifs_ready: (n, t) => `${n}/${t} active ready`,
    search_actif: (n) => `Active ${n}…`,
    btn_match: 'Open match',
    match_title: 'Match',
    combat_title: 'Combat', search_opp: 'Search opponent…',
    dmg_given: 'Damage dealt', dmg_taken: 'Damage taken',
    advanced_opts: 'Advanced options',
    cov_offense: 'Offensive coverage', cov_defense: 'Defensive coverage',
    cov_strong: 'Strong vs', cov_missing: 'Missing',
    cov_weak: 'Weaknesses', cov_resists: 'Resistances', cov_immune: 'Immunities',
    cov_shared_weak: 'Shared weakness',
    threats_title: 'Threats',
    freq_threats: 'Frequent threats', rare_threats: 'Rare threats',
    export_analysis: 'Export analysis',
    threat_why_def: 'Defensive threat', threat_why_off: 'Bypasses resistances',
    threat_why_speed: 'Faster', threat_why_coverage: 'Covers multiple actives',
  }
};

// ── Pokémon type colors ────────────────────────────────────────────────────
const TYPE_COLORS = {
  Normal:    { bg: '#A8A878', text: '#fff' },
  Feu:       { bg: '#F08030', text: '#fff' }, Fire:     { bg: '#F08030', text: '#fff' },
  Eau:       { bg: '#6890F0', text: '#fff' }, Water:    { bg: '#6890F0', text: '#fff' },
  Plante:    { bg: '#78C850', text: '#fff' }, Grass:    { bg: '#78C850', text: '#fff' },
  Électrik:  { bg: '#F8D030', text: '#1a1a1a' }, Electric: { bg: '#F8D030', text: '#1a1a1a' },
  Glace:     { bg: '#98D8D8', text: '#1a1a1a' }, Ice:      { bg: '#98D8D8', text: '#1a1a1a' },
  Combat:    { bg: '#C03028', text: '#fff' }, Fighting: { bg: '#C03028', text: '#fff' },
  Poison:    { bg: '#A040A0', text: '#fff' },
  Sol:       { bg: '#E0C068', text: '#1a1a1a' }, Ground:  { bg: '#E0C068', text: '#1a1a1a' },
  Vol:       { bg: '#A890F0', text: '#fff' }, Flying:   { bg: '#A890F0', text: '#fff' },
  Psy:       { bg: '#F85888', text: '#fff' }, Psychic:  { bg: '#F85888', text: '#fff' },
  Insecte:   { bg: '#A8B820', text: '#fff' }, Bug:      { bg: '#A8B820', text: '#fff' },
  Roche:     { bg: '#B8A038', text: '#fff' }, Rock:     { bg: '#B8A038', text: '#fff' },
  Spectre:   { bg: '#705898', text: '#fff' }, Ghost:    { bg: '#705898', text: '#fff' },
  Dragon:    { bg: '#7038F8', text: '#fff' },
  Ténèbres:  { bg: '#705848', text: '#fff' }, Dark:     { bg: '#705848', text: '#fff' },
  Acier:     { bg: '#B8B8D0', text: '#1a1a1a' }, Steel:  { bg: '#B8B8D0', text: '#1a1a1a' },
  Fée:       { bg: '#EE99AC', text: '#1a1a1a' }, Fairy:  { bg: '#EE99AC', text: '#1a1a1a' },
};

function TypeBadge({ type, small }) {
  const c = TYPE_COLORS[type] || { bg: '#888', text: '#fff' };
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg, color: c.text,
      fontSize: small ? 9 : 10, fontWeight: 600, lineHeight: 1,
      padding: small ? '2px 5px' : '3px 7px',
      borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: '0.03em',
    }}>{type}</span>
  );
}

// ── Abilities per Pokémon ──────────────────────────────────────────────────
const ABILITIES_DB = {
  'Dracolosse': [
    { name: 'Multiécaille', nameEn: 'Multiscale', desc: 'Réduit les dégâts à PV pleins', descEn: 'Reduces damage at full HP' },
    { name: 'Attention', nameEn: 'Inner Focus', desc: 'Empêche la peur', descEn: 'Prevents flinching' },
    { name: 'Force Intérieure', nameEn: 'Sheer Force', desc: 'Bloque certaines baisses de stats', descEn: 'Removes secondary effects, boosts power' },
  ],
  'Carchacrok': [
    { name: 'Voile Sable', nameEn: 'Sand Veil', desc: 'Augmente l\'esquive sous sable', descEn: 'Boosts evasion in sandstorm' },
    { name: 'Peau Dure', nameEn: 'Rough Skin', desc: 'Blesse au contact', descEn: 'Damages on contact' },
  ],
  'Kangourex': [
    { name: 'Querelleur', nameEn: 'Scrappy', desc: 'Touche les Spectres avec Normal/Combat', descEn: 'Hits Ghosts with Normal/Fighting' },
    { name: 'Attention', nameEn: 'Inner Focus', desc: 'Empêche la peur', descEn: 'Prevents flinching' },
  ],
  'Gardevoir': [
    { name: 'Synchro', nameEn: 'Synchronize', desc: 'Transmet les altérations de statut', descEn: 'Passes status conditions back' },
    { name: 'Trace', nameEn: 'Trace', desc: 'Copie le talent adverse', descEn: 'Copies the opponent\'s ability' },
  ],
  'Corvaillus': [
    { name: 'Miroir', nameEn: 'Mirror Armor', desc: 'Renvoie les baisses de stats', descEn: 'Reflects stat drops' },
    { name: 'Pressions', nameEn: 'Pressure', desc: 'Fait consommer 2 PP par attaque ennemie', descEn: 'Forces extra PP usage' },
  ],
  'Amphinobi': [
    { name: 'Colle-Bave', nameEn: 'Torrent', desc: 'Booste Eau à bas PV', descEn: 'Boosts Water moves at low HP' },
    { name: 'Protoforme', nameEn: 'Protean', desc: 'Change de type à chaque attaque', descEn: 'Changes type with each move' },
  ],
};

// ── Natures ────────────────────────────────────────────────────────────────
const NATURES_DB = [
  { name: 'Jovial',   nameEn: 'Jolly',   plus: 'Vit', minus: 'Atq Spé', plusEn: 'Spe', minusEn: 'SpA' },
  { name: 'Rigide',   nameEn: 'Adamant', plus: 'Atq', minus: 'Atq Spé', plusEn: 'Atk', minusEn: 'SpA' },
  { name: 'Timide',   nameEn: 'Timid',   plus: 'Vit', minus: 'Atq',     plusEn: 'Spe', minusEn: 'Atk' },
  { name: 'Modeste',  nameEn: 'Modest',  plus: 'Atq Spé', minus: 'Atq', plusEn: 'SpA', minusEn: 'Atk' },
  { name: 'Prudent',  nameEn: 'Careful', plus: 'Déf Spé', minus: 'Atq Spé', plusEn: 'SpD', minusEn: 'SpA' },
  { name: 'Assuré',   nameEn: 'Bold',    plus: 'Déf', minus: 'Atq',     plusEn: 'Def', minusEn: 'Atk' },
  { name: 'Sérieux',  nameEn: 'Serious', plus: null, minus: null, plusEn: null, minusEn: null },
  { name: 'Bizarre',  nameEn: 'Quirky',  plus: null, minus: null, plusEn: null, minusEn: null },
  { name: 'Espiègle', nameEn: 'Naive',   plus: 'Vit', minus: 'Déf Spé', plusEn: 'Spe', minusEn: 'SpD' },
  { name: 'Fougueux', nameEn: 'Hasty',   plus: 'Vit', minus: 'Déf',     plusEn: 'Spe', minusEn: 'Def' },
];

// EV presets
const EV_PRESETS = {
  fr: [
    { label: 'Physique rapide', evs: { hp: 6,   atk: 252, def: 0,   spa: 0,   spd: 0,   spe: 252 } },
    { label: 'Spécial rapide',  evs: { hp: 6,   atk: 0,   def: 0,   spa: 252, spd: 0,   spe: 252 } },
    { label: 'Déf. physique',   evs: { hp: 252, atk: 0,   def: 252, spa: 0,   spd: 6,   spe: 0   } },
    { label: 'Déf. spéciale',   evs: { hp: 252, atk: 0,   def: 6,   spa: 0,   spd: 252, spe: 0   } },
  ],
  en: [
    { label: 'Physical fast',   evs: { hp: 6,   atk: 252, def: 0,   spa: 0,   spd: 0,   spe: 252 } },
    { label: 'Special fast',    evs: { hp: 6,   atk: 0,   def: 0,   spa: 252, spd: 0,   spe: 252 } },
    { label: 'Phys. wall',      evs: { hp: 252, atk: 0,   def: 252, spa: 0,   spd: 6,   spe: 0   } },
    { label: 'Sp. wall',        evs: { hp: 252, atk: 0,   def: 6,   spa: 0,   spd: 252, spe: 0   } },
  ],
};

const EV_STATS = ['hp','atk','def','spa','spd','spe'];
const EV_LABELS_FR = { hp:'PV', atk:'Atq', def:'Déf', spa:'Atq Spé', spd:'Déf Spé', spe:'Vit' };
const EV_LABELS_EN = { hp:'HP', atk:'Atk', def:'Def', spa:'SpA', spd:'SpD', spe:'Spe' };

function defaultEVs(pkName) {
  const presets = {
    'Dracolosse': { hp: 6,   atk: 252, def: 0, spa: 0, spd: 0,   spe: 252 },
    'Carchacrok': { hp: 6,   atk: 252, def: 0, spa: 0, spd: 0,   spe: 252 },
    'Kangourex':  { hp: 252, atk: 252, def: 0, spa: 0, spd: 0,   spe: 6   },
  };
  return presets[pkName] || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

// ── Pokémon data ────────────────────────────────────────────────────────────
const POKEMON_DB = [
  { id: 1, name: 'Dracolosse', nameEn: 'Dragonite',  types: ['Dragon', 'Vol'],     tier: 'S', ability: 'Multiécaille', teraType: 'Normal', nature: 'Jovial',  speed: 80 },
  { id: 2, name: 'Carchacrok', nameEn: 'Garchomp',   types: ['Dragon', 'Sol'],     tier: 'S', ability: 'Voile Sable',  teraType: 'Sol',    nature: 'Jovial',  speed: 102 },
  { id: 3, name: 'Kangourex',  nameEn: 'Kangaskhan', types: ['Normal'],            tier: 'A', ability: 'Querelleur',   teraType: 'Normal', nature: 'Rigide',  speed: 90 },
  { id: 4, name: 'Gardevoir',  nameEn: 'Gardevoir',  types: ['Psy', 'Fée'],       tier: 'A', ability: 'Synchro',      teraType: 'Fée',    nature: 'Timide',  speed: 80 },
  { id: 5, name: 'Corvaillus', nameEn: 'Corviknight', types: ['Vol', 'Acier'],     tier: 'B', ability: 'Miroir',       teraType: 'Vol',    nature: 'Assuré',  speed: 67 },
  { id: 6, name: 'Amphinobi',  nameEn: 'Greninja',   types: ['Eau', 'Ténèbres'],  tier: 'S', ability: 'Protoforme',   teraType: 'Eau',    nature: 'Timide',  speed: 122 },
  { id: 7, name: 'Scalproie',  nameEn: 'Bisharp',    types: ['Ténèbres', 'Acier'], tier: 'A', ability: 'Défaitiste',   teraType: 'Acier',  nature: 'Rigide',  speed: 70 },
  { id: 8, name: 'Pyrax',      nameEn: 'Heatran',    types: ['Feu', 'Acier'],     tier: 'A', ability: 'Flash Feu',    teraType: 'Acier',  nature: 'Modeste', speed: 77 },
];

const ITEMS_DB = [
  { id: 1, name: 'Grosses Bottes',  nameEn: 'Heavy-Duty Boots', desc: 'Protège des pièges' },
  { id: 2, name: 'Orbe Vie',        nameEn: 'Life Orb',         desc: '+30% puissance, -10% PV/tour' },
  { id: 3, name: 'Restes',          nameEn: 'Leftovers',        desc: 'Régénère 1/16 PV/tour' },
  { id: 4, name: 'Mouchoir Choix',  nameEn: 'Choice Scarf',     desc: '+50% Vitesse, verrouille une attaque' },
  { id: 5, name: 'Focécharpe',      nameEn: 'Focus Sash',       desc: 'Résiste un KO avec 1 PV' },
  { id: 6, name: 'Ceinture Expert', nameEn: 'Expert Belt',      desc: '+20% si type super-efficace' },
];

const MOVES_DB = [
  { id: 1, name: 'Séisme',          nameEn: 'Earthquake',    type: 'Sol',    cat: 'Physique', catEn: 'Physical', power: 100, acc: 100, pp: 10, stabOn: ['Carchacrok'] },
  { id: 2, name: 'Vitesse Extrême', nameEn: 'Extreme Speed', type: 'Normal', cat: 'Physique', catEn: 'Physical', power: 80,  acc: 100, pp: 5,  stabOn: [] },
  { id: 3, name: 'Draco-Danse',     nameEn: 'Dragon Dance',  type: 'Dragon', cat: 'Statut',   catEn: 'Status',   power: null,acc: null,pp: 20, stabOn: ['Dracolosse','Carchacrok'] },
  { id: 4, name: 'Laser Glace',     nameEn: 'Ice Beam',      type: 'Glace',  cat: 'Spécial',  catEn: 'Special',  power: 90,  acc: 100, pp: 10, stabOn: [] },
  { id: 5, name: 'Close Combat',    nameEn: 'Close Combat',  type: 'Combat', cat: 'Physique', catEn: 'Physical', power: 120, acc: 100, pp: 5,  stabOn: [] },
  { id: 6, name: 'Surf',            nameEn: 'Surf',          type: 'Eau',    cat: 'Spécial',  catEn: 'Special',  power: 90,  acc: 100, pp: 15, stabOn: ['Amphinobi'] },
  { id: 7, name: 'Lance-Flamme',    nameEn: 'Flamethrower',  type: 'Feu',    cat: 'Spécial',  catEn: 'Special',  power: 90,  acc: 100, pp: 15, stabOn: ['Pyrax'] },
  { id: 8, name: 'Tranche',         nameEn: 'Night Slash',   type: 'Ténèbres',cat:'Physique', catEn: 'Physical', power: 70,  acc: 100, pp: 15, stabOn: ['Amphinobi'] },
];

const SAVES_DB = [
  { id: 1, name: 'VGC Malmö Reg.G',  date: '04 mai 2026', mode: '2v2', pokemons: ['Dracolosse','Carchacrok','Gardevoir','Amphinobi'] },
  { id: 2, name: 'Ladder BO3 speed', date: '02 mai 2026', mode: '1v1', pokemons: ['Carchacrok','Corvaillus','Kangourex'] },
  { id: 3, name: 'Test Rain',         date: '29 avr. 2026', mode: '2v2', pokemons: ['Amphinobi','Corvaillus','Dracolosse','Pyrax'] },
  { id: 4, name: 'Stall build',       date: '25 avr. 2026', mode: '1v1', pokemons: ['Corvaillus','Gardevoir','Kangourex'] },
];

const THREATS_DB = [
  {
    name: 'Gardevoir', nameEn: 'Gardevoir', types: ['Psy','Fée'], threat: 'high',
    reason: 'Psi-Choc KO Amphinobi', reasonEn: 'Psyshock KOs Greninja',
    whyTags: ['threat_why_def','threat_why_coverage'],
    targets: ['Dracolosse','Amphinobi'],
    speed: 80,
  },
  {
    name: 'Amphinobi', nameEn: 'Greninja', types: ['Eau','Ténèbres'], threat: 'high',
    reason: 'Protoforme perce tout', reasonEn: 'Protean pierces everything',
    whyTags: ['threat_why_off','threat_why_speed'],
    targets: ['Dracolosse','Carchacrok'],
    speed: 122,
  },
  {
    name: 'Scalproie', nameEn: 'Bisharp', types: ['Ténèbres','Acier'], threat: 'mid',
    reason: 'Renforce si tu utilises Défense', reasonEn: 'Powers up on Defog',
    whyTags: ['threat_why_def'],
    targets: ['Gardevoir'],
    speed: 70,
  },
  {
    name: 'Pyrax', nameEn: 'Heatran', types: ['Feu','Acier'], threat: 'mid',
    reason: 'Résiste Dragon + Fée', reasonEn: 'Resists Dragon + Fairy',
    whyTags: ['threat_why_off'],
    targets: ['Dracolosse'],
    speed: 77,
  },
];

// ── Empty slot template ────────────────────────────────────────────────────
function emptySlot() {
  return {
    pokemon: null, item: null,
    moves: [null, null, null, null],
    ability: null, teraType: '', nature: null,
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    comment: '',
  };
}

// ── Small reusable UI ──────────────────────────────────────────────────────
function SearchInput({ placeholder, value, onChange, style }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-subtle)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', paddingLeft: 32, paddingRight: 12,
          height: 38, border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: '#fff', color: 'var(--fg)',
          fontSize: 13, fontFamily: 'var(--font-sans)',
          outline: 'none', boxShadow: 'var(--shadow-inset-field)', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.boxShadow = 'var(--ring-focus)'}
        onBlur={e => e.target.style.boxShadow = 'var(--shadow-inset-field)'}
      />
    </div>
  );
}

function Btn({ label, variant = 'primary', onClick, small, fullWidth, icon, disabled }) {
  const btnStyles = {
    primary:   { bg: 'var(--primary)',  color: '#fff',          border: 'none', hoverBg: 'var(--primary-dark)' },
    secondary: { bg: '#fff',            color: 'var(--fg)',      border: '1px solid var(--border)', hoverBg: 'var(--bg-muted)' },
    ghost:     { bg: 'transparent',     color: 'var(--fg-muted)',border: '1px solid var(--border)', hoverBg: 'var(--bg-muted)' },
    success:   { bg: 'var(--success)',  color: '#fff',          border: 'none', hoverBg: 'var(--success-dark)' },
    danger:    { bg: 'var(--danger)',   color: '#fff',          border: 'none', hoverBg: 'var(--danger-dark)' },
  };
  const s = btnStyles[variant];
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        height: small ? 32 : 40, padding: small ? '0 12px' : '0 16px',
        background: disabled ? 'var(--neutral-20)' : (hov ? s.hoverBg : s.bg),
        color: disabled ? 'var(--fg-subtle)' : s.color,
        border: s.border, borderRadius: 'var(--radius-sm)',
        fontSize: small ? 12 : 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-initial)' : 'none',
        transition: 'background 0.12s, box-shadow 0.12s',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      {icon && icon}{label}
    </button>
  );
}

function StatusPill({ text, variant }) {
  const colors = {
    ready:   { bg: 'var(--success-alpha)', color: 'var(--success)' },
    partial: { bg: 'var(--warning-alpha)', color: 'var(--warning)' },
    empty:   { bg: 'var(--blackberry-alpha)', color: 'var(--fg-muted)' },
    danger:  { bg: 'var(--danger-alpha)', color: 'var(--danger)' },
  };
  const c = colors[variant] || colors.empty;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 999, lineHeight: 1.4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }}></span>
      {text}
    </span>
  );
}

function Card({ children, style, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: hov && onClick ? 'var(--shadow-hover)' : 'var(--shadow-initial)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.12s', ...style,
      }}
    >{children}</div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: 'var(--fg-muted)', padding: '0 0 6px',
    }}>{children}</div>
  );
}

Object.assign(window, {
  LABELS, TYPE_COLORS, POKEMON_DB, ITEMS_DB, MOVES_DB, SAVES_DB, THREATS_DB,
  ABILITIES_DB, NATURES_DB, EV_PRESETS, EV_STATS, EV_LABELS_FR, EV_LABELS_EN,
  defaultEVs, emptySlot,
  TypeBadge, SearchInput, Btn, StatusPill, Card, Divider, SectionLabel,
});
