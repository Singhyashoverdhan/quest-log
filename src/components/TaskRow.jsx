import React from 'react';
import { C } from './ui';
import { I } from './Icons';
import { fmtDS, fmtM } from '../utils';

export default function TaskRow({ task, ac, sc, onComplete, onToggleSub, onStar, compact, readOnly }) {
  const [open, setOpen] = React.useState(false);
  const col = sc[task.section] || '#A09C96';
  const subDone = task.subtasks.filter(s => s.done).length;
  return (
    <div style={{ marginBottom: compact ? 6 : 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: compact ? '8px 10px' : '11px 13px', borderRadius: 12, border: '1px solid #EAE6DE', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'border-color .15s' }}>
        {!readOnly && (
          <button onClick={onComplete} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${col}`, background: 'transparent', flexShrink: 0, marginTop: 1, cursor: 'pointer' }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: compact ? 13 : 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1814' }}>{task.title}</span>
            {task.starred && <span style={{ color: '#C9A970', flexShrink: 0 }}>{I.Star(10, '#C9A970')}</span>}
          </div>
          {!compact && task.notes && <div style={{ fontSize: 11, color: '#A09C96', marginTop: 2 }}>{task.notes}</div>}
          <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {!compact && <span style={C.pill(col)}>{task.section}</span>}
            {task.dueDate && <span className="mono" style={{ fontSize: 10, color: '#A09C96' }}>{fmtDS(task.dueDate)}</span>}
            {task.estMins > 0 && <span className="mono" style={{ fontSize: 10, color: '#C4C0BA', display: 'flex', alignItems: 'center', gap: 3 }}>{I.Clock(10)} {fmtM(task.estMins)}</span>}
          </div>
          {task.subtasks.length > 0 && (
            <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#A09C96', fontSize: 11, cursor: 'pointer' }}>
              {I.ChevDown(11)} {subDone}/{task.subtasks.length} items
            </button>
          )}
          {open && task.subtasks.map(st => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <button onClick={() => !readOnly && onToggleSub(task.id, st.id, task.user)} style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid ' + (st.done ? '#7BAF92' : '#C4C0BA'), background: st.done ? '#7BAF92' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FFFFFF', cursor: readOnly ? 'default' : 'pointer' }}>
                {st.done && I.Check(8)}
              </button>
              <span style={{ fontSize: 11, color: st.done ? '#C4C0BA' : '#706C66', textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</span>
            </div>
          ))}
        </div>
        {!readOnly && <button onClick={() => onStar && onStar(task.id, task.user)} style={{ color: task.starred ? '#C9A970' : '#D8D4CC', flexShrink: 0, cursor: 'pointer' }}>{I.Star(11, task.starred ? '#C9A970' : 'none')}</button>}
      </div>
    </div>
  );
}
