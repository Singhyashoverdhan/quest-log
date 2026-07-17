export default function Sparkline({ data, color, W = 200, H = 50, target }) {
  if (!data || data.length < 2) return (
    <div style={{ width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A09C96', fontSize: 11 }}>
      no data yet
    </div>
  );

  const vals = data.map(d => d.v);
  // Include target in range so the dashed line always fits inside the chart
  const allVals = target != null ? [...vals, target] : vals;
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  // Add 10% vertical breathing room so lines never sit at the very edge
  const buffer = (rawMax - rawMin) * 0.15 || 1;
  const min = rawMin - buffer;
  const max = rawMax + buffer;
  const rng = max - min;

  const pad = 6;
  const toY = v => H - pad - ((v - min) / rng) * (H - pad * 2);
  const pts = data.map((d, i) => ({
    x: pad + ((W - pad * 2) / (data.length - 1)) * i,
    y: toY(d.v),
  }));

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const tY   = target != null ? toY(target) : null;

  // Unique gradient ID per color + width + first value to avoid collisions
  const gid = `g${color.replace('#', '')}_${W}_${vals[0]}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {tY != null && (
        <line x1={pad} y1={tY} x2={W - pad} y2={tY} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3 : 2} fill={color} />
      ))}
    </svg>
  );
}
