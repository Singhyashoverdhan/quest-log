import React from 'react';
import { HABIT_CATEGORIES, TOTAL_XP, ACCENT } from './data';
import { uid, getDK, normalizeDate } from './utils';
import { sb } from './supabase';
import { C } from './components/ui';
import { I } from './components/Icons';
import Login from './components/Login';
import AddTaskModal from './components/AddTaskModal';
import MeasLogModal from './components/MeasLogModal';
import HomeTab from './components/HomeTab';
import DailyTab from './components/DailyTab';
import TasksTab from './components/TasksTab';
import SquadTab from './components/SquadTab';
import MeasuresTab from './components/MeasuresTab';
import SetupTab from './components/SetupTab';

// ── Parsers ────────────────────────────────────────────────────────────────

function parseLog(rows) {
  const L = {};
  for (const r of rows) {
    const dk = r.date;
    if (!L[r.username]) L[r.username] = {};
    if (!L[r.username][dk]) L[r.username][dk] = {};
    L[r.username][dk][`${r.category}::${r.activity}`] = { done: r.done, mins: r.mins || 0 };
  }
  return L;
}

function parseMeas(rows) {
  const M = {};
  for (const r of rows) {
    const dk = r.date;
    if (!M[r.username]) M[r.username] = {};
    if (!M[r.username][dk]) M[r.username][dk] = {};
    M[r.username][dk][r.area] = r.value;
  }
  return M;
}

function parseTargets(rows) {
  const T = {};
  for (const r of rows) {
    if (!T[r.username]) T[r.username] = {};
    T[r.username][r.area] = r.value;
  }
  return T;
}

function parseTasks(rows) {
  const T = {};
  for (const r of rows) {
    if (!T[r.username]) T[r.username] = [];
    T[r.username].push({
      id: r.id,
      user: r.username,
      title: r.title,
      notes: r.notes || '',
      section: r.section || 'Work',
      dueDate: r.due_date || '',
      estMins: r.est_mins || 0,
      actMins: r.act_mins || 0,
      starred: r.starred || false,
      status: r.status || 'active',
      completedAt: r.completed_at || '',
      createdAt: r.created_at || '',
      subtasks: (r.subtasks || []).map(s => ({
        id: s.id, taskId: s.task_id, user: s.username, title: s.title, done: s.done,
      })),
    });
  }
  return T;
}

function parseChallenges(rows, completions) {
  const CH = {};
  for (const r of rows) CH[r.date] = { prompt: r.prompt, completions: {} };
  for (const c of completions) { if (CH[c.date]) CH[c.date].completions[c.username] = true; }
  return CH;
}

function loadSelectedHabits(username) {
  if (!username) return new Set();
  try { const s = localStorage.getItem(`ql_habits_${username}`); if (s) return new Set(JSON.parse(s)); } catch {}
  return new Set(HABIT_CATEGORIES.flatMap(c => c.activities.map(a => `${c.name}::${a.name}`)));
}

// ── Nav config ────────────────────────────────────────────────────────────

const LEFT_TABS  = [
  { id: 'home',  label: 'Home',  icon: I.Home },
  { id: 'daily', label: 'Daily', icon: I.Activity },
];
const RIGHT_TABS = [
  { id: 'body',  label: 'Body',  icon: I.BarChart },
  { id: 'tasks', label: 'Tasks', icon: I.Task },
];
const ALL_TABS = [
  { id: 'home',  label: 'Home',  icon: I.Home },
  { id: 'daily', label: 'Daily', icon: I.Activity },
  { id: 'tasks', label: 'Tasks', icon: I.Task },
  { id: 'squad', label: 'Squad', icon: I.Users },
  { id: 'body',  label: 'Body',  icon: I.BarChart },
];

// ── App ───────────────────────────────────────────────────────────────────

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
  const [dayOffset, setDayOffset] = React.useState(0);
  const [selectedHabits, setSelectedHabits] = React.useState(new Set());

  const lastMeasVals = React.useMemo(() => {
    const userM = measurements[cu?.name] || {};
    const snap = {};
    Object.keys(userM).sort().forEach(d => Object.assign(snap, userM[d]));
    return snap;
  }, [measurements, cu?.name]);

  React.useEffect(() => { const h = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  React.useEffect(() => { setSelectedHabits(cu ? loadSelectedHabits(cu.name) : new Set()); }, [cu?.name]);

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

  // ── Load ──────────────────────────────────────────────────────────────

  const loadData = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [logRes, measRes, targRes, taskRes, chalRes, compRes] = await Promise.all([
        sb.from('daily_log').select('*'),
        sb.from('measurements').select('*'),
        sb.from('targets').select('*'),
        sb.from('tasks').select('*, subtasks(*)').neq('status', 'deleted'),
        sb.from('challenges').select('*'),
        sb.from('challenge_completions').select('*'),
      ]);
      if (logRes.error)  throw logRes.error;
      if (measRes.error) throw measRes.error;
      if (targRes.error) throw targRes.error;
      if (taskRes.error) throw taskRes.error;
      setAllLogs(parseLog(logRes.data));
      setMeasurements(parseMeas(measRes.data));
      setTargets(parseTargets(targRes.data));
      setTasks(parseTasks(taskRes.data));
      setChallenges(parseChallenges(chalRes.data || [], compRes.data || []));
    } catch (e) {
      console.error(e);
      setError('Could not reach database.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { if (cu) loadData(); }, [cu, loadData]);

  // ── Habit toggle ──────────────────────────────────────────────────────

  const toggle = React.useCallback(async (catName, actName, xp, mins) => {
    if (readOnly) return;
    const todayDK = getDK(0);
    const key = `${catName}::${actName}`, uname = cu.name;
    const current = ((allLogs[uname] || {})[todayDK] || {})[key] || { done: false, mins: 0 };
    const next = { done: !current.done, mins: current.done ? 0 : (mins || 0) };
    setAllLogs(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), [todayDK]: { ...((prev[uname] || {})[todayDK] || {}), [key]: next } } }));
    setSyncing(true);
    const { error: err } = await sb.from('daily_log').upsert(
      { date: todayDK, username: uname, category: catName, activity: actName, xp, done: next.done, mins: next.mins },
      { onConflict: 'date,username,category,activity' }
    );
    if (err) {
      setAllLogs(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), [todayDK]: { ...((prev[uname] || {})[todayDK] || {}), [key]: current } } }));
      setError('Sync failed.');
    }
    setSyncing(false);
  }, [readOnly, cu, allLogs]);

  // ── Tasks ──────────────────────────────────────────────────────────────

  const addTask = React.useCallback(async (data) => {
    if (readOnly) return;
    const uname = cu.name, id = uid(), now = new Date().toISOString();
    const task = { id, user: uname, ...data, actMins: 0, status: 'active', completedAt: '', createdAt: now, subtasks: data.subtasks || [] };
    setTasks(prev => ({ ...prev, [uname]: [...(prev[uname] || []), task] }));
    setShowAddTask(false); setSyncing(true);
    const { error: err } = await sb.from('tasks').insert({
      id, username: uname, title: data.title, notes: data.notes || '',
      section: data.section, due_date: data.dueDate || null,
      est_mins: data.estMins || 0, starred: data.starred || false,
      status: 'active', created_at: now,
    });
    if (!err && data.subtasks?.length) {
      await sb.from('subtasks').insert(
        data.subtasks.map(st => ({ id: st.id, task_id: id, username: uname, title: st.title, done: false }))
      );
    }
    if (err) setError('Task save failed.');
    setSyncing(false);
  }, [readOnly, cu]);

  const completeTask = React.useCallback(async (taskId, actMins) => {
    if (readOnly) return;
    const uname = cu.name, now = new Date().toISOString();
    let snapshot = null;
    // Optimistic update — capture previous state for rollback
    setTasks(prev => {
      snapshot = prev;
      const ut = [...(prev[uname] || [])];
      const i = ut.findIndex(t => t.id === taskId);
      if (i > -1) ut[i] = { ...ut[i], status: 'done', actMins, completedAt: now };
      return { ...prev, [uname]: ut };
    });
    setSyncing(true);
    const { error: err, data } = await sb.from('tasks')
      .update({ status: 'done', act_mins: actMins, completed_at: now })
      .eq('id', taskId)
      .select('id');
    // Roll back if the update failed or matched no rows
    if (err || !data?.length) {
      if (snapshot) setTasks(snapshot);
      setError('Could not save — task not marked done. Please try again.');
    }
    setSyncing(false);
  }, [readOnly, cu]);

  const toggleSubtask = React.useCallback(async (taskId, subtaskId, uname) => {
    const task = (tasks[uname] || []).find(t => t.id === taskId);
    const sub  = task?.subtasks.find(s => s.id === subtaskId);
    const nextDone = !sub?.done;
    setTasks(prev => { const ut = [...(prev[uname] || [])]; const ti = ut.findIndex(t => t.id === taskId); if (ti > -1) { const st = [...ut[ti].subtasks]; const si = st.findIndex(s => s.id === subtaskId); if (si > -1) st[si] = { ...st[si], done: nextDone }; ut[ti] = { ...ut[ti], subtasks: st }; } return { ...prev, [uname]: ut }; });
    setSyncing(true);
    const { error: err } = await sb.from('subtasks').update({ done: nextDone }).eq('id', subtaskId);
    if (err) setError('Subtask failed.');
    setSyncing(false);
  }, [tasks]);

  const deleteTask = React.useCallback(async (id, uname) => {
    setTasks(prev => ({ ...prev, [uname]: (prev[uname] || []).filter(t => t.id !== id) }));
    await sb.from('tasks').update({ status: 'deleted' }).eq('id', id);
  }, []);

  const toggleStar = React.useCallback(async (id, uname) => {
    const task = (tasks[uname] || []).find(t => t.id === id);
    const next = !task?.starred;
    setTasks(prev => { const ut = [...(prev[uname] || [])]; const i = ut.findIndex(t => t.id === id); if (i > -1) ut[i] = { ...ut[i], starred: next }; return { ...prev, [uname]: ut }; });
    await sb.from('tasks').update({ starred: next }).eq('id', id);
  }, [tasks]);

  // ── Measurements ──────────────────────────────────────────────────────

  const logMeasurements = React.useCallback(async (uname, date, entries) => {
    const dk = normalizeDate(date);
    setMeasurements(prev => { const day = { ...((prev[uname] || {})[dk] || {}) }; entries.forEach(([a, v]) => { day[a] = parseFloat(v); }); return { ...prev, [uname]: { ...(prev[uname] || {}), [dk]: day } }; });
    setSyncing(true);
    const { error: err } = await sb.from('measurements').upsert(
      entries.map(([area, value]) => ({ date: dk, username: uname, area, value: parseFloat(value) })),
      { onConflict: 'date,username,area' }
    );
    if (err) setError('Meas save failed.');
    setSyncing(false);
  }, []);

  const saveTargets = React.useCallback(async (uname, vals) => {
    const entries = Object.entries(vals).filter(([, v]) => v !== '');
    setTargets(prev => ({ ...prev, [uname]: { ...(prev[uname] || {}), ...Object.fromEntries(entries.map(([k, v]) => [k, parseFloat(v) || null])) } }));
    setSyncing(true);
    const { error: err } = await sb.from('targets').upsert(
      entries.map(([area, value]) => ({ username: uname, area, value: parseFloat(value) || null })),
      { onConflict: 'username,area' }
    );
    if (err) setError('Target save failed.');
    setSyncing(false);
  }, []);

  // ── Challenges ────────────────────────────────────────────────────────

  const setChallenge = React.useCallback(async (date, prompt) => {
    setChallenges(prev => ({ ...prev, [date]: { ...(prev[date] || { completions: {} }), prompt } }));
    setSyncing(true);
    const { error: err } = await sb.from('challenges').upsert({ date, prompt }, { onConflict: 'date' });
    if (err) setError('Challenge failed.');
    setSyncing(false);
  }, []);

  const completeChallenge = React.useCallback(async (date, prompt, uname) => {
    setChallenges(prev => ({ ...prev, [date]: { ...(prev[date] || {}), completions: { ...((prev[date] || {}).completions || {}), [uname]: true } } }));
    setSyncing(true);
    const { error: err } = await sb.from('challenge_completions').upsert({ date, username: uname }, { onConflict: 'date,username' });
    if (err) setError('Challenge failed.');
    setSyncing(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  if (!cu) return <Login onLogin={login} />;
  if (loading) return (
    <div style={{ background: '#F5F3EE', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div className="spin" style={{ display: 'flex', color: ac }}>{I.Loader(32)}</div>
      <div className="mono" style={{ color: '#A09C96', fontSize: 13 }}>Loading Quest Log…</div>
    </div>
  );

  const sharedMeasProps = { cu, measurements, targets, onLogMeasurements: logMeasurements, onSaveTargets: saveTargets, ac, readOnly, viewingUser };
  const sharedTaskProps = { cu: activeUser, tasks, completeTask, toggleSubtask, deleteTask, toggleStar, readOnly, viewingUser, ac };

  return (
    <div style={{ background: '#F5F3EE', color: '#1A1814', minHeight: '100vh' }}>
      {showAddTask && <AddTaskModal defaultSection="Work" onClose={() => setShowAddTask(false)} onSave={addTask} />}
      {showQuickMeas && <MeasLogModal lastVals={lastMeasVals} onClose={() => setShowQuickMeas(false)} onSave={(date, entries) => { logMeasurements(cu.name, date, entries); setShowQuickMeas(false); }} />}

      {/* Quick add bottom sheet */}
      {showQuickAdd && (
        <div onClick={() => setShowQuickAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 400, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background: '#FFFFFF', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, margin: '0 auto', padding: '20px 20px 52px', boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#EAE6DE', margin: '0 auto 20px' }} />
            <div style={{ fontWeight: 700, fontSize: 17, color: '#1A1814', marginBottom: 16 }}>Quick Add</div>
            <button onClick={() => { setShowQuickAdd(false); setShowAddTask(true); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 14, background: '#F8F6F1', border: '1px solid #EAE6DE', marginBottom: 10, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: ac + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ac }}>{I.Task(20)}</div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: '#1A1814' }}>Add Task</div><div style={{ fontSize: 12, color: '#A09C96', marginTop: 2 }}>Create a new task</div></div>
            </button>
            <button onClick={() => { setShowQuickAdd(false); setShowQuickMeas(true); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 14, background: '#F8F6F1', border: '1px solid #EAE6DE', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#7BAF9218', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7BAF92' }}>{I.BarChart(20)}</div>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: '#1A1814' }}>Log Measurements</div><div style={{ fontSize: 12, color: '#A09C96', marginTop: 2 }}>Body tracking entry</div></div>
            </button>
          </div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(245,243,238,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EAE6DE', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div>
              <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 2 }}>QUEST LOG</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1814' }}>{activeUser?.name}</div>
            </div>
            {ALL_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 20, background: tab === t.id ? ac : 'transparent', color: tab === t.id ? '#FFFFFF' : '#706C66', fontSize: 13, fontWeight: 600, transition: 'all .15s', cursor: 'pointer' }}>
                {t.icon(14)}{t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {syncing && <div className="spin" style={{ display: 'flex', color: ac }}>{I.Loader(14, ac)}</div>}
            <button onClick={() => setTab('setup')} title="Settings" style={{ width: 30, height: 30, borderRadius: '50%', background: tab === 'setup' ? ac + '18' : 'transparent', border: '1px solid #EAE6DE', color: tab === 'setup' ? ac : '#A09C96', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {I.Settings(15)}
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserPicker(v => !v)} style={{ width: 30, height: 30, borderRadius: '50%', background: cu.color + '22', border: `1px solid ${cu.color}44`, color: cu.color, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {cu.name[0]}
              </button>
              {showUserPicker && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#FFFFFF', border: '1px solid #EAE6DE', borderRadius: 16, padding: 10, zIndex: 300, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  <div style={{ padding: '4px 10px 10px', borderBottom: '1px solid #F0EDE8', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1814' }}>{cu.name}</div>
                    <div style={{ fontSize: 11, color: '#A09C96', marginTop: 1 }}>Logged in</div>
                  </div>
                  <button onClick={() => { setTab('setup'); setShowUserPicker(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, color: '#1A1814', fontSize: 13, cursor: 'pointer' }}>
                    {I.Settings(14)} Settings
                  </button>
                  <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, color: '#C47878', fontSize: 13, cursor: 'pointer', marginTop: 2 }}>
                    {I.Logout()} Sign out
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setShowQuickAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: ac, color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {I.Plus(13)} Add
            </button>
            <button onClick={loadData} style={{ ...C.nb }}>{I.Refresh()}</button>
          </div>
        </div>
      )}

      {/* Mobile slim header */}
      {isMobile && (
        <div style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(245,243,238,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EAE6DE', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: '#A09C96', letterSpacing: 2 }}>QUEST LOG</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1814' }}>{activeUser?.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {syncing && <div className="spin" style={{ display: 'flex', color: ac }}>{I.Loader(14, ac)}</div>}
            <button onClick={() => setTab('setup')} title="Settings" style={{ width: 30, height: 30, borderRadius: '50%', background: tab === 'setup' ? ac + '18' : 'transparent', border: '1px solid #EAE6DE', color: tab === 'setup' ? ac : '#A09C96', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {I.Settings(15)}
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserPicker(v => !v)} style={{ width: 30, height: 30, borderRadius: '50%', background: cu.color + '22', border: `1px solid ${cu.color}44`, color: cu.color, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {cu.name[0]}
              </button>
              {showUserPicker && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#FFFFFF', border: '1px solid #EAE6DE', borderRadius: 16, padding: 10, zIndex: 300, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  <div style={{ padding: '4px 10px 10px', borderBottom: '1px solid #F0EDE8', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1814' }}>{cu.name}</div>
                    <div style={{ fontSize: 11, color: '#A09C96', marginTop: 1 }}>Logged in</div>
                  </div>
                  <button onClick={() => { setTab('setup'); setShowUserPicker(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, color: '#1A1814', fontSize: 13, cursor: 'pointer' }}>
                    {I.Settings(14)} Settings
                  </button>
                  <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, color: '#C47878', fontSize: 13, cursor: 'pointer', marginTop: 2 }}>
                    {I.Logout()} Sign out
                  </button>
                </div>
              )}
            </div>
            <button onClick={loadData} style={{ ...C.nb }}>{I.Refresh()}</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ margin: '8px 16px', padding: '10px 14px', borderRadius: 10, background: '#C4787814', border: '1px solid #C4787844', fontSize: 13, color: '#C47878', display: 'flex', justifyContent: 'space-between' }}>
          {error}<button onClick={() => setError(null)} style={{ color: '#C47878', cursor: 'pointer' }}>{I.X()}</button>
        </div>
      )}
      {showUserPicker && <div onClick={() => setShowUserPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />}

      {/* Page content */}
      <div style={{ padding: isMobile ? '16px 16px 0' : '24px 32px 0', maxWidth: isMobile ? '100%' : 960, margin: '0 auto' }}>
        {tab === 'home'  && <HomeTab cu={activeUser} allLogs={allLogs} tasks={tasks} ac={ac} dayOffset={dayOffset} onDayChange={setDayOffset} isMobile={isMobile} completeTask={completeTask} toggleSubtask={toggleSubtask} toggleStar={toggleStar} onAddTask={() => setShowAddTask(true)} />}
        {tab === 'daily' && <DailyTab cu={activeUser} allLogs={allLogs} toggle={toggle} ac={ac} selectedHabits={selectedHabits} />}
        {tab === 'tasks' && <TasksTab {...sharedTaskProps} onAddTask={() => setShowAddTask(true)} />}
        {tab === 'squad' && <SquadTab allLogs={allLogs} challenges={challenges} cu={cu} onSetChallenge={setChallenge} onCompleteChallenge={completeChallenge} />}
        {tab === 'body'  && <MeasuresTab {...sharedMeasProps} />}
        {tab === 'setup' && <SetupTab ac={ac} readOnly={readOnly} selectedHabits={selectedHabits} onToggleHabit={toggleHabit} />}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid #EAE6DE', display: 'flex', alignItems: 'center', padding: '8px 0 24px', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          {LEFT_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === t.id ? ac : '#C4C0BA', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'color .15s' }}>
              {t.icon(tab === t.id ? 22 : 20)}{t.label}
            </button>
          ))}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <button onClick={() => setShowQuickAdd(true)} style={{ width: 54, height: 54, borderRadius: '50%', background: ac, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 18px ${ac}66`, marginTop: -26, cursor: 'pointer', border: '3px solid #F5F3EE' }}>
              {I.Plus(22)}
            </button>
          </div>
          {RIGHT_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === t.id ? ac : '#C4C0BA', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'color .15s' }}>
              {t.icon(tab === t.id ? 22 : 20)}{t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
