import React from 'react';
import { SECTIONS, HABIT_CATEGORIES } from '../data';
import { getDK, fmtD, fmtM } from '../utils';
import { C } from './ui';
import { I } from './Icons';

const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

export default function DailyTab({ cu, allLogs, toggle, ac, selectedHabits }) {
  const [dayOffset, setDayOffset] = React.useState(0);
  const [pendingTime, setPendingTime] = React.useState(null);
  const [timeInputVal, setTimeInputVal] = React.useState('');

  const activeDate = getDK(dayOffset);
  const isToday = dayOffset === 0;
  const myLog = (allLogs[cu.name] || {})[activeDate] || {};

  // Reset pending time input when changing date
  React.useEffect(() => { setPendingTime(null); setTimeInputVal(''); }, [dayOffset]);

  const filteredCats = React.useMemo(() =>
    HABIT_CATEGORIES.map(cat => ({
      ...cat,
      activities: cat.activities.filter(a => selectedHabits.has(`${cat.name}::${a.name}`))
    })).filter(cat => cat.activities.length > 0)
  , [selectedHabits]);

  const totalDone = filteredCats.reduce((n, c) => n + c.activities.filter(a => myLog[`${c.name}::${a.name}`]?.done).length, 0);
  const totalActs = filteredCats.reduce((n, c) => n + c.activities.length, 0);
  const todayPct = totalActs ? Math.round((totalDone / totalActs) * 100) : 0;

  function handleCheck(cat, act, xp, trackTime) {
    const already = myLog[`${cat}::${act}`]?.done;
    if (already) {
      toggle(cat, act, xp, 0, activeDate);
      if (pendingTime?.cat === cat && pendingTime?.act === act) { setPendingTime(null); setTimeInputVal(''); }
    } else if (trackTime && isToday) {
      setPendingTime({ cat, act, xp }); setTimeInputVal('');
    } else {
      toggle(cat, act, xp, 0, activeDate);
    }
  }

  function submitTime() {
    if (!pendingTime) return;
    toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, parseInt(timeInputVal) || 0, activeDate);
    setPendingTime(null); setTimeInputVal('');
  }

  if (filteredCats.length === 0) {
    return (
      <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🗓</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1814' }}>No habits selected</div>
        <div style={{ fontSize: 13, color: '#A09C96' }}>Go to Setup to choose which habits to track daily.</div>
      </div>
    );
  }

  return (
    <div className="fade">
      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1A1814' }}>
            {isToday ? 'Daily Routine' : fmtD(activeDate)}
          </div>
          <div className="mono" style={{ fontSize: 11, color: '#A09C96', marginTop: 2 }}>
            {isToday ? fmtD(activeDate) : 'backdating'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setDayOffset(o => Math.max(o - 1, -7))} disabled={dayOffset <= -7} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #EAE6DE', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#706C66', cursor: 'pointer', opacity: dayOffset <= -7 ? 0.3 : 1 }}>
            {I.Left(13)}
          </button>
          <div style={C.card({ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 4 })}>
            <span style={{ fontSize: 22, fontWeight: 700, color: ac }}>{totalDone}</span>
            <span className="mono" style={{ fontSize: 12, color: '#A09C96' }}>/ {totalActs}</span>
          </div>
          <button onClick={() => setDayOffset(o => Math.min(o + 1, 0))} disabled={isToday} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #EAE6DE', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#706C66', cursor: 'pointer', opacity: isToday ? 0.2 : 1 }}>
            {I.Right(13)}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#F0EDE8', borderRadius: 6, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${todayPct}%`, background: ac, borderRadius: 6, transition: 'width .5s' }} />
      </div>

      {filteredCats.map(cat => {
        const col = SC[cat.section] || ac;
        return (
          <div key={cat.name} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
              <span className="mono" style={{ fontSize: 10, color: '#A09C96', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{cat.section}</span>
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
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 14px', borderRadius: isPending ? '14px 14px 0 0' : 14, marginBottom: isPending ? 0 : 8, border: '1px solid ' + (visual ? col + '44' : '#EAE6DE'), background: visual ? col + '0C' : '#FFFFFF', textAlign: 'left', transition: 'all .12s', cursor: 'pointer', boxShadow: visual ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid ' + (visual ? col : '#D8D4CC'), background: visual ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FFFFFF', transition: 'all .15s' }}>
                        {visual && I.Check(11)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: visual ? '#1A1814' : '#706C66', fontWeight: visual ? 600 : 400 }}>{act.name}</div>
                        {act.trackTime && state.mins > 0 && <div className="mono" style={{ fontSize: 10, color: col, marginTop: 1 }}>{fmtM(state.mins)}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {act.trackTime && !visual && isToday && <span className="mono" style={{ fontSize: 10, color: '#C4C0BA' }}>timed</span>}
                      <span className="mono" style={{ fontSize: 12, color: visual ? col : '#C4C0BA', fontWeight: 600 }}>+{act.xp}</span>
                    </div>
                  </button>
                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 12px', marginBottom: 8, background: '#FFFFFF', borderRadius: '0 0 14px 14px', border: '1px solid ' + col + '44', borderTop: '1px solid #F0EDE8' }}>
                      <span style={{ fontSize: 12, color: '#A09C96', flexShrink: 0 }}>Time (mins)</span>
                      <input type="number" placeholder="optional" value={timeInputVal} onChange={e => setTimeInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitTime()} autoFocus
                        style={{ flex: 1, maxWidth: 80, padding: '5px 9px', borderRadius: 8, border: '1px solid #EAE6DE', background: '#F8F6F1', color: '#1A1814', fontSize: 13, outline: 'none' }} />
                      <button onClick={submitTime} style={{ padding: '5px 14px', borderRadius: 8, background: col, color: '#FFFFFF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Done</button>
                      <button onClick={() => { toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, 0, activeDate); setPendingTime(null); setTimeInputVal(''); }} style={{ fontSize: 12, color: '#A09C96', cursor: 'pointer' }}>skip</button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
      <div style={{ height: 100 }} />
    </div>
  );
}
