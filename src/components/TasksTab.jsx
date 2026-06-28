import React from 'react';
import { SECTIONS, TASK_SECTIONS } from '../data';
import { C } from './ui';
import { I } from './Icons';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

export default function TasksTab({ cu, tasks, onAddTask, completeTask, toggleSubtask, deleteTask, toggleStar, readOnly, viewingUser, ac }) {
  const [activeSection, setActiveSection] = React.useState('All');
  const [showDone, setShowDone] = React.useState(false);
  const [timeModal, setTimeModal] = React.useState(null);
  const uname = viewingUser ? viewingUser.name : cu.name;
  const myTasks = tasks[uname] || [];
  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

  const filtered = myTasks.filter(t => {
    if (!showDone && t.status === 'done') return false;
    if (showDone && t.status !== 'done') return false;
    if (activeSection !== 'All' && t.section !== activeSection) return false;
    return true;
  });

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} onClose={() => setTimeModal(null)} onSubmit={(m) => { completeTask(timeModal.id, m); setTimeModal(null); }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{readOnly ? `${uname}'s Tasks` : 'My Tasks'}</div>
        {!readOnly && <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: ac, color: '#15171c', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(14)} New Task</button>}
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        {['All', ...TASK_SECTIONS].map(s => {
          const cnt = s === 'All' ? myTasks.filter(t => t.status === 'active').length : myTasks.filter(t => t.status === 'active' && t.section === s).length;
          const active = activeSection === s && !showDone;
          const col = SC[s] || ac;
          return (
            <button key={s} onClick={() => { setActiveSection(s); setShowDone(false); }} style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 20, border: '1px solid ' + (active ? col + '66' : '#2a2d35'), background: active ? col + '18' : 'transparent', color: active ? col : '#9aa1ad', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {s}{cnt > 0 ? ` ·${cnt}` : ''}
            </button>
          );
        })}
        <button onClick={() => setShowDone(v => !v)} style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 20, border: '1px solid ' + (showDone ? '#7ad6a0' : '#2a2d35'), background: showDone ? '#7ad6a018' : 'transparent', color: showDone ? '#7ad6a0' : '#9aa1ad', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✓ Done</button>
      </div>
      {filtered.length === 0 && <div style={C.card({ padding: '30px', textAlign: 'center', color: '#5f6470', fontSize: 13 })}>{showDone ? 'No completed tasks.' : 'Nothing here. Add a task!'}</div>}
      {filtered.map(t => (
        <div key={t.id} style={{ position: 'relative' }}>
          <TaskRow task={t} ac={ac} sc={SC} onComplete={() => t.status !== 'done' && setTimeModal({ id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} readOnly={readOnly} />
          {!readOnly && <button onClick={() => deleteTask(t.id, t.user)} style={{ position: 'absolute', right: 8, top: 10, color: '#3a3d45', display: 'flex' }}>{I.Trash()}</button>}
        </div>
      ))}
      <div style={{ height: 80 }} />
    </div>
  );
}
