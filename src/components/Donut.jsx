export default function Donut({ slices, size = 100, label, value }) {
  const total = slices.reduce((s, d) => s + d.val, 0) || 1;
  const r = 38, circ = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
  let off = 0;
  const segs = slices.filter(d => d.val > 0).map(d => {
    const dash = (d.val / total) * circ, o = off;
    off += dash;
    return { ...d, dash, gap: circ - dash, off: o };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2d35" strokeWidth={9} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={9}
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off}
          transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
      ))}
      <circle cx={cx} cy={cy} r={r - 5} fill="#15171c" />
      {value && <text x={cx} y={cy - 4} textAnchor="middle" fill="#e7e9ee" fontSize="14" fontWeight="700" fontFamily="IBM Plex Mono">{value}</text>}
      {label && <text x={cx} y={cy + 12} textAnchor="middle" fill="#7c8493" fontSize="9" fontFamily="IBM Plex Mono">{label}</text>}
    </svg>
  );
}
