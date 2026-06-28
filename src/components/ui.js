export const C = {
  card: (ex = {}) => ({ background: '#1c1f26', border: '1px solid #2a2d35', borderRadius: 14, ...ex }),
  inp:  (ex = {}) => ({ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2d35', background: '#15171c', color: '#e7e9ee', fontSize: 14, outline: 'none', ...ex }),
  pill: (col, ex = {}) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: col + '18', border: `1px solid ${col}33`, color: col, fontSize: 11, fontWeight: 600, ...ex }),
  nb:   { width: 32, height: 32, borderRadius: 8, border: '1px solid #2a2d35', background: '#1c1f26', color: '#e7e9ee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
};
