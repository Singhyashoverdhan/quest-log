import React from 'react';
import { MEASUREMENT_AREAS } from '../data';
import { fmtDSY } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import Sparkline from './Sparkline';
import MeasLogModal from './MeasLogModal';
import TargetModal from './TargetModal';

export default function MeasuresTab({ cu, measurements, targets, onLogMeasurements, onSaveTargets, ac, readOnly, viewingUser }) {
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
  const sessionsLogged = sortedDates.length;
  const allWeights = sortedDates.map(d => userM[d]?.['Weight']).filter(v => v != null);
  const weightDelta = allWeights.length >= 2 ? +(allWeights[allWeights.length - 1] - allWeights[0]).toFixed(1) : null;

  return (
    <div className="fade">
      {showLog && <MeasLogModal lastVals={Object.fromEntries(MEASUREMENT_AREAS.map(a => [a.name, latestVals[a.name]?.val]))} onClose={() => setShowLog(false)} onSave={(date, entries) => { onLogMeasurements(uname, date, entries); setShowLog(false); }} />}
      {showTarget && <TargetModal cur={userT} onClose={() => setShowTarget(false)} onSave={vals => { onSaveTargets(uname, vals); setShowTarget(false); }} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1A1814' }}>Body</div>
          <div className="mono" style={{ fontSize: 11, color: '#A09C96', marginTop: 2 }}>
            {sessionsLogged > 0 ? `${sessionsLogged} session${sessionsLogged !== 1 ? 's' : ''} logged` : 'No data yet'}
            {weightDelta != null && <span style={{ color: weightDelta <= 0 ? '#7BAF92' : '#C47878', marginLeft: 8 }}>· {weightDelta > 0 ? '+' : ''}{weightDelta} kg</span>}
          </div>
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowTarget(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 20, border: '1px solid #EAE6DE', background: '#FFFFFF', color: '#706C66', fontSize: 12, fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{I.Target()} Targets</button>
            <button onClick={() => setShowLog(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(12)} Log</button>
          </div>
        )}
      </div>

      {/* Area selector pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {MEASUREMENT_AREAS.map(a => (
          <button key={a.name} onClick={() => setSelectedArea(a.name)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 20, border: '1px solid ' + (selectedArea === a.name ? ac + '66' : '#EAE6DE'), background: selectedArea === a.name ? ac : '#FFFFFF', color: selectedArea === a.name ? '#FFFFFF' : '#706C66', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {a.name}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div style={C.card({ padding: '18px', marginBottom: 16 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1814' }}>{selectedArea}</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
            {latestVals[selectedArea]?.val != null && (
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 0.5, marginBottom: 2 }}>CURRENT</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: ac, lineHeight: 1 }}>{latestVals[selectedArea].val}</div>
              </div>
            )}
            {userT[selectedArea] != null && (
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 0.5, marginBottom: 2 }}>TARGET</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#C4C0BA', lineHeight: 1 }}>{userT[selectedArea]}</div>
              </div>
            )}
          </div>
        </div>
        {sparkData.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            {(() => {
              const W = Math.max(280, sparkData.length * 100);
              const pad = 6;
              const xOf = i => pad + ((W - pad * 2) / Math.max(sparkData.length - 1, 1)) * i;
              return (
                <>
                  <Sparkline data={sparkData} color={ac} W={W} H={80} target={userT[selectedArea] ?? null} />
                  <div style={{ borderTop: '1px solid #F0EDE8', marginTop: 10, paddingTop: 8, position: 'relative', width: W, height: 42 }}>
                    {sparkData.map((d, i) => (
                      <div key={d.d} style={{ position: 'absolute', left: xOf(i), transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: ac }}>{d.v}</div>
                        <div className="mono" style={{ fontSize: 10, color: '#A09C96', marginTop: 1 }}>{fmtDSY(d.d)}</div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#A09C96', fontSize: 13, padding: '24px 0' }}>No data for {selectedArea} yet.</div>
        )}
      </div>

      {/* All measurements grid */}
      <div className="mono" style={{ fontSize: 10, color: '#A09C96', letterSpacing: 1, marginBottom: 10 }}>ALL MEASUREMENTS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MEASUREMENT_AREAS.map(a => {
          const l = latestVals[a.name];
          const t = userT[a.name];
          const allVals = sortedDates.map(d => userM[d]?.[a.name]).filter(v => v != null);
          const prev = allVals.length > 1 ? allVals[allVals.length - 2] : null;
          const change = l?.val != null && prev != null ? +(l.val - prev).toFixed(2) : null;
          const dist = l?.val != null && t != null ? +(l.val - t).toFixed(2) : null;
          const isSelected = selectedArea === a.name;
          return (
            <div key={a.name} onClick={() => setSelectedArea(a.name)} style={C.card({ padding: '12px', cursor: 'pointer', outline: isSelected ? `2px solid ${ac}` : 'none', outlineOffset: 0, transition: 'outline .15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
              <div>
                <div style={{ fontSize: 11, color: '#A09C96', marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: l?.val != null ? '#1A1814' : '#D8D4CC', lineHeight: 1 }}>{l?.val ?? '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {change != null
                  ? <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: change > 0 ? '#C47878' : change < 0 ? '#7BAF92' : '#A09C96' }}>{change > 0 ? '↑' : change < 0 ? '↓' : '—'} {Math.abs(change)}</div>
                  : <div className="mono" style={{ fontSize: 11, color: '#C4C0BA' }}>—</div>}
                {dist != null && (() => {
                  const pct = Math.round(100 - Math.abs(dist) / t * 100);
                  return (
                    <div className="mono" style={{ fontSize: 10, marginTop: 3, color: pct >= 100 ? '#7BAF92' : '#A09C96' }}>
                      {pct >= 100 ? '✓' : `${Math.max(0, pct)}%`}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 100 }} />
    </div>
  );
}
