import React from 'react';
import { SECTIONS, TASK_SECTIONS } from '../data';
import { getDK } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import TaskRow from './TaskRow';
import TimeModal from './TimeModal';

function urgency(task) {
  const today = getDK(0);
  if (!task.dueDate) return 'none';
  if (task.dueDate < today) return 'overdue';
  if (task.dueDate === today) return 'today';
  const d = new Date(today + 'T00:00:00'); d.setDate(d.getDate() + 1);
  if (task.dueDate === d.toISOString().slice(0, 10)) return 'soon';
  return 'none';
}

const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

export default function TasksTab({ cu, tasks, onAddTask, completeTask, toggleSubtask, deleteTask, toggleStar, reopenTask, readOnly, viewingUser, ac }) {
  const [activeSection, setActiveSection] = React.useState('All');
  const [timeModal, setTimeModal] = React.useState(null);
  const uname = viewingUser ? viewingUser.name : cu.name;
  const myTasks = tasks[uname] || [];

  const inSection = t => activeSection === 'All' || t.section === activeSection;
  const activeTasks = myTasks.filter(t => t.status === 'active' && inSection(t));
  const doneTasks   = myTasks.filter(t => t.status === 'done'   && inSection(t))
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  return (
    <div className="fade">
      {timeModal && <TimeModal label={timeModal.title} onClose={() => setTimeModal(null)} onSubmit={m => { completeTask(timeModal.id, m); setTimeModal(null); }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#1A1814' }}>{readOnly ? `${uname}'s Tasks` : 'My Tasks'}</div>
        {!readOnly && <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(14)} New Task</button>}
      </div>

      {/* Section filter pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        {['All', ...TASK_SECTIONS].map(s => {
          const cnt = s === 'All' ? myTasks.filter(t => t.status === 'active').length : myTasks.filter(t => t.status === 'active' && t.section === s).length;
          const active = activeSection === s;
          const col = SC[s] || ac;
          return (
            <button key={s} onClick={() => setActiveSection(s)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, border: '1px solid ' + (active ? col + '55' : '#EAE6DE'), background: active ? col : '#FFFFFF', color: active ? '#FFFFFF' : '#706C66', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all .15s' }}>
              {s}{cnt > 0 ? ` ·${cnt}` : ''}
            </button>
          );
        })}
      </div>

      {/* Active tasks */}
      {activeTasks.length === 0 && doneTasks.length === 0 && (
        <div style={C.card({ padding: '30px', textAlign: 'center', color: '#A09C96', fontSize: 13 })}>Nothing here. Add a task!</div>
      )}
      {activeTasks.length === 0 && doneTasks.length > 0 && (
        <div style={{ textAlign: 'center', color: '#A09C96', fontSize: 13, padding: '16px 0 8px' }}>All caught up!</div>
      )}
      {activeTasks.map(t => (
        <TaskRow key={t.id} task={t} ac={ac} sc={SC} urgency={urgency(t)} onComplete={() => setTimeModal({ id: t.id, title: t.title })} onToggleSub={toggleSubtask} onStar={toggleStar} onDelete={!readOnly ? deleteTask : undefined} readOnly={readOnly} />
      ))}

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: '#EAE6DE' }} />
            <div className="mono" style={{ fontSize: 10, color: '#A09C96', letterSpacing: 1 }}>COMPLETED · {doneTasks.length}</div>
            <div style={{ flex: 1, height: 1, background: '#EAE6DE' }} />
          </div>
          {doneTasks.map(t => (
            <TaskRow key={t.id} task={t} ac={ac} sc={SC} urgency={undefined} onComplete={() => {}} onToggleSub={toggleSubtask} onStar={toggleStar} onReopen={!readOnly ? reopenTask : undefined} readOnly={readOnly} />
          ))}
        </>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}
