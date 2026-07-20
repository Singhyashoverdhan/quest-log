export default function XPRing({ pct, xp, color, size = 110 }) {
  const r = size / 2 - 9, circ = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
  const fPct = Math.round(size * 0.14);
  const fXp  = Math.round(size * 0.10);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EAE6DE" strokeWidth={9} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      <text x={cx} y={cy - size * 0.10} textAnchor="middle" dominantBaseline="central" fill="#1A1814" fontSize={fPct} fontWeight="700" fontFamily="IBM Plex Mono">{pct}%</text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill={color} fontSize={fXp} fontWeight="600" fontFamily="IBM Plex Mono">{xp}xp</text>
    </svg>
  );
}
