import React from 'react';
import Modal from './Modal';
import { C } from './ui';
import { fmtM } from '../utils';

export default function TimeModal({ label, onSubmit, onClose, optional }) {
  const [m, setM] = React.useState('');
  const mins = parseInt(m) || 0;
  const hasValue = mins > 0;

  return (
    <Modal title="Log Time" onClose={onClose}>
      <div style={{ fontSize: 13, color: '#706C66', marginBottom: 14 }}>"{label}"</div>
      <div style={{ fontSize: 13, color: '#A09C96', marginBottom: 8 }}>How long did this take? (minutes)</div>
      <input type="number" placeholder="e.g. 45" value={m} onChange={e => setM(e.target.value)} style={C.inp({ marginBottom: 12 })} autoFocus />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {[15, 30, 45, 60, 90, 120].map(v => (
          <button key={v} onClick={() => setM(String(v))} style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid ' + (m === String(v) ? '#C9A97066' : '#EAE6DE'), background: m === String(v) ? '#C9A97018' : '#FFFFFF', color: m === String(v) ? '#C9A970' : '#A09C96', fontSize: 13, cursor: 'pointer' }}>
            {fmtM(v)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {optional && (
          <button
            onClick={() => onSubmit(0)}
            style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid #EAE6DE', color: hasValue ? '#A09C96' : '#706C66', background: hasValue ? '#F8F6F1' : '#FFFFFF', fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}
          >
            Skip
          </button>
        )}
        <button
          onClick={() => onSubmit(mins)}
          disabled={!optional && !hasValue}
          style={{ flex: 2, padding: '12px', borderRadius: 14, background: hasValue ? '#C9A970' : optional ? '#EAE6DE' : '#C9A970', color: hasValue ? '#FFFFFF' : optional ? '#A09C96' : '#FFFFFF', fontWeight: 700, fontSize: 13, cursor: !optional && !hasValue ? 'default' : 'pointer', transition: 'all .15s', opacity: !optional && !hasValue ? 0.5 : 1 }}
        >
          {hasValue ? `Log ${fmtM(mins)}` : optional ? 'Done' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
