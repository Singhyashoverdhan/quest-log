import React from 'react';
import { C } from './ui';
import { I } from './Icons';
import { fmtDS, fmtM } from '../utils';

export default function TaskRow({ task, ac, sc, onComplete, onToggleSub, onStar, compact, readOnly }) {
  const [open, setOpen] = React.useState(false);
  const col = sc[task.section] || '#7c8493';
  const subDone = task.subtasks.filter(s => s.done).length;
  return (
    <div style={{ marginBottom: compact ? 6 : 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: compact ? '7px 8px' : '10px 12px', borderRadius: 9, border: '1px solid #2a2d35', background: '#15171c', transition: 'border-color .15s' }}>
        {!readOnly && (
          <button onClick={onComplete} style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${col}`, background: 'transparent', flexShrink: 0, marginTop: 1, cursor: 'pointer' }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: compact ? 12 : 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
            {task.starred && <span style={{ color: '#e8b34e', flexShrink: 0 }}>{I.Star(10, '#e8b34e')}</span>}
          </div>
          {!compact && task.notes && <div style={{ fontSize: 11, color: '#7c8493', marginTop: 2 }}>{task.notes}</div>}
          <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {!compact && <span style={C.pill(col)}>{task.section}</span>}
            {task.dueDate && <span className="mono" style={{ fontSize: 10, color: '#7c8493' }}>{fmtDS(task.dueDate)}</span>}
            {task.estMins > 0 && <span className="mono" style={{ fontSize: 10, color: '#5f6470' }}>{I.Clock(10)} {fmtM(task.estMins)}</span>}
          </div>
          {task.subtasks.length > 0 && (
            <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#7c8493', fontSize: 11 }}>
              {I.ChevDown(11)} {subDone}/{task.subtasks.length} items
            </button>
          )}
          {open && task.subtasks.map(st => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <button onClick={() => !readOnly && onToggleSub(task.id, st.id, task.user)} style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid ' + (st.done ? '#7ad6a0' : '#444955'), background: st.done ? '#7ad6a0' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#15171c', cursor: readOnly ? 'default' : 'pointer' }}>
                {st.done && I.Check(8)}
              </button>
              <span style={{ fontSize: 11, color: st.done ? '#5f6470' : '#c5cad3', textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</span>
            </div>
          ))}
        </div>
        {!readOnly && <button onClick={() => onStar && onStar(task.id, task.user)} style={{ color: task.starred ? '#e8b34e' : '#3a3d45', flexShrink: 0 }}>{I.Star(11, task.starred ? '#e8b34e' : 'none')}</button>}
      </div>
    </div>
  );
}
