import React from 'react';
import { HABIT_CATEGORIES, TOTAL_XP, USERS, SECTIONS } from '../data';
import { getDK, fmtD, fmtDS } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import XPRing from './XPRing';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

function computeXP(log) {
  let xp = 0;
  HABIT_CATEGORIES.forEach(c => c.activities.forEach(a => { if (log[`${c.name}::${a.name}`]?.done) xp += a.xp; }));
  return xp;
}

const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

export default function HomeTab({ cu, allLogs, tasks, ac, dayOffset, onDayChange, isMobile, completeTask, toggleSubtask, toggleStar, onAddTask }) {
  const [timeModal, setTimeModal] = React.useState(null);
  const activeDate = getDK(dayOffset);
  const isToday = dayOffset === 0;
  const myLogs = allLogs[cu.name] || {};
  const myLog = myLogs[activeDate] || {};
  const myTasks = tasks[cu.name] || [];

  const dayXP = React.useMemo(() => computeXP(myLog), [myLog]);
  const dayPct = TOTAL_XP ? Math.round((dayXP / TOTAL_XP) * 100) : 0;

  const last7 = React.useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const k = getDK(i - 6);
    return { key: k, pct: TOTAL_XP ? Math.round((computeXP(myLogs[k] || {}) / TOTAL_XP) * 100) : 0 };
  }), [myLogs]);

  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) { if (computeXP(myLogs[getDK(-i)] || {}) > 0) s++; else break; }
    return s;
  })();

  const habitsDone = HABIT_CATEGORIES.reduce((n, c) => n + c.activities.filter(a => myLog[`${c.name}::${a.name}`]?.done).length, 0);
  const habitsTotal = HABIT_CATEGORIES.reduce((n, c) => n + c.activities.length, 0);
  const activeTasks = myTasks.filter(t => t.status === 'active');
  const maxBar = Math.max(...last7.map(d => d.pct), 1);

  const monthXP = React.useMemo(() => {
    const prefix = activeDate.slice(0, 7);
    return Object.entries(myLogs).filter(([k]) => k.startsWith(prefix)).reduce((s, [, dl]) => s + computeXP(dl), 0);
  }, [myLogs, activeDate]);

  const dayLabel = dayOffset === 0 ? 'Today' : dayOffset === -1 ? 'Yesterday' : fmtD(activeDate);

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} optional onClose={() => setTimeModal(null)} onSubmit={m => { completeTask(timeModal.id, m); setTimeModal(null); }} />}

      {/* Day navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
        <button onClick={() => onDayChange(Math.max(dayOffset - 1, -30))} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #EAE6DE', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#706C66', cursor: 'pointer', opacity: dayOffset <= -30 ? 0.3 : 1 }} disabled={dayOffset <= -30}>
          {I.Left(14)}
        </button>
        <div style={{ textAlign: 'center', minWidth: 130 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1814' }}>{dayLabel}</div>
          {dayOffset !== 0 && <div className="mono" style={{ fontSize: 10, color: '#A09C96', marginTop: 1 }}>{fmtD(activeDate)}</div>}
        </div>
        <button onClick={() => onDayChange(Math.min(dayOffset + 1, 0))} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #EAE6DE', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#706C66', cursor: 'pointer', opacity: dayOffset >= 0 ? 0.2 : 1 }} disabled={dayOffset >= 0}>
          {I.Right(14)}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <XPRing pct={dayPct} xp={dayXP} color={ac} size={isMobile ? 90 : 96} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={C.card({ padding: '10px 12px', flex: 1 })}>
              <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 1, marginBottom: 4 }}>HABITS</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: '#1A1814' }}>{habitsDone}<span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}>/{habitsTotal}</span></div>
            </div>
            <div style={C.card({ padding: '10px 12px', flex: 1 })}>
              <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 1, marginBottom: 4 }}>STREAK</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: streak >= 3 ? ac : '#1A1814' }}>{streak}<span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}>d</span></div>
            </div>
          </div>
          <div style={C.card({ padding: '10px 12px' })}>
            <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 1, marginBottom: 4 }}>THIS MONTH</div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1, color: '#1A1814' }}>{monthXP}<span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}> xp</span></div>
          </div>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div style={C.card({ padding: '14px 14px 10px', marginBottom: 14 })}>
        <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 1.5, marginBottom: 12 }}>LAST 7 DAYS</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
          {last7.map((d, idx) => {
            const isActive = d.key === activeDate;
            const barH = Math.max(3, Math.round((d.pct / maxBar) * 40));
            return (
              <div key={d.key} onClick={() => onDayChange(idx - 6)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <div style={{ width: '100%', borderRadius: 6, height: barH, background: isActive ? ac : d.pct === 0 ? '#F0EDE8' : ac + '55', transition: 'height .3s', outline: isActive ? `2px solid ${ac}` : 'none', outlineOffset: 1 }} />
                <div className="mono" style={{ fontSize: 8, color: isActive ? ac : '#C4C0BA', fontWeight: isActive ? 700 : 400 }}>
                  {new Date(d.key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active tasks */}
      {isToday && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#1A1814' }}>Tasks <span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}>· {activeTasks.length} active</span></div>
            <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{I.Plus(10)} Add</button>
          </div>
          {activeTasks.length === 0
            ? <div style={C.card({ padding: '16px', textAlign: 'center', color: '#A09C96', fontSize: 13 })}>All clear — no active tasks.</div>
            : activeTasks.slice(0, 5).map(t => (
              <TaskRow key={t.id} task={t} ac={ac} sc={SC} onComplete={() => t.status !== 'done' && setTimeModal({ id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} compact />
            ))}
          {activeTasks.length > 5 && <div className="mono" style={{ fontSize: 11, color: '#A09C96', textAlign: 'center', marginTop: 6 }}>+{activeTasks.length - 5} more in Tasks</div>}
        </div>
      )}

      {/* Squad leaderboard */}
      <div style={C.card({ padding: '16px', marginBottom: 14 })}>
        <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 1.5, marginBottom: 14 }}>
          SQUAD · {isToday ? 'TODAY' : fmtDS(activeDate).toUpperCase()}
        </div>
        {USERS.map(u => {
          const dl = (allLogs[u.name] || {})[activeDate] || {};
          const xp = computeXP(dl);
          const pct = TOTAL_XP ? Math.round((xp / TOTAL_XP) * 100) : 0;
          return (
            <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.color + '18', border: `1.5px solid ${pct > 0 ? u.color : '#EAE6DE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: u.color }}>{u.name[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1814' }}>{u.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: pct > 0 ? u.color : '#C4C0BA' }}>{xp} xp · {pct}%</span>
                </div>
                <div style={{ height: 4, background: '#F0EDE8', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: u.color, borderRadius: 4, transition: 'width .5s' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
