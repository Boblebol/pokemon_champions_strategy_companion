
// ── Build Screen ──────────────────────────────────────────────────────────

function MoveRow({ move, isStab, lang }) {
  if (!move) return null;
  const catColors = {
    'Physique': { bg: '#EF6C00', text: '#fff' }, 'Physical': { bg: '#EF6C00', text: '#fff' },
    'Spécial':  { bg: '#3949AB', text: '#fff' }, 'Special':  { bg: '#3949AB', text: '#fff' },
    'Statut':   { bg: '#546E7A', text: '#fff' }, 'Status':   { bg: '#546E7A', text: '#fff' },
  };
  const cat = lang === 'fr' ? move.cat : move.catEn;
  const name = lang === 'fr' ? move.name : move.nameEn;
  const cc = catColors[cat] || { bg: '#888', text: '#fff' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 10px',
      background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)', flexWrap: 'wrap', rowGap: 3,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', flex: '1 1 auto', minWidth: 80 }}>{name}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <TypeBadge type={move.type} />
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', background: cc.bg, color: cc.text, borderRadius: 99 }}>{cat}</span>
        {isStab && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', background: 'var(--ratings-alpha)', color: 'var(--ratings-dark)', borderRadius: 99, border: '1px solid var(--ratings)' }}>STAB</span>}
        {move.power != null && <span style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 600 }}>{move.power}</span>}
        {move.acc  != null && <span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>{move.acc}%</span>}
        <span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>PP{move.pp}</span>
      </div>
    </div>
  );
}

function SearchDropdown({ query, results, onSelect, renderItem, placeholder, style }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-subtle)' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder={placeholder} value={query.value}
          onChange={e => { query.set(e.target.value); setOpen(true); }}
          onFocus={e => { e.target.style.boxShadow = 'var(--ring-focus)'; setOpen(true); }}
          onBlur={e => e.target.style.boxShadow = 'var(--shadow-inset-field)'}
          style={{
            width: '100%', paddingLeft: 30, paddingRight: 28,
            height: 36, border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--fg)',
            fontSize: 12, fontFamily: 'var(--font-sans)',
            outline: 'none', boxSizing: 'border-box', boxShadow: 'var(--shadow-inset-field)',
          }}
        />
        {query.value && (
          <button onClick={() => { query.set(''); setOpen(false); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--fg-subtle)', fontSize: 14, lineHeight: 1 }}>×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-hover)', zIndex: 200, marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
          {results.map((item, i) => (
            <div key={i} onMouseDown={() => { onSelect(item); setOpen(false); }}
              style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-alpha)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{renderItem(item)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ability Selector ──────────────────────────────────────────────────────
function AbilitySelector({ pokemon, selectedAbility, onSelect, lang }) {
  const L = LABELS[lang];
  const abilities = pokemon ? (ABILITIES_DB[pokemon.name] || [{ name: pokemon.ability, nameEn: pokemon.ability, desc: '', descEn: '' }]) : [];
  if (abilities.length === 0) return null;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {abilities.map((ab, i) => {
          const isSelected = selectedAbility ? selectedAbility.name === ab.name : i === 0;
          const abName = lang === 'fr' ? ab.name : ab.nameEn;
          const abDesc = lang === 'fr' ? ab.desc : ab.descEn;
          return (
            <button key={i} onClick={() => onSelect(ab)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '6px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                background: isSelected ? 'var(--primary-alpha)' : 'var(--bg-muted)',
                transition: 'all 0.1s', flex: '1 1 auto', minWidth: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--fg)', lineHeight: 1.2 }}>{abName}</span>
              {abDesc && <span style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 2, lineHeight: 1.3, textAlign: 'left' }}>{abDesc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Nature Selector ───────────────────────────────────────────────────────
function NatureSelector({ selectedNature, onSelect, lang }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = NATURES_DB.filter(n =>
    (lang === 'fr' ? n.name : n.nameEn).toLowerCase().includes(query.toLowerCase())
  );

  const displayName = selectedNature
    ? (lang === 'fr' ? selectedNature.name : selectedNature.nameEn)
    : (lang === 'fr' ? 'Choisir une nature…' : 'Choose a nature…');

  const effectStr = (n) => {
    if (!n || !n.plus) return lang === 'fr' ? 'Neutre' : 'Neutral';
    const p = lang === 'fr' ? n.plus : n.plusEn;
    const m = lang === 'fr' ? n.minus : n.minusEn;
    return `+${p} / -${m}`;
  };

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', height: 36,
        border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: selectedNature ? 'var(--fg)' : 'var(--fg-subtle)' }}>{displayName}</span>
          {selectedNature && (
            <span style={{ fontSize: 10, color: selectedNature.plus ? 'var(--success)' : 'var(--fg-subtle)', fontWeight: 600 }}>
              {effectStr(selectedNature)}
            </span>
          )}
        </div>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-hover)', zIndex: 200, marginTop: 2 }}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
            <input type="text" placeholder={lang === 'fr' ? 'Filtrer…' : 'Filter…'} value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', height: 28, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.map((n, i) => {
              const name = lang === 'fr' ? n.name : n.nameEn;
              const eff = effectStr(n);
              const isSel = selectedNature && selectedNature.name === n.name;
              return (
                <div key={i} onMouseDown={() => { onSelect(n); setOpen(false); setQuery(''); }}
                  style={{
                    padding: '7px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isSel ? 'var(--primary-alpha)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-muted)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 12, fontWeight: isSel ? 700 : 400, color: isSel ? 'var(--primary)' : 'var(--fg)' }}>{name}</span>
                  <span style={{ fontSize: 10, color: n.plus ? 'var(--success)' : 'var(--fg-subtle)', fontWeight: 600 }}>{eff}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EV Panel ──────────────────────────────────────────────────────────────
function EVPanel({ evs, setEvs, nature, lang }) {
  const L = LABELS[lang];
  const evLabels = lang === 'fr' ? EV_LABELS_FR : EV_LABELS_EN;
  const total = EV_STATS.reduce((s, k) => s + (evs[k] || 0), 0);
  const max = 510;
  const pct = Math.min(total / max, 1);
  const isComplete = total === max;
  const isOver = total > max;

  function applyPreset(preset) {
    setEvs({ ...preset.evs });
  }

  function updateEV(stat, val) {
    const v = Math.max(0, Math.min(252, parseInt(val) || 0));
    const newEvs = { ...evs, [stat]: v };
    const newTotal = EV_STATS.reduce((s, k) => s + (newEvs[k] || 0), 0);
    if (newTotal <= max) setEvs(newEvs);
  }

  const effectStr = (n) => {
    if (!n || !n.plus) return null;
    const p = lang === 'fr' ? n.plus : n.plusEn;
    const m = lang === 'fr' ? n.minus : n.minusEn;
    return `+${p} / -${m}`;
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: isOver ? 'var(--danger)' : isComplete ? 'var(--success)' : 'var(--fg-muted)' }}>
            {total}/{max} EV
          </span>
          {nature && effectStr(nature) && (
            <span style={{ fontSize: 10, color: 'var(--fg-subtle)', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 99, border: '1px solid var(--border)' }}>
              {lang === 'fr' ? nature.name : nature.nameEn} · {effectStr(nature)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--neutral-20)', borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 99, background: isOver ? 'var(--danger)' : isComplete ? 'var(--success)' : 'var(--primary)', transition: 'width 0.2s' }} />
      </div>

      {/* Stat inputs grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 8px', marginBottom: 10 }}>
        {EV_STATS.map(stat => {
          const val = evs[stat] || 0;
          const isPlus = nature && (lang === 'fr' ? nature.plus : nature.plusEn) === evLabels[stat];
          const isMinus = nature && (lang === 'fr' ? nature.minus : nature.minusEn) === evLabels[stat];
          return (
            <div key={stat} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: isPlus ? 'var(--success)' : isMinus ? 'var(--danger)' : 'var(--fg-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {evLabels[stat]}
                </span>
                {isPlus && <span style={{ fontSize: 8, color: 'var(--success)', fontWeight: 700 }}>↑</span>}
                {isMinus && <span style={{ fontSize: 8, color: 'var(--danger)', fontWeight: 700 }}>↓</span>}
              </div>
              <input
                type="number" min="0" max="252" value={val}
                onChange={e => updateEV(stat, e.target.value)}
                style={{
                  width: '100%', height: 30, padding: '0 6px',
                  border: `1px solid ${val > 0 ? (isPlus ? 'var(--success)' : 'var(--border)') : 'var(--neutral-35)'}`,
                  borderRadius: 4, fontSize: 12, fontWeight: val > 0 ? 600 : 400,
                  fontFamily: 'var(--font-sans)', color: 'var(--fg)',
                  background: val > 0 ? (isPlus ? 'var(--success-alpha)' : 'var(--bg-muted)') : '#fff',
                  outline: 'none', textAlign: 'center', boxSizing: 'border-box',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Preset chips */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {(EV_PRESETS[lang] || EV_PRESETS.fr).map((p, i) => (
          <button key={i} onClick={() => applyPreset(p)} style={{
            padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 600,
            border: '1px solid var(--border)', cursor: 'pointer',
            background: 'var(--bg-muted)', color: 'var(--fg-muted)',
            fontFamily: 'var(--font-sans)', transition: 'all 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-alpha)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}
          >{p.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Slot Builder ──────────────────────────────────────────────────────────
function SlotBuilder({ slot, slotIndex, lang, onUpdate }) {
  const L = LABELS[lang];

  const [pkQuery,    setPkQuery]    = React.useState(slot.pokemon ? (lang === 'fr' ? slot.pokemon.name : slot.pokemon.nameEn) : '');
  const [itemQuery,  setItemQuery]  = React.useState(slot.item    ? (lang === 'fr' ? slot.item.name    : slot.item.nameEn)    : '');
  const [moveQueries, setMoveQueries] = React.useState(slot.moves.map(m => m ? (lang === 'fr' ? m.name : m.nameEn) : ''));
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [localSlot, setLocalSlot] = React.useState(() => ({
    ...slot,
    evs: slot.evs || (slot.pokemon ? defaultEVs(slot.pokemon.name) : { hp:0,atk:0,def:0,spa:0,spd:0,spe:0 }),
    ability: slot.ability || null,
    nature:  slot.nature  || null,
  }));

  const pkResults   = POKEMON_DB.filter(p => p.name.toLowerCase().includes(pkQuery.toLowerCase()) || p.nameEn.toLowerCase().includes(pkQuery.toLowerCase()));
  const itemResults = ITEMS_DB.filter(it => it.name.toLowerCase().includes(itemQuery.toLowerCase()) || it.nameEn.toLowerCase().includes(itemQuery.toLowerCase()));

  function getMoveResults(q) {
    return MOVES_DB.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.nameEn.toLowerCase().includes(q.toLowerCase()));
  }

  function patch(delta) {
    const updated = { ...localSlot, ...delta };
    setLocalSlot(updated);
    onUpdate(updated);
  }

  function selectPokemon(pk) {
    const abilities = ABILITIES_DB[pk.name];
    const defaultAbility = abilities ? abilities[0] : null;
    const defaultNature = NATURES_DB.find(n => n.name === pk.nature || n.nameEn === pk.nature) || null;
    patch({ pokemon: pk, ability: defaultAbility, nature: defaultNature, evs: defaultEVs(pk.name) });
    setPkQuery(lang === 'fr' ? pk.name : pk.nameEn);
  }

  function updateMove(idx, move) {
    const newMoves = [...localSlot.moves];
    newMoves[idx] = move;
    patch({ moves: newMoves });
    const newQ = [...moveQueries];
    newQ[idx] = lang === 'fr' ? move.name : move.nameEn;
    setMoveQueries(newQ);
  }

  const isStab = (move) => {
    if (!localSlot.pokemon || !move) return false;
    return move.stabOn.includes(localSlot.pokemon.name) || move.stabOn.includes(localSlot.pokemon.nameEn);
  };

  return (
    <div style={{ padding: '12px 14px 10px' }}>

      {/* ── Pokémon search ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <SearchDropdown
          query={{ value: pkQuery, set: setPkQuery }}
          results={pkResults}
          onSelect={selectPokemon}
          placeholder={L.search_pokemon}
          style={{ flex: 1 }}
          renderItem={pk => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{lang === 'fr' ? pk.name : pk.nameEn}</span>
              <div style={{ display: 'flex', gap: 3 }}>{pk.types.map(t => <TypeBadge key={t} type={t} />)}</div>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-alpha)', padding: '1px 5px', borderRadius: 99 }}>{pk.tier}</span>
            </div>
          )}
        />
        {localSlot.pokemon && (
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {localSlot.pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
        )}
      </div>

      {/* ── Talent (ability) chips — visible directly ── */}
      {localSlot.pokemon && (
        <AbilitySelector
          pokemon={localSlot.pokemon}
          selectedAbility={localSlot.ability}
          onSelect={ab => patch({ ability: ab })}
          lang={lang}
        />
      )}

      {/* ── Item search ── */}
      <SearchDropdown
        query={{ value: itemQuery, set: setItemQuery }}
        results={itemResults}
        onSelect={item => { patch({ item }); setItemQuery(lang === 'fr' ? item.name : item.nameEn); }}
        placeholder={L.search_item}
        style={{ marginBottom: 10 }}
        renderItem={item => (
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{lang === 'fr' ? item.name : item.nameEn}</span>
            <span style={{ fontSize: 11, color: 'var(--fg-muted)', marginLeft: 8 }}>{item.desc}</span>
          </div>
        )}
      />

      {/* ── 4 Moves ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {[0,1,2,3].map(mi => (
          <div key={mi}>
            <SearchDropdown
              query={{ value: moveQueries[mi], set: v => { const q=[...moveQueries]; q[mi]=v; setMoveQueries(q); } }}
              results={getMoveResults(moveQueries[mi])}
              onSelect={m => updateMove(mi, m)}
              placeholder={L.search_move(mi + 1)}
              renderItem={m => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>{lang === 'fr' ? m.name : m.nameEn}</span>
                    <TypeBadge type={m.type} />
                  </div>
                  <div style={{ display: 'flex', gap: 5, fontSize: 10, color: 'var(--fg-muted)' }}>
                    <span>{lang === 'fr' ? m.cat : m.catEn}</span>
                    {m.power && <span>· {m.power}</span>}
                    {m.acc && <span>· {m.acc}%</span>}
                    <span>· PP{m.pp}</span>
                  </div>
                </div>
              )}
            />
            {localSlot.moves[mi] && (
              <div style={{ marginTop: 3 }}>
                <MoveRow move={localSlot.moves[mi]} isStab={isStab(localSlot.moves[mi])} lang={lang} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Details toggle ── */}
      <button
        onClick={() => setDetailsOpen(!detailsOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg-muted)', fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-sans)', padding: '6px 0', width: '100%',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        {L.details_toggle}
        {/* summary badges */}
        {localSlot.nature && (
          <span style={{ fontSize: 10, color: 'var(--fg-subtle)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 99, border: '1px solid var(--border)', marginLeft: 4 }}>
            {lang === 'fr' ? localSlot.nature.name : localSlot.nature.nameEn}
          </span>
        )}
        {localSlot.pokemon?.teraType && (
          <span style={{ fontSize: 10, color: 'var(--fg-subtle)', background: 'var(--bg-muted)', padding: '1px 6px', borderRadius: 99, border: '1px solid var(--border)' }}>
            Tera {localSlot.pokemon.teraType}
          </span>
        )}
      </button>

      {/* ── Expanded details ── */}
      {detailsOpen && (
        <div style={{ marginTop: 6, padding: '12px', background: 'var(--bg-muted)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Nature */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{L.nature_label}</div>
            <NatureSelector
              selectedNature={localSlot.nature}
              onSelect={n => patch({ nature: n })}
              lang={lang}
            />
          </div>

          {/* Tera type */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{L.tera_label}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['Normal','Feu','Eau','Plante','Électrik','Glace','Combat','Sol','Vol','Psy','Dragon','Ténèbres','Acier','Fée'].map(t => {
                const sel = (localSlot.pokemon?.teraType || localSlot.teraType) === t;
                return (
                  <button key={t} onClick={() => patch({ teraType: t })}
                    style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', opacity: sel ? 1 : 0.55, transform: sel ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.1s' }}>
                    <TypeBadge type={t} small />
                  </button>
                );
              })}
            </div>
          </div>

          {/* EVs */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{L.ev_label}</div>
            <EVPanel
              evs={localSlot.evs}
              setEvs={evs => patch({ evs })}
              nature={localSlot.nature}
              lang={lang}
            />
          </div>

          {/* Comment */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{L.comment_label}</div>
            <textarea rows={2} defaultValue={localSlot.comment}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--fg)', background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Build Screen shell ─────────────────────────────────────────────────────
function BuildScreen({ lang, team, setTeam, mode }) {
  const L = LABELS[lang];
  const [activeSlot, setActiveSlot] = React.useState(0);

  function updateSlot(idx, slot) {
    const newTeam = [...team];
    newTeam[idx] = slot;
    setTeam(newTeam);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Slot rail */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px 8px', background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
        {team.map((slot, i) => {
          const filled = slot.pokemon !== null;
          const active = i === activeSlot;
          const evTotal = slot.evs ? EV_STATS.reduce((s, k) => s + (slot.evs[k] || 0), 0) : 0;
          const evDone = evTotal === 510;
          return (
            <button key={i} onClick={() => setActiveSlot(i)} style={{
              flexShrink: 0, width: 52, height: 52, borderRadius: 8,
              background: active ? 'var(--primary)' : filled ? 'var(--bg-muted)' : 'var(--neutral-20)',
              border: `2px solid ${active ? 'var(--primary)' : filled ? (evDone ? 'var(--success)' : 'var(--border)') : 'var(--neutral-35)'}`,
              cursor: 'pointer', transition: 'all 0.12s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              position: 'relative',
            }}>
              {filled ? (
                <>
                  <span style={{ fontSize: 8, fontWeight: 700, color: active ? '#fff' : 'var(--fg)', lineHeight: 1.1, textAlign: 'center', padding: '0 2px', maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'fr' ? slot.pokemon.name : slot.pokemon.nameEn}
                  </span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {slot.pokemon.types.slice(0, 1).map(t => <TypeBadge key={t} type={t} small />)}
                  </div>
                  {evDone && !active && (
                    <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                  )}
                </>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#fff' : 'var(--fg-subtle)' }}>S{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active slot summary bar */}
      <div style={{ padding: '8px 14px 0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
          {team[activeSlot]?.pokemon ? (lang === 'fr' ? team[activeSlot].pokemon.name : team[activeSlot].pokemon.nameEn) : L.slot_label(activeSlot + 1)}
        </span>
        {team[activeSlot]?.pokemon && team[activeSlot].pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
        {team[activeSlot]?.ability && (
          <span style={{ fontSize: 10, color: 'var(--primary)', background: 'var(--primary-alpha)', padding: '2px 7px', borderRadius: 99 }}>
            {lang === 'fr' ? team[activeSlot].ability.name : team[activeSlot].ability.nameEn}
          </span>
        )}
        {team[activeSlot]?.item && (
          <span style={{ fontSize: 10, color: 'var(--fg-muted)', background: 'var(--bg-muted)', padding: '2px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
            {lang === 'fr' ? team[activeSlot].item.name : team[activeSlot].item.nameEn}
          </span>
        )}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SlotBuilder
          key={activeSlot}
          slot={team[activeSlot]}
          slotIndex={activeSlot}
          lang={lang}
          onUpdate={slot => updateSlot(activeSlot, slot)}
        />
      </div>
    </div>
  );
}

window.BuildScreen = BuildScreen;
window.MoveRow = MoveRow;
