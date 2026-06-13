import { useState, useEffect, useCallback, useRef } from "react";

// ─── UTILS ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().split("T")[0];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

const GROCERY_CATS = ["Verduras", "Frutas", "Carne", "Pescado", "Lácteos", "Conservas", "Otros"];
const RECIPE_TAGS = ["Batch cooking", "Rápida", "Alta proteína", "Vegetariana", "Favorita"];
const PRIORITY_COLORS = { alta: "#EF4444", media: "#F59E0B", baja: "#6B7280" };
const PRIORITY_LABELS = { alta: "Alta", media: "Media", baja: "Baja" };

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

// ─── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED_RECIPES = [
  { id: uid(), name: "Pollo al horno con verduras", photo: "", ingredients: [{ name: "Pechuga de pollo", amount: "600g", category: "Carne" }, { name: "Pimiento rojo", amount: "2 unidades", category: "Verduras" }, { name: "Calabacín", amount: "1 unidad", category: "Verduras" }, { name: "Aceite de oliva", amount: "3 cucharadas", category: "Otros" }], steps: ["Precalentar el horno a 200°C.", "Cortar verduras en trozos y salpimentar el pollo.", "Hornear 35 minutos hasta dorar."], time: 45, servings: 4, tags: ["Batch cooking", "Alta proteína"] },
  { id: uid(), name: "Arroz integral con legumbres", photo: "", ingredients: [{ name: "Arroz integral", amount: "300g", category: "Conservas" }, { name: "Garbanzos cocidos", amount: "400g", category: "Conservas" }, { name: "Cúrcuma", amount: "1 cucharadita", category: "Otros" }, { name: "Caldo de verduras", amount: "600ml", category: "Otros" }], steps: ["Sofreír especias 2 min.", "Añadir arroz y caldo.", "Cocer 35 min tapado. Añadir garbanzos al final."], time: 40, servings: 4, tags: ["Batch cooking", "Vegetariana"] },
  { id: uid(), name: "Tortilla de espinacas", photo: "", ingredients: [{ name: "Huevos", amount: "6 unidades", category: "Lácteos" }, { name: "Espinacas frescas", amount: "200g", category: "Verduras" }, { name: "Cebolla", amount: "1 unidad", category: "Verduras" }], steps: ["Sofreír cebolla y espinacas.", "Batir huevos, mezclar y cuajar a fuego medio."], time: 20, servings: 3, tags: ["Rápida", "Vegetariana"] },
];

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 20, style = {} }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />,
    check: <><path d="M20 6L9 17l-5-5" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
    cooking: <><path d="M12 2a7 7 0 00-7 7c0 2.4 1.2 4.5 3 5.7V17h8v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 00-7-7z" /><path d="M10 17v2a2 2 0 004 0v-2" /></>,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    chevronRight: <polyline points="9 18 15 12 9 6" />,
    refresh: <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {icons[name]}
    </svg>
  );
};

// ─── CIRCULAR PROGRESS ────────────────────────────────────────────────────────
function CircularProgress({ value, size = 64, label, color = "#6366F1" }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{value}%</span>
        {label && <span style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ label, color = "#6366F1", size = "sm" }) {
  const pad = size === "sm" ? "2px 8px" : "4px 12px";
  const fs = size === "sm" ? 11 : 12;
  return (
    <span style={{ background: color + "22", color, borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--card)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 720 : 480, maxHeight: "92vh", overflow: "auto", padding: "24px 20px 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "var(--border)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── INPUT / SELECT ───────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, background: "var(--bg)", color: "var(--text)", outline: "none", boxSizing: "border-box" };
const btn = (variant = "primary") => ({
  padding: "10px 20px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
  background: variant === "primary" ? "#6366F1" : variant === "danger" ? "#EF4444" : "var(--border)",
  color: variant === "ghost" ? "var(--text)" : "#fff",
});

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onEdit }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => onToggle(task.id)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: `2px solid ${task.done ? "#6366F1" : "var(--border-strong)"}`, background: task.done ? "#6366F1" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {task.done && <Icon name="check" size={12} style={{ color: "#fff" }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--text-muted)" : "var(--text)", lineHeight: 1.4 }}>{task.title}</p>
        {task.desc && <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{task.desc}</p>}
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <Badge label={PRIORITY_LABELS[task.priority]} color={PRIORITY_COLORS[task.priority]} />
          {task.category !== "today" && <Badge label={task.category === "week" ? "Esta semana" : "Mes"} color="#8B5CF6" />}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button onClick={() => onEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><Icon name="edit" size={15} /></button>
        <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><Icon name="trash" size={15} /></button>
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
      <input style={inp} placeholder="Nombre de la tarea" value={form.title} onChange={e => s("title")(e.target.value)} />
      <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} placeholder="Descripción (opcional)" value={form.desc} onChange={e => s("desc")(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Prioridad</label>
          <select style={inp} value={form.priority} onChange={e => s("priority")(e.target.value)}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Categoría</label>
          <select style={inp} value={form.category} onChange={e => s("category")(e.target.value)}>
            <option value="today">Hoy</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button style={btn("ghost")} onClick={onClose}>Cancelar</button>
        <button style={btn()} onClick={() => { if (form.title.trim()) { onSave({ ...form, id: form.id || uid(), done: form.done || false, createdAt: form.createdAt || Date.now() }); onClose(); } }}>Guardar</button>
      </div>
    </div>
  );
}

// ─── RECIPE FORM ──────────────────────────────────────────────────────────────
function RecipeForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", photo: "", ingredients: [], steps: [], time: 30, servings: 4, tags: [] });
  const [newIng, setNewIng] = useState({ name: "", amount: "", category: "Otros" });
  const [newStep, setNewStep] = useState("");
  const s = k => v => setForm(p => ({ ...p, [k]: v }));

  const addIng = () => {
    if (newIng.name && newIng.amount) {
      setForm(p => ({ ...p, ingredients: [...p.ingredients, { ...newIng }] }));
      setNewIng({ name: "", amount: "", category: "Otros" });
    }
  };
  const addStep = () => {
    if (newStep.trim()) {
      setForm(p => ({ ...p, steps: [...p.steps, newStep.trim()] }));
      setNewStep("");
    }
  };
  const toggleTag = t => setForm(p => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter(x => x !== t) : [...p.tags, t] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input style={inp} placeholder="Nombre de la receta" value={form.name} onChange={e => s("name")(e.target.value)} />
      <input style={inp} placeholder="URL de foto (opcional)" value={form.photo} onChange={e => s("photo")(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Tiempo (min)</label>
          <input style={inp} type="number" value={form.time} onChange={e => s("time")(+e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Raciones</label>
          <input style={inp} type="number" value={form.servings} onChange={e => s("servings")(+e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>Etiquetas</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {RECIPE_TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)} style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${form.tags.includes(t) ? "#6366F1" : "var(--border)"}`, background: form.tags.includes(t) ? "#6366F133" : "transparent", color: form.tags.includes(t) ? "#6366F1" : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{t}</button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>Ingredientes</label>
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ flex: 1, fontSize: 13 }}>{ing.amount} {ing.name}</span>
            <Badge label={ing.category} color="#8B5CF6" />
            <button onClick={() => setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><Icon name="x" size={14} /></button>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 6, marginTop: 8 }}>
          <input style={inp} placeholder="Ingrediente" value={newIng.name} onChange={e => setNewIng(p => ({ ...p, name: e.target.value }))} />
          <input style={inp} placeholder="Cantidad" value={newIng.amount} onChange={e => setNewIng(p => ({ ...p, amount: e.target.value }))} />
          <select style={inp} value={newIng.category} onChange={e => setNewIng(p => ({ ...p, category: e.target.value }))}>
            {GROCERY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addIng} style={{ ...btn(), padding: "10px 12px" }}><Icon name="plus" size={16} /></button>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>Pasos</label>
        {form.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
            <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "#6366F1", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 13, lineHeight: 1.5, paddingTop: 3 }}>{step}</span>
            <button onClick={() => setForm(p => ({ ...p, steps: p.steps.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><Icon name="x" size={14} /></button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Añadir paso..." value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === "Enter" && addStep()} />
          <button onClick={addStep} style={{ ...btn(), padding: "10px 12px" }}><Icon name="plus" size={16} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button style={btn("ghost")} onClick={onClose}>Cancelar</button>
        <button style={btn()} onClick={() => { if (form.name.trim()) { onSave({ ...form, id: form.id || uid() }); onClose(); } }}>Guardar receta</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ tasks, mealPlan, recipes }) {
  const todayTasks = tasks.filter(t => t.category === "today");
  const doneTodayCount = todayTasks.filter(t => t.done).length;
  const todayPct = todayTasks.length ? Math.round((doneTodayCount / todayTasks.length) * 100) : 0;
  const weekTasks = tasks.filter(t => t.category === "week");
  const doneWeekCount = weekTasks.filter(t => t.done).length;
  const weekPct = weekTasks.length ? Math.round((doneWeekCount / weekTasks.length) * 100) : 0;
  const monthTasks = tasks.filter(t => t.category === "month");
  const doneMonthCount = monthTasks.filter(t => t.done).length;
  const monthPct = monthTasks.length ? Math.round((doneMonthCount / monthTasks.length) * 100) : 0;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayMeals = mealPlan[todayIdx] || {};
  const getRecipe = id => recipes.find(r => r.id === id);
  const pendingHigh = todayTasks.filter(t => !t.done && t.priority === "alta");

  const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", textTransform: "capitalize" }}>{dateStr}</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Buenos días 👋</h1>
      </div>

      {/* Progress rings */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "20px 16px", marginBottom: 16, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={todayPct} size={72} label="Hoy" color="#6366F1" />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{doneTodayCount}/{todayTasks.length} tareas</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={weekPct} size={72} label="Semana" color="#8B5CF6" />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{doneWeekCount}/{weekTasks.length} tareas</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={monthPct} size={72} label="Mes" color="#06B6D4" />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{doneMonthCount}/{monthTasks.length} tareas</p>
        </div>
      </div>

      {/* High priority today */}
      {pendingHigh.length > 0 && (
        <div style={{ background: "#EF444422", borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: "1px solid #EF444433" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon name="zap" size={14} style={{ color: "#EF4444" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>URGENTE HOY</span>
          </div>
          {pendingHigh.slice(0, 2).map(t => (
            <p key={t.id} style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500, color: "var(--text)" }}>· {t.title}</p>
          ))}
          {pendingHigh.length > 2 && <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>+{pendingHigh.length - 2} más</p>}
        </div>
      )}

      {/* Today's meals */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Icon name="cooking" size={16} style={{ color: "#F59E0B" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Comidas de hoy</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {["lunch", "dinner"].map(meal => {
            const r = getRecipe(todayMeals[meal]);
            return (
              <div key={meal} style={{ background: "var(--bg)", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{meal === "lunch" ? "COMIDA" : "CENA"}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{r ? r.name : <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Sin planificar</span>}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending tasks today */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Icon name="list" size={16} style={{ color: "#6366F1" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Pendiente hoy</span>
        </div>
        {todayTasks.filter(t => !t.done).slice(0, 5).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_COLORS[t.priority], flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, flex: 1 }}>{t.title}</p>
          </div>
        ))}
        {todayTasks.filter(t => !t.done).length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>¡Todo completado! 🎉</p>
        )}
        {todayTasks.filter(t => !t.done).length > 5 && (
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>+{todayTasks.filter(t => !t.done).length - 5} más...</p>
        )}
      </div>
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({ tasks, setTasks }) {
  const [tab, setTab] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const tabs = [{ key: "today", label: "Hoy" }, { key: "week", label: "Semana" }, { key: "month", label: "Mes" }];
  const visible = tasks.filter(t => t.category === tab);
  const pending = visible.filter(t => !t.done);
  const done = visible.filter(t => t.done);

  const saveTask = task => setTasks(p => p.find(x => x.id === task.id) ? p.map(x => x.id === task.id ? task : x) : [...p, task]);
  const toggleTask = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Tareas</h1>
        <button onClick={() => { setEditTask(null); setModalOpen(true); }} style={{ ...btn(), padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={16} /> Nueva
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--border)", borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", background: tab === t.key ? "var(--card)" : "transparent", color: tab === t.key ? "var(--text)" : "var(--text-muted)", fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", fontSize: 14, transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "var(--card)", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>PENDIENTES</p>
          <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700 }}>{pending.length}</p>
        </div>
        <div style={{ background: "var(--card)", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>COMPLETADAS</p>
          <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#10B981" }}>{done.length}</p>
        </div>
      </div>

      {/* Task list */}
      {pending.length === 0 && done.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <Icon name="check" size={40} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>No hay tareas aún</p>
        </div>
      )}

      {pending.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={t => { setEditTask(t); setModalOpen(true); }} />)}

      {done.length > 0 && (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 16, marginBottom: 8 }}>COMPLETADAS</p>
          {done.map(t => <TaskCard key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={t => { setEditTask(t); setModalOpen(true); }} />)}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? "Editar tarea" : "Nueva tarea"}>
        <TaskForm initial={editTask} onSave={saveTask} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

// ─── MEAL PLANNER ─────────────────────────────────────────────────────────────
function MealPlanner({ mealPlan, setMealPlan, recipes }) {
  const [picking, setPicking] = useState(null); // { dayIdx, meal }
  const [search, setSearch] = useState("");

  const assign = recipeId => {
    setMealPlan(p => {
      const next = { ...p };
      if (!next[picking.dayIdx]) next[picking.dayIdx] = {};
      next[picking.dayIdx] = { ...next[picking.dayIdx], [picking.meal]: recipeId };
      return next;
    });
    setPicking(null);
  };

  const clear = (dayIdx, meal) => setMealPlan(p => {
    const next = { ...p };
    if (next[dayIdx]) { const d = { ...next[dayIdx] }; delete d[meal]; next[dayIdx] = d; }
    return next;
  });

  const getRecipe = id => recipes.find(r => r.id === id);
  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: 32 }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 24, fontWeight: 700 }}>Planificador</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map((day, i) => {
          const meals = mealPlan[i] || {};
          return (
            <div key={i} style={{ background: "var(--card)", borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{day}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["lunch", "dinner"].map(meal => {
                  const r = getRecipe(meals[meal]);
                  return (
                    <div key={meal} style={{ background: "var(--bg)", borderRadius: 10, padding: "8px 10px", minHeight: 56, position: "relative" }}>
                      <p style={{ margin: 0, fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{meal === "lunch" ? "COMIDA" : "CENA"}</p>
                      {r ? (
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{r.name}</p>
                          <button onClick={() => clear(i, meal)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, fontSize: 11, marginTop: 4 }}>quitar</button>
                        </div>
                      ) : (
                        <button onClick={() => { setPicking({ dayIdx: i, meal }); setSearch(""); }} style={{ background: "none", border: "1.5px dashed var(--border-strong)", borderRadius: 8, padding: "4px 8px", fontSize: 12, color: "var(--text-muted)", cursor: "pointer", width: "100%" }}>
                          + asignar
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

      <Modal open={!!picking} onClose={() => setPicking(null)} title={`Asignar receta — ${picking ? (picking.meal === "lunch" ? "Comida" : "Cena") : ""}`}>
        <input style={{ ...inp, marginBottom: 12 }} placeholder="Buscar receta..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
          {filtered.map(r => (
            <button key={r.id} onClick={() => assign(r.id)} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", textAlign: "left", cursor: "pointer", color: "var(--text)" }}>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{r.name}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}><Icon name="clock" size={11} style={{ display: "inline", verticalAlign: -1 }} /> {r.time} min · {r.servings} raciones</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>Sin resultados</p>}
        </div>
      </Modal>
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

  const filtered = recipes.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || r.tags.includes(filter);
    return matchSearch && matchFilter;
  });

  const saveRecipe = r => setRecipes(p => p.find(x => x.id === r.id) ? p.map(x => x.id === r.id ? r : x) : [...p, r]);
  const deleteRecipe = id => { setRecipes(p => p.filter(r => r.id !== id)); setViewRecipe(null); };

  const tagColors = { "Batch cooking": "#6366F1", "Rápida": "#10B981", "Alta proteína": "#F59E0B", "Vegetariana": "#22C55E", "Favorita": "#EF4444" };

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Recetas</h1>
        <button onClick={() => { setEditRecipe(null); setModalOpen(true); }} style={{ ...btn(), padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={16} /> Nueva
        </button>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input style={{ ...inp, paddingLeft: 38 }} placeholder="Buscar recetas..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        <button onClick={() => setFilter("")} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${!filter ? "#6366F1" : "var(--border)"}`, background: !filter ? "#6366F133" : "transparent", color: !filter ? "#6366F1" : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>Todas</button>
        {RECIPE_TAGS.map(t => (
          <button key={t} onClick={() => setFilter(f => f === t ? "" : t)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${filter === t ? tagColors[t] : "var(--border)"}`, background: filter === t ? tagColors[t] + "22" : "transparent", color: filter === t ? tagColors[t] : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <Icon name="book" size={40} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>No hay recetas</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => (
          <button key={r.id} onClick={() => setViewRecipe(r)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", textAlign: "left", cursor: "pointer", color: "var(--text)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: r.photo ? "none" : "var(--border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {r.photo ? <img src={r.photo} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <Icon name="book" size={22} style={{ color: "var(--text-muted)", opacity: 0.5 }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{r.name}</p>
              <p style={{ margin: "3px 0 6px", fontSize: 12, color: "var(--text-muted)" }}>{r.time} min · {r.servings} raciones · {r.ingredients.length} ingredientes</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {r.tags.slice(0, 2).map(t => <Badge key={t} label={t} color={tagColors[t]} />)}
              </div>
            </div>
            <Icon name="chevronRight" size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* View recipe modal */}
      <Modal open={!!viewRecipe} onClose={() => setViewRecipe(null)} title={viewRecipe?.name || ""}>
        {viewRecipe && (
          <div>
            {viewRecipe.photo && <img src={viewRecipe.photo} alt={viewRecipe.name} style={{ width: "100%", borderRadius: 10, marginBottom: 14, maxHeight: 200, objectFit: "cover" }} />}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={14} /> {viewRecipe.time} min</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="users" size={14} /> {viewRecipe.servings} raciones</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {viewRecipe.tags.map(t => <Badge key={t} label={t} color={tagColors[t]} />)}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ingredientes</h3>
            {viewRecipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                <span>{ing.name}</span>
                <span style={{ color: "var(--text-muted)" }}>{ing.amount}</span>
              </div>
            ))}
            <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 10 }}>Preparación</h3>
            {viewRecipe.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, paddingTop: 4 }}>{step}</p>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button style={btn("danger")} onClick={() => deleteRecipe(viewRecipe.id)}>Eliminar</button>
              <button style={btn()} onClick={() => { setEditRecipe(viewRecipe); setViewRecipe(null); setModalOpen(true); }}>Editar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRecipe ? "Editar receta" : "Nueva receta"} wide>
        <RecipeForm initial={editRecipe} onSave={saveRecipe} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

// ─── BATCH COOKING ────────────────────────────────────────────────────────────
function BatchCooking({ mealPlan, recipes }) {
  const [checklist, setChecklist] = useLocalStorage("batch_checklist", {});

  const allRecipeIds = [...new Set(Object.values(mealPlan).flatMap(d => [d.lunch, d.dinner].filter(Boolean)))];
  const plannedRecipes = allRecipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);

  const allIngredients = {};
  plannedRecipes.forEach(r => {
    r.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase();
      if (!allIngredients[key]) allIngredients[key] = { ...ing, count: 0 };
      allIngredients[key].count += 1;
    });
  });
  const byCategory = {};
  Object.values(allIngredients).forEach(ing => {
    const cat = ing.category || "Otros";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(ing);
  });

  const batchRecipes = plannedRecipes.filter(r => r.tags.includes("Batch cooking"));
  const quickRecipes = plannedRecipes.filter(r => !r.tags.includes("Batch cooking"));

  const toggleCheck = key => setChecklist(p => ({ ...p, [key]: !p[key] }));
  const resetChecklist = () => setChecklist({});

  const taskItems = [
    ...batchRecipes.map(r => ({ id: `prep_${r.id}`, label: `Preparar: ${r.name}`, type: "batch" })),
    ...quickRecipes.map(r => ({ id: `cook_${r.id}`, label: `Cocinar: ${r.name}`, type: "quick" })),
  ];
  const doneCount = taskItems.filter(t => checklist[t.id]).length;

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Batch cooking</h1>
        <button onClick={resetChecklist} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <Icon name="refresh" size={14} /> Reiniciar
        </button>
      </div>

      {plannedRecipes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <Icon name="calendar" size={40} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>Planifica comidas primero para generar tu plan</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div style={{ background: "var(--card)", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Progreso del domingo</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{doneCount}/{taskItems.length}</span>
            </div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${taskItems.length ? (doneCount / taskItems.length) * 100 : 0}%`, background: "#6366F1", borderRadius: 4, transition: "width .4s ease" }} />
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: "var(--card)", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>LISTA DE TAREAS</p>
            {taskItems.map(task => (
              <div key={task.id} onClick={() => toggleCheck(task.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checklist[task.id] ? "#6366F1" : "var(--border-strong)"}`, background: checklist[task.id] ? "#6366F1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checklist[task.id] && <Icon name="check" size={13} style={{ color: "#fff" }} />}
                </div>
                <span style={{ fontSize: 14, textDecoration: checklist[task.id] ? "line-through" : "none", color: checklist[task.id] ? "var(--text-muted)" : "var(--text)" }}>{task.label}</span>
                <Badge label={task.type === "batch" ? "Batch" : "Normal"} color={task.type === "batch" ? "#6366F1" : "#10B981"} />
              </div>
            ))}
          </div>

          {/* Ingredients by category */}
          <div style={{ background: "var(--card)", borderRadius: 14, padding: "16px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>INGREDIENTES NECESARIOS</p>
            {Object.entries(byCategory).map(([cat, ings]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{cat}</p>
                {ings.map(ing => (
                  <div key={ing.name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                    <span>{ing.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>{ing.amount}</span>
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

  const allRecipeIds = [...new Set(Object.values(mealPlan).flatMap(d => [d.lunch, d.dinner].filter(Boolean)))];
  const plannedRecipes = allRecipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean);

  const autoItems = {};
  plannedRecipes.forEach(r => {
    r.ingredients.forEach(ing => {
      const key = `${ing.category}__${ing.name}`;
      if (!autoItems[key]) autoItems[key] = { ...ing, sources: [] };
      autoItems[key].sources.push(r.name);
    });
  });

  const byCategory = {};
  [...Object.entries(autoItems).map(([k, v]) => ({ ...v, key: k, isAuto: true })), ...extra.map(e => ({ ...e, isAuto: false }))].forEach(item => {
    const cat = item.category || "Otros";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  const catColors = { Verduras: "#22C55E", Frutas: "#F59E0B", Carne: "#EF4444", Pescado: "#06B6D4", Lácteos: "#8B5CF6", Conservas: "#6366F1", Otros: "#6B7280" };
  const toggleCheck = key => setChecked(p => ({ ...p, [key]: !p[key] }));
  const addExtra = () => {
    if (newItem.trim()) { setExtra(p => [...p, { name: newItem.trim(), amount: "", category: newCat, key: uid() }]); setNewItem(""); }
  };
  const removeExtra = key => setExtra(p => p.filter(e => e.key !== key));
  const totalItems = Object.values(byCategory).flat().length;
  const doneItems = Object.values(byCategory).flat().filter(i => checked[i.key || `${i.category}__${i.name}`]).length;
  const resetAll = () => setChecked({});

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>La compra</h1>
        <button onClick={resetAll} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <Icon name="refresh" size={14} /> Reiniciar
        </button>
      </div>

      {/* Progress */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <CircularProgress value={totalItems ? Math.round((doneItems / totalItems) * 100) : 0} size={56} color="#10B981" />
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{doneItems} de {totalItems} productos</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{totalItems - doneItems} pendientes</p>
        </div>
      </div>

      {/* Add extra item */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>Añadir producto</p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8 }}>
          <input style={inp} placeholder="Producto..." value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addExtra()} />
          <select style={inp} value={newCat} onChange={e => setNewCat(e.target.value)}>
            {GROCERY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addExtra} style={{ ...btn(), padding: "10px 12px" }}><Icon name="plus" size={16} /></button>
        </div>
      </div>

      {Object.keys(byCategory).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          <Icon name="cart" size={40} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>Planifica comidas para generar la lista automáticamente</p>
        </div>
      )}

      {GROCERY_CATS.filter(c => byCategory[c]).map(cat => {
        const items = byCategory[cat] || [];
        const color = catColors[cat];
        return (
          <div key={cat} style={{ background: "var(--card)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>{cat}</p>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{items.filter(i => checked[i.key || `${i.category}__${i.name}`]).length}/{items.length}</span>
            </div>
            {items.map(item => {
              const key = item.key || `${item.category}__${item.name}`;
              const isDone = checked[key];
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <button onClick={() => toggleCheck(key)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isDone ? color : "var(--border-strong)"}`, background: isDone ? color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isDone && <Icon name="check" size={12} style={{ color: "#fff" }} />}
                  </button>
                  <span style={{ flex: 1, fontSize: 14, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--text-muted)" : "var(--text)" }}>{item.name}</span>
                  {item.amount && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.amount}</span>}
                  {!item.isAuto && <button onClick={() => removeExtra(item.key)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}><Icon name="x" size={14} /></button>}
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
  { key: "dashboard", label: "Inicio", icon: "home" },
  { key: "tasks", label: "Tareas", icon: "list" },
  { key: "meals", label: "Comidas", icon: "calendar" },
  { key: "recipes", label: "Recetas", icon: "book" },
  { key: "batch", label: "Batch", icon: "cooking" },
  { key: "grocery", label: "Compra", icon: "cart" },
];

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage("dark_mode", false);
  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [recipes, setRecipes] = useLocalStorage("recipes", SEED_RECIPES);
  const [mealPlan, setMealPlan] = useLocalStorage("meal_plan", {});

  const colors = darkMode ? {
    "--bg": "#0F0F10", "--card": "#1C1C1E", "--text": "#F5F5F7", "--text-muted": "#8A8A8E",
    "--border": "#2C2C2E", "--border-strong": "#48484A",
  } : {
    "--bg": "#F2F2F7", "--card": "#FFFFFF", "--text": "#1C1C1E", "--text-muted": "#6E6E73",
    "--border": "#E5E5EA", "--border-strong": "#C7C7CC",
  };

  return (
    <div style={{ ...Object.fromEntries(Object.entries(colors)), fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="zap" size={15} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>Foco</span>
        </div>
        <button onClick={() => setDarkMode(d => !d)} style={{ background: "var(--border)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
          <Icon name={darkMode ? "sun" : "moon"} size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 16px 100px", maxWidth: 540, margin: "0 auto", width: "100%" }}>
        {tab === "dashboard" && <Dashboard tasks={tasks} mealPlan={mealPlan} recipes={recipes} />}
        {tab === "tasks" && <Tasks tasks={tasks} setTasks={setTasks} />}
        {tab === "meals" && <MealPlanner mealPlan={mealPlan} setMealPlan={setMealPlan} recipes={recipes} />}
        {tab === "recipes" && <Recipes recipes={recipes} setRecipes={setRecipes} />}
        {tab === "batch" && <BatchCooking mealPlan={mealPlan} recipes={recipes} />}
        {tab === "grocery" && <GroceryList mealPlan={mealPlan} recipes={recipes} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-around", padding: "8px 4px 20px", zIndex: 50 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: tab === t.key ? "#6366F1" : "var(--text-muted)", padding: "4px 8px", borderRadius: 10, transition: "color .15s", minWidth: 44 }}>
            <Icon name={t.icon} size={22} />
            <span style={{ fontSize: 10, fontWeight: tab === t.key ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
