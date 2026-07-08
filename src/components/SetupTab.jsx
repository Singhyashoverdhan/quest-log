import React from 'react';
import { HABIT_CATEGORIES, MEASUREMENT_AREAS, SECTIONS } from '../data';
import { fmtDS, getDK } from '../utils';
import { C } from './ui';
import { I } from './Icons';
import Sparkline from './Sparkline';
import MeasLogModal from './MeasLogModal';
import TargetModal from './TargetModal';

export default function SetupTab({ cu, measurements, targets, onLogMeasurements, onSaveTargets, ac, readOnly, viewingUser, selectedHabits, onToggleHabit }) {
  const [showLog, setShowLog] = React.useState(false);
  const [showTarget, setShowTarget] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState('Weight');
  const [section, setSection] = React.useState('routine'); // 'routine' | 'measurements'
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

  // Motivational stat for measurements header
  const sessionsLogged = sortedDates.length;
  const latestWeight = latestVals['Weight']?.val;
  const allWeights = sortedDates.map(d => userM[d]?.['Weight']).filter(v => v != null);
  const firstWeight = allWeights[0];
  const weightDelta = latestWeight != null && firstWeight != null ? +(latestWeight - firstWeight).toFixed(1) : null;

  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

  // Group habit categories by section for display
  const habitGroups = HABIT_CATEGORIES.reduce((acc, cat) => {
    const col = SC[cat.section] || ac;
    if (!acc[cat.section]) acc[cat.section] = { color: col, cats: [] };
    acc[cat.section].cats.push(cat);
    return acc;
  }, {});

  const selectedCount = HABIT_CATEGORIES.reduce((acc, c) => acc + c.activities.filter(a => selectedHabits?.has(`${c.name}::${a.name}`)).length, 0);
  const totalCount = HABIT_CATEGORIES.reduce((acc, c) => acc + c.activities.length, 0);

  return (
    <div className="fade">
      {showLog && <MeasLogModal lastVals={Object.fromEntries(MEASUREMENT_AREAS.map(a => [a.name, latestVals[a.name]?.val]))} onClose={() => setShowLog(false)} onSave={(date, entries) => { onLogMeasurements(uname, date, entries); setShowLog(false); }} />}
      {showTarget && <TargetModal cur={userT} onClose={() => setShowTarget(false)} onSave={vals => { onSaveTargets(uname, vals); setShowTarget(false); }} />}

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'routine', label: 'My Routine' }, { id: 'measurements', label: 'Body' }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid ' + (section === s.id ? ac + '66' : '#252830'), background: section === s.id ? ac + '18' : 'transparent', color: section === s.id ? ac : '#7c8493', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Routine (habit selection) */}
      {section === 'routine' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 3 }}>My Routine</div>
              <div className="mono" style={{ fontSize: 11, color: '#6a7080' }}>{selectedCount} of {totalCount} habits selected</div>
            </div>
            {!readOnly && (
              <button
                onClick={() => {
                  if (!onToggleHabit) return;
                  const allKeys = HABIT_CATEGORIES.flatMap(c => c.activities.map(a => `${c.name}::${a.name}`));
                  const allSelected = allKeys.every(k => selectedHabits?.has(k));
                  // if all selected → deselect all; otherwise → select all
                  allKeys.forEach(k => {
                    const has = selectedHabits?.has(k);
                    if (allSelected && has) onToggleHabit(k);
                    else if (!allSelected && !has) onToggleHabit(k);
                  });
                }}
                style={{ fontSize: 12, color: '#6a7080', padding: '5px 10px', borderRadius: 8, border: '1px solid #252830', cursor: 'pointer' }}
              >
                {HABIT_CATEGORIES.flatMap(c => c.activities.map(a => `${c.name}::${a.name}`)).every(k => selectedHabits?.has(k)) ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {Object.entries(habitGroups).map(([sectionName, { color: col, cats }]) => (
            <div key={sectionName} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
                <span className="mono" style={{ fontSize: 10, color: '#8A909E', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{sectionName}</span>
              </div>
              {cats.map(cat => cat.activities.map(act => {
                const key = `${cat.name}::${act.name}`;
                const on = selectedHabits?.has(key) ?? true;
                return (
                  <button
                    key={key}
                    onClick={() => !readOnly && onToggleHabit?.(key)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', borderRadius: 11, marginBottom: 6, border: '1px solid ' + (on ? col + '44' : '#252830'), background: on ? col + '0C' : '#1A1D24', textAlign: 'left', transition: 'all .15s', cursor: readOnly ? 'default' : 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid ' + (on ? col : '#3A404E'), background: on ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#13151A', transition: 'all .15s' }}>
                        {on && I.Check(11)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: on ? '#E6E8EF' : '#5f6470', fontWeight: on ? 500 : 400 }}>{act.name}</div>
                        {act.trackTime && <div className="mono" style={{ fontSize: 10, color: '#4a5060', marginTop: 1 }}>timed</div>}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: on ? col : '#3A404E' }}>+{act.xp}</span>
                  </button>
                );
              }))}
            </div>
          ))}
        </div>
      )}

      {/* Body measurements */}
      {section === 'measurements' && (
        <div>
          {/* Motivational header */}
          <div style={C.card({ padding: '14px 16px', marginBottom: 16 })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="mono" style={{ fontSize: 9, color: '#6a7080', letterSpacing: 1, marginBottom: 5 }}>PROGRESS</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {sessionsLogged > 0
                    ? `${sessionsLogged} session${sessionsLogged !== 1 ? 's' : ''} logged`
                    : 'No data yet'}
                </div>
                {weightDelta != null && (
                  <div className="mono" style={{ fontSize: 12, color: weightDelta <= 0 ? '#7BAF92' : '#C47878', marginTop: 3 }}>
                    Weight {weightDelta > 0 ? '+' : ''}{weightDelta} kg since first entry
                  </div>
                )}
              </div>
              {!readOnly && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowTarget(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: '1px solid #252830', color: '#9aa1ad', fontSize: 12, cursor: 'pointer' }}>{I.Target()} Targets</button>
                  <button onClick={() => setShowLog(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: ac, color: '#13151A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{I.Plus(12)} Log</button>
                </div>
              )}
            </div>
          </div>

          {/* Area selector */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
            {MEASUREMENT_AREAS.map(a => (
              <button key={a.name} onClick={() => setSelectedArea(a.name)} style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 20, border: '1px solid ' + (selectedArea === a.name ? ac + '66' : '#252830'), background: selectedArea === a.name ? ac + '18' : 'transparent', color: selectedArea === a.name ? ac : '#7c8493', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {a.name}
              </button>
            ))}
          </div>

          {/* Chart card */}
          <div style={C.card({ padding: '16px', marginBottom: 14 })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedArea}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {latestVals[selectedArea]?.val != null && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 9, color: '#6a7080', letterSpacing: 0.5 }}>CURRENT</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: ac }}>{latestVals[selectedArea].val}</div>
                  </div>
                )}
                {userT[selectedArea] != null && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 9, color: '#6a7080', letterSpacing: 0.5 }}>TARGET</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#6a7080' }}>{userT[selectedArea]}</div>
                  </div>
                )}
              </div>
            </div>
            {sparkData.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <Sparkline data={sparkData} color={ac} W={Math.max(260, sparkData.length * 44)} H={80} target={userT[selectedArea] ?? null} />
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginTop: 10, paddingTop: 10, borderTop: '1px solid #252830' }}>
                  {sparkData.map(d => (
                    <div key={d.d} style={{ flexShrink: 0, textAlign: 'center' }}>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: ac }}>{d.v}</div>
                      <div className="mono" style={{ fontSize: 10, color: '#4a5060' }}>{fmtDS(d.d)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#4a5060', fontSize: 13, padding: '20px 0' }}>No data for {selectedArea} yet.</div>
            )}
          </div>

          {/* All measurements grid */}
          <div className="mono" style={{ fontSize: 10, color: '#6a7080', letterSpacing: 1, marginBottom: 10 }}>ALL MEASUREMENTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MEASUREMENT_AREAS.map(a => {
              const l = latestVals[a.name];
              const t = userT[a.name];
              const allVals = sortedDates.map(d => userM[d]?.[a.name]).filter(v => v != null);
              const prev = allVals.length > 1 ? allVals[allVals.length - 2] : null;
              const change = l?.val != null && prev != null ? +(l.val - prev).toFixed(2) : null;
              return (
                <div key={a.name} onClick={() => { setSelectedArea(a.name); }} style={C.card({ padding: '11px', cursor: 'pointer', borderColor: selectedArea === a.name ? ac + '55' : '#252830', transition: 'border-color .15s' })}>
                  <div style={{ fontSize: 11, color: '#6a7080', marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: l?.val != null ? '#E6E8EF' : '#3A404E' }}>{l?.val ?? '—'}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {change != null && <span className="mono" style={{ fontSize: 10, color: change > 0 ? '#C47878' : '#7BAF92' }}>{change > 0 ? '+' : ''}{change}</span>}
                    {t != null && <span className="mono" style={{ fontSize: 10, color: '#4a5060' }}>↯ {t}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}
