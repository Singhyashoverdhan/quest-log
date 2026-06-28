import React from 'react';
import { C } from './ui';
import { I } from './Icons';

export default function Modal({ title, onClose, children, wide }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background: '#1c1f26', borderRadius: '20px 20px 0 0', border: '1px solid #2a2d35', borderBottom: 'none', width: '100%', maxWidth: wide ? 700 : 500, maxHeight: '92vh', overflowY: 'auto', padding: '24px 24px 44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
          <button onClick={onClose} style={{ ...C.nb, width: 28, height: 28, color: '#9aa1ad' }}>{I.X()}</button>
        </div>
        {children}
      </div>
    </div>
  );
}
