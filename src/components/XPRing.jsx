export default function XPRing({ pct, xp, color, size = 110 }) {
  const r = size / 2 - 8, circ = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EAE6DE" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dashoffset .5s ease' }} />
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" fill="#1A1814" fontSize={size > 100 ? 16 : 13} fontWeight="700" fontFamily="IBM Plex Mono">{pct}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={color} fontSize={size > 100 ? 13 : 11} fontWeight="600" fontFamily="IBM Plex Mono">{xp}xp</text>
    </svg>
  );
}
