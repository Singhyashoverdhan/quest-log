import React from 'react';
import { USERS, HABIT_CATEGORIES, TOTAL_XP, SECTIONS } from '../data';
import { getDK, fmtD, fmtDS } from '../utils';
import { C } from './ui';
import { I } from './Icons';

function computeXP(log) {
  let xp = 0;
  HABIT_CATEGORIES.forEach(c => c.activities.forEach(a => { if (log[`${c.name}::${a.name}`]?.done) xp += a.xp; }));
  return xp;
}

function getTitle(userLogs) {
  const catCount = {};
  let totalDone = 0, totalPossible = 0, streak = 0;

  for (let i = 0; i < 7; i++) {
    const dl = userLogs[getDK(-i)] || {};
    let dayXP = 0;
    HABIT_CATEGORIES.forEach(c => c.activities.forEach(a => {
      totalPossible++;
      if (dl[`${c.name}::${a.name}`]?.done) {
        dayXP += a.xp; totalDone++;
        catCount[c.section] = (catCount[c.section] || 0) + 1;
      }
    }));
    if (i === 0 || streak === i) { if (dayXP > 0) streak++; }
  }

  const top = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pct = totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0;

  if (streak >= 5 && pct >= 70) return { title: 'Disciplined Marshal', emoji: '⚔️' };
  if (top === 'Health' && pct >= 50) return { title: 'Body Sculptor', emoji: '💪' };
  if (top === 'Morning' && streak >= 3) return { title: 'Dawn Commander', emoji: '🌅' };
  if (top === 'Creative Work' && pct >= 40) return { title: 'The Artisan', emoji: '🎨' };
  if (top === 'Learning' && pct >= 40) return { title: 'Knowledge Seeker', emoji: '📖' };
  if (top === 'Expression') return { title: 'The Wordsmith', emoji: '✍️' };
  if (pct >= 60) return { title: 'Quest Champion', emoji: '🏆' };
  if (streak >= 3) return { title: 'Steady Climber', emoji: '📈' };
  if (pct >= 30) return { title: 'Rising Force', emoji: '⚡' };
  return { title: 'The Wanderer', emoji: '🌿' };
}

export default function SquadTab({ allLogs, challenges, cu, onSetChallenge, onCompleteChallenge }) {
  const dk = getDK(0);
  const [prompt, setPrompt] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [view, setView] = React.useState('today'); // 'today' | 'week' | 'month'
  const challenge = challenges[dk];

  const scores = React.useMemo(() => {
    return USERS.map(u => {
      const logs = allLogs[u.name] || {};

      // Today
      const todayXP = computeXP(logs[dk] || {});

      // Weekly (last 7 days)
      let weekXP = 0;
      for (let i = 0; i < 7; i++) weekXP += computeXP(logs[getDK(-i)] || {});

      // Monthly (current month)
      const prefix = dk.slice(0, 7);
      let monthXP = 0;
      Object.entries(logs).forEach(([k, dl]) => { if (k.startsWith(prefix)) monthXP += computeXP(dl); });

      // Streak
      let streak = 0;
      for (let i = 0; i < 60; i++) { if (computeXP(logs[getDK(-i)] || {}) > 0) streak++; else break; }

      const titleData = getTitle(logs);
      const xp = view === 'today' ? todayXP : view === 'week' ? weekXP : monthXP;
      return { ...u, xp, todayXP, weekXP, monthXP, pct: TOTAL_XP ? Math.round((todayXP / TOTAL_XP) * 100) : 0, streak, ...titleData };
    }).sort((a, b) => b.xp - a.xp);
  }, [allLogs, dk, view]);

  return (
    <div className="fade">
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Squad</div>
      <div className="mono" style={{ fontSize: 11, color: '#6a7080', marginBottom: 18 }}>{fmtD(dk)}</div>

      {/* Picture a day challenge */}
      <div style={C.card({ padding: '16px', marginBottom: 16, borderColor: '#C9A97033' })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {I.Camera()}<span style={{ fontWeight: 600, fontSize: 14 }}>Picture a Day</span>
          {cu.isAdmin && <button onClick={() => setEditing(v => !v)} style={{ marginLeft: 'auto', ...C.pill('#8A8F9E'), cursor: 'pointer' }}>{I.Edit()} {challenge?.prompt ? 'Edit' : 'Set'}</button>}
        </div>
        {editing && cu.isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="Today's prompt…" value={prompt} onChange={e => setPrompt(e.target.value)} style={C.inp({ flex: 1, fontSize: 13 })} />
            <button onClick={() => { if (prompt.trim()) { onSetChallenge(dk, prompt.trim()); setPrompt(''); setEditing(false); } }} style={{ padding: '8px 14px', borderRadius: 10, background: '#C9A970', color: '#13151A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Set</button>
          </div>
        )}
        {challenge?.prompt ? (
          <>
            <div style={{ fontSize: 14, color: '#B0B7C3', marginBottom: 12, fontStyle: 'italic' }}>"{challenge.prompt}"</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {USERS.map(u => {
                const done = challenge.completions?.[u.name];
                const isMe = u.name === cu.name;
                return (
                  <button key={u.name} onClick={() => isMe && !done && onCompleteChallenge(dk, challenge.prompt, cu.name)}
                    style={{ ...C.pill(done ? u.color : '#4a5060'), cursor: isMe && !done ? 'pointer' : 'default', padding: '6px 12px', fontSize: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? u.color : '#4a5060' }} /> {u.name} {done ? '✓' : '○'}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ color: '#4a5060', fontSize: 13 }}>{cu.isAdmin ? 'Set a challenge for today.' : 'No challenge today.'}</div>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[{ id: 'today', label: 'Today' }, { id: 'week', label: '7 Days' }, { id: 'month', label: 'Month' }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{ padding: '5px 13px', borderRadius: 20, border: '1px solid ' + (view === v.id ? '#C9A97066' : '#252830'), background: view === v.id ? '#C9A97018' : 'transparent', color: view === v.id ? '#C9A970' : '#6a7080', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {scores.map((u, i) => (
        <div key={u.name} style={C.card({ padding: '14px 16px', marginBottom: 10 })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="mono" style={{ fontSize: i < 3 ? 20 : 14, width: 28, textAlign: 'center', color: i === 0 ? '#C9A970' : i === 1 ? '#8A909E' : i === 2 ? '#A0826A' : '#4a5060', fontWeight: 700 }}>
              {i === 0 ? '①' : i === 1 ? '②' : i === 2 ? '③' : `${i + 1}`}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                    <span style={{ fontSize: 13 }}>{u.emoji}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6a7080', fontStyle: 'italic' }}>{u.title}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="mono" style={{ fontSize: 13, color: u.color, fontWeight: 700 }}>{u.xp} xp</div>
                  {view === 'today' && <div className="mono" style={{ fontSize: 10, color: '#4a5060' }}>{u.pct}%</div>}
                  {view !== 'today' && <div className="mono" style={{ fontSize: 10, color: '#4a5060' }}>🔥{u.streak}d</div>}
                </div>
              </div>
              {view === 'today' && (
                <div style={{ height: 3, background: '#252830', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${u.pct}%`, background: u.color, borderRadius: 3, transition: 'width .5s' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div style={{ height: 80 }} />
    </div>
  );
}
