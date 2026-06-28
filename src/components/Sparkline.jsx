export default function Sparkline({ data, color, W = 200, H = 50, target }) {
  if (!data || data.length < 2) return <div style={{ width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6470', fontSize: 11 }}>no data yet</div>;
  const vals = data.map(d => d.v), min = Math.min(...vals), max = Math.max(...vals), rng = max - min || 1;
  const pad = 6;
  const pts = data.map((d, i) => ({ x: pad + ((W - pad * 2) / (data.length - 1)) * i, y: H - pad - ((d.v - min) / rng) * (H - pad * 2) }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const tY = target != null ? H - pad - ((target - min) / rng) * (H - pad * 2) : null;
  const gid = `g${color.replace('#', '')}${W}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {tY != null && tY > 0 && tY < H && <line x1={pad} y1={tY} x2={W - pad} y2={tY} stroke="#e8b34e" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3 : 2} fill={color} />)}
    </svg>
  );
}
