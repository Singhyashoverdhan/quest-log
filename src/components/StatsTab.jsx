import { SECTIONS, HABIT_CATEGORIES, TOTAL_XP } from '../data';
import { fmtD, fmtM } from '../utils';
import { C } from './ui';
import Donut from './Donut';

export default function StatsTab({ cu, last7, catBreakdown, earnedXP, fulfilment, tasks, ac, allLogs }) {
  const SC = Object.fromEntries(SECTIONS.map(s => [s.name, s.color]));
  const myTasks = tasks[cu.name] || [];
  const doneTasks = myTasks.filter(t => t.status === 'done' && t.actMins > 0);
  const sectionTime = {};
  doneTasks.forEach(t => { sectionTime[t.section] = (sectionTime[t.section] || 0) + t.actMins; });
  const totalAct = doneTasks.reduce((s, t) => s + t.actMins, 0);
  const totalEst = doneTasks.reduce((s, t) => s + t.estMins, 0);
  const maxPct = Math.max(...last7.map(d => d.pct), 1);
  const streak = (() => { let s = 0; for (let i = 0; i < last7.length; i++) { const d = last7[last7.length - 1 - i]; if (d.pct > 0) s++; else break; } return s; })();

  const habitTime = {};
  const userLogs = allLogs[cu.name] || {};
  Object.values(userLogs).forEach(dayLog => {
    Object.entries(dayLog).forEach(([key, state]) => {
      if (state.mins > 0) {
        const cat = HABIT_CATEGORIES.find(c => c.activities.some(a => `${c.name}::${a.name}` === key));
        if (cat) { habitTime[cat.section] = (habitTime[cat.section] || 0) + state.mins; }
      }
    });
  });

  return (
    <div className="fade">
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Your Stats</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[{ l: 'TODAY XP', v: earnedXP, s: `/ ${TOTAL_XP}` }, { l: 'FULFILMENT', v: `${fulfilment}%`, s: 'today' }, { l: 'STREAK', v: `${streak}d`, s: 'active' }].map(s => (
          <div key={s.l} style={{ flex: 1, ...C.card({ padding: '12px' }) }}>
            <div className="mono" style={{ fontSize: 9, color: '#7c8493', letterSpacing: 1, marginBottom: 5 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ac }}>{s.v}</div>
            <div className="mono" style={{ fontSize: 9, color: '#5f6470', marginTop: 2 }}>{s.s}</div>
          </div>
        ))}
      </div>
      <div style={C.card({ padding: '16px', marginBottom: 14 })}>
        <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 14 }}>LAST 7 DAYS</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {last7.map(d => (
            <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="mono" style={{ fontSize: 9, color: '#7c8493' }}>{d.pct > 0 ? `${d.pct}%` : ''}</div>
              <div style={{ width: '100%', borderRadius: 4, height: Math.max(3, (d.pct / maxPct) * 60), background: d.pct === 0 ? '#2a2d35' : ac, transition: 'height .4s' }} />
              <div className="mono" style={{ fontSize: 9, color: '#5f6470' }}>{fmtD(d.key).slice(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={C.card({ padding: '16px', marginBottom: 14 })}>
        <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 12 }}>HABIT BREAKDOWN</div>
        {catBreakdown.map(c => (
          <div key={c.name} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: '#c5cad3' }}>{c.name}</span>
              <span className="mono" style={{ color: '#7c8493' }}>{c.earned}/{c.total} · {c.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: '#2a2d35', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.pct}%`, background: SC[HABIT_CATEGORIES.find(h => h.name === c.name)?.section] || ac, borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>
        ))}
      </div>
      {(Object.keys(sectionTime).length > 0 || Object.keys(habitTime).length > 0) && (
        <div style={C.card({ padding: '16px', marginBottom: 14 })}>
          <div className="mono" style={{ fontSize: 10, color: '#7c8493', letterSpacing: 1.5, marginBottom: 14 }}>TIME ANALYTICS</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Donut size={100} value={fmtM(totalAct) || '—'} label="tasks"
              slices={Object.entries(sectionTime).map(([s, v]) => ({ label: s, val: v, color: SC[s] || '#7c8493' }))} />
            <div style={{ flex: 1 }}>
              {totalEst > 0 && <div className="mono" style={{ fontSize: 11, color: '#7c8493', marginBottom: 8 }}>Task accuracy: {Math.round(totalAct / totalEst * 100)}%</div>}
              <div className="mono" style={{ fontSize: 10, color: '#5f6470', marginBottom: 6 }}>TASKS BY SECTION</div>
              {Object.entries(sectionTime).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: SC[s] || '#7c8493' }} />{s}</div>
                  <span className="mono" style={{ color: '#7c8493' }}>{fmtM(v)}</span>
                </div>
              ))}
              {Object.keys(habitTime).length > 0 && (
                <>
                  <div className="mono" style={{ fontSize: 10, color: '#5f6470', marginTop: 8, marginBottom: 6 }}>HABIT TIME</div>
                  {Object.entries(habitTime).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: SC[s] || '#7c8493' }} />{s}</div>
                      <span className="mono" style={{ color: '#7c8493' }}>{fmtM(v)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ height: 80 }} />
    </div>
  );
}
