import React from 'react';
import { MEASUREMENT_AREAS } from '../data';
import Modal from './Modal';
import { C } from './ui';

export default function TargetModal({ cur, onSave, onClose }) {
  const [vals, setVals] = React.useState({ ...cur });
  return (
    <Modal title="Set Targets" onClose={onClose} wide>
      <div style={{ fontSize: 12, color: '#7c8493', marginBottom: 14 }}>Set once, edit anytime. These are your ideal values.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {MEASUREMENT_AREAS.map(a => (
          <div key={a.name}>
            <div style={{ fontSize: 11, color: '#7c8493', marginBottom: 4 }}>{a.name}</div>
            <input type="number" step="0.1" placeholder="target" value={vals[a.name] ?? ''} onChange={e => setVals(v => ({ ...v, [a.name]: e.target.value }))} style={C.inp({ fontSize: 13 })} />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(vals)} style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#e8b34e', color: '#15171c', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Save Targets</button>
    </Modal>
  );
}
