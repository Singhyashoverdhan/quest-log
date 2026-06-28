export const getDK = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toISOString().slice(0, 10); };
export const fmtD  = k => new Date(k + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtDS = k => new Date(k + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const uid   = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const fmtM  = m => { if (!m) return '—'; if (m < 60) return `${m}m`; return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`; };

export const TODAY    = getDK(0);
const hourNow         = new Date().getHours();
export const greeting = hourNow < 12 ? 'Morning' : hourNow < 17 ? 'Afternoon' : 'Evening';
