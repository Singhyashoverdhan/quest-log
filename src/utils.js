export const normalizeDate = str => {
  if (!str) return str;
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  return s;
};
export const getDK = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toISOString().slice(0, 10); };
export const fmtD  = k => { const n = normalizeDate(k); const d = new Date(n + 'T00:00:00'); return isNaN(d) ? k : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
export const fmtDS  = k => { const n = normalizeDate(k); const d = new Date(n + 'T00:00:00'); return isNaN(d) ? k : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
export const fmtDSY = k => { const n = normalizeDate(k); const d = new Date(n + 'T00:00:00'); return isNaN(d) ? k : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' }); };
export const uid   = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const fmtM  = m => { if (!m) return '—'; if (m < 60) return `${m}m`; return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`; };
export const getToday = () => getDK(0);
export const TODAY    = getDK(0); // snapshot at load — use getToday() for fresh value
const hourNow         = new Date().getHours();
export const greeting = hourNow < 12 ? 'Morning' : hourNow < 17 ? 'Afternoon' : 'Evening';
