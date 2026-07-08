import React from 'react';
import Modal from './Modal';
import { C } from './ui';
import { fmtM } from '../utils';

export default function TimeModal({ label, onSubmit, onClose, optional }) {
  const [m, setM] = React.useState('');
  return (
    <Modal title="Log Time" onClose={onClose}>
      <div style={{ fontSize: 14, color: '#706C66', marginBottom: 14 }}>"{label}"</div>
      <div style={{ fontSize: 13, color: '#A09C96', marginBottom: 8 }}>How long did this take? (minutes)</div>
      <input type="number" placeholder="e.g. 45" value={m} onChange={e => setM(e.target.value)} style={C.inp({ marginBottom: 12 })} autoFocus />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {[15, 30, 45, 60, 90, 120].map(v => (
          <button key={v} onClick={() => setM(String(v))} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid ' + (m === String(v) ? '#C9A97066' : '#EAE6DE'), background: m === String(v) ? '#C9A97018' : '#FFFFFF', color: m === String(v) ? '#C9A970' : '#A09C96', fontSize: 13, cursor: 'pointer' }}>
            {fmtM(v)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {optional && <button onClick={() => onSubmit(0)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #EAE6DE', color: '#A09C96', fontSize: 14, cursor: 'pointer' }}>Skip</button>}
        <button onClick={() => onSubmit(parseInt(m) || 0)} style={{ flex: 2, padding: '12px', borderRadius: 12, background: '#C9A970', color: '#FFFFFF', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {optional ? 'Done' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
