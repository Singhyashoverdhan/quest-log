import React from 'react';
import { MEASUREMENT_AREAS } from '../data';
import { getDK } from '../utils';
import Modal from './Modal';
import { C } from './ui';

export default function MeasLogModal({ onSave, onClose, lastVals }) {
  const [date, setDate] = React.useState(() => getDK(0));
  const [vals, setVals] = React.useState({});
  return (
    <Modal title="Log Measurements" onClose={onClose} wide>
      <div style={{ fontSize: 12, color: '#A09C96', marginBottom: 14 }}>Log all measurements for a date. Leave blank to skip an area.</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 5 }}>Date</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={C.inp({ maxWidth: 200 })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {MEASUREMENT_AREAS.map(a => {
          const last = lastVals?.[a.name];
          return (
            <div key={a.name}>
              <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 2 }}>
                {a.name}{last != null && <span style={{ color: '#C4C0BA' }}> · last: {last}</span>}
              </div>
              {a.note && <div style={{ fontSize: 10, color: '#C4C0BA', marginBottom: 4 }}>{a.note}</div>}
              <input type="number" step="0.1" placeholder={last != null ? String(last) : '—'} value={vals[a.name] ?? ''} onChange={e => setVals(v => ({ ...v, [a.name]: e.target.value }))} style={C.inp({ fontSize: 13 })} />
            </div>
          );
        })}
      </div>
      <button onClick={() => { const e = Object.entries(vals).filter(([, v]) => v !== ''); if (e.length) onSave(date, e); }} style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#C9A970', color: '#FFFFFF', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
        Save Measurements
      </button>
    </Modal>
  );
}
