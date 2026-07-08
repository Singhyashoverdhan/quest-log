import React from 'react';
import { SECTIONS, TASK_SECTIONS } from '../data';
import { C } from './ui';
import { I } from './Icons';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

export default function TasksTab({ cu, tasks, onAddTask, completeTask, toggleSubtask, deleteTask, toggleStar, readOnly, viewingUser, ac }) {
  const [activeSection, setActiveSection] = React.useState('All');
  const [showDone, setShowDone] = React.useState(false);
  const [timeModal, setTimeModal] = React.useState(null);
  const uname = viewingUser ? viewingUser.name : cu.name;
  const myTasks = tasks[uname] || [];

  const filtered = myTasks.filter(t => {
    if (!showDone && t.status === 'done') return false;
    if (showDone && t.status !== 'done') return false;
    if (activeSection !== 'All' && t.section !== activeSection) return false;
    return true;
  });

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} onClose={() => setTimeModal(null)} onSubmit={m => { completeTask(timeModal.id, m); setTimeModal(null); }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#1A1814' }}>{readOnly ? `${uname}'s Tasks` : 'My Tasks'}</div>
        {!readOnly && <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(14)} New Task</button>}
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        {['All', ...TASK_SECTIONS].map(s => {
          const cnt = s === 'All' ? myTasks.filter(t => t.status === 'active').length : myTasks.filter(t => t.status === 'active' && t.section === s).length;
          const active = activeSection === s && !showDone;
          const col = SC[s] || ac;
          return (
            <button key={s} onClick={() => { setActiveSection(s); setShowDone(false); }} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, border: '1px solid ' + (active ? col + '55' : '#EAE6DE'), background: active ? col : '#FFFFFF', color: active ? '#FFFFFF' : '#706C66', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all .15s' }}>
              {s}{cnt > 0 ? ` ·${cnt}` : ''}
            </button>
          );
        })}
        <button onClick={() => setShowDone(v => !v)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, border: '1px solid ' + (showDone ? '#7BAF9266' : '#EAE6DE'), background: showDone ? '#7BAF92' : '#FFFFFF', color: showDone ? '#FFFFFF' : '#706C66', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>✓ Done</button>
      </div>
      {filtered.length === 0 && <div style={C.card({ padding: '30px', textAlign: 'center', color: '#A09C96', fontSize: 13 })}>{showDone ? 'No completed tasks.' : 'Nothing here. Add a task!'}</div>}
      {filtered.map(t => (
        <div key={t.id} style={{ position: 'relative' }}>
          <TaskRow task={t} ac={ac} sc={SC} onComplete={() => t.status !== 'done' && setTimeModal({ id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} readOnly={readOnly} />
          {!readOnly && <button onClick={() => deleteTask(t.id, t.user)} style={{ position: 'absolute', right: 8, top: 10, color: '#D8D4CC', cursor: 'pointer' }}>{I.Trash()}</button>}
        </div>
      ))}
      <div style={{ height: 100 }} />
    </div>
  );
}
