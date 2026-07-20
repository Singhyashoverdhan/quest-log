import React from 'react';
import { TASK_SECTIONS } from '../data';
import { uid } from '../utils';
import Modal from './Modal';
import { C } from './ui';
import { I } from './Icons';

export default function AddTaskModal({ onSave, onClose, defaultSection }) {
  const [title, setTitle] = React.useState('');
  const [titleErr, setTitleErr] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [section, setSection] = React.useState(defaultSection || 'Work');
  const [due, setDue] = React.useState('');
  const [est, setEst] = React.useState('');
  const [starred, setStarred] = React.useState(false);
  const [subs, setSubs] = React.useState([]);
  const [si, setSi] = React.useState('');

  const addSub = () => {
    if (!si.trim()) return;
    setSubs(s => [...s, { id: uid(), title: si.trim(), done: false }]);
    setSi('');
  };

  function handleSave() {
    if (!title.trim()) { setTitleErr(true); return; }
    onSave({ title: title.trim(), notes, section, dueDate: due, estMins: parseInt(est) || 0, starred, subtasks: subs });
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          key={titleErr ? 'err' : 'ok'}
          placeholder="Task title *"
          value={title}
          onChange={e => { setTitle(e.target.value); if (titleErr) setTitleErr(false); }}
          className={titleErr ? 'shake' : ''}
          style={C.inp({ border: titleErr ? '1px solid #C47878' : undefined })}
          autoFocus
        />
        {titleErr && <div style={{ fontSize: 11, color: '#C47878', marginTop: -8 }}>Title is required</div>}
        <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ ...C.inp(), resize: 'none', height: 68 }} />
        <select value={section} onChange={e => setSection(e.target.value)} style={{ ...C.inp(), cursor: 'pointer' }}>
          {TASK_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 4 }}>Due Date</div>
            <input type="date" value={due} onChange={e => setDue(e.target.value)} style={C.inp({ fontSize: 13 })} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 4 }}>Est. Time (mins)</div>
            <input type="number" placeholder="60" value={est} onChange={e => setEst(e.target.value)} style={C.inp({ fontSize: 13 })} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 8 }}>Checklist</div>
          {subs.map((st, i) => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid #EAE6DE', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: '#1A1814' }}>{st.title}</span>
              <button onClick={() => setSubs(s => s.filter((_, j) => j !== i))} style={{ color: '#C47878', display: 'flex' }}>{I.X()}</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Add item" value={si} onChange={e => setSi(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} style={C.inp({ flex: 1 })} />
            <button onClick={addSub} style={{ ...C.nb, background: '#C9A97011', borderColor: '#C9A97033', color: '#C9A970' }}>{I.Plus()}</button>
          </div>
        </div>
        <button onClick={() => setStarred(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: starred ? '#C9A970' : '#A09C96', fontSize: 13, alignSelf: 'flex-start' }}>
          {I.Star(14, starred ? '#C9A970' : 'none')} {starred ? 'Starred' : 'Star'}
        </button>
        <button onClick={handleSave} style={{ width: '100%', padding: '12px', borderRadius: 14, background: '#C9A970', color: '#FFFFFF', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
          Add Task
        </button>
      </div>
    </Modal>
  );
}
