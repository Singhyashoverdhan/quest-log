import React from 'react';
import { SECTIONS, HABIT_CATEGORIES, USERS } from '../data';
import { getDK, fmtD, fmtM, greeting } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import XPRing from './XPRing';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

export default function HomeMobile({ cu, allLogs, tasks, challenges, ac, toggle, completeTask, toggleSubtask, toggleStar, onAddTask, earnedXP, fulfilment, last7, allLogsAll, onCompleteChallenge }) {
  const [timeModal, setTimeModal] = React.useState(null); // for tasks only
  const [pendingTime, setPendingTime] = React.useState(null); // { cat, act, xp }
  const [timeInputVal, setTimeInputVal] = React.useState('');
  const dk = getDK(0);
  const myLog = (allLogs[cu.name] || {})[dk] || {};
  const myTasks = tasks[cu.name] || [];
  const challenge = challenges[dk];
  const streak = (() => { let s = 0; for (let i = 0; i < last7.length; i++) { const d = last7[last7.length - 1 - i]; if (d.pct > 0) s++; else break; } return s; })();
  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

  function handleHabitCheck(cat, act, xp, trackTime) {
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

  function submitPendingTime() {
    if (!pendingTime) return;
    toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, parseInt(timeInputVal) || 0);
    setPendingTime(null);
    setTimeInputVal('');
  }

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} optional onClose={() => setTimeModal(null)}
        onSubmit={(mins) => { completeTask(timeModal.id, mins); setTimeModal(null); }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <XPRing pct={fulfilment} xp={earnedXP} color={ac} size={90} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Good {greeting}</div>
          <div className="mono" style={{ fontSize: 11, color: '#7c8493', marginBottom: 8 }}>{fmtD(dk)}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: ac }}>{earnedXP}</div><div className="mono" style={{ fontSize: 9, color: '#7c8493' }}>XP</div></div>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: '#e8b34e' }}>{streak}d</div><div className="mono" style={{ fontSize: 9, color: '#7c8493' }}>streak</div></div>
          </div>
        </div>
      </div>

      {challenge?.prompt && (
        <div style={C.card({ padding: '12px', marginBottom: 14, borderColor: '#e8b34e33' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {I.Camera()}<span style={{ fontWeight: 600, fontSize: 13 }}>Picture a Day</span>
          </div>
          <div style={{ fontSize: 12, color: '#c5cad3', marginBottom: 8, fontStyle: 'italic' }}>"{challenge.prompt}"</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {USERS.map(u => {
              const done = challenge.completions?.[u.name];
              const isMe = u.name === cu.name;
              return <button key={u.name} onClick={() => isMe && !done && onCompleteChallenge(dk, challenge.prompt, cu.name)} style={{ ...C.pill(done ? u.color : '#5f6470'), cursor: isMe && !done ? 'pointer' : 'default' }}>{u.name[0]} {done ? '✓' : '○'}</button>;
            })}
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Daily Habits</div>
      {HABIT_CATEGORIES.map(cat => {
        const col = SECTIONS.find(s => s.name === cat.section)?.color || ac;
        return (
          <div key={cat.name} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#9aa1ad', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: col }} />{cat.section}
            </div>
            {cat.activities.map(act => {
              const key = `${cat.name}::${act.name}`;
              const state = myLog[key] || { done: false, mins: 0 };
              const isPending = pendingTime?.cat === cat.name && pendingTime?.act === act.name;
              const visual = state.done || isPending;
              return (
                <React.Fragment key={act.name}>
                  <button onClick={() => handleHabitCheck(cat.name, act.name, act.xp, act.trackTime)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: isPending ? '10px 10px 0 0' : 10, marginBottom: isPending ? 0 : 6, border: '1px solid ' + (visual ? col + '55' : '#2a2d35'), background: visual ? col + '12' : '#1c1f26', textAlign: 'left', transition: 'all .12s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 17, height: 17, borderRadius: 4, border: '1.5px solid ' + (visual ? col : '#444955'), background: visual ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#15171c' }}>
                        {visual && I.Check()}
                      </div>
                      <span style={{ fontSize: 13, color: visual ? '#e7e9ee' : '#c5cad3' }}>{act.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {state.mins > 0 && <span className="mono" style={{ fontSize: 10, color: col }}>{fmtM(state.mins)}</span>}
                      <span className="mono" style={{ fontSize: 11, color: visual ? col : '#5f6470' }}>+{act.xp}</span>
                    </div>
                  </button>
                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 10px', marginBottom: 6, background: col + '08', borderRadius: '0 0 10px 10px', borderLeft: '1px solid ' + col + '44', borderRight: '1px solid ' + col + '44', borderBottom: '1px solid ' + col + '44' }}>
                      <span style={{ fontSize: 12, color: '#7c8493', flexShrink: 0 }}>mins:</span>
                      <input type="number" placeholder="optional" value={timeInputVal} onChange={e => setTimeInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPendingTime()} autoFocus
                        style={{ flex: 1, maxWidth: 80, padding: '4px 8px', borderRadius: 7, border: '1px solid #2a2d35', background: '#15171c', color: '#e7e9ee', fontSize: 13, outline: 'none' }} />
                      <button onClick={submitPendingTime} style={{ padding: '4px 10px', borderRadius: 7, background: col, color: '#15171c', fontSize: 12, fontWeight: 700 }}>✓</button>
                      <button onClick={() => { toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, 0); setPendingTime(null); setTimeInputVal(''); }} style={{ fontSize: 12, color: '#7c8493' }}>skip</button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Tasks</div>
        <button onClick={onAddTask} style={{ ...C.pill(ac), cursor: 'pointer' }}>{I.Plus(11)} Add</button>
      </div>
      {myTasks.filter(t => t.status === 'active').slice(0, 5).map(t => (
        <TaskRow key={t.id} task={t} ac={ac} sc={SC} onComplete={() => setTimeModal({ type: 'task', id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} compact />
      ))}
      <div style={{ height: 80 }} />
    </div>
  );
}
