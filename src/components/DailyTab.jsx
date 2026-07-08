import React from 'react';
import { SECTIONS, HABIT_CATEGORIES } from '../data';
import { getDK, fmtD, fmtM } from '../utils';
import { C } from './ui';
import { I } from './Icons';

export default function DailyTab({ cu, allLogs, toggle, ac, selectedHabits }) {
  const [pendingTime, setPendingTime] = React.useState(null);
  const [timeInputVal, setTimeInputVal] = React.useState('');
  const today = getDK(0);
  const myLog = (allLogs[cu.name] || {})[today] || {};
  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

  const filteredCats = React.useMemo(() => {
    return HABIT_CATEGORIES.map(cat => ({
      ...cat,
      activities: cat.activities.filter(a => selectedHabits.has(`${cat.name}::${a.name}`))
    })).filter(cat => cat.activities.length > 0);
  }, [selectedHabits]);

  const totalDone = filteredCats.reduce((acc, c) => acc + c.activities.filter(a => myLog[`${c.name}::${a.name}`]?.done).length, 0);
  const totalActs = filteredCats.reduce((acc, c) => acc + c.activities.length, 0);

  function handleCheck(cat, act, xp, trackTime) {
    const key = `${cat}::${act}`;
    const already = myLog[key]?.done;
    if (already) {
      toggle(cat, act, xp, 0);
      if (pendingTime?.cat === cat && pendingTime?.act === act) { setPendingTime(null); setTimeInputVal(''); }
    } else if (trackTime) {
      setPendingTime({ cat, act, xp });
      setTimeInputVal('');
    } else {
      toggle(cat, act, xp, 0);
    }
  }

  function submitTime() {
    if (!pendingTime) return;
    toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, parseInt(timeInputVal) || 0);
    setPendingTime(null);
    setTimeInputVal('');
  }

  if (filteredCats.length === 0) {
    return (
      <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🗓</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>No habits in your routine</div>
        <div style={{ fontSize: 13, color: '#6a7080' }}>Head to Setup to choose which habits to track daily.</div>
      </div>
    );
  }

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Daily Routine</div>
          <div className="mono" style={{ fontSize: 11, color: '#6a7080', marginTop: 2 }}>{fmtD(today)}</div>
        </div>
        <div style={C.card({ padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 })}>
          <span style={{ fontSize: 18, fontWeight: 700, color: ac }}>{totalDone}</span>
          <span className="mono" style={{ fontSize: 11, color: '#6a7080' }}>/ {totalActs}</span>
        </div>
      </div>

      {filteredCats.map(cat => {
        const col = SC[cat.section] || ac;
        const earned = cat.activities.reduce((s, a) => s + (myLog[`${cat.name}::${a.name}`]?.done ? a.xp : 0), 0);
        const total = cat.activities.reduce((s, a) => s + a.xp, 0);
        return (
          <div key={cat.name} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
                <span className="mono" style={{ fontSize: 10, color: '#8A909E', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{cat.section}</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: '#4a5060' }}>{earned}/{total} xp</span>
            </div>
            {cat.activities.map(act => {
              const key = `${cat.name}::${act.name}`;
              const state = myLog[key] || { done: false, mins: 0 };
              const isPending = pendingTime?.cat === cat.name && pendingTime?.act === act.name;
              const visual = state.done || isPending;
              return (
                <React.Fragment key={act.name}>
                  <button
                    onClick={() => handleCheck(cat.name, act.name, act.xp, act.trackTime)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 14px', borderRadius: isPending ? '12px 12px 0 0' : 12, marginBottom: isPending ? 0 : 8, border: '1px solid ' + (visual ? col + '55' : '#252830'), background: visual ? col + '10' : '#1A1D24', textAlign: 'left', transition: 'all .12s', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid ' + (visual ? col : '#3A404E'), background: visual ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#13151A', transition: 'all .15s' }}>
                        {visual && I.Check(11)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: visual ? '#E6E8EF' : '#B0B7C3', fontWeight: visual ? 500 : 400 }}>{act.name}</div>
                        {act.trackTime && state.mins > 0 && <div className="mono" style={{ fontSize: 10, color: col, marginTop: 1 }}>{fmtM(state.mins)}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {act.trackTime && !state.done && !isPending && <span className="mono" style={{ fontSize: 10, color: '#4a5060' }}>timed</span>}
                      <span className="mono" style={{ fontSize: 12, color: visual ? col : '#4a5060', fontWeight: 600 }}>+{act.xp}</span>
                    </div>
                  </button>
                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 11px', marginBottom: 8, background: col + '08', borderRadius: '0 0 12px 12px', border: '1px solid ' + col + '44', borderTop: 'none' }}>
                      <span style={{ fontSize: 12, color: '#6a7080', flexShrink: 0 }}>Time (mins)</span>
                      <input
                        type="number" placeholder="optional" value={timeInputVal}
                        onChange={e => setTimeInputVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitTime()}
                        autoFocus
                        style={{ flex: 1, maxWidth: 80, padding: '4px 8px', borderRadius: 8, border: '1px solid #252830', background: '#13151A', color: '#E6E8EF', fontSize: 13, outline: 'none' }}
                      />
                      <button onClick={submitTime} style={{ padding: '4px 13px', borderRadius: 8, background: col, color: '#13151A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Done</button>
                      <button onClick={() => { toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, 0); setPendingTime(null); setTimeInputVal(''); }} style={{ fontSize: 12, color: '#6a7080', cursor: 'pointer' }}>skip</button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
      <div style={{ height: 80 }} />
    </div>
  );
}
