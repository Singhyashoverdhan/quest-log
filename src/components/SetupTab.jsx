import React from 'react';
import { MEASUREMENT_AREAS, USERS } from '../data';
import { fmtDS } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import Sparkline from './Sparkline';
import MeasLogModal from './MeasLogModal';
import TargetModal from './TargetModal';

export default function SetupTab({ cu, measurements, targets, onLogMeasurements, onSaveTargets, ac, readOnly, viewingUser }) {
  const [showLog, setShowLog] = React.useState(false);
  const [showTarget, setShowTarget] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState('Weight');
  const uname = viewingUser ? viewingUser.name : cu.name;
  const userM = measurements[uname] || {};
  const userT = targets[uname] || {};
  const sortedDates = Object.keys(userM).sort();
  const latestVals = MEASUREMENT_AREAS.reduce((acc, a) => {
    let val = null;
    for (const d of sortedDates) { if (userM[d]?.[a.name] != null) val = userM[d][a.name]; }
    acc[a.name] = { val }; return acc;
  }, {});
  const sparkData = sortedDates.map(d => userM[d]?.[selectedArea] != null ? { d, v: userM[d][selectedArea] } : null).filter(Boolean);
  const userInfo = USERS.find(u => u.name === cu.name);

  return (
    <div className="fade">
      {showLog && <MeasLogModal lastVals={Object.fromEntries(MEASUREMENT_AREAS.map(a => [a.name, latestVals[a.name]?.val]))} onClose={() => setShowLog(false)} onSave={(date, entries) => { onLogMeasurements(uname, date, entries); setShowLog(false); }} />}
      {showTarget && <TargetModal cur={userT} onClose={() => setShowTarget(false)} onSave={(vals) => { onSaveTargets(uname, vals); setShowTarget(false); }} />}

      {/* Profile */}
      <div style={C.card({ padding: '16px', marginBottom: 20 })}>
        <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 14 }}>PROFILE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: userInfo?.color + '22', border: `2px solid ${userInfo?.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: userInfo?.color }}>{cu.name[0]}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{cu.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: 12, color: '#7c8493' }}>PIN: ••••</span>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: userInfo?.color }} />
              {cu.isAdmin && <span style={C.pill('#e8b34e')}>admin</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body measurements */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Body</div>
        {!readOnly && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowTarget(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: '1px solid #2a2d35', color: '#9aa1ad', fontSize: 12, cursor: 'pointer' }}>{I.Target()} Targets</button>
            <button onClick={() => setShowLog(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: ac, color: '#15171c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(12)} Log</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
        {MEASUREMENT_AREAS.map(a => (
          <button key={a.name} onClick={() => setSelectedArea(a.name)} style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 20, border: '1px solid ' + (selectedArea === a.name ? ac + '66' : '#2a2d35'), background: selectedArea === a.name ? ac + '18' : 'transparent', color: selectedArea === a.name ? ac : '#9aa1ad', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {a.name}
          </button>
        ))}
      </div>
      <div style={C.card({ padding: '16px', marginBottom: 14 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedArea}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {userT[selectedArea] != null && <span className="mono" style={{ fontSize: 12, color: '#e8b34e' }}>↯ {userT[selectedArea]}</span>}
            {latestVals[selectedArea]?.val != null && <span className="mono" style={{ fontSize: 12, color: ac }}>{latestVals[selectedArea].val}</span>}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <Sparkline data={sparkData} color={ac} W={Math.max(260, sparkData.length * 40)} H={80} target={userT[selectedArea] ?? null} />
        </div>
        {sparkData.length > 0 && (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 10, paddingTop: 10, borderTop: '1px solid #2a2d35' }}>
            {sparkData.map(d => (
              <div key={d.d} style={{ flexShrink: 0, textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: ac }}>{d.v}</div>
                <div className="mono" style={{ fontSize: 10, color: '#5f6470' }}>{fmtDS(d.d)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1, marginBottom: 10 }}>ALL MEASUREMENTS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MEASUREMENT_AREAS.map(a => {
          const l = latestVals[a.name];
          const t = userT[a.name];
          const allVals = sortedDates.map(d => userM[d]?.[a.name]).filter(v => v != null);
          const prev = allVals.length > 1 ? allVals[allVals.length - 2] : null;
          const change = l?.val != null && prev != null ? +(l.val - prev).toFixed(2) : null;
          return (
            <div key={a.name} onClick={() => setSelectedArea(a.name)} style={C.card({ padding: '11px', cursor: 'pointer', borderColor: selectedArea === a.name ? ac + '44' : '#2a2d35' })}>
              <div style={{ fontSize: 11, color: '#7c8493', marginBottom: 3 }}>{a.name}</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: l?.val != null ? ac : '#5f6470' }}>{l?.val ?? '—'}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                {change != null && <span className="mono" style={{ fontSize: 10, color: change > 0 ? '#f08b8b' : '#7ad6a0' }}>{change > 0 ? '+' : ''}{change}</span>}
                {t != null && <span className="mono" style={{ fontSize: 10, color: '#5f6470' }}>↯{t}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}
