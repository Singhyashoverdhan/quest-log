export const C = {
  card: (ex = {}) => ({ background: '#FFFFFF', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', ...ex }),
  inp:  (ex = {}) => ({ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #EAE6DE', background: '#F8F6F1', color: '#1A1814', fontSize: 13, outline: 'none', ...ex }),
  pill: (col, ex = {}) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 20, background: col + '18', border: `1px solid ${col}33`, color: col, fontSize: 11, fontWeight: 600, ...ex }),
  nb:   { width: 32, height: 32, borderRadius: 8, border: '1px solid #EAE6DE', background: '#FFFFFF', color: '#1A1814', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
};
