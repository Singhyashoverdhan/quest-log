import React from 'react';
import { USERS } from '../data';
import { I } from './Icons';

export default function Login({ onLogin }) {
  const [sel, setSel] = React.useState(null);
  const [pin, setPin] = React.useState('');
  const [err, setErr] = React.useState(false);
  const [sk, setSk] = React.useState(0);

  function digit(d) {
    if (pin.length >= 4) return;
    const n = pin + d;
    setPin(n);
    if (n.length === 4) {
      setTimeout(() => {
        const u = USERS.find(u => u.name === sel);
        if (u && u.pin === n) { onLogin(u); }
        else { setErr(true); setSk(k => k + 1); setTimeout(() => { setPin(''); setErr(false); }, 600); }
      }, 100);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="mono" style={{ fontSize: 11, color: '#7c8493', letterSpacing: 2, marginBottom: 6 }}>DAY IN LIFE</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Quest Log</div>
      <div style={{ fontSize: 13, color: '#5f6470', marginBottom: 48 }}>Your personal operating system</div>
      {!sel ? (
        <div className="fade" style={{ width: '100%', maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: '#9aa1ad', textAlign: 'center', marginBottom: 14 }}>Who are you?</div>
          {USERS.map(u => (
            <button key={u.name} onClick={() => { setSel(u.name); setPin(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 18px', borderRadius: 12, marginBottom: 9, border: `1px solid ${u.color}33`, background: `${u.color}0d`, color: '#e7e9ee', fontSize: 16, fontWeight: 600 }}>
              {u.name}<div style={{ width: 9, height: 9, borderRadius: '50%', background: u.color }} />
            </button>
          ))}
        </div>
      ) : (
        <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 280 }}>
          <button onClick={() => { setSel(null); setPin(''); }} style={{ color: '#7c8493', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>{I.Left()} back</button>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{sel}</div>
          <div style={{ fontSize: 13, color: '#7c8493', marginBottom: 30 }}>Enter your PIN</div>
          <div key={sk} className={err ? 'shake' : ''} style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: pin.length > i ? (err ? '#f08b8b' : USERS.find(u => u.name === sel)?.color || '#e8b34e') : '#2a2d35', transition: 'background .1s' }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((d, i) => (
              <button key={i} onClick={() => d === '' ? null : d === '⌫' ? setPin(p => p.slice(0, -1)) : digit(String(d))} disabled={d === ''}
                style={{ height: 58, borderRadius: 12, border: '1px solid #2a2d35', background: d === '' ? 'transparent' : '#1c1f26', color: '#e7e9ee', fontSize: 20, fontWeight: 600, opacity: d === '' ? 0 : 1, cursor: d === '' ? 'default' : 'pointer' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
