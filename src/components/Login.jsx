import React from 'react';
import { USERS, ACCENT } from '../data';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F5F3EE' }}>
      <div className="mono" style={{ fontSize: 10, color: '#A09C96', letterSpacing: 2, marginBottom: 6 }}>DAY IN LIFE</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, color: '#1A1814' }}>Quest Log</div>
      <div style={{ fontSize: 13, color: '#A09C96', marginBottom: 48 }}>Your personal operating system</div>
      {!sel ? (
        <div className="fade" style={{ width: '100%', maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: '#A09C96', textAlign: 'center', marginBottom: 14 }}>Who are you?</div>
          {USERS.map(u => (
            <button key={u.name} onClick={() => { setSel(u.name); setPin(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 18px', borderRadius: 14, marginBottom: 9, border: `1px solid ${u.color}44`, background: '#FFFFFF', color: '#1A1814', fontSize: 16, fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              {u.name}<div style={{ width: 10, height: 10, borderRadius: '50%', background: u.color }} />
            </button>
          ))}
        </div>
      ) : (
        <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 280 }}>
          <button onClick={() => { setSel(null); setPin(''); }} style={{ color: '#A09C96', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>{I.Left()} back</button>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#1A1814' }}>{sel}</div>
          <div style={{ fontSize: 13, color: '#A09C96', marginBottom: 30 }}>Enter your PIN</div>
          <div key={sk} className={err ? 'shake' : ''} style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: pin.length > i ? (err ? '#C47878' : USERS.find(u => u.name === sel)?.color || ACCENT) : '#E8E4DC', transition: 'background .1s' }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((d, i) => (
              <button key={i} onClick={() => d === '' ? null : d === '⌫' ? setPin(p => p.slice(0, -1)) : digit(String(d))} disabled={d === ''}
                style={{ height: 58, borderRadius: 12, border: '1px solid #E8E4DC', background: d === '' ? 'transparent' : '#FFFFFF', color: '#1A1814', fontSize: 20, fontWeight: 600, opacity: d === '' ? 0 : 1, cursor: d === '' ? 'default' : 'pointer', boxShadow: d === '' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
