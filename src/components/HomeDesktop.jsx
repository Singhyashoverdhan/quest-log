import React from 'react';
import { SECTIONS, HABIT_CATEGORIES, USERS, TOTAL_XP } from '../data';
import { getDK, fmtD, fmtM } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import XPRing from './XPRing';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

export default function HomeDesktop({ cu, allLogs, tasks, challenges, ac, toggle, completeTask, toggleSubtask, toggleStar, onAddTask, setTaskSection, earnedXP, fulfilment, last7, allLogsAll, onCompleteChallenge }) {
  const [timeModal, setTimeModal] = React.useState(null); // for tasks only
  const [pendingTime, setPendingTime] = React.useState(null); // { cat, act, xp }
  const [timeInputVal, setTimeInputVal] = React.useState('');
  const dk = getDK(0);
  const myLog = (allLogs[cu.name] || {})[dk] || {};
  const myTasks = tasks[cu.name] || [];
  const challenge = challenges[dk];

  const habitMinsToday = Object.values(myLog).reduce((s, v) => s + (v.mins || 0), 0);
  const taskMinsToday = myTasks.filter(t => t.completedAt?.startsWith(dk)).reduce((s, t) => s + (t.actMins || 0), 0);
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
    <div className="fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto', gap: 14, padding: '0 0 40px' }}>
      {timeModal && (
        <TimeModal label={timeModal.title} optional onClose={() => setTimeModal(null)}
          onSubmit={(mins) => { completeTask(timeModal.id, mins); setTimeModal(null); }} />
      )}

      {/* COL 1 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={C.card({ padding: '18px' })}>
          <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 14 }}>TODAY'S PROGRESS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <XPRing pct={fulfilment} xp={earnedXP} color={ac} size={110} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#7c8493', marginBottom: 10 }}>Category breakdown</div>
              {HABIT_CATEGORIES.map(cat => {
                const total = cat.activities.reduce((s, a) => s + a.xp, 0);
                const earned = cat.activities.reduce((s, a) => s + (myLog[`${cat.name}::${a.name}`]?.done ? a.xp : 0), 0);
                const pct = total ? Math.round((earned / total) * 100) : 0;
                return (
                  <div key={cat.name} style={{ marginBottom: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 11 }}>
                      <span style={{ color: '#9aa1ad' }}>{cat.section}</span>
                      <span className="mono" style={{ color: '#5f6470' }}>{earned}/{total}</span>
                    </div>
                    <div style={{ height: 3, background: '#2a2d35', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: SC[cat.section] || ac, borderRadius: 2, transition: 'width .3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={C.card({ padding: '16px' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5 }}>7-DAY STREAK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#e8b34e', fontSize: 13, fontWeight: 700 }}>
              {I.Flame()} {streak}d
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {last7.map(d => {
              const mx = Math.max(...last7.map(x => x.pct), 1);
              return (
                <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="mono" style={{ fontSize: 9, color: '#7c8493' }}>{d.pct > 0 ? `${d.pct}%` : ''}</div>
                  <div style={{ width: '100%', borderRadius: 4, height: Math.max(3, (d.pct / mx) * 44), background: d.pct === 0 ? '#2a2d35' : ac, transition: 'height .3s' }} />
                  <div className="mono" style={{ fontSize: 9, color: '#5f6470' }}>{fmtD(d.key).slice(0, 1)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={C.card({ padding: '16px' })}>
          <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 12 }}>TIME TODAY</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: ac }}>{fmtM(habitMinsToday) || '—'}</div>
              <div className="mono" style={{ fontSize: 10, color: '#7c8493', marginTop: 3 }}>habits</div>
            </div>
            <div style={{ width: 1, background: '#2a2d35' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#7ad6a0' }}>{fmtM(taskMinsToday) || '—'}</div>
              <div className="mono" style={{ fontSize: 10, color: '#7c8493', marginTop: 3 }}>tasks</div>
            </div>
            <div style={{ width: 1, background: '#2a2d35' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#7eb8f7' }}>{fmtM(habitMinsToday + taskMinsToday) || '—'}</div>
              <div className="mono" style={{ fontSize: 10, color: '#7c8493', marginTop: 3 }}>total</div>
            </div>
          </div>
        </div>

        <div style={C.card({ padding: '16px' })}>
          <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 12 }}>SQUAD TODAY</div>
          {USERS.map(u => {
            const dl = (allLogsAll[u.name] || {})[dk] || {};
            let xp = 0; HABIT_CATEGORIES.forEach(c => c.activities.forEach(a => { if (dl[`${c.name}::${a.name}`]?.done) xp += a.xp; }));
            const pct = TOTAL_XP ? Math.round((xp / TOTAL_XP) * 100) : 0;
            return (
              <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${u.color}22`, border: `2px solid ${pct > 0 ? u.color : '#2a2d35'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: u.color }}>{u.name[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12, fontWeight: 500 }}>
                    <span>{u.name}</span><span className="mono" style={{ color: u.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, background: '#2a2d35', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: u.color, borderRadius: 2, transition: 'width .4s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COL 2 — Habits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {challenge?.prompt && (
          <div style={C.card({ padding: '14px', borderColor: '#e8b34e33' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {I.Camera()}<span style={{ fontWeight: 600, fontSize: 13 }}>Picture a Day</span>
              {challenge.completions?.[cu.name] && <span style={{ ...C.pill('#7ad6a0'), marginLeft: 'auto' }}>✓ Done</span>}
            </div>
            <div style={{ fontSize: 13, color: '#c5cad3', marginBottom: 10, fontStyle: 'italic' }}>"{challenge.prompt}"</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {USERS.map(u => {
                const done = challenge.completions?.[u.name];
                const isMe = u.name === cu.name;
                return (
                  <button key={u.name} onClick={() => isMe && !done && onCompleteChallenge(dk, challenge.prompt, cu.name)}
                    style={{ ...C.pill(done ? u.color : '#5f6470'), cursor: isMe && !done ? 'pointer' : 'default' }}>
                    {u.name[0]} {done ? '✓' : '○'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {HABIT_CATEGORIES.map(cat => {
          const col = SC[cat.section] || ac;
          const total = cat.activities.reduce((s, a) => s + a.xp, 0);
          const earned = cat.activities.reduce((s, a) => s + (myLog[`${cat.name}::${a.name}`]?.done ? a.xp : 0), 0);
          return (
            <div key={cat.name} style={C.card({ padding: '14px' })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{cat.section}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: '#5f6470' }}>{earned}/{total} xp</span>
              </div>
              {cat.activities.map(act => {
                const key = `${cat.name}::${act.name}`;
                const state = myLog[key] || { done: false, mins: 0 };
                const isPending = pendingTime?.cat === cat.name && pendingTime?.act === act.name;
                const visual = state.done || isPending;
                return (
                  <React.Fragment key={act.name}>
                    <button onClick={() => handleHabitCheck(cat.name, act.name, act.xp, act.trackTime)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 10px', borderRadius: 9, marginBottom: isPending ? 0 : 5, border: '1px solid ' + (visual ? col + '55' : '#2a2d35'), background: visual ? col + '12' : 'transparent', textAlign: 'left', transition: 'all .12s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid ' + (visual ? col : '#444955'), background: visual ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#15171c', transition: 'all .15s' }}>
                          {visual && I.Check(11)}
                        </div>
                        <span style={{ fontSize: 13, color: visual ? '#e7e9ee' : '#c5cad3' }}>{act.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {state.mins > 0 && <span className="mono" style={{ fontSize: 10, color: col }}>{fmtM(state.mins)}</span>}
                        <span className="mono" style={{ fontSize: 11, color: visual ? col : '#5f6470' }}>+{act.xp}</span>
                      </div>
                    </button>
                    {isPending && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px 8px', marginBottom: 5, background: col + '08', borderRadius: '0 0 9px 9px', borderLeft: '1px solid ' + col + '44', borderRight: '1px solid ' + col + '44', borderBottom: '1px solid ' + col + '44' }}>
                        <span style={{ fontSize: 11, color: '#7c8493', flexShrink: 0 }}>mins:</span>
                        <input type="number" placeholder="optional" value={timeInputVal} onChange={e => setTimeInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPendingTime()} autoFocus
                          style={{ width: 64, padding: '3px 6px', borderRadius: 6, border: '1px solid #2a2d35', background: '#15171c', color: '#e7e9ee', fontSize: 12, outline: 'none' }} />
                        <button onClick={submitPendingTime} style={{ padding: '3px 8px', borderRadius: 6, background: col, color: '#15171c', fontSize: 11, fontWeight: 700 }}>✓</button>
                        <button onClick={() => { toggle(pendingTime.cat, pendingTime.act, pendingTime.xp, 0); setPendingTime(null); setTimeInputVal(''); }} style={{ fontSize: 11, color: '#7c8493' }}>skip</button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* COL 3 — Tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {myTasks.filter(t => t.starred && t.status === 'active').length > 0 && (
          <div style={C.card({ padding: '14px', borderColor: '#e8b34e33' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              {I.Star(13, '#e8b34e')}<span style={{ fontWeight: 600, fontSize: 13, color: '#e8b34e' }}>Starred</span>
            </div>
            {myTasks.filter(t => t.starred && t.status === 'active').map(t => (
              <TaskRow key={t.id} task={t} ac={ac} sc={SC} onComplete={() => setTimeModal({ type: 'task', id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} compact />
            ))}
          </div>
        )}

        {SECTIONS.filter(sec => myTasks.some(t => t.section === sec.name && t.status === 'active')).map(sec => (
          <div key={sec.name} style={C.card({ padding: '14px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: sec.color }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{sec.name}</span>
                <span className="mono" style={{ fontSize: 10, color: '#5f6470' }}>{myTasks.filter(t => t.section === sec.name && t.status === 'active').length}</span>
              </div>
              <button onClick={() => { setTaskSection(sec.name); onAddTask(); }} style={{ color: '#5f6470', display: 'flex', alignItems: 'center' }}>{I.Plus(13)}</button>
            </div>
            {myTasks.filter(t => t.section === sec.name && t.status === 'active').map(t => (
              <TaskRow key={t.id} task={t} ac={ac} sc={SC} onComplete={() => setTimeModal({ type: 'task', id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} compact />
            ))}
          </div>
        ))}

        {myTasks.filter(t => t.status === 'active').length === 0 && (
          <div style={C.card({ padding: '20px', textAlign: 'center', borderStyle: 'dashed' })}>
            <div style={{ color: '#5f6470', fontSize: 13, marginBottom: 10 }}>No active tasks</div>
            <button onClick={onAddTask} style={{ ...C.pill(ac, { cursor: 'pointer', fontSize: 13, padding: '6px 14px' }) }}>
              {I.Plus(12)} Add a task
            </button>
          </div>
        )}

        {myTasks.filter(t => t.status === 'done').slice(-3).length > 0 && (
          <div style={C.card({ padding: '14px', opacity: 0.7 })}>
            <div className="mono" style={{ fontSize: 10, color: '#5f6470', letterSpacing: 1, marginBottom: 10 }}>RECENTLY DONE</div>
            {myTasks.filter(t => t.status === 'done').slice(-3).reverse().map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 15, height: 15, borderRadius: 4, background: '#7ad6a0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#15171c' }}>{I.Check(9)}</div>
                <span style={{ fontSize: 12, color: '#5f6470', textDecoration: 'line-through', flex: 1 }}>{t.title}</span>
                {t.actMins > 0 && <span className="mono" style={{ fontSize: 10, color: '#5f6470' }}>{fmtM(t.actMins)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
