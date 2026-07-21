import React from 'react';
import { HABIT_CATEGORIES, TOTAL_XP, SECTIONS } from '../data';
import { getDK, fmtDS } from '../utils';
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

function urgency(task) {
  if (!task.dueDate) return 'none';
  const due = task.dueDate;
  const today = getDK(0);
  if (due < today) return 'overdue';
  if (due === today) return 'today';
  const d = new Date(today + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  if (due === d.toISOString().slice(0, 10)) return 'soon';
  return 'none';
}

export default function HomeTab({ cu, allLogs, tasks, ac, dayOffset, onDayChange, isMobile, completeTask, toggleSubtask, toggleStar, onAddTask }) {
  const [timeModal, setTimeModal] = React.useState(null);
  const activeDate = getDK(dayOffset);
  const isToday = dayOffset === 0;
  const myLogs = allLogs[cu.name] || {};
  const myLog = myLogs[activeDate] || {};
  const myTasks = (tasks[cu.name] || []).filter(t => t.status === 'active');

  const dayXP = React.useMemo(() => computeXP(myLog), [myLog]);
  const dayPct = TOTAL_XP ? Math.round((dayXP / TOTAL_XP) * 100) : 0;

  const last7 = React.useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const k = getDK(i - 6);
    return { key: k, pct: TOTAL_XP ? Math.round((computeXP(myLogs[k] || {}) / TOTAL_XP) * 100) : 0 };
  }), [myLogs]);

  const streak = React.useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) { if (computeXP(myLogs[getDK(-i)] || {}) > 0) s++; else break; }
    return s;
  }, [myLogs]);

  const habitsDone = HABIT_CATEGORIES.reduce((n, c) => n + c.activities.filter(a => myLog[`${c.name}::${a.name}`]?.done).length, 0);
  const habitsTotal = HABIT_CATEGORIES.reduce((n, c) => n + c.activities.length, 0);
  const maxBar = Math.max(...last7.map(d => d.pct), 1);

  const weekXP = React.useMemo(() =>
    Array.from({ length: 7 }, (_, i) => computeXP(myLogs[getDK(-i)] || {})).reduce((a, b) => a + b, 0)
  , [myLogs]);

  const monthXP = React.useMemo(() => {
    const prefix = activeDate.slice(0, 7);
    return Object.entries(myLogs).filter(([k]) => k.startsWith(prefix)).reduce((s, [, dl]) => s + computeXP(dl), 0);
  }, [myLogs, activeDate]);

  // Sort tasks: overdue → today → soon → starred → rest
  const sortedTasks = React.useMemo(() => {
    const ord = { overdue: 0, today: 1, soon: 2, none: 3 };
    return [...myTasks].sort((a, b) => {
      const ua = urgency(a), ub = urgency(b);
      if (ord[ua] !== ord[ub]) return ord[ua] - ord[ub];
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      return 0;
    });
  }, [myTasks]);

  const overdueTasks = sortedTasks.filter(t => urgency(t) === 'overdue');
  const dueTodayTasks = sortedTasks.filter(t => urgency(t) === 'today');

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} optional onClose={() => setTimeModal(null)} onSubmit={m => { completeTask(timeModal.id, m); setTimeModal(null); }} />}

      {/* Day navigation */}
      <div style={{ padding: '10px 0 16px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 28 }}>
          <button
            onClick={() => onDayChange(Math.max(dayOffset - 1, -30))}
            disabled={dayOffset <= -30}
            style={{ fontSize: 22, fontWeight: 600, color: '#D8D4CC', cursor: 'pointer', opacity: dayOffset <= -30 ? 0.3 : 1 }}
          >
            {new Date(getDK(dayOffset - 1) + 'T00:00:00').getDate()}
          </button>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#1A1814', lineHeight: 1 }}>
            {new Date(activeDate + 'T00:00:00').getDate()}
          </div>
          <button
            onClick={() => onDayChange(Math.min(dayOffset + 1, 0))}
            disabled={dayOffset >= 0}
            style={{ fontSize: 22, fontWeight: 600, color: '#D8D4CC', cursor: 'pointer', opacity: dayOffset >= 0 ? 0.2 : 1 }}
          >
            {new Date(getDK(dayOffset + 1) + 'T00:00:00').getDate()}
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: '#A09C96', marginTop: 6, textTransform: 'uppercase' }}>
          {new Date(activeDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
          {'  ·  '}
          {dayOffset === 0 ? 'Today' : dayOffset === -1 ? 'Yesterday' : fmtDS(activeDate)}
        </div>
      </div>

      {/* Stats — ring + flat stats in one card */}
      <div style={C.card({ padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 })}>
        <XPRing pct={dayPct} xp={dayXP} color={ac} size={130} />
        <div style={{ width: 1, alignSelf: 'stretch', background: '#EAE6DE', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignSelf: 'stretch', paddingTop: 2, paddingBottom: 2, gap: 8 }}>
          {[
            [
              { label: 'HABITS',   val: habitsDone, suffix: `/${habitsTotal}`, color: habitsDone === habitsTotal && habitsTotal > 0 ? '#7BAF92' : '#1A1814' },
              { label: 'WEEK XP',  val: weekXP,     suffix: ' xp',            color: '#1A1814' },
            ],
            [
              { label: 'STREAK',   val: streak,     suffix: ' d',             color: streak >= 3 ? ac : '#1A1814' },
              { label: 'MONTH XP', val: monthXP,    suffix: ' xp',            color: '#1A1814' },
            ],
          ].map((col, ci) => (
            <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
              {col.map(s => (
                <div key={s.label}>
                  <div className="mono" style={{ fontSize: 10, color: '#A09C96', letterSpacing: 1, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: s.color }}>
                    {s.val}<span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}>{s.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 7-day bar chart */}
      <div style={C.card({ padding: '12px 12px 8px', marginBottom: 12 })}>
        <div className="mono" style={{ fontSize: 10, color: '#A09C96', letterSpacing: 1.5, marginBottom: 10 }}>LAST 7 DAYS</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
          {last7.map((d, idx) => {
            const isActive = d.key === activeDate;
            const barH = Math.max(3, Math.round((d.pct / maxBar) * 32));
            return (
              <div key={d.key} onClick={() => onDayChange(idx - 6)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <div style={{ width: '100%', borderRadius: 4, height: barH, background: isActive ? ac : d.pct === 0 ? '#EAE6DE' : ac + '55', transition: 'height .3s', outline: isActive ? `2px solid ${ac}` : 'none', outlineOffset: 1 }} />
                <div className="mono" style={{ fontSize: 10, color: isActive ? ac : '#A09C96', fontWeight: isActive ? 700 : 400 }}>
                  {new Date(d.key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent task alerts */}
      {isToday && (overdueTasks.length > 0 || dueTodayTasks.length > 0) && (
        <div style={{ marginBottom: 10 }}>
          {overdueTasks.length > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#C4787808', border: '1px solid #C4787830', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C47878', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#C47878', fontWeight: 600 }}>{overdueTasks.length} overdue</span>
              <span style={{ fontSize: 11, color: '#A09C96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {overdueTasks.map(t => t.title).join(', ')}</span>
            </div>
          )}
          {dueTodayTasks.length > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#C9A97008', border: '1px solid #C9A97030', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: ac, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: ac, fontWeight: 600 }}>{dueTodayTasks.length} due today</span>
              <span style={{ fontSize: 11, color: '#A09C96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {dueTodayTasks.map(t => t.title).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      {isToday && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1814' }}>Tasks <span className="mono" style={{ fontSize: 11, color: '#A09C96', fontWeight: 400 }}>· {myTasks.length} active</span></div>
            <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{I.Plus(9)} Add</button>
          </div>
          {myTasks.length === 0
            ? <div style={C.card({ padding: '14px', textAlign: 'center', color: '#A09C96', fontSize: 13 })}>All clear — no active tasks.</div>
            : sortedTasks.slice(0, 6).map(t => {
                const u = urgency(t);
                return <TaskRow key={t.id} task={t} ac={ac} sc={SC} urgency={u} onComplete={() => setTimeModal({ id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} compact />;
              })
          }
          {myTasks.length > 6 && <div className="mono" style={{ fontSize: 11, color: '#A09C96', textAlign: 'center', marginTop: 4 }}>+{myTasks.length - 6} more · open Tasks tab</div>}
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}
