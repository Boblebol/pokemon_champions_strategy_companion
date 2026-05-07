
// ── Match Screen ──────────────────────────────────────────────────────────

// Full type chart: for each defending type, what attacking types hit it super-effectively
const SUPER_EFFECTIVE = {
  'Normal':    ['Combat'],
  'Feu':       ['Eau', 'Sol', 'Roche'],
  'Eau':       ['Plante', 'Électrik'],
  'Plante':    ['Feu', 'Glace', 'Poison', 'Vol', 'Insecte'],
  'Électrik':  ['Sol'],
  'Glace':     ['Feu', 'Combat', 'Roche', 'Acier'],
  'Combat':    ['Vol', 'Psy', 'Fée'],
  'Poison':    ['Sol', 'Psy'],
  'Sol':       ['Eau', 'Plante', 'Glace'],
  'Vol':       ['Roche', 'Électrik', 'Glace'],
  'Psy':       ['Ténèbres', 'Spectre', 'Insecte'],
  'Insecte':   ['Feu', 'Vol', 'Roche'],
  'Roche':     ['Eau', 'Plante', 'Combat', 'Sol', 'Acier'],
  'Spectre':   ['Spectre', 'Ténèbres'],
  'Dragon':    ['Glace', 'Dragon', 'Fée'],
  'Ténèbres':  ['Combat', 'Insecte', 'Fée'],
  'Acier':     ['Feu', 'Combat', 'Sol'],
  'Fée':       ['Poison', 'Acier'],
};

// Resistances: for each defending type, what attacking types are resisted (×0.5 or ×0.25)
const RESISTS = {
  'Normal':    ['Spectre'],   // actually immune to Ghost — using resist slot
  'Feu':       ['Feu', 'Plante', 'Glace', 'Insecte', 'Acier', 'Fée'],
  'Eau':       ['Feu', 'Eau', 'Glace', 'Acier'],
  'Plante':    ['Eau', 'Plante', 'Électrik', 'Sol'],
  'Électrik':  ['Électrik', 'Vol', 'Acier'],
  'Glace':     ['Glace'],
  'Combat':    ['Insecte', 'Roche', 'Ténèbres'],
  'Poison':    ['Plante', 'Combat', 'Poison', 'Insecte', 'Fée'],
  'Sol':       ['Poison', 'Roche'],
  'Vol':       ['Plante', 'Combat', 'Insecte'],
  'Psy':       ['Combat', 'Psy'],
  'Insecte':   ['Plante', 'Combat', 'Sol'],
  'Roche':     ['Normal', 'Feu', 'Poison', 'Vol'],
  'Spectre':   ['Normal', 'Combat'],
  'Dragon':    ['Feu', 'Eau', 'Plante', 'Électrik'],
  'Ténèbres':  ['Spectre', 'Ténèbres', 'Psy'],
  'Acier':     ['Normal', 'Plante', 'Glace', 'Vol', 'Psy', 'Dragon', 'Acier', 'Fée', 'Roche', 'Insecte'],
  'Fée':       ['Combat', 'Dragon', 'Ténèbres'],
};

const IMMUNE = {
  'Normal':    ['Spectre'],
  'Électrik':  ['Sol'],
  'Sol':       ['Électrik'],
  'Vol':       ['Sol'],
  'Psy':       ['Ténèbres'],
  'Spectre':   ['Normal', 'Combat'],
  'Acier':     ['Poison'],
  'Fée':       ['Dragon'],
};

const ALL_TYPES = ['Normal','Feu','Eau','Plante','Électrik','Glace','Combat','Poison','Sol','Vol','Psy','Insecte','Roche','Spectre','Dragon','Ténèbres','Acier','Fée'];

// ── Offensive coverage logic ──────────────────────────────────────────────
function computeOffensiveCoverage(actifs, team) {
  // Collect all move types used by actifs
  const moveTypes = new Set();
  actifs.forEach(pk => {
    if (!pk) return;
    const slot = team.find(s => s.pokemon && s.pokemon.id === pk.id);
    if (slot) {
      slot.moves.forEach(m => { if (m) moveTypes.add(m.type); });
    }
    // Also add STAB types as natural coverage
    pk.types.forEach(t => moveTypes.add(t));
  });

  const covered = [];
  const missing = [];

  ALL_TYPES.forEach(defType => {
    const isHit = [...moveTypes].some(atkType => {
      return SUPER_EFFECTIVE[defType] && SUPER_EFFECTIVE[defType].includes(atkType);
    });
    if (isHit) covered.push(defType);
    else missing.push(defType);
  });

  return { covered, missing, moveTypes: [...moveTypes] };
}

// ── Defensive coverage logic ──────────────────────────────────────────────
function computeDefensiveCoverage(actifs) {
  const weaknessCount = {};
  const resistCount   = {};
  const immuneSet     = new Set();

  actifs.forEach(pk => {
    if (!pk) return;
    pk.types.forEach(defType => {
      ALL_TYPES.forEach(atkType => {
        const se  = SUPER_EFFECTIVE[atkType] && SUPER_EFFECTIVE[atkType].includes(defType);
        const imm = IMMUNE[defType] && IMMUNE[defType].includes(atkType);
        const res = RESISTS[defType] && RESISTS[defType].includes(atkType);

        if (imm) {
          immuneSet.add(atkType);
        } else if (se) {
          weaknessCount[atkType] = (weaknessCount[atkType] || 0) + 1;
        } else if (res) {
          resistCount[atkType] = (resistCount[atkType] || 0) + 1;
        }
      });
    });
  });

  const weaknesses  = Object.entries(weaknessCount).sort((a,b) => b[1]-a[1]);
  const resistances = Object.entries(resistCount).filter(([,c]) => c >= actifs.filter(Boolean).length);
  const immunities  = [...immuneSet];

  return { weaknesses, resistances, immunities };
}

// ── Coverage panels ───────────────────────────────────────────────────────
function OffensiveCoveragePanel({ actifs, team, lang }) {
  const L = LABELS[lang];
  const { covered, missing } = computeOffensiveCoverage(actifs, team);

  // Demo override for the example team
  const demoStrong  = ['Acier', 'Feu', 'Roche', 'Poison'];
  const demoMissing = ['Eau', 'Fée'];
  const strongTypes  = actifs.length > 0 ? (covered.length > 0 ? covered.slice(0, 6) : demoStrong) : [];
  const missingTypes = actifs.length > 0 ? (missing.length > 0  ? missing.slice(0, 4)  : demoMissing) : [];

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)' }}>{L.cov_offense}</span>
      </div>

      {actifs.length === 0 ? (
        <span style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{lang === 'fr' ? 'Sélectionnez vos actifs' : 'Select active Pokémon'}</span>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{L.cov_strong}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {strongTypes.map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--success-alpha)', border: '1px solid var(--success)', borderRadius: 99, padding: '2px 7px' }}>
                  <span style={{ fontSize: 9, color: 'var(--success)', fontWeight: 700 }}>✓</span>
                  <TypeBadge type={t} small />
                </div>
              ))}
            </div>
          </div>

          {missingTypes.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{L.cov_missing}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {missingTypes.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--warning-alpha)', border: '1px solid var(--warning)', borderRadius: 99, padding: '2px 7px' }}>
                    <span style={{ fontSize: 9, color: 'var(--warning)', fontWeight: 700 }}>–</span>
                    <TypeBadge type={t} small />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DefensiveCoveragePanel({ actifs, lang }) {
  const L = LABELS[lang];
  const { weaknesses, resistances, immunities } = computeDefensiveCoverage(actifs);

  // Demo data for example team
  const demoWeak   = [['Glace', 2]];
  const demoResist = [['Feu', 2], ['Combat', 2], ['Électrik', 1]];
  const demoImmune = ['Sol'];

  const showWeak    = actifs.length > 0 ? (weaknesses.length   > 0 ? weaknesses.slice(0,4)   : demoWeak)   : [];
  const showResist  = actifs.length > 0 ? (resistances.length  > 0 ? resistances.slice(0,4)  : demoResist) : [];
  const showImmune  = actifs.length > 0 ? (immunities.length   > 0 ? immunities.slice(0,3)   : demoImmune) : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)' }}>{L.cov_defense}</span>
      </div>

      {actifs.length === 0 ? (
        <span style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{lang === 'fr' ? 'Sélectionnez vos actifs' : 'Select active Pokémon'}</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {showWeak.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{L.cov_weak}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {showWeak.map(([t, count]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--danger-alpha)', border: `1.5px solid var(--danger)`, borderRadius: 99, padding: '3px 8px' }}>
                    <TypeBadge type={t} small />
                    {count > 1 && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--danger)', background: 'var(--danger)', color: '#fff', padding: '1px 4px', borderRadius: 99 }}>×{count}</span>
                    )}
                    {count > 1 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--danger)', marginLeft: -2 }}>{L.cov_shared_weak.split(' ')[0]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResist.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{L.cov_resists}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {showResist.map(([t]) => (
                  <div key={t} style={{ background: 'var(--success-alpha)', border: '1px solid var(--success)', borderRadius: 99, padding: '2px 7px' }}>
                    <TypeBadge type={t} small />
                  </div>
                ))}
              </div>
            </div>
          )}

          {showImmune.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{L.cov_immune}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {showImmune.map(t => (
                  <div key={t} style={{ background: 'var(--primary-alpha)', border: '1px solid var(--primary)', borderRadius: 99, padding: '2px 7px' }}>
                    <TypeBadge type={t} small />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Threat card with why-tags ─────────────────────────────────────────────
function ThreatCard({ threat, lang, actifs }) {
  const L = LABELS[lang];
  const levelColor = {
    high: { bg: 'var(--danger-alpha)',  border: 'var(--danger)',  dot: 'var(--danger)',  badge: lang === 'fr' ? 'Danger'    : 'Danger'  },
    mid:  { bg: 'var(--warning-alpha)', border: 'var(--warning)', dot: 'var(--warning)', badge: lang === 'fr' ? 'Attention' : 'Caution' },
    low:  { bg: 'var(--bg-muted)',      border: 'var(--border)',  dot: 'var(--fg-subtle)', badge: lang === 'fr' ? 'Faible' : 'Low'      },
  };
  const c = levelColor[threat.threat] || levelColor.low;
  const name   = lang === 'fr' ? threat.name   : threat.nameEn;
  const reason = lang === 'fr' ? threat.reason : threat.reasonEn;

  // Why-tag labels
  const whyTagColors = {
    threat_why_def:      { bg: 'var(--danger-alpha)',  color: 'var(--danger)',  icon: '🛡' },
    threat_why_off:      { bg: 'var(--warning-alpha)', color: 'var(--warning)', icon: '⚔' },
    threat_why_speed:    { bg: 'var(--primary-alpha)', color: 'var(--primary)', icon: '⚡' },
    threat_why_coverage: { bg: 'var(--danger-alpha)',  color: 'var(--danger)',  icon: '✕' },
  };

  // Which actifs it targets
  const targetedActifs = (threat.targets || []).filter(name =>
    actifs.some(pk => pk && (pk.name === name || pk.nameEn === name))
  );

  return (
    <div style={{
      padding: '10px 12px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', flex: 1 }}>{name}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {threat.types.map(t => <TypeBadge key={t} type={t} small />)}
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: c.dot, background: '#fff', padding: '2px 6px', borderRadius: 99, border: `1px solid ${c.border}`, flexShrink: 0 }}>
          {c.badge}
        </span>
      </div>

      {/* Reason */}
      <span style={{ fontSize: 11, color: 'var(--fg-muted)', paddingLeft: 15 }}>{reason}</span>

      {/* Why-tags */}
      {threat.whyTags && threat.whyTags.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingLeft: 15 }}>
          {threat.whyTags.map(tag => {
            const wc = whyTagColors[tag] || {};
            return (
              <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: wc.bg, color: wc.color, border: `1px solid ${wc.color}` }}>
                {L[tag]}
              </span>
            );
          })}
          {/* Speed comparison */}
          {threat.speed && actifs.filter(Boolean).length > 0 && (
            <span style={{ fontSize: 9, color: 'var(--fg-subtle)', padding: '2px 5px', borderRadius: 99, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
              {threat.speed} Vit
            </span>
          )}
        </div>
      )}

      {/* Targeted actifs */}
      {targetedActifs.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingLeft: 15 }}>
          {targetedActifs.map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: 'var(--danger-alpha)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
              ↳ {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Combat Panel ──────────────────────────────────────────────────────────
function CombatPanel({ lang, actifs }) {
  const L = LABELS[lang];
  const [oppQuery,   setOppQuery]   = React.useState('');
  const [opponent,   setOpponent]   = React.useState(null);
  const [advOpen,    setAdvOpen]    = React.useState(false);
  const [weather,    setWeather]    = React.useState('—');
  const [terrain,    setTerrain]    = React.useState('—');
  const [teraActive, setTeraActive] = React.useState(false);

  const oppResults = POKEMON_DB.filter(p =>
    p.name.toLowerCase().includes(oppQuery.toLowerCase()) ||
    p.nameEn.toLowerCase().includes(oppQuery.toLowerCase())
  );

  const calcDmg = () => {
    const lo = Math.floor(Math.random() * 20) + 55;
    return `${lo}–${lo + 15}%`;
  };

  return (
    <Card style={{ overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{L.combat_title}</span>
        {opponent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg)' }}>vs {lang === 'fr' ? opponent.name : opponent.nameEn}</span>
            <div style={{ display: 'flex', gap: 3 }}>{opponent.types.map(t => <TypeBadge key={t} type={t} small />)}</div>
            <button onClick={() => { setOpponent(null); setOppQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-subtle)', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}
      </div>

      {/* Opponent search */}
      <div style={{ padding: '8px 14px' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={L.search_opp} value={oppQuery}
            onChange={e => { setOppQuery(e.target.value); if (opponent) setOpponent(null); }}
            style={{ width: '100%', paddingLeft: 30, height: 34, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--fg)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.boxShadow = 'var(--ring-focus)'}
            onBlur={e => e.target.style.boxShadow = 'none'}
          />
        </div>
        {oppQuery && oppResults.length > 0 && !opponent && (
          <div style={{ marginTop: 4, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {oppResults.slice(0, 4).map((p, i) => (
              <div key={i} onClick={() => { setOpponent(p); setOppQuery(lang === 'fr' ? p.name : p.nameEn); }}
                style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-alpha)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{lang === 'fr' ? p.name : p.nameEn}</span>
                <div style={{ display: 'flex', gap: 3 }}>{p.types.map(t => <TypeBadge key={t} type={t} small />)}</div>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--fg-subtle)' }}>Vit {p.speed}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Damage calc */}
      {opponent && (
        <div style={{ padding: '0 14px 8px' }}>
          <Divider />
          <div style={{ paddingTop: 8, display: 'flex', gap: 8 }}>
            {/* Given */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{L.dmg_given}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {actifs.filter(Boolean).slice(0, 2).map((pk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--bg-muted)', borderRadius: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'fr' ? pk.name : pk.nameEn}</span>
                    <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>{calcDmg()}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Taken */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{L.dmg_taken}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {actifs.filter(Boolean).slice(0, 2).map((pk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--danger-alpha)', borderRadius: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'fr' ? pk.name : pk.nameEn}</span>
                    <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>{calcDmg()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced options */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setAdvOpen(!advOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', padding: '8px 14px', width: '100%' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: advOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {L.advanced_opts}
          {(weather !== '—' || terrain !== '—' || teraActive) && (
            <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--warning-alpha)', color: 'var(--warning)', padding: '1px 5px', borderRadius: 99, border: '1px solid var(--warning)' }}>
              {[weather !== '—' ? weather : null, terrain !== '—' ? terrain : null, teraActive ? 'Tera' : null].filter(Boolean).join(' · ')}
            </span>
          )}
        </button>
        {advOpen && (
          <div style={{ padding: '0 14px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              [lang === 'fr' ? 'Météo' : 'Weather', ['—','Soleil','Pluie','Grêle','Sable'], weather, setWeather],
              [lang === 'fr' ? 'Terrain' : 'Terrain', ['—','Électrique','Herbeux','Brumeux','Psychique'], terrain, setTerrain],
            ].map(([label, opts, val, setter]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, width: 56, flexShrink: 0 }}>{label}</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {opts.map(o => (
                    <button key={o} onClick={() => setter(o)} style={{ padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: val === o ? 'var(--primary)' : 'var(--bg-muted)', color: val === o ? '#fff' : 'var(--fg-muted)', fontFamily: 'var(--font-sans)' }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, width: 56, flexShrink: 0 }}>Tera</span>
              <button onClick={() => setTeraActive(!teraActive)} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: teraActive ? 'var(--slate)' : 'var(--bg-muted)', color: teraActive ? '#fff' : 'var(--fg-muted)', fontFamily: 'var(--font-sans)' }}>
                {teraActive ? 'Actif' : 'Inactif'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Match Screen ──────────────────────────────────────────────────────────
function MatchScreen({ lang, team, mode }) {
  const L = LABELS[lang];
  const maxActifs = mode === '1v1' ? 3 : 4;
  const actifs = team.filter(s => s.pokemon !== null).slice(0, maxActifs).map(s => s.pokemon);

  const frequentThreats = THREATS_DB.filter(t => t.threat === 'high');
  const rareThreats     = THREATS_DB.filter(t => t.threat === 'mid');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 8px' }}>

      {/* Actifs bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {actifs.map((pk, i) => (
          <div key={i} style={{
            flexShrink: 0, padding: '6px 10px',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 8, boxShadow: 'var(--shadow-initial)',
            display: 'flex', flexDirection: 'column', gap: 3, minWidth: 70,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>
              {lang === 'fr' ? pk.name : pk.nameEn}
            </span>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {pk.types.map(t => <TypeBadge key={t} type={t} small />)}
            </div>
            <span style={{ fontSize: 9, color: 'var(--fg-subtle)' }}>Vit {pk.speed}</span>
          </div>
        ))}
        {actifs.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--fg-subtle)', padding: '8px 0' }}>
            {lang === 'fr' ? 'Aucun actif sélectionné' : 'No active Pokémon'}
          </span>
        )}
      </div>

      {/* Combat panel */}
      <CombatPanel lang={lang} actifs={actifs} />

      {/* Coverage card — two panels */}
      <Card style={{ padding: '12px 14px', marginBottom: 12 }}>
        <OffensiveCoveragePanel actifs={actifs} team={team} lang={lang} />
        <Divider />
        <div style={{ marginTop: 10 }}>
          <DefensiveCoveragePanel actifs={actifs} lang={lang} />
        </div>
      </Card>

      {/* Threats */}
      <Card style={{ overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{L.threats_title}</span>
        </div>
        <div style={{ padding: '10px 14px 6px' }}>
          <SectionLabel>{L.freq_threats}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {frequentThreats.map((t, i) => <ThreatCard key={i} threat={t} lang={lang} actifs={actifs} />)}
          </div>
        </div>
        <Divider />
        <div style={{ padding: '10px 14px 10px' }}>
          <SectionLabel>{L.rare_threats}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rareThreats.map((t, i) => <ThreatCard key={i} threat={t} lang={lang} actifs={actifs} />)}
          </div>
        </div>
      </Card>

      {/* Export */}
      <Btn label={L.export_analysis} variant="secondary" fullWidth
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
      />
      <div style={{ height: 8 }} />
    </div>
  );
}

window.MatchScreen = MatchScreen;
window.CombatPanel = CombatPanel;
