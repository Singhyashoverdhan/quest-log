import React from 'react';
import { SECTIONS, HABIT_CATEGORIES, USERS } from '../data';
import { getDK, fmtD, fmtM, greeting } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import XPRing from './XPRing';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

export default function HomeMobile({ cu, allLogs, tasks, challenges, ac, toggle, completeTask, toggleSubtask, toggleStar, onAddTask, earnedXP, fulfilment, last7, allLogsAll, onCompleteChallenge }) {
  const [timeModal, setTimeModal] = React.useState(null);
  const dk = getDK(0);
  const myLog = (allLogs[cu.name] || {})[dk] || {};
  const myTasks = tasks[cu.name] || [];
  const challenge = challenges[dk];
  const streak = (() => { let s = 0; for (let i = 0; i < last7.length; i++) { const d = last7[last7.length - 1 - i]; if (d.pct > 0) s++; else break; } return s; })();
  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} optional onClose={() => setTimeModal(null)}
        onSubmit={(mins) => {
          if (timeModal.type === 'habit') toggle(timeModal.cat, timeModal.act, timeModal.xp, mins);
          else if (timeModal.type === 'task') completeTask(timeModal.id, mins);
          setTimeModal(null);
        }} />}

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
              return (
                <button key={act.name} onClick={() => { const already = state.done; if (!already && act.trackTime) setTimeModal({ type: 'habit', cat: cat.name, act: act.name, xp: act.xp, title: act.name }); else toggle(cat.name, act.name, act.xp, 0); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: 10, marginBottom: 6, border: '1px solid ' + (state.done ? col + '55' : '#2a2d35'), background: state.done ? col + '12' : '#1c1f26', textAlign: 'left', transition: 'all .12s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 17, height: 17, borderRadius: 4, border: '1.5px solid ' + (state.done ? col : '#444955'), background: state.done ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#15171c' }}>
                      {state.done && I.Check()}
                    </div>
                    <span style={{ fontSize: 13, color: state.done ? '#e7e9ee' : '#c5cad3' }}>{act.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {state.mins > 0 && <span className="mono" style={{ fontSize: 10, color: col }}>{fmtM(state.mins)}</span>}
                    <span className="mono" style={{ fontSize: 11, color: state.done ? col : '#5f6470' }}>+{act.xp}</span>
                  </div>
                </button>
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
