import { useState, useCallback } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const GROCERY_CATS = ["Verduras", "Frutas", "Carne", "Pescado", "Lácteos", "Conservas", "Otros"];
const RECIPE_TAGS = ["Batch cooking", "Rápida", "Alta proteína", "Vegetariana", "Favorita"];

const PRIORITY = {
  alta:  { label: "Alta",  color: "#FF6B6B", bg: "#FFF0F0", emoji: "🔴" },
  media: { label: "Media", color: "#FFA94D", bg: "#FFF7F0", emoji: "🟡" },
  baja:  { label: "Baja",  color: "#74C69D", bg: "#F0FFF8", emoji: "🟢" },
};

const CAT_COLORS = {
  Verduras: "#74C69D", Frutas: "#FFA94D", Carne: "#FF6B6B",
  Pescado: "#4DABF7", Lácteos: "#CC5DE8", Conservas: "#748FFC", Otros: "#A8A8B3",
};

const TAG_COLORS = {
  "Batch cooking": "#748FFC", "Rápida": "#74C69D", "Alta proteína": "#FFA94D",
  "Vegetariana": "#74C69D", "Favorita": "#FF6B6B",
};

const SECTION_EMOJIS = { today: "☀️", week: "📅", month: "🎯" };

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; }
    catch { return init; }
  });
  const set = useCallback(v => setVal(prev => {
    const next = typeof v === "function" ? v(prev) : v;
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }), [key]);
  return [val, set];
}

const SEED_RECIPES = [
  { id: uid(), name: "Pollo al horno con verduras 🍗", photo: "", ingredients: [{ name: "Pechuga de pollo", amount: "600g", category: "Carne" }, { name: "Pimiento rojo", amount: "2 uds", category: "Verduras" }, { name: "Calabacín", amount: "1 ud", category: "Verduras" }, { name: "Aceite de oliva", amount: "3 cdas", category: "Otros" }], steps: ["Precalentar el horno a 200°C.", "Cortar verduras y salpimentar el pollo.", "Hornear 35 minutos hasta dorar."], time: 45, servings: 4, tags: ["Batch cooking", "Alta proteína"] },
  { id: uid(), name: "Arroz integral con garbanzos 🫘", photo: "", ingredients: [{ name: "Arroz integral", amount: "300g", category: "Conservas" }, { name: "Garbanzos cocidos", amount: "400g", category: "Conservas" }, { name: "Cúrcuma", amount: "1 cdta", category: "Otros" }, { name: "Caldo de verduras", amount: "600ml", category: "Otros" }], steps: ["Sofreír especias 2 min.", "Añadir arroz y caldo.", "Cocer 35 min tapado."], time: 40, servings: 4, tags: ["Batch cooking", "Vegetariana"] },
  { id: uid(), name: "Tortilla de espinacas 🥚", photo: "", ingredients: [{ name: "Huevos", amount: "6 uds", category: "Lácteos" }, { name: "Espinacas frescas", amount: "200g", category: "Verduras" }, { name: "Cebolla", amount: "1 ud", category: "Verduras" }], steps: ["Sofreír cebolla y espinacas.", "Batir huevos, mezclar y cuajar."], time: 20, servings: 3, tags: ["Rápida", "Vegetariana"] },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: "#fff", borderRadius: 20, padding: "16px 18px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 12, ...extra,
});
const pill = (bg, color, extra = {}) => ({
  background: bg, color, borderRadius: 999, padding: "4px 12px",
  fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, ...extra,
});
const inp = {
  width: "100%", padding: "12px 16px", border: "2px solid #F0F0F5",
  borderRadius: 14, fontSize: 14, background: "#FAFAFA", color: "#1a1a2e",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const btnPrimary = (color = "#748FFC") => ({
  background: color, color: "#fff", border: "none", borderRadius: 14,
  padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
});
const btnGhost = {
  background: "#F0F0F5", color: "#666", border: "none", borderRadius: 14,
  padding: "12px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
};

// ─── ICON ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const p = {
    home: "M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9",
    check: "M20 6L9 17l-5-5",
    plus: "M12 5v14M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z",
    x: "M18 6L6 18M6 6l12 12",
    search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
    chevronRight: "M9 18l6-6-6-6",
    refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
    clock: "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    cart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={p[name]} />
    </svg>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto", padding: "24px 20px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#F0F0F5", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="x" size={16} color="#666" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function MonthCalendar({ tasks }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  const doneByDay = {};
  const pendingByDay = {};
  tasks.forEach(t => {
    if (!t.createdAt) return;
    const d = new Date(t.createdAt);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (t.done) doneByDay[day] = (doneByDay[day] || 0) + 1;
      else pendingByDay[day] = (pendingByDay[day] || 0) + 1;
    }
  });

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div style={card()}>
      <p style={{ margin: "0 0 14px", fontWeight: 800, fontSize: 16, color: "#1a1a2e", textTransform: "capitalize" }}>📅 {monthName}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["L","M","X","J","V","S","D"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#A8A8B3", padding: "2px 0" }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const isToday = day === todayDate;
          const hasDone = doneByDay[day] > 0;
          const hasPending = pendingByDay[day] > 0;
          return (
            <div key={day} style={{ textAlign: "center", padding: "6px 2px", borderRadius: 10,
              background: isToday ? "#748FFC" : "transparent", position: "relative" }}>
              <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? "#fff" : "#1a1a2e" }}>{day}</span>
              {(hasDone || hasPending) && (
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
                  {hasDone && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#74C69D" }} />}
                  {hasPending && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFA94D" }} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "#74C69D", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#74C69D" }} /> Completada
        </span>
        <span style={{ fontSize: 11, color: "#FFA94D", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFA94D" }} /> Pendiente
        </span>
      </div>
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const p = PRIORITY[task.priority];
  return (
    <div style={{ ...card(), display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
      <button onClick={() => onToggle(task.id)} style={{
        flexShrink: 0, width: 26, height: 26, borderRadius: "50%", border: "none",
        background: task.done ? "#74C69D" : "#F0F0F5", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
      }}>
        {task.done && <Icon name="check" size={14} color="#fff" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: task.done ? "#A8A8B3" : "#1a1a2e", textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.title}</p>
        {task.desc && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888", lineHeight: 1.4 }}>{task.desc}</p>}
        <div style={{ marginTop: 8 }}>
          <span style={pill(p.bg, p.color)}>{p.emoji} {p.label}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(task)} style={{ background: "#F0F0F5", border: "none", borderRadius: 10, padding: "6px", cursor: "pointer" }}><Icon name="edit" size={14} color="#888" /></button>
        <button onClick={() => onDelete(task.id)} style={{ background: "#FFF0F0", border: "none", borderRadius: 10, padding: "6px", cursor: "pointer" }}><Icon name="trash" size={14} color="#FF6B6B" /></button>
      </div>
    </div>
  );
}

// ─── TASK FORM ────────────────────────────────────────────────────────────────
function TaskForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { title: "", desc: "", priority: "media", category: "today" });
  const s = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input style={inp} placeholder="¿Qué tienes que hacer? ✍️" value={form.title} onChange={e => s("title")(e.target.value)} />
      <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} placeholder="Descripción (opcional)" value={form.desc} onChange={e => s("desc")(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>PRIORIDAD</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(PRIORITY).map(([k, v]) => (
              <button key={k} onClick={() => s("priority")(k)} style={{ ...pill(form.priority === k ? v.bg : "#F0F0F5", form.priority === k ? v.color : "#888"), padding: "8px 14px", border: `2px solid ${form.priority === k ? v.color : "transparent"}`, cursor: "pointer", fontFamily: "inherit", justifyContent: "flex-start" }}>
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>CUÁNDO</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ k: "today", l: "☀️ Hoy" }, { k: "week", l: "📅 Semana" }, { k: "month", l: "🎯 Mes" }].map(({ k, l }) => (
              <button key={k} onClick={() => s("category")(k)} style={{ ...pill(form.category === k ? "#EEF0FF" : "#F0F0F5", form.category === k ? "#748FFC" : "#888"), padding: "8px 14px", border: `2px solid ${form.category === k ? "#748FFC" : "transparent"}`, cursor: "pointer", fontFamily: "inherit", justifyContent: "flex-start" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={{ ...btnGhost, flex: 1 }} onClick={onClose}>Cancelar</button>
        <button style={{ ...btnPrimary(), flex: 1 }} onClick={() => { if (form.title.trim()) { onSave({ ...form, id: form.id || uid(), done: form.done || false, createdAt: form.createdAt || Date.now() }); onClose(); } }}>
          Guardar ✓
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ tasks, mealPlan, recipes }) {
  const todayTasks = tasks.filter(t => t.category === "today");
  const weekTasks = tasks.filter(t => t.category === "week");
  const monthTasks = tasks.filter(t => t.category === "month");
  const pct = (arr) => arr.length ? Math.round((arr.filter(t => t.done).length / arr.length) * 100) : 0;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayMeals = mealPlan[todayIdx] || {};
  const getRecipe = id => recipes.find(r => r.id === id);

  const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  const ProgressBar = ({ value, color, label, count, total }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{count}/{total}</span>
      </div>
      <div style={{ height: 10, background: "#F0F0F5", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 999, transition: "width .5s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#A8A8B3", fontWeight: 600, textTransform: "capitalize" }}>{dateStr}</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#1a1a2e", letterSpacing: -0.5 }}>Buenos días ☀️</h1>
      </div>

      {/* Progress */}
      <div style={card()}>
        <p style={{ margin: "0 0 14px", fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>📊 Tu progreso</p>
        <ProgressBar value={pct(todayTasks)} color="#748FFC" label="☀️ Hoy" count={todayTasks.filter(t=>t.done).length} total={todayTasks.length} />
        <ProgressBar value={pct(weekTasks)} color="#74C69D" label="📅 Semana" count={weekTasks.filter(t=>t.done).length} total={weekTasks.length} />
        <ProgressBar value={pct(monthTasks)} color="#FFA94D" label="🎯 Mes" count={monthTasks.filter(t=>t.done).length} total={monthTasks.length} />
      </div>

      {/* Calendar */}
      <MonthCalendar tasks={tasks} />

      {/* Today meals */}
      <div style={card()}>
        <p style={{ margin: "0 0 12px", fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>🍽️ Comidas de hoy</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["lunch", "dinner"].map(meal => {
            const r = getRecipe(todayMeals[meal]);
            return (
              <div key={meal} style={{ background: meal === "lunch" ? "#FFF7F0" : "#F0F4FF", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: meal === "lunch" ? "#FFA94D" : "#748FFC" }}>{meal === "lunch" ? "🌞 COMIDA" : "🌙 CENA"}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>{r ? r.name : <span style={{ color: "#CCC", fontStyle: "italic", fontWeight: 400 }}>Sin planificar</span>}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent tasks */}
      {todayTasks.filter(t => !t.done && t.priority === "alta").length > 0 && (
        <div style={{ ...card(), background: "#FFF0F0", border: "2px solid #FFD0D0" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 15, color: "#FF6B6B" }}>🔥 Urgente hoy</p>
          {todayTasks.filter(t => !t.done && t.priority === "alta").map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B6B", flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{t.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ tasks, setTasks }) {
  const [tab, setTab] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const tabs = [
    { key: "today", label: "☀️ Hoy" },
    { key: "week", label: "📅 Semana" },
    { key: "month", label: "🎯 Mes" },
  ];
  const visible = tasks.filter(t => t.category === tab);
  const pending = visible.filter(t => !t.done);
  const done = visible.filter(t => t.done);

  const saveTask = t => setTasks(p => p.find(x => x.id === t.id) ? p.map(x => x.id === t.id ? t : x) : [...p, t]);
  const toggleTask = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1a1a2e" }}>Tareas ✅</h1>
        <button onClick={() => { setEditTask(null); setModalOpen(true); }}
          style={{ ...btnPrimary(), borderRadius: 999, padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={16} color="#fff" /> Nueva
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...pill(tab === t.key ? "#748FFC" : "#F0F0F5", tab === t.key ? "#fff" : "#888"),
            padding: "10px 18px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
            fontFamily: "inherit", flexShrink: 0,
          }}>{t.label}</button>
        ))}
      </div>

      {pending.length === 0 && done.length === 0 && (
        <div style={{ ...card(), textAlign: "center", padding: "40px 20px", color: "#A8A8B3" }}>
          <p style={{ fontSize: 40, margin: "0 0 10px" }}>🎉</p>
          <p style={{ fontWeight: 700, fontSize: 16 }}>¡Sin tareas aquí!</p>
          <p style={{ fontSize: 13 }}>Añade una nueva tarea para empezar</p>
        </div>
      )}

      {pending.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={t => { setEditTask(t); setModalOpen(true); }} />)}

      {done.length > 0 && (
        <>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#A8A8B3", margin: "16px 0 8px", letterSpacing: 0.5 }}>COMPLETADAS ✓</p>
          {done.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={t => { setEditTask(t); setModalOpen(true); }} />)}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? "Editar tarea ✏️" : "Nueva tarea ✨"}>
        <TaskForm initial={editTask} onSave={saveTask} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

// ─── MEAL PLANNER ─────────────────────────────────────────────────────────────
function MealPlanner({ mealPlan, setMealPlan, recipes }) {
  const [picking, setPicking] = useState(null);
  const [search, setSearch] = useState("");
  const todayIdx = (new Date().getDay() + 6) % 7;

  const assign = id => {
    setMealPlan(p => {
      const next = { ...p };
      if (!next[picking.dayIdx]) next[picking.dayIdx] = {};
      next[picking.dayIdx] = { ...next[picking.dayIdx], [picking.meal]: id };
      return next;
    });
    setPicking(null);
  };
  const clear = (dayIdx, meal) => setMealPlan(p => {
    const next = { ...p, [dayIdx]: { ...p[dayIdx] } };
    delete next[dayIdx][meal];
    return next;
  });

  const getRecipe = id => recipes.find(r => r.id === id);
  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: 32 }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 900, color: "#1a1a2e" }}>Comidas 🍽️</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map((day, i) => {
          const meals = mealPlan[i] || {};
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{ ...card(), border: isToday ? "2px solid #748FFC" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {isToday && <span style={pill("#EEF0FF", "#748FFC")}>Hoy</span>}
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: isToday ? "#748FFC" : "#1a1a2e" }}>{day}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["lunch", "dinner"].map(meal => {
                  const r = getRecipe(meals[meal]);
                  return (
                    <div key={meal} style={{ background: meal === "lunch" ? "#FFF7F0" : "#F0F4FF", borderRadius: 12, padding: "10px 12px", minHeight: 60 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 800, color: meal === "lunch" ? "#FFA94D" : "#748FFC" }}>{meal === "lunch" ? "🌞 COMIDA" : "🌙 CENA"}</p>
                      {r ? (
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>{r.name}</p>
                          <button onClick={() => clear(i, meal)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B6B", fontSize: 11, fontWeight: 600, padding: 0, marginTop: 4 }}>quitar ×</button>
                        </div>
                      ) : (
                        <button onClick={() => { setPicking({ dayIdx: i, meal }); setSearch(""); }}
                          style={{ background: "transparent", border: `1.5px dashed ${meal === "lunch" ? "#FFA94D" : "#748FFC"}`, borderRadius: 8, padding: "4px 8px", fontSize: 11, color: meal === "lunch" ? "#FFA94D" : "#748FFC", cursor: "pointer", width: "100%", fontFamily: "inherit", fontWeight: 600 }}>
                          + añadir
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!picking} onClose={() => setPicking(null)} title="Elegir receta 🍳">
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input style={inp} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
          {filtered.map(r => (
            <button key={r.id} onClick={() => assign(r.id)} style={{ ...card(), border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🍳</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{r.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#888" }}>{r.time} min · {r.servings} raciones</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ textAlign: "center", color: "#A8A8B3", padding: 20 }}>Sin resultados 🔍</p>}
        </div>
      </Modal>
    </div>
  );
}

// ─── RECIPE FORM ──────────────────────────────────────────────────────────────
function RecipeForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", photo: "", ingredients: [], steps: [], time: 30, servings: 4, tags: [] });
  const [newIng, setNewIng] = useState({ name: "", amount: "", category: "Otros" });
  const [newStep, setNewStep] = useState("");
  const s = k => v => setForm(p => ({ ...p, [k]: v }));
  const addIng = () => { if (newIng.name && newIng.amount) { setForm(p => ({ ...p, ingredients: [...p.ingredients, { ...newIng }] })); setNewIng({ name: "", amount: "", category: "Otros" }); } };
  const addStep = () => { if (newStep.trim()) { setForm(p => ({ ...p, steps: [...p.steps, newStep.trim()] })); setNewStep(""); } };
  const toggleTag = t => setForm(p => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter(x => x !== t) : [...p.tags, t] }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input style={inp} placeholder="Nombre de la receta 🍽️" value={form.name} onChange={e => s("name")(e.target.value)} />
      <input style={inp} placeholder="URL de foto (opcional)" value={form.photo} onChange={e => s("photo")(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>⏱️ TIEMPO (min)</label><input style={inp} type="number" value={form.time} onChange={e => s("time")(+e.target.value)} /></div>
        <div><label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 6 }}>👥 RACIONES</label><input style={inp} type="number" value={form.servings} onChange={e => s("servings")(+e.target.value)} /></div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 8 }}>🏷️ ETIQUETAS</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {RECIPE_TAGS.map(t => {
            const c = TAG_COLORS[t];
            return <button key={t} onClick={() => toggleTag(t)} style={{ ...pill(form.tags.includes(t) ? c + "22" : "#F0F0F5", form.tags.includes(t) ? c : "#888"), padding: "7px 14px", border: `2px solid ${form.tags.includes(t) ? c : "transparent"}`, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>;
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 8 }}>🛒 INGREDIENTES</label>
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, background: "#FAFAFA", borderRadius: 10, padding: "8px 12px" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{ing.amount} {ing.name}</span>
            <span style={pill(CAT_COLORS[ing.category] + "22", CAT_COLORS[ing.category])}>{ing.category}</span>
            <button onClick={() => setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6B6B" }}><Icon name="x" size={14} color="#FF6B6B" /></button>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 6, marginTop: 8 }}>
          <input style={inp} placeholder="Ingrediente" value={newIng.name} onChange={e => setNewIng(p => ({ ...p, name: e.target.value }))} />
          <input style={inp} placeholder="Cantidad" value={newIng.amount} onChange={e => setNewIng(p => ({ ...p, amount: e.target.value }))} />
          <select style={inp} value={newIng.category} onChange={e => setNewIng(p => ({ ...p, category: e.target.value }))}>{GROCERY_CATS.map(c => <option key={c}>{c}</option>)}</select>
          <button onClick={addIng} style={{ ...btnPrimary(), padding: "10px 12px" }}><Icon name="plus" size={16} color="#fff" /></button>
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#888", display: "block", marginBottom: 8 }}>📋 PASOS</label>
        {form.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "#748FFC", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, paddingTop: 5 }}>{step}</span>
            <button onClick={() => setForm(p => ({ ...p, steps: p.steps.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="x" size={14} color="#FF6B6B" /></button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Añadir paso..." value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === "Enter" && addStep()} />
          <button onClick={addStep} style={{ ...btnPrimary(), padding: "10px 12px" }}><Icon name="plus" size={16} color="#fff" /></button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={{ ...btnGhost, flex: 1 }} onClick={onClose}>Cancelar</button>
        <button style={{ ...btnPrimary(), flex: 1 }} onClick={() => { if (form.name.trim()) { onSave({ ...form, id: form.id || uid() }); onClose(); } }}>Guardar receta 🍳</button>
      </div>
    </div>
  );
}

// ─── RECIPES ──────────────────────────────────────────────────────────────────
function Recipes({ recipes, setRecipes }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);
  const [viewRecipe, setViewRecipe] = useState(null);

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) && (!filter || r.tags.includes(filter)));
  const saveRecipe = r => setRecipes(p => p.find(x => x.id === r.id) ? p.map(x => x.id === r.id ? r : x) : [...p, r]);
  const deleteRecipe = id => { setRecipes(p => p.filter(r => r.id !== id)); setViewRecipe(null); };

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1a1a2e" }}>Recetas 📖</h1>
        <button onClick={() => { setEditRecipe(null); setModalOpen(true); }} style={{ ...btnPrimary("#74C69D"), borderRadius: 999, padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={16} color="#fff" /> Nueva
        </button>
      </div>
      <input style={{ ...inp, marginBottom: 12 }} placeholder="🔍 Buscar recetas..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        <button onClick={() => setFilter("")} style={{ ...pill(!filter ? "#748FFC" : "#F0F0F5", !filter ? "#fff" : "#888"), padding: "8px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, fontWeight: 700 }}>Todas</button>
        {RECIPE_TAGS.map(t => {
          const c = TAG_COLORS[t];
          return <button key={t} onClick={() => setFilter(f => f === t ? "" : t)} style={{ ...pill(filter === t ? c : "#F0F0F5", filter === t ? "#fff" : "#888"), padding: "8px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, fontWeight: 700, background: filter === t ? c : "#F0F0F5" }}>{t}</button>;
        })}
      </div>
      {filtered.length === 0 && <div style={{ ...card(), textAlign: "center", padding: "40px 20px" }}><p style={{ fontSize: 40 }}>📖</p><p style={{ color: "#A8A8B3", fontWeight: 700 }}>Sin recetas</p></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => (
          <button key={r.id} onClick={() => setViewRecipe(r)} style={{ ...card(), border: "none", textAlign: "left", cursor: "pointer", display: "flex", gap: 14, alignItems: "center", marginBottom: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F0F4FF", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              {r.photo ? <img src={r.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🍳"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{r.name}</p>
              <p style={{ margin: "4px 0 6px", fontSize: 12, color: "#888" }}>⏱️ {r.time} min · 👥 {r.servings} raciones</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {r.tags.slice(0, 2).map(t => <span key={t} style={pill(TAG_COLORS[t] + "22", TAG_COLORS[t])}>{t}</span>)}
              </div>
            </div>
            <Icon name="chevronRight" size={18} color="#CCC" />
          </button>
        ))}
      </div>

      <Modal open={!!viewRecipe} onClose={() => setViewRecipe(null)} title={viewRecipe?.name || ""}>
        {viewRecipe && (
          <div>
            {viewRecipe.photo && <img src={viewRecipe.photo} alt="" style={{ width: "100%", borderRadius: 14, marginBottom: 14, maxHeight: 200, objectFit: "cover" }} />}
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={pill("#F0F4FF", "#748FFC")}>⏱️ {viewRecipe.time} min</span>
              <span style={pill("#F0FFF8", "#74C69D")}>👥 {viewRecipe.servings} raciones</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {viewRecipe.tags.map(t => <span key={t} style={pill(TAG_COLORS[t] + "22", TAG_COLORS[t])}>{t}</span>)}
            </div>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>🛒 Ingredientes</p>
            {viewRecipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0F0F5", fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>{ing.name}</span>
                <span style={{ color: "#888" }}>{ing.amount}</span>
              </div>
            ))}
            <p style={{ fontWeight: 800, fontSize: 15, marginTop: 16, marginBottom: 12 }}>📋 Preparación</p>
            {viewRecipe.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: "#748FFC", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, paddingTop: 4 }}>{step}</p>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ ...btnGhost, flex: 1 }} onClick={() => deleteRecipe(viewRecipe.id)}>🗑️ Eliminar</button>
              <button style={{ ...btnPrimary(), flex: 1 }} onClick={() => { setEditRecipe(viewRecipe); setViewRecipe(null); setModalOpen(true); }}>✏️ Editar</button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRecipe ? "Editar receta ✏️" : "Nueva receta 🍳"}>
        <RecipeForm initial={editRecipe} onSave={saveRecipe} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

// ─── BATCH COOKING ────────────────────────────────────────────────────────────
function BatchCooking({ mealPlan, recipes }) {
  const [checklist, setChecklist] = useLocalStorage("batch_checklist", {});
  const allIds = [...new Set(Object.values(mealPlan).flatMap(d => [d.lunch, d.dinner].filter(Boolean)))];
  const planned = allIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);
  const batch = planned.filter(r => r.tags.includes("Batch cooking"));
  const normal = planned.filter(r => !r.tags.includes("Batch cooking"));
  const tasks = [...batch.map(r => ({ id: `b_${r.id}`, label: r.name, type: "batch", color: "#748FFC" })), ...normal.map(r => ({ id: `n_${r.id}`, label: r.name, type: "normal", color: "#74C69D" }))];
  const done = tasks.filter(t => checklist[t.id]).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const allIng = {};
  planned.forEach(r => r.ingredients.forEach(ing => { const k = ing.name.toLowerCase(); if (!allIng[k]) allIng[k] = { ...ing }; }));
  const byCategory = {};
  Object.values(allIng).forEach(ing => { const c = ing.category || "Otros"; if (!byCategory[c]) byCategory[c] = []; byCategory[c].push(ing); });

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1a1a2e" }}>Batch 🥘</h1>
        <button onClick={() => setChecklist({})} style={{ ...btnGhost, padding: "8px 14px", fontSize: 12 }}>🔄 Reiniciar</button>
      </div>
      {planned.length === 0 ? (
        <div style={{ ...card(), textAlign: "center", padding: "48px 20px" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>🥘</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e", marginBottom: 6 }}>Planifica primero</p>
          <p style={{ fontSize: 13, color: "#A8A8B3" }}>Asigna recetas en el planificador de comidas para generar tu plan de batch cooking</p>
        </div>
      ) : (
        <>
          <div style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>📊 Progreso del domingo</p>
              <span style={pill("#EEF0FF", "#748FFC")}>{done}/{tasks.length}</span>
            </div>
            <div style={{ height: 12, background: "#F0F0F5", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #748FFC, #74C69D)", borderRadius: 999, transition: "width .4s" }} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#888", textAlign: "right", fontWeight: 600 }}>{pct}% completado</p>
          </div>

          <div style={card()}>
            <p style={{ margin: "0 0 12px", fontWeight: 800, fontSize: 15 }}>✅ Lista de tareas</p>
            {tasks.map(task => (
              <div key={task.id} onClick={() => setChecklist(p => ({ ...p, [task.id]: !p[task.id] }))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #F5F5F5", cursor: "pointer" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${checklist[task.id] ? task.color : "#E0E0E0"}`, background: checklist[task.id] ? task.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                  {checklist[task.id] && <Icon name="check" size={14} color="#fff" />}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: checklist[task.id] ? "line-through" : "none", color: checklist[task.id] ? "#A8A8B3" : "#1a1a2e" }}>{task.label}</span>
                <span style={pill(task.color + "22", task.color)}>{task.type === "batch" ? "🥘 Batch" : "⚡ Rápida"}</span>
              </div>
            ))}
          </div>

          <div style={card()}>
            <p style={{ margin: "0 0 12px", fontWeight: 800, fontSize: 15 }}>🛒 Ingredientes necesarios</p>
            {Object.entries(byCategory).map(([cat, ings]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, color: CAT_COLORS[cat] || "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{cat}</p>
                {ings.map(ing => (
                  <div key={ing.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontWeight: 600 }}>{ing.name}</span>
                    <span style={{ color: "#888" }}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── GROCERY LIST ─────────────────────────────────────────────────────────────
function GroceryList({ mealPlan, recipes }) {
  const [extra, setExtra] = useLocalStorage("grocery_extra", []);
  const [checked, setChecked] = useLocalStorage("grocery_checked", {});
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("Otros");

  const allIds = [...new Set(Object.values(mealPlan).flatMap(d => [d.lunch, d.dinner].filter(Boolean)))];
  const planned = allIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);
  const autoItems = {};
  planned.forEach(r => r.ingredients.forEach(ing => { const k = `${ing.category}__${ing.name}`; if (!autoItems[k]) autoItems[k] = { ...ing, key: k, isAuto: true }; }));
  const allItems = [...Object.values(autoItems), ...extra];
  const byCategory = {};
  allItems.forEach(item => { const c = item.category || "Otros"; if (!byCategory[c]) byCategory[c] = []; byCategory[c].push(item); });
  const total = allItems.length;
  const done = allItems.filter(i => checked[i.key]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1a1a2e" }}>La compra 🛒</h1>
        <button onClick={() => setChecked({})} style={{ ...btnGhost, padding: "8px 14px", fontSize: 12 }}>🔄 Reiniciar</button>
      </div>

      <div style={{ ...card(), background: "linear-gradient(135deg, #748FFC22, #74C69D22)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#748FFC" }}>{pct}%</span>
          <span style={{ fontSize: 9, color: "#888", fontWeight: 700 }}>listo</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>{done} de {total} productos</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{total - done} pendientes</p>
          <div style={{ height: 6, background: "#fff", borderRadius: 999, overflow: "hidden", marginTop: 8, width: 140 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#74C69D", borderRadius: 999 }} />
          </div>
        </div>
      </div>

      <div style={card()}>
        <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 14 }}>➕ Añadir producto</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8 }}>
          <input style={inp} placeholder="Producto..." value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && newItem.trim() && (setExtra(p => [...p, { name: newItem.trim(), amount: "", category: newCat, key: uid(), isAuto: false }]), setNewItem(""))} />
          <select style={inp} value={newCat} onChange={e => setNewCat(e.target.value)}>{GROCERY_CATS.map(c => <option key={c}>{c}</option>)}</select>
          <button onClick={() => { if (newItem.trim()) { setExtra(p => [...p, { name: newItem.trim(), amount: "", category: newCat, key: uid(), isAuto: false }]); setNewItem(""); } }} style={{ ...btnPrimary("#74C69D"), padding: "10px 12px" }}><Icon name="plus" size={16} color="#fff" /></button>
        </div>
      </div>

      {total === 0 && (
        <div style={{ ...card(), textAlign: "center", padding: "48px 20px" }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>🛒</p>
          <p style={{ fontWeight: 800, color: "#1a1a2e", marginBottom: 6 }}>La lista está vacía</p>
          <p style={{ fontSize: 13, color: "#A8A8B3" }}>Planifica comidas para generar la lista automáticamente</p>
        </div>
      )}

      {GROCERY_CATS.filter(c => byCategory[c]).map(cat => {
        const items = byCategory[cat];
        const color = CAT_COLORS[cat] || "#888";
        const catDone = items.filter(i => checked[i.key]).length;
        return (
          <div key={cat} style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color }}>{cat}</p>
              <span style={{ marginLeft: "auto", ...pill(color + "22", color) }}>{catDone}/{items.length}</span>
            </div>
            {items.map(item => {
              const isDone = checked[item.key];
              return (
                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                  <button onClick={() => setChecked(p => ({ ...p, [item.key]: !p[item.key] }))} style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", border: "none", background: isDone ? color : "#F0F0F5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isDone && <Icon name="check" size={14} color="#fff" />}
                  </button>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: isDone ? "line-through" : "none", color: isDone ? "#A8A8B3" : "#1a1a2e" }}>{item.name}</span>
                  {item.amount && <span style={{ fontSize: 12, color: "#888" }}>{item.amount}</span>}
                  {!item.isAuto && <button onClick={() => setExtra(p => p.filter(e => e.key !== item.key))} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="x" size={14} color="#FF6B6B" /></button>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "dashboard", label: "Inicio", emoji: "🏠" },
  { key: "tasks",     label: "Tareas", emoji: "✅" },
  { key: "meals",     label: "Comidas", emoji: "🍽️" },
  { key: "recipes",   label: "Recetas", emoji: "📖" },
  { key: "batch",     label: "Batch",  emoji: "🥘" },
  { key: "grocery",   label: "Compra", emoji: "🛒" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [recipes, setRecipes] = useLocalStorage("recipes", SEED_RECIPES);
  const [mealPlan, setMealPlan] = useLocalStorage("meal_plan", {});

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif", background: "#F5F5FA", color: "#1a1a2e", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F5", padding: "16px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #748FFC, #9775FA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e", letterSpacing: -0.5 }}>Kaizen</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 100px", maxWidth: 540, margin: "0 auto" }}>
        {tab === "dashboard" && <Dashboard tasks={tasks} mealPlan={mealPlan} recipes={recipes} />}
        {tab === "tasks"     && <Tasks tasks={tasks} setTasks={setTasks} />}
        {tab === "meals"     && <MealPlanner mealPlan={mealPlan} setMealPlan={setMealPlan} recipes={recipes} />}
        {tab === "recipes"   && <Recipes recipes={recipes} setRecipes={setRecipes} />}
        {tab === "batch"     && <BatchCooking mealPlan={mealPlan} recipes={recipes} />}
        {tab === "grocery"   && <GroceryList mealPlan={mealPlan} recipes={recipes} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #F0F0F5", display: "flex", justifyContent: "space-around", padding: "10px 4px 24px", zIndex: 50 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", minWidth: 44 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: tab === t.key ? "#EEF0FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background .15s" }}>
              {t.emoji}
            </div>
            <span style={{ fontSize: 10, fontWeight: tab === t.key ? 800 : 500, color: tab === t.key ? "#748FFC" : "#A8A8B3" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
