import React from 'react';
import { MEASUREMENT_AREAS } from '../data';
import { TODAY } from '../utils';
import Modal from './Modal';
import { C } from './ui';

export default function MeasLogModal({ onSave, onClose, lastVals }) {
  const [date, setDate] = React.useState(TODAY);
  const [vals, setVals] = React.useState({});
  return (
    <Modal title="Log Measurements" onClose={onClose} wide>
      <div style={{ fontSize: 12, color: '#7c8493', marginBottom: 14 }}>Log all measurements for a date. Leave blank to skip an area.</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#7c8493', marginBottom: 5 }}>Date</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={C.inp({ maxWidth: 200 })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {MEASUREMENT_AREAS.map(a => {
          const last = lastVals?.[a.name];
          return (
            <div key={a.name}>
              <div style={{ fontSize: 11, color: '#7c8493', marginBottom: 4 }}>{a.name} {last != null && <span style={{ color: '#5f6470' }}>· last: {last}</span>}</div>
              <input type="number" step="0.1" placeholder={last != null ? String(last) : '—'} value={vals[a.name] ?? ''} onChange={e => setVals(v => ({ ...v, [a.name]: e.target.value }))} style={C.inp({ fontSize: 13 })} />
            </div>
          );
        })}
      </div>
      <button onClick={() => { const e = Object.entries(vals).filter(([, v]) => v !== ''); if (e.length) onSave(date, e); }} style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#e8b34e', color: '#15171c', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
        Save Measurements
      </button>
    </Modal>
  );
}
