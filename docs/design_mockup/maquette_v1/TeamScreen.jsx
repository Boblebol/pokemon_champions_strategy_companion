
// ── Team Screen ───────────────────────────────────────────────────────────

function TeamScreen({ lang, team, setTeam, mode, setMode, onNavigate }) {
  const L = LABELS[lang];
  const [savesQuery, setSavesQuery] = React.useState('');
  const [loadedSave, setLoadedSave] = React.useState(null);

  const filledCount = team.filter(s => s.pokemon !== null).length;
  const maxActifs = mode === '1v1' ? 3 : 4;
  const activeCount = team.filter(s => s.pokemon !== null).slice(0, maxActifs).length;

  const teamStatus = filledCount === 0 ? 'empty' : filledCount < 6 ? 'partial' : 'ready';
  const actifStatus = activeCount === maxActifs ? 'ready' : activeCount > 0 ? 'partial' : 'empty';

  const filteredSaves = SAVES_DB.filter(s =>
    s.name.toLowerCase().includes(savesQuery.toLowerCase()) ||
    s.pokemons.some(p => p.toLowerCase().includes(savesQuery.toLowerCase()))
  );

  function handleLoadSave(save) {
    setLoadedSave(save.id);
    const newTeam = Array(6).fill(null).map((_, i) => {
      const pkName = save.pokemons[i];
      if (!pkName) return emptySlot();
      const pk = POKEMON_DB.find(p => p.name === pkName || p.nameEn === pkName);
      return pk ? { ...emptySlot(), pokemon: pk } : emptySlot();
    });
    setTeam(newTeam);
    setMode(save.mode);
  }

  function handleNewTeam() {
    setTeam(Array(6).fill(null).map(() => emptySlot()));
    setLoadedSave(null);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>

      {/* Team status card */}
      <Card style={{ padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{L.team_title}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatusPill
              text={filledCount === 0 ? L.team_empty : L.team_count(filledCount)}
              variant={teamStatus}
            />
            <StatusPill
              text={L.team_actifs_ready(activeCount, maxActifs)}
              variant={actifStatus}
            />
          </div>
        </div>

        {/* Pokemon mini-row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {team.map((slot, i) => {
            const filled = slot.pokemon !== null;
            const isActive = i < maxActifs;
            return (
              <div key={i} style={{
                flex: 1, height: 44, borderRadius: 6,
                background: filled ? (isActive ? 'var(--primary-alpha)' : 'var(--bg-muted)') : 'var(--neutral-20)',
                border: `1.5px solid ${filled ? (isActive ? 'var(--primary)' : 'var(--border)') : 'var(--neutral-35)'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {filled ? (
                  <>
                    <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--fg-muted)', lineHeight: 1, textAlign: 'center', padding: '0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {lang === 'fr' ? slot.pokemon.name : slot.pokemon.nameEn}
                    </span>
                    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                      {slot.pokemon.types.slice(0, 1).map(t => <TypeBadge key={t} type={t} small />)}
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: 16, color: 'var(--neutral-50)' }}>+</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['1v1', '2v2'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, height: 36,
                background: mode === m ? 'var(--primary)' : '#fff',
                color: mode === m ? '#fff' : 'var(--fg-muted)',
                border: `1px solid ${mode === m ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {m === '1v1' ? L.mode_1v1 : L.mode_2v2}
            </button>
          ))}
        </div>

        {/* Primary action */}
        <Btn label={L.btn_continue} variant="primary" fullWidth onClick={() => onNavigate('build')} />
      </Card>

      {/* Quick actions row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Btn label={L.btn_new} variant="secondary" small onClick={handleNewTeam} style={{ flex: 1 }} />
        <Btn label={L.btn_save} variant="ghost" small
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
        />
        <Btn label={L.btn_export} variant="ghost" small
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
        />
      </div>

      {/* Saves */}
      <Card style={{ overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{L.saves_title}</span>
          <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{SAVES_DB.length} teams</span>
        </div>
        <div style={{ padding: '0 14px 10px' }}>
          <SearchInput placeholder={L.saves_search} value={savesQuery} onChange={setSavesQuery} />
        </div>
        <Divider />
        {filteredSaves.length === 0 ? (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>{L.saves_empty}</div>
        ) : (
          filteredSaves.map((save, i) => (
            <div key={save.id}>
              <div
                onClick={() => handleLoadSave(save)}
                style={{
                  padding: '11px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer',
                  background: loadedSave === save.id ? 'var(--primary-alpha)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (loadedSave !== save.id) e.currentTarget.style.background = 'var(--bg-muted)'; }}
                onMouseLeave={e => { if (loadedSave !== save.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: loadedSave === save.id ? 'var(--primary)' : 'var(--fg)' }}>{save.name}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 5px',
                      background: save.mode === '2v2' ? 'var(--primary-alpha)' : 'var(--bg-muted)',
                      color: save.mode === '2v2' ? 'var(--primary)' : 'var(--fg-muted)',
                      borderRadius: 99,
                    }}>{save.mode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {save.pokemons.map(p => (
                      <span key={p} style={{ fontSize: 10, color: 'var(--fg-muted)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 99 }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>{save.date}</span>
                  {loadedSave === save.id && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--success)' }}>✓ chargée</span>
                  )}
                </div>
              </div>
              {i < filteredSaves.length - 1 && <Divider />}
            </div>
          ))
        )}
      </Card>

      {/* Offline indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '4px 0 2px' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M10.54 16a6 6 0 0 1 2.92 0"/><circle cx="12" cy="20" r="1" fill="var(--success)"/>
        </svg>
        <span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>{L.offline_on}</span>
      </div>
    </div>
  );
}

window.TeamScreen = TeamScreen;
