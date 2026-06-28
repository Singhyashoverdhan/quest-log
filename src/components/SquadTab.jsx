import React from 'react';
import { USERS, HABIT_CATEGORIES, TOTAL_XP } from '../data';
import { getDK, fmtD } from '../utils';
import { C } from './ui';
import { I } from './Icons';

export default function SquadTab({ allLogs, challenges, cu, onSetChallenge, onCompleteChallenge }) {
  const dk = getDK(0);
  const [prompt, setPrompt] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const challenge = challenges[dk];
  const scores = USERS.map(u => {
    const dl = (allLogs[u.name] || {})[dk] || {};
    let xp = 0; HABIT_CATEGORIES.forEach(c => c.activities.forEach(a => { if (dl[`${c.name}::${a.name}`]?.done) xp += a.xp; }));
    return { ...u, xp, pct: TOTAL_XP ? Math.round((xp / TOTAL_XP) * 100) : 0 };
  }).sort((a, b) => b.xp - a.xp);

  return (
    <div className="fade">
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Squad</div>
      <div className="mono" style={{ fontSize: 11, color: '#7c8493', marginBottom: 18 }}>{fmtD(dk)}</div>
      <div style={C.card({ padding: '16px', marginBottom: 16, borderColor: '#e8b34e33' })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {I.Camera()}<span style={{ fontWeight: 600, fontSize: 14 }}>Picture a Day</span>
          {cu.isAdmin && <button onClick={() => setEditing(v => !v)} style={{ marginLeft: 'auto', ...C.pill('#9aa1ad'), cursor: 'pointer' }}>{I.Edit()} {challenge?.prompt ? 'Edit' : 'Set'}</button>}
        </div>
        {editing && cu.isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="Today's prompt…" value={prompt} onChange={e => setPrompt(e.target.value)} style={C.inp({ flex: 1, fontSize: 13 })} />
            <button onClick={() => { if (prompt.trim()) { onSetChallenge(dk, prompt.trim()); setPrompt(''); setEditing(false); } }} style={{ padding: '8px 14px', borderRadius: 10, background: '#e8b34e', color: '#15171c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Set</button>
          </div>
        )}
        {challenge?.prompt ? (
          <>
            <div style={{ fontSize: 14, color: '#c5cad3', marginBottom: 12, fontStyle: 'italic' }}>"{challenge.prompt}"</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {USERS.map(u => {
                const done = challenge.completions?.[u.name];
                const isMe = u.name === cu.name;
                return (
                  <button key={u.name} onClick={() => isMe && !done && onCompleteChallenge(dk, challenge.prompt, cu.name)}
                    style={{ ...C.pill(done ? u.color : '#5f6470'), cursor: isMe && !done ? 'pointer' : 'default', padding: '6px 12px', fontSize: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? u.color : '#5f6470' }} /> {u.name} {done ? '✓' : '○'}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ color: '#5f6470', fontSize: 13 }}>{cu.isAdmin ? 'Set a challenge for today.' : 'No challenge today.'}</div>
        )}
      </div>
      {scores.map((u, i) => (
        <div key={u.name} style={C.card({ padding: '14px 16px', marginBottom: 10 })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? '#e8b34e' : i === 1 ? '#9aa1ad' : i === 2 ? '#cd7f32' : '#5f6470', width: 24 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color }} /><span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                </div>
                <span className="mono" style={{ fontSize: 12, color: u.color }}>{u.xp} XP · {u.pct}%</span>
              </div>
              <div style={{ height: 4, background: '#2a2d35', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${u.pct}%`, background: u.color, borderRadius: 3, transition: 'width .5s' }} />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ height: 80 }} />
    </div>
  );
}
