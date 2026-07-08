import React from 'react';
import { USERS, SECTIONS, HABIT_CATEGORIES, TOTAL_XP, ACCENT } from './data';
import { readSheet, appendRow } from './sheets';
import { getDK, uid, TODAY, normalizeDate } from './utils';
import { C } from './components/ui';
import { I } from './components/Icons';
import Login from './components/Login';
import AddTaskModal from './components/AddTaskModal';
import MeasLogModal from './components/MeasLogModal';
import HomeTab from './components/HomeTab';
import DailyTab from './components/DailyTab';
import TasksTab from './components/TasksTab';
import SquadTab from './components/SquadTab';
import SetupTab from './components/SetupTab';

function parseLog(rows) {
  const L = {};
  for (let i = 1; i < rows.length; i++) {
    const [date, user, cat, act, , done, mins] = rows[i];
    if (!date || !user || !cat || !act) continue;
    const dk = normalizeDate(date);
    if (!L[user]) L[user] = {};
    if (!L[user][dk]) L[user][dk] = {};
    L[user][dk][`${cat}::${act}`] = { done: done === 'TRUE', mins: parseInt(mins) || 0 };
  }
  return L;
}

function parseMeas(rows) {
  const M = {};
  for (let i = 1; i < rows.length; i++) {
    const [date, user, area, value] = rows[i];
    if (!date || !user || !area || value == null) continue;
    const dk = normalizeDate(date);
    if (!M[user]) M[user] = {};
    if (!M[user][dk]) M[user][dk] = {};
    M[user][dk][area] = parseFloat(value);
  }
  return M;
}

function parseTargets(rows) {
  const T = {};
  for (let i = 1; i < rows.length; i++) {
    const [user, area, target] = rows[i];
    if (!user || !area) continue;
    if (!T[user]) T[user] = {};
    T[user][area] = parseFloat(target) || null;
  }
  return T;
}

function parseTasks(rows) {
  const T = {};
  for (let i = 1; i < rows.length; i++) {
    const [id, user, title, notes, section, due, est, act, starred, status, completedAt, createdAt] = rows[i];
    if (!id || !user || !title) continue;
    if (id.endsWith('-done')) continue;
    if (!T[user]) T[user] = [];
    const existing = T[user].find(t => t.id === id);
    if (existing) { existing.actMins = parseInt(act) || 0; existing.status = status || existing.status; existing.completedAt = completedAt || existing.completedAt; }
    else T[user].push({ id, user, title: title || '', notes: notes || '', section: section || 'Work', dueDate: due || '', estMins: parseInt(est) || 0, actMins: parseInt(act) || 0, starred: starred === 'TRUE', status: status || 'active', completedAt: completedAt || '', createdAt: createdAt || '', subtasks: [] });
  }
  return T;
}

function parseSubtasks(rows, tasks) {
  for (let i = 1; i < rows.length; i++) {
    const [id, taskId, user, title, done] = rows[i];
    if (!id || !taskId || !user || id.endsWith('-toggle')) continue;
    if (tasks[user]) { const t = tasks[user].find(t => t.id === taskId); if (t && !t.subtasks.find(s => s.id === id)) t.subtasks.push({ id, taskId, user, title, done: done === 'TRUE' }); }
  }
  return tasks;
}

function parseChallenges(rows) {
  const C = {};
  for (let i = 1; i < rows.length; i++) {
    const [date, prompt, user, done] = rows[i];
    if (!date) continue;
    const dk = normalizeDate(date);
    if (!C[dk]) C[dk] = { prompt: '', completions: {} };
    if (prompt) C[dk].prompt = prompt;
    if (user) C[dk].completions[user] = done === 'TRUE';
  }
  return C;
}

function loadSelectedHabits(username) {
  if (!username) return new Set();
  try {
    const stored = localStorage.getItem(`ql_habits_${username}`);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set(HABIT_CATEGORIES.flatMap(c => c.activities.map(a => `${c.name}::${a.name}`)));
}

export default function App() {
  const [cu, setCu] = React.useState(() => { try { const s = localStorage.getItem('ql_user'); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [viewingUser, setViewingUser] = React.useState(null);
  const [tab, setTab] = React.useState('home');
  const [allLogs, setAllLogs] = React.useState({});
  const [measurements, setMeasurements] = React.useState({});
  const [targets, setTargets] = React.useState({});
  const [tasks, setTasks] = React.useState({});
  const [challenges, setChallenges] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [showUserPicker, setShowUserPicker] = React.useState(false);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [showQuickMeas, setShowQuickMeas] = React.useState(false);
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [taskSection, setTaskSection] = React.useState(null);
  const [dayOffset, setDayOffset] = React.useState(0);
  const [selectedHabits, setSelectedHabits] = React.useState(() => loadSelectedHabits(null));

  React.useEffect(() => { const h = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  React.useEffect(() => {
    if (cu) setSelectedHabits(loadSelectedHabits(cu.name));
    else setSelectedHabits(new Set());
  }, [cu?.name]);

  function login(u) { localStorage.setItem('ql_user', JSON.stringify(u)); setCu(u); setViewingUser(null); }
  function logout() { localStorage.removeItem('ql_user'); setCu(null); setViewingUser(null); }

  const activeUser = viewingUser || cu;
  const readOnly = viewingUser !== null;
  const ac = ACCENT;

  function toggleHabit(key) {
    if (!cu) return;
    setSelectedHabits(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem(`ql_habits_${cu.name}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [lr, mr, tr, taskR, stR, chR] = await Promise.all([
        readSheet('Daily Log'), readSheet('Measurements'), readSheet('Targets'),
        readSheet('Tasks'), readSheet('Subtasks'), readSheet('Challenge')
      ]);
      setAllLogs(parseLog(lr));
      setMeasurements(parseMeas(mr));
      setTargets(parseTargets(tr));
      const pt = parseTasks(taskR);
      parseSubtasks(stR, pt);
      setTasks(pt);
      setChallenges(parseChallenges(chR));
    } catch (e) { setError('Could not reach Google Sheets.'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { if (cu) loadData(); }, [cu, loadData]);

  const toggle = React.useCallback(async (catName, actName, xp, mins) => {
    if (readOnly) return;
    const key = `${catName}::${actName}`, uname = cu.name;
    const current = ((allLogs[uname] || {})[TODAY] || {})[key] || { done: false, mins: 0 };
    const next = { done: !current.done, mins: current.done ? 0 : (mins || 0) };
    setAllLogs(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), [TODAY]: { ...((prev[uname] || {})[TODAY] || {}), [key]: next } } }));
    setSyncing(true);
    try { await appendRow('Daily Log', [TODAY, uname, catName, actName, xp, next.done ? 'TRUE' : 'FALSE', next.mins || '']); }
    catch (e) { setAllLogs(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), [TODAY]: { ...((prev[uname] || {})[TODAY] || {}), [key]: current } } })); setError('Sync failed.'); }
    finally { setSyncing(false); }
  }, [readOnly, cu, allLogs]);

  const addTask = React.useCallback(async (data) => {
    if (readOnly) return;
    const uname = cu.name, id = uid(), now = new Date().toISOString();
    const task = { id, user: uname, ...data, actMins: 0, status: 'active', completedAt: '', createdAt: now, subtasks: data.subtasks || [] };
    setTasks(prev => ({ ...prev, [uname]: [...(prev[uname] || []), task] }));
    setShowAddTask(false);
    setSyncing(true);
    try {
      await appendRow('Tasks', [id, uname, data.title, data.notes || '', data.section, data.dueDate || '', data.estMins || 0, '', data.starred ? 'TRUE' : 'FALSE', 'active', '', now]);
      for (const st of (data.subtasks || [])) await appendRow('Subtasks', [st.id, id, uname, st.title, 'FALSE']);
    } catch (e) { setError('Task save failed.'); }
    finally { setSyncing(false); }
  }, [readOnly, cu]);

  const completeTask = React.useCallback(async (taskId, actMins) => {
    if (readOnly) return;
    const uname = cu.name, now = new Date().toISOString();
    setTasks(prev => { const ut = [...(prev[uname] || [])]; const idx = ut.findIndex(t => t.id === taskId); if (idx > -1) ut[idx] = { ...ut[idx], status: 'done', actMins, completedAt: now }; return { ...prev, [uname]: ut }; });
    setSyncing(true);
    try { await appendRow('Tasks', [taskId + '-done', uname, '', '', '', '', '', actMins, '', 'done', now, '']); }
    catch (e) { setError('Complete failed.'); }
    finally { setSyncing(false); }
  }, [readOnly, cu]);

  const toggleSubtask = React.useCallback(async (taskId, subtaskId, uname) => {
    setTasks(prev => { const ut = [...(prev[uname] || [])]; const ti = ut.findIndex(t => t.id === taskId); if (ti > -1) { const st = [...ut[ti].subtasks]; const si = st.findIndex(s => s.id === subtaskId); if (si > -1) st[si] = { ...st[si], done: !st[si].done }; ut[ti] = { ...ut[ti], subtasks: st }; } return { ...prev, [uname]: ut }; });
    setSyncing(true);
    try { await appendRow('Subtasks', [subtaskId + '-toggle', taskId, uname, '', 'TOGGLE']); }
    catch (e) { setError('Subtask failed.'); }
    finally { setSyncing(false); }
  }, []);

  const deleteTask = React.useCallback((taskId, uname) => { setTasks(prev => ({ ...prev, [uname]: (prev[uname] || []).filter(t => t.id !== taskId) })); }, []);
  const toggleStar = React.useCallback((taskId, uname) => { setTasks(prev => { const ut = [...(prev[uname] || [])]; const i = ut.findIndex(t => t.id === taskId); if (i > -1) ut[i] = { ...ut[i], starred: !ut[i].starred }; return { ...prev, [uname]: ut }; }); }, []);

  const logMeasurements = React.useCallback(async (uname, date, entries) => {
    const dk = normalizeDate(date);
    setMeasurements(prev => { const day = { ...((prev[uname] || {})[dk] || {}) }; entries.forEach(([a, v]) => { day[a] = parseFloat(v); }); return { ...prev, [uname]: { ...(prev[uname] || {}), [dk]: day } }; });
    setSyncing(true);
    try { for (const [a, v] of entries) await appendRow('Measurements', [dk, uname, a, parseFloat(v), '']); }
    catch (e) { setError('Meas save failed.'); }
    finally { setSyncing(false); }
  }, []);

  const saveTargets = React.useCallback(async (uname, vals) => {
    const entries = Object.entries(vals).filter(([, v]) => v !== '');
    setTargets(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), ...Object.fromEntries(entries.map(([k, v]) => [k, parseFloat(v) || null])) } }));
    setSyncing(true);
    try { for (const [a, v] of entries) await appendRow('Targets', [uname, a, parseFloat(v)]); }
    catch (e) { setError('Target save failed.'); }
    finally { setSyncing(false); }
  }, []);

  const setChallenge = React.useCallback(async (date, prompt) => {
    setChallenges(prev => ({ ...prev, [date]: { ...(prev[date] || { completions: {} }), prompt } }));
    setSyncing(true);
    try { await appendRow('Challenge', [date, prompt, '', '']); }
    catch (e) { setError('Challenge failed.'); }
    finally { setSyncing(false); }
  }, []);

  const completeChallenge = React.useCallback(async (date, prompt, uname) => {
    setChallenges(prev => ({ ...prev, [date]: { ...(prev[date] || {}), completions: { ...((prev[date] || {}).completions || {}), [uname]: true } } }));
    setSyncing(true);
    try { await appendRow('Challenge', [date, prompt, uname, 'TRUE']); }
    catch (e) { setError('Challenge failed.'); }
    finally { setSyncing(false); }
  }, []);

  if (!cu) return <Login onLogin={login} />;
  if (loading) return (
    <div style={{ background: '#13151A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div className="spin" style={{ display: 'flex', color: ac }}>{I.Loader(32)}</div>
      <div className="mono" style={{ color: '#6a7080', fontSize: 13 }}>Loading Quest Log…</div>
    </div>
  );

  const TABS = [
    { id: 'home',  label: 'Home',  icon: I.Home },
    { id: 'daily', label: 'Daily', icon: I.Activity },
    { id: 'tasks', label: 'Tasks', icon: I.Task },
    { id: 'squad', label: 'Squad', icon: I.Users },
    { id: 'setup', label: 'Setup', icon: I.Ruler },
  ];

  const sharedTaskProps = { cu: activeUser, tasks, completeTask, toggleSubtask, deleteTask, toggleStar, readOnly, viewingUser, ac };

  // Snapshot of latest meas for quick-add modal
  const lastMeasVals = React.useMemo(() => {
    const userM = measurements[cu?.name] || {};
    const dates = Object.keys(userM).sort();
    const snap = {};
    dates.forEach(d => Object.assign(snap, userM[d]));
    return snap;
  }, [measurements, cu?.name]);

  return (
    <div style={{ background: '#13151A', color: '#E6E8EF', minHeight: '100vh' }}>
      {showAddTask && <AddTaskModal defaultSection={taskSection || 'Work'} onClose={() => { setShowAddTask(false); setTaskSection(null); }} onSave={addTask} />}

      {showQuickMeas && (
        <MeasLogModal
          lastVals={lastMeasVals}
          onClose={() => setShowQuickMeas(false)}
          onSave={(date, entries) => { logMeasurements(cu.name, date, entries); setShowQuickMeas(false); }}
        />
      )}

      {showQuickAdd && (
        <div onClick={() => setShowQuickAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 400, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background: '#1A1D24', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, margin: '0 auto', padding: '20px 20px 48px', border: '1px solid #252830', borderBottom: 'none' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#353840', margin: '0 auto 18px' }} />
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Add</div>
            <button onClick={() => { setShowQuickAdd(false); setShowAddTask(true); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 12, background: '#252830', marginBottom: 10, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: ac + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ac }}>{I.Task(18)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Add Task</div>
                <div style={{ fontSize: 12, color: '#6a7080', marginTop: 2 }}>Create a new task</div>
              </div>
            </button>
            <button onClick={() => { setShowQuickAdd(false); setShowQuickMeas(true); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 12, background: '#252830', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7BAF9220', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7BAF92' }}>{I.Ruler(18)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Log Measurements</div>
                <div style={{ fontSize: 12, color: '#6a7080', marginTop: 2 }}>Body tracking entry</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(19,21,26,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1E2028', padding: isMobile ? '12px 16px' : '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 24 }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: '#4a5060', letterSpacing: 2 }}>QUEST LOG</div>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700 }}>{activeUser?.name}</div>
          </div>
          {!isMobile && TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: '1px solid ' + (tab === t.id ? ac + '44' : 'transparent'), background: tab === t.id ? ac + '14' : 'transparent', color: tab === t.id ? ac : '#7c8493', fontSize: 13, fontWeight: 600, transition: 'all .15s', cursor: 'pointer' }}>
              {t.icon(14)}{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {syncing && <div className="spin" style={{ display: 'flex', opacity: 0.5 }}>{I.Loader(14, ac)}</div>}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserPicker(v => !v)}
              style={{ width: 30, height: 30, borderRadius: '50%', background: '#252830', border: '1px solid #353840', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A909E', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
            >
              {activeUser?.name[0]}
            </button>
            {showUserPicker && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#1A1D24', border: '1px solid #252830', borderRadius: 14, padding: 10, zIndex: 300, minWidth: 170, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: 10, color: '#4a5060', padding: '2px 8px 8px', fontWeight: 600, fontFamily: 'IBM Plex Mono', letterSpacing: 1 }}>VIEW AS</div>
                {USERS.map(u => (
                  <button key={u.name} onClick={() => { setViewingUser(u.name === cu.name ? null : u); setShowUserPicker(false); setTab('home'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, background: activeUser?.name === u.name ? u.color + '14' : 'transparent', color: '#E6E8EF', fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color }} />{u.name}{u.name === cu.name && <span style={{ fontSize: 10, color: '#4a5060', marginLeft: 'auto' }}>you</span>}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #252830', marginTop: 8, paddingTop: 8 }}>
                  <button onClick={() => { setShowUserPicker(false); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, color: '#C47878', fontSize: 13, cursor: 'pointer' }}>
                    {I.Logout()} Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
          {!isMobile && (
            <button onClick={() => setShowQuickAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: ac, color: '#13151A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {I.Plus(13)} Add
            </button>
          )}
          <button onClick={loadData} style={{ ...C.nb }}>{I.Refresh()}</button>
        </div>
      </div>

      {error && (
        <div style={{ margin: '8px 16px', padding: '10px 14px', borderRadius: 10, background: 'rgba(196,120,120,0.1)', border: '1px solid rgba(196,120,120,0.3)', fontSize: 13, color: '#C47878', display: 'flex', justifyContent: 'space-between' }}>
          {error}<button onClick={() => setError(null)} style={{ color: '#C47878', cursor: 'pointer' }}>{I.X()}</button>
        </div>
      )}

      {showUserPicker && <div onClick={() => setShowUserPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />}

      <div style={{ padding: isMobile ? '16px 16px 0' : '20px 32px 0', maxWidth: isMobile ? '100%' : 1400, margin: '0 auto' }}>
        {tab === 'home' && (
          <HomeTab
            cu={activeUser} allLogs={allLogs} tasks={tasks} challenges={challenges}
            ac={ac} dayOffset={dayOffset} onDayChange={setDayOffset}
            isMobile={isMobile} completeTask={completeTask} toggleSubtask={toggleSubtask}
            toggleStar={toggleStar} onAddTask={() => setShowAddTask(true)}
          />
        )}
        {tab === 'daily' && (
          <DailyTab
            cu={activeUser} allLogs={allLogs} toggle={toggle}
            ac={ac} selectedHabits={selectedHabits}
          />
        )}
        {tab === 'tasks' && <TasksTab {...sharedTaskProps} onAddTask={() => setShowAddTask(true)} />}
        {tab === 'squad' && <SquadTab allLogs={allLogs} challenges={challenges} cu={cu} onSetChallenge={setChallenge} onCompleteChallenge={completeChallenge} />}
        {tab === 'setup' && (
          <SetupTab
            cu={cu} measurements={measurements} targets={targets}
            onLogMeasurements={logMeasurements} onSaveTargets={saveTargets}
            ac={ac} readOnly={readOnly} viewingUser={viewingUser}
            selectedHabits={selectedHabits} onToggleHabit={toggleHabit}
          />
        )}
      </div>

      {isMobile && (
        <>
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(26,29,36,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #252830', display: 'flex', padding: '8px 0 20px', zIndex: 100 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === t.id ? ac : '#4a5060', fontSize: 10, fontWeight: 600, transition: 'color .15s', cursor: 'pointer' }}>
                {t.icon(tab === t.id ? 20 : 18)}{t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowQuickAdd(true)}
            style={{ position: 'fixed', bottom: 78, right: 18, width: 46, height: 46, borderRadius: '50%', background: ac, color: '#13151A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${ac}55`, zIndex: 90, cursor: 'pointer' }}
          >
            {I.Plus(20)}
          </button>
        </>
      )}
    </div>
  );
}
