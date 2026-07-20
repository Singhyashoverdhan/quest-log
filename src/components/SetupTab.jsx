import React from 'react';
import { HABIT_CATEGORIES, SECTIONS } from '../data';
import { C } from './ui';
import { I } from './Icons';

const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));

const habitGroups = HABIT_CATEGORIES.reduce((acc, cat) => {
  const col = SC[cat.section] || '#A09C96';
  if (!acc[cat.section]) acc[cat.section] = { color: col, cats: [] };
  acc[cat.section].cats.push(cat);
  return acc;
}, {});

const ALL_KEYS = HABIT_CATEGORIES.flatMap(c => c.activities.map(a => `${c.name}::${a.name}`));

export default function SetupTab({ ac, readOnly, selectedHabits, onToggleHabit }) {
  const selectedCount = ALL_KEYS.filter(k => selectedHabits?.has(k)).length;
  const allSelected = ALL_KEYS.every(k => selectedHabits?.has(k));

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#1A1814' }}>My Routine</div>
          <div className="mono" style={{ fontSize: 11, color: '#A09C96', marginTop: 2 }}>{selectedCount} of {ALL_KEYS.length} habits selected</div>
        </div>
        {!readOnly && (
          <button
            onClick={() => ALL_KEYS.forEach(k => { const has = selectedHabits?.has(k); if (allSelected ? has : !has) onToggleHabit?.(k); })}
            style={{ fontSize: 11, color: '#A09C96', padding: '8px 12px', borderRadius: 20, border: '1px solid #EAE6DE', background: '#FFFFFF', cursor: 'pointer' }}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#EAE6DE', borderRadius: 4, marginBottom: 22, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${ALL_KEYS.length ? (selectedCount / ALL_KEYS.length) * 100 : 0}%`, background: ac, borderRadius: 4, transition: 'width .4s' }} />
      </div>

      {Object.entries(habitGroups).map(([sectionName, { color: col, cats }]) => (
        <div key={sectionName} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
            <span className="mono" style={{ fontSize: 10, color: '#A09C96', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{sectionName}</span>
          </div>
          {cats.map(cat => cat.activities.map(act => {
            const key = `${cat.name}::${act.name}`;
            const on = selectedHabits?.has(key) ?? true;
            return (
              <button
                key={key}
                onClick={() => !readOnly && onToggleHabit?.(key)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', borderRadius: 14, marginBottom: 8, border: '1px solid ' + (on ? col + '44' : '#EAE6DE'), background: on ? col + '0C' : '#FFFFFF', textAlign: 'left', transition: 'all .15s', cursor: readOnly ? 'default' : 'pointer', boxShadow: on ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 8, border: '1.5px solid ' + (on ? col : '#EAE6DE'), background: on ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FFFFFF', transition: 'all .15s' }}>
                    {on && I.Check(11)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: on ? '#1A1814' : '#A09C96', fontWeight: on ? 500 : 400 }}>{act.name}</div>
                    {act.trackTime && <div className="mono" style={{ fontSize: 10, color: '#A09C96', marginTop: 1 }}>timed · +{act.xp} xp</div>}
                  </div>
                </div>
                {!act.trackTime && <span className="mono" style={{ fontSize: 11, color: on ? col : '#A09C96' }}>+{act.xp}</span>}
              </button>
            );
          }))}
        </div>
      ))}
      <div style={{ height: 100 }} />
    </div>
  );
}
