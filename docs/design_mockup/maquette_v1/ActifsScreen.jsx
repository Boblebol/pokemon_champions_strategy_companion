
// ── Actifs Screen ──────────────────────────────────────────────────────────

function ActifsScreen({ lang, team, mode, onNavigate }) {
  const L = LABELS[lang];
  const maxActifs = mode === '1v1' ? 3 : 4;
  const filledSlots = team.filter(s => s.pokemon !== null);

  const [actifs, setActifs] = React.useState(() => {
    // Auto-select first N filled slots
    return filledSlots.slice(0, maxActifs).map(s => s.pokemon);
  });
  const [queries, setQueries] = React.useState(
    Array(maxActifs).fill('').map((_, i) =>
      filledSlots[i]?.pokemon ? (lang === 'fr' ? filledSlots[i].pokemon.name : filledSlots[i].pokemon.nameEn) : ''
    )
  );

  const readyCount = actifs.filter(Boolean).length;
  const allReady = readyCount === maxActifs;

  function getResults(q) {
    return filledSlots
      .filter(s => s.pokemon &&
        (s.pokemon.name.toLowerCase().includes(q.toLowerCase()) ||
         s.pokemon.nameEn.toLowerCase().includes(q.toLowerCase()))
      )
      .map(s => s.pokemon);
  }

  function selectActif(idx, pk) {
    const newActifs = [...actifs];
    newActifs[idx] = pk;
    setActifs(newActifs);
    const newQ = [...queries];
    newQ[idx] = lang === 'fr' ? pk.name : pk.nameEn;
    setQueries(newQ);
  }

  function clearActif(idx) {
    const newActifs = [...actifs];
    newActifs[idx] = null;
    setActifs(newActifs);
    const newQ = [...queries];
    newQ[idx] = '';
    setQueries(newQ);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>{L.actifs_title}</h2>
        <StatusPill
          text={L.actifs_ready(readyCount, maxActifs)}
          variant={allReady ? 'ready' : readyCount > 0 ? 'partial' : 'empty'}
        />
      </div>

      {/* Active slots */}
      <Card style={{ overflow: 'hidden', marginBottom: 14 }}>
        {Array(maxActifs).fill(null).map((_, i) => {
          const pk = actifs[i];
          const results = getResults(queries[i]);
          const [dropOpen, setDropOpen] = React.useState(false);
          const ref = React.useRef(null);

          React.useEffect(() => {
            function handler(e) { if (ref.current && !ref.current.contains(e.target)) setDropOpen(false); }
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
          }, []);

          return (
            <div key={i}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: pk ? 6 : 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: pk ? 'var(--success-alpha)' : 'var(--neutral-20)',
                    border: `1.5px solid ${pk ? 'var(--success)' : 'var(--neutral-35)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 10, fontWeight: 700,
                    color: pk ? 'var(--success)' : 'var(--fg-subtle)',
                  }}>
                    {pk ? '✓' : i + 1}
                  </div>
                  <div ref={ref} style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-subtle)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <input
                        type="text"
                        placeholder={L.search_actif(i + 1)}
                        value={queries[i]}
                        onChange={e => { const q=[...queries]; q[i]=e.target.value; setQueries(q); setDropOpen(true); }}
                        onFocus={() => setDropOpen(true)}
                        style={{
                          width: '100%', paddingLeft: 30, paddingRight: pk ? 28 : 8,
                          height: 36, border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          background: pk ? 'var(--success-alpha)' : '#fff',
                          color: 'var(--fg)',
                          fontSize: 12, fontFamily: 'var(--font-sans)',
                          outline: 'none', boxSizing: 'border-box',
                          fontWeight: pk ? 600 : 400,
                        }}
                      />
                      {pk && (
                        <button onClick={() => clearActif(i)} style={{
                          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          color: 'var(--fg-subtle)', fontSize: 14, lineHeight: 1,
                        }}>×</button>
                      )}
                    </div>
                    {dropOpen && results.length > 0 && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: '#fff', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-hover)',
                        zIndex: 100, marginTop: 2,
                      }}>
                        {results.map((p, ri) => (
                          <div
                            key={ri}
                            onMouseDown={() => { selectActif(i, p); setDropOpen(false); }}
                            style={{
                              padding: '8px 12px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 8,
                              borderBottom: ri < results.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-alpha)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{lang === 'fr' ? p.name : p.nameEn}</span>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {p.types.map(t => <TypeBadge key={t} type={t} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Move preview if selected */}
                {pk && (
                  <div style={{ marginLeft: 32, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {pk.types.map(t => <TypeBadge key={t} type={t} small />)}
                    <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>· {pk.ability}</span>
                    <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>· Tera {pk.teraType}</span>
                  </div>
                )}
              </div>
              {i < maxActifs - 1 && <Divider />}
            </div>
          );
        })}
      </Card>

      {/* Team overview chips */}
      {filledSlots.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionLabel>{lang === 'fr' ? 'Team disponible' : 'Available team'}</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {filledSlots.map((slot, i) => {
              const isActive = actifs.some(a => a && a.id === slot.pokemon.id);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px',
                  background: isActive ? 'var(--success-alpha)' : 'var(--bg-muted)',
                  border: `1px solid ${isActive ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 999, cursor: 'pointer',
                  transition: 'all 0.1s',
                }} onClick={() => {
                  const emptyIdx = actifs.findIndex(a => !a);
                  if (!isActive && emptyIdx !== -1) selectActif(emptyIdx, slot.pokemon);
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'var(--success-dark)' : 'var(--fg)' }}>
                    {lang === 'fr' ? slot.pokemon.name : slot.pokemon.nameEn}
                  </span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {slot.pokemon.types.map(t => <TypeBadge key={t} type={t} small />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open match button */}
      <Btn
        label={L.btn_match}
        variant={allReady ? 'success' : 'primary'}
        fullWidth
        onClick={() => onNavigate('match')}
        disabled={readyCount === 0}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
      />
    </div>
  );
}

window.ActifsScreen = ActifsScreen;
