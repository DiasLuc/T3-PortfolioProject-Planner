import { startTransition, useEffect, useState } from "react";

import {
  createTask,
  deleteDay,
  deleteTask,
  getTasksForDay,
  loginUser,
  registerUser,
  replaceDay,
  updateTask
} from "./api.js";

const SESSION_KEY = "daily-planner-session";
const DEFAULT_DAY = "2026-05-01";
const DEMO_USERS = [
  "alice / planner123",
  "bruno / planner123",
  "carla / planner123"
];
const TIMELINE_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
const TASK_COLORS = ["#22c55e", "#f59e0b", "#0ea5e9", "#a855f7", "#fb7185", "#6366f1"];

function makeTaskForm(date = DEFAULT_DAY) {
  return {
    id: null,
    date,
    startTime: "",
    endTime: "",
    title: "",
    notes: ""
  };
}

function makeDraftRow(date = DEFAULT_DAY) {
  return {
    id: `draft-${Math.random().toString(36).slice(2, 9)}`,
    date,
    startTime: "",
    endTime: "",
    title: "",
    notes: ""
  };
}

function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatCompactDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function describeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

function getTaskDurationMinutes(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function summarizeHours(tasks) {
  if (tasks.length === 0) {
    return "Open day";
  }

  const totalMinutes = tasks.reduce(
    (minutes, task) => minutes + getTaskDurationMinutes(task.startTime, task.endTime),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours}h planned` : `${hours}h ${minutes}m planned`;
}

function tasksOverlap(left, right) {
  return left.startTime < right.endTime && right.startTime < left.endTime;
}

function validateTaskForm(form) {
  if (!form.date || !form.startTime || !form.endTime || !form.title.trim()) {
    return "Date, time range, and title are required.";
  }

  if (form.endTime <= form.startTime) {
    return "End time must be after start time.";
  }

  return "";
}

function detectTaskConflict(form, tasks, currentTaskId = null) {
  return tasks.find((task) => task.id !== currentTaskId && tasksOverlap(form, task));
}

function validateDraftRows(rows) {
  const nonEmptyRows = rows.filter((row) => row.title.trim() || row.startTime || row.endTime);

  if (nonEmptyRows.length === 0) {
    return { error: "Add at least one task before replacing the day.", tasks: [] };
  }

  const normalized = [];
  for (const row of nonEmptyRows) {
    const message = validateTaskForm(row);
    if (message) {
      return { error: message, tasks: [] };
    }

    normalized.push({
      startTime: row.startTime,
      endTime: row.endTime,
      title: row.title.trim(),
      notes: row.notes.trim()
    });
  }

  normalized.sort((left, right) => left.startTime.localeCompare(right.startTime));
  for (let index = 1; index < normalized.length; index += 1) {
    if (tasksOverlap(normalized[index - 1], normalized[index])) {
      return { error: "Provided tasks overlap within the day schedule.", tasks: [] };
    }
  }

  return { error: "", tasks: normalized };
}

function buildReplaceDraft(tasks, date) {
  if (tasks.length === 0) {
    return [makeDraftRow(date)];
  }

  return tasks.map((task) => ({
    id: task.id,
    date: task.date,
    startTime: task.startTime,
    endTime: task.endTime,
    title: task.title,
    notes: task.notes || ""
  }));
}

function getTaskTop(startTime) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const minutesFromEight = (hours - 8) * 60 + minutes;
  return Math.max(42, 42 + minutesFromEight * 1.43);
}

function getTaskHeight(startTime, endTime) {
  return Math.max(86, getTaskDurationMinutes(startTime, endTime) * 1.43);
}

function TaskCard({ task, index, compact = false, onEdit }) {
  const accentColor = TASK_COLORS[index % TASK_COLORS.length];
  const style = compact
    ? {
        top: `${getTaskTop(task.startTime)}px`,
        height: `${getTaskHeight(task.startTime, task.endTime)}px`,
        left: `${120 + (index % 2) * 44}px`,
        width: `${index % 2 === 0 ? 650 : 586}px`
      }
    : {};

  return (
    <button
      className={`task-card ${compact ? "task-card--timeline" : ""}`}
      onClick={() => onEdit(task)}
      style={style}
      type="button"
    >
      <span className="task-card__accent" style={{ backgroundColor: accentColor }} />
      <span className="task-card__time">{describeRange(task.startTime, task.endTime)}</span>
      <strong className="task-card__title">{task.title}</strong>
      <span className="task-card__notes">{task.notes || "No notes added yet."}</span>
    </button>
  );
}

function AuthView({
  authMode,
  authForm,
  authError,
  authBusy,
  notice,
  onAuthModeChange,
  onAuthFormChange,
  onSubmit
}) {
  return (
    <main className="screen screen--auth">
      <div className="auth-blob auth-blob--left" />
      <div className="auth-blob auth-blob--right" />

      <section className="auth-hero">
        <span className="pill pill--lime">Seeded demo data available</span>
        <h1>Plan the day you have, or log the day you had.</h1>
        <p className="lede">
          A single entry point keeps the MVP simple: users can sign in, switch to registration,
          and immediately continue into their own dated planner.
        </p>

        <div className="demo-panel">
          <h2>Demo accounts for seeded week</h2>
          <ul>
            {DEMO_USERS.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
          <p>One week of non-overlapping tasks is preloaded for each account.</p>
        </div>
      </section>

      <section className="auth-panel">
        <span className="pill pill--mint">MVP entry</span>
        <h2>Welcome back</h2>
        <p>Use your account to access only your own planner data.</p>

        <div className="auth-switch">
          <button
            className={authMode === "login" ? "auth-switch__item is-active" : "auth-switch__item"}
            onClick={() => onAuthModeChange("login")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={authMode === "register" ? "auth-switch__item is-active" : "auth-switch__item"}
            onClick={() => onAuthModeChange("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              id="username"
              name="username"
              onChange={onAuthFormChange}
              placeholder="alice"
              value={authForm.username}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              id="password"
              name="password"
              onChange={onAuthFormChange}
              placeholder="planner123"
              type="password"
              value={authForm.password}
            />
          </label>

          <label className="remember-row">
            <input type="checkbox" />
            <span>Remember this device</span>
          </label>

          {authError ? <p className="banner banner--error">{authError}</p> : null}
          {notice ? <p className="banner banner--success">{notice}</p> : null}

          <button className="button button--primary button--full" disabled={authBusy} type="submit">
            {authBusy ? "Working..." : authMode === "login" ? "Sign In" : "Create Account"}
          </button>

          <button
            className="button button--secondary button--full"
            onClick={() => onAuthModeChange(authMode === "login" ? "register" : "login")}
            type="button"
          >
            {authMode === "login" ? "Create New Account" : "Back to Sign In"}
          </button>
        </form>

        <p className="auth-footnote">
          Register uses the same shell with password rules and duplicate username feedback.
        </p>
        <span className="auth-arrow-note">Continue to daily planner</span>
      </section>
    </main>
  );
}

function PlannerAside({
  selectedDate,
  session,
  tasks,
  onLogout,
  onReplaceDay
}) {
  const navItems = [
    { label: "Today", active: true, action: null },
    { label: "Past days", active: false, action: null },
    { label: "Upcoming", active: false, action: null },
    { label: "Completed notes", active: false, action: null },
    { label: "API docs", active: false, href: "/docs" }
  ];

  return (
    <aside className="planner-sidebar">
      <div>
        <div className="brand-lockup">
          <strong>TodayPilot</strong>
          <span>Daily planner</span>
        </div>

        <div className="planner-user">
          <span className="muted-label">Signed in as</span>
          <strong>{session.user.username}</strong>
          <span>{summarizeHours(tasks)}</span>
          <span>{formatCompactDate(selectedDate)}</span>
        </div>

        <nav className="planner-nav">
          {navItems.map((item) =>
            item.href ? (
              <a className={`planner-nav__item ${item.active ? "is-active" : ""}`} href={item.href} key={item.label} rel="noreferrer" target="_blank">
                {item.label}
              </a>
            ) : (
              <button
                className={`planner-nav__item ${item.active ? "is-active" : ""}`}
                key={item.label}
                onClick={item.label === "Completed notes" ? onReplaceDay : undefined}
                type="button"
              >
                {item.label}
              </button>
            )
          )}
        </nav>
      </div>

      <button className="button button--ghost button--full" onClick={onLogout} type="button">
        Sign out
      </button>
    </aside>
  );
}

function PlannerRules({ selectedDate, emptyDay }) {
  return (
    <aside className="rules-panel">
      <h3>Planner rules</h3>
      <ul>
        <li>Only your own tasks are visible.</li>
        <li>Past days are editable when needed.</li>
        <li>Adjacent times are allowed.</li>
        <li>Overlaps are blocked before save.</li>
        <li>Delete a single task or clear a whole day.</li>
      </ul>

      <div className="empty-day-card">
        <strong>{emptyDay ? `No tasks on ${formatCompactDate(selectedDate)}` : `Need a reset on ${formatCompactDate(selectedDate)}?`}</strong>
        <p>
          {emptyDay
            ? "Users can still open an empty day and add their first task."
            : "Open the editor to add, revise, replace, or clear the day schedule."}
        </p>
      </div>

      <span className="rules-note">Open editor to create or update a task</span>
    </aside>
  );
}

function EditorContextTaskCard({ task, index, stateLabel, onEdit }) {
  const accentColor = TASK_COLORS[index % TASK_COLORS.length];

  return (
    <button className="editor-context-card" onClick={() => onEdit(task)} type="button">
      <span className="editor-context-card__accent" style={{ backgroundColor: accentColor }} />
      <span className="editor-context-card__time">{describeRange(task.startTime, task.endTime)}</span>
      <strong className="editor-context-card__title">{task.title}</strong>
      <span className="editor-context-card__label">{stateLabel}</span>
    </button>
  );
}

function TimelinePanel({ tasks, tasksLoading, onEdit }) {
  return (
    <section className="timeline-shell">
      <div className="timeline-grid">
        {TIMELINE_HOURS.map((hour, index) => (
          <div className="timeline-slot" key={hour} style={{ top: `${20 + index * 86}px` }}>
            <span className="timeline-slot__label">{hour}</span>
            <span className="timeline-slot__line" />
          </div>
        ))}

        {tasksLoading ? (
          <div className="timeline-empty">
            <strong>Fetching tasks</strong>
            <p>The planner is loading this day from the API.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="timeline-empty">
            <strong>No tasks scheduled</strong>
            <p>Use the add-task action or replace the whole day in one API call.</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard compact index={index} key={task.id} onEdit={onEdit} task={task} />
          ))
        )}
      </div>
    </section>
  );
}

function DrawerTaskForm({
  editorForm,
  editorMode,
  editorError,
  localConflict,
  saving,
  onFieldChange,
  onSave,
  onDelete,
  onClose
}) {
  const submitLabel = editorMode === "create" ? "Create Task" : "Save Changes";

  return (
    <aside className="editor-drawer">
      <span className="pill pill--blue">Create or edit task</span>
      <h3>Task details</h3>
      <p className="drawer-copy">The same panel supports new tasks, edits, and deletion.</p>

      <label className="field">
        <span>Task title</span>
        <input id="task-title" name="title" onChange={onFieldChange} value={editorForm.title} />
      </label>

      <div className="drawer-grid drawer-grid--two">
        <label className="field">
          <span>Date</span>
          <input id="task-date" name="date" onChange={onFieldChange} type="date" value={editorForm.date} />
        </label>

        <label className="field">
          <span>Status</span>
          <input readOnly value={editorMode === "create" ? "Draft" : "Scheduled"} />
        </label>
      </div>

      <div className="drawer-grid drawer-grid--two">
        <label className="field">
          <span>Start time</span>
          <input
            className={localConflict ? "is-danger" : ""}
            id="task-start"
            name="startTime"
            onChange={onFieldChange}
            type="time"
            value={editorForm.startTime}
          />
          {localConflict ? (
            <small className="helper helper--danger">
              Conflicts with {localConflict.title} ({describeRange(localConflict.startTime, localConflict.endTime)})
            </small>
          ) : null}
        </label>

        <label className="field">
          <span>End time</span>
          <input id="task-end" name="endTime" onChange={onFieldChange} type="time" value={editorForm.endTime} />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea id="task-notes" name="notes" onChange={onFieldChange} rows="4" value={editorForm.notes} />
      </label>

      <div className="validation-card">
        <strong>Validation behavior</strong>
        <p>
          Save stays disabled until the task no longer overlaps. Setting a start time equal to
          another task&apos;s end time is allowed because adjacent times remain valid.
        </p>
      </div>

      {editorError ? <p className="banner banner--error">{editorError}</p> : null}

      <div className="drawer-actions">
        {editorMode === "edit" ? (
          <button className="button button--danger" onClick={onDelete} type="button">
            Delete Task
          </button>
        ) : <span />}

        <div className="drawer-actions__group">
          <button className="button button--secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="button button--secondary"
            disabled={saving || Boolean(localConflict)}
            onClick={onSave}
            type="button"
          >
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}

function DrawerReplaceDay({
  selectedDate,
  draftRows,
  draftError,
  saving,
  onAddRow,
  onChangeRow,
  onRemoveRow,
  onClose,
  onSave
}) {
  return (
    <aside className="editor-drawer">
      <span className="pill pill--blue">Replace day schedule</span>
      <h3>{formatDisplayDate(selectedDate)}</h3>
      <p className="drawer-copy">Use the bulk day endpoint to replace every task on the selected date.</p>

      <div className="replace-stack">
        {draftRows.map((row, index) => (
          <div className="replace-card" key={row.id}>
            <div className="replace-card__header">
              <strong>Task {index + 1}</strong>
              <button className="text-link" onClick={() => onRemoveRow(row.id)} type="button">
                Remove
              </button>
            </div>

            <div className="drawer-grid drawer-grid--two">
              <label className="field">
                <span>Start</span>
                <input
                  onChange={(event) => onChangeRow(row.id, "startTime", event.target.value)}
                  type="time"
                  value={row.startTime}
                />
              </label>

              <label className="field">
                <span>End</span>
                <input
                  onChange={(event) => onChangeRow(row.id, "endTime", event.target.value)}
                  type="time"
                  value={row.endTime}
                />
              </label>
            </div>

            <label className="field">
              <span>Title</span>
              <input onChange={(event) => onChangeRow(row.id, "title", event.target.value)} value={row.title} />
            </label>

            <label className="field">
              <span>Notes</span>
              <textarea
                onChange={(event) => onChangeRow(row.id, "notes", event.target.value)}
                rows="3"
                value={row.notes}
              />
            </label>
          </div>
        ))}
      </div>

      <button className="button button--ghost button--full" onClick={onAddRow} type="button">
        Add another task
      </button>

      {draftError ? <p className="banner banner--error">{draftError}</p> : null}

      <div className="drawer-actions">
        <button className="button button--secondary" onClick={onClose} type="button">
          Cancel
        </button>
        <button className="button button--primary" disabled={saving} onClick={onSave} type="button">
          {saving ? "Replacing..." : "Replace day schedule"}
        </button>
      </div>
    </aside>
  );
}

function PlannerStage({
  selectedDate,
  session,
  tasks,
  tasksLoading,
  tasksError,
  notice,
  editorMode,
  editorForm,
  editorError,
  localConflict,
  drawerSaving,
  onLogout,
  onReplaceDay,
  onCreateTask,
  onEditTask,
  onDeleteDay,
  onSelectDate,
  onEditorChange,
  onEditorSave,
  onEditorDelete,
  onCloseEditor
}) {
  const isTaskEditorOpen = Boolean(editorMode) && editorMode !== "replace";
  const orderedEditorTasks = localConflict
    ? [
        ...tasks.filter((task) => task.id === localConflict.id),
        ...tasks.filter((task) => task.id === editorForm.id),
        ...tasks.filter((task) => task.id !== localConflict.id && task.id !== editorForm.id)
      ]
    : [
        ...tasks.filter((task) => task.id === editorForm.id),
        ...tasks.filter((task) => task.id !== editorForm.id)
      ];

  return (
    <div className={`screen screen--planner ${editorMode ? "has-editor-open" : ""}`}>
      <div className="planner-canvas">
        <div className="planner-shell">
          <PlannerAside
            selectedDate={selectedDate}
            session={session}
            tasks={tasks}
            onLogout={onLogout}
            onReplaceDay={onReplaceDay}
          />

          <section className="planner-main">
            {isTaskEditorOpen ? (
              <section className="editor-layout">
                <div className="editor-layout__left">
                  <header className="editor-context-header">
                    <h1>Selected day: {formatDisplayDate(selectedDate)}</h1>
                    <p>
                      Editing happens in context so users keep schedule visibility while resolving
                      conflicts.
                    </p>
                  </header>

                  <div className="editor-context-list">
                    {orderedEditorTasks.map((task, index) => {
                      let stateLabel = "Existing task";
                      if (localConflict && task.id === localConflict.id) {
                        stateLabel = "Existing task causing conflict";
                      } else if (task.id === editorForm.id) {
                        stateLabel = "Task being edited";
                      } else if (index === orderedEditorTasks.length - 1) {
                        stateLabel = "Existing afternoon block";
                      }

                      return (
                        <EditorContextTaskCard
                          index={index}
                          key={task.id}
                          onEdit={onEditTask}
                          stateLabel={stateLabel}
                          task={task}
                        />
                      );
                    })}
                  </div>
                </div>

                <DrawerTaskForm
                  editorError={editorError}
                  editorForm={editorForm}
                  editorMode={editorMode}
                  localConflict={localConflict}
                  onClose={onCloseEditor}
                  onDelete={onEditorDelete}
                  onFieldChange={onEditorChange}
                  onSave={onEditorSave}
                  saving={drawerSaving}
                />
              </section>
            ) : (
              <>
                <header className="planner-header">
                  <div>
                    <h1>{formatDisplayDate(selectedDate)}</h1>
                    <p>
                      {tasks.length === 0
                        ? "No tasks yet for this day. You can still add one right away."
                        : `${tasks.length} tasks total, no overlaps, ${summarizeHours(tasks)}.`}
                    </p>
                  </div>

                  <div className="planner-header__actions">
                    <span className="pill pill--gold">{session.user.username}</span>
                    <div className="date-field">
                      <span>Planner day</span>
                      <input onChange={(event) => onSelectDate(event.target.value)} type="date" value={selectedDate} />
                    </div>
                    <button className="button button--primary button--add" onClick={onCreateTask} type="button">
                      + Add Task
                    </button>
                  </div>
                </header>

                {notice ? <div className="banner banner--success">{notice}</div> : null}
                {tasksError ? <div className="banner banner--error">{tasksError}</div> : null}

                <div className="planner-body">
                  <TimelinePanel onEdit={onEditTask} tasks={tasks} tasksLoading={tasksLoading} />

                  <div className="planner-sidecluster">
                    <PlannerRules emptyDay={tasks.length === 0} selectedDate={selectedDate} />
                    <div className="planner-quick-actions">
                      <button className="button button--ghost button--full" onClick={onReplaceDay} type="button">
                        Replace full day
                      </button>
                      <button className="button button--danger button--full" onClick={onDeleteDay} type="button">
                        Delete entire day
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "alice", password: "planner123" });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [session, setSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DAY);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorMode, setEditorMode] = useState(null);
  const [editorForm, setEditorForm] = useState(makeTaskForm(DEFAULT_DAY));
  const [editorError, setEditorError] = useState("");
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [draftRows, setDraftRows] = useState([makeDraftRow(DEFAULT_DAY)]);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return;
    }

    try {
      setSession(JSON.parse(rawSession));
    } catch (_error) {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!session?.token) {
      return undefined;
    }

    let isActive = true;
    setTasksLoading(true);
    setTasksError("");

    getTasksForDay(session.token, selectedDate)
      .then((response) => {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setTasks(response.tasks);
        });
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        if (error.status === 401) {
          handleLogout();
          return;
        }

        setTasksError(error.message);
      })
      .finally(() => {
        if (isActive) {
          setTasksLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [session, selectedDate]);

  function persistSession(nextSession) {
    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  }

  function handleLogout() {
    setSession(null);
    setTasks([]);
    setEditorMode(null);
    setNotice("");
    setAuthError("");
    window.localStorage.removeItem(SESSION_KEY);
  }

  function handleAuthFormChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setNotice("");

    try {
      if (authMode === "register") {
        const response = await registerUser(authForm);
        setAuthMode("login");
        setNotice(`${response.message}. Sign in to open your planner.`);
      } else {
        const response = await loginUser(authForm);
        persistSession({
          token: response.token,
          user: response.user
        });
        setSelectedDate(DEFAULT_DAY);
        setNotice(`Welcome back, ${response.user.username}.`);
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function openCreateDrawer() {
    setEditorMode("create");
    setEditorError("");
    setEditorForm(makeTaskForm(selectedDate));
  }

  function openEditDrawer(task) {
    setEditorMode("edit");
    setEditorError("");
    setEditorForm({
      id: task.id,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      title: task.title,
      notes: task.notes || ""
    });
  }

  function openReplaceDrawer() {
    setEditorMode("replace");
    setDraftError("");
    setDraftRows(buildReplaceDraft(tasks, selectedDate));
  }

  function closeDrawer() {
    setEditorMode(null);
    setEditorError("");
    setDraftError("");
  }

  function handleEditorFieldChange(event) {
    const { name, value } = event.target;
    setEditorForm((current) => ({ ...current, [name]: value }));
  }

  async function refreshDay(message, dateOverride = selectedDate) {
    if (!session?.token) {
      return;
    }

    const response = await getTasksForDay(session.token, dateOverride);
    startTransition(() => {
      setTasks(response.tasks);
    });
    setNotice(message);
  }

  async function handleSaveTask() {
    setDrawerSaving(true);
    setEditorError("");
    setNotice("");

    try {
      const validationError = validateTaskForm(editorForm);
      if (validationError) {
        setEditorError(validationError);
        return;
      }

      if (editorForm.date === selectedDate) {
        const conflict = detectTaskConflict(editorForm, tasks, editorForm.id);
        if (conflict) {
          setEditorError("Task overlaps an existing task for this day.");
          return;
        }
      }

      const payload = {
        date: editorForm.date,
        startTime: editorForm.startTime,
        endTime: editorForm.endTime,
        title: editorForm.title.trim(),
        notes: editorForm.notes.trim()
      };

      if (editorMode === "create") {
        await createTask(session.token, payload);
        if (payload.date !== selectedDate) {
          setSelectedDate(payload.date);
        }
        await refreshDay("Task created successfully.", payload.date);
      } else {
        await updateTask(session.token, editorForm.id, payload);
        if (payload.date !== selectedDate) {
          setSelectedDate(payload.date);
        }
        await refreshDay("Task updated successfully.", payload.date);
      }

      closeDrawer();
    } catch (error) {
      setEditorError(error.message);
    } finally {
      setDrawerSaving(false);
    }
  }

  async function handleDeleteTask() {
    if (!window.confirm("Delete this task from the planner?")) {
      return;
    }

    setDrawerSaving(true);
    setEditorError("");

    try {
      await deleteTask(session.token, editorForm.id);
      await refreshDay("Task deleted successfully.");
      closeDrawer();
    } catch (error) {
      setEditorError(error.message);
    } finally {
      setDrawerSaving(false);
    }
  }

  async function handleDeleteDay() {
    if (!window.confirm(`Delete every task on ${selectedDate}?`)) {
      return;
    }

    setNotice("");
    setTasksError("");

    try {
      await deleteDay(session.token, selectedDate);
      await refreshDay("Day tasks deleted successfully.");
    } catch (error) {
      setTasksError(error.message);
    }
  }

  function handleDraftRowChange(rowId, field, value) {
    setDraftRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  }

  function handleAddDraftRow() {
    setDraftRows((current) => [...current, makeDraftRow(selectedDate)]);
  }

  function handleRemoveDraftRow(rowId) {
    setDraftRows((current) => {
      if (current.length === 1) {
        return [makeDraftRow(selectedDate)];
      }

      return current.filter((row) => row.id !== rowId);
    });
  }

  async function handleReplaceDay() {
    setDrawerSaving(true);
    setDraftError("");
    setNotice("");

    try {
      const { error, tasks: normalizedTasks } = validateDraftRows(
        draftRows.map((row) => ({ ...row, date: selectedDate }))
      );

      if (error) {
        setDraftError(error);
        return;
      }

      await replaceDay(session.token, {
        date: selectedDate,
        tasks: normalizedTasks
      });

      await refreshDay("Day updated successfully.");
      closeDrawer();
    } catch (error) {
      setDraftError(error.message);
    } finally {
      setDrawerSaving(false);
    }
  }

  const localConflict =
    editorMode === "replace" || editorForm.date !== selectedDate
      ? null
      : detectTaskConflict(editorForm, tasks, editorForm.id);

  if (!session) {
    return (
      <AuthView
        authBusy={authBusy}
        authError={authError}
        authForm={authForm}
        authMode={authMode}
        notice={notice}
        onAuthFormChange={handleAuthFormChange}
        onAuthModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="planner-stage">
      <PlannerStage
        drawerSaving={drawerSaving}
        editorError={editorError}
        editorForm={editorForm}
        editorMode={editorMode}
        localConflict={localConflict}
        notice={notice}
        onCreateTask={openCreateDrawer}
        onDeleteDay={handleDeleteDay}
        onEditorChange={handleEditorFieldChange}
        onEditorDelete={handleDeleteTask}
        onEditorSave={handleSaveTask}
        onEditTask={openEditDrawer}
        onLogout={handleLogout}
        onCloseEditor={closeDrawer}
        onReplaceDay={openReplaceDrawer}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        session={session}
        tasks={tasks}
        tasksError={tasksError}
        tasksLoading={tasksLoading}
      />

      {editorMode === "replace" ? (
        <div className="editor-stage">
          <DrawerReplaceDay
            draftError={draftError}
            draftRows={draftRows}
            onAddRow={handleAddDraftRow}
            onChangeRow={handleDraftRowChange}
            onClose={closeDrawer}
            onRemoveRow={handleRemoveDraftRow}
            onSave={handleReplaceDay}
            saving={drawerSaving}
            selectedDate={selectedDate}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
