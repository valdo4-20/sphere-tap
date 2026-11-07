import {migrateJourney,validJourney} from './journeyProgression.js';
import {validWalk,validPoint} from "./walking.js";
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const localTime = (time) => {
  const d = new Date(time);
  return `${dayKey(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export function uid(source = globalThis.crypto) {
  if (source?.randomUUID) return source.randomUUID();
  if (source?.getRandomValues) {
    const bytes = source.getRandomValues(new Uint8Array(16));
    return [...bytes].map((n) => n.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
export const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const money = (cents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const total = (entries) =>
  entries.reduce(
    (s, e) => ({
      count: round(s.count + e.quantity),
      cost:
        s.cost + (typeof e.cost === "number" ? Math.round(e.cost * 100) : 0),
    }),
    { count: 0, cost: 0 },
  );
export const unitLabel = (c) => ({session:"sessão",package:"pacote",gram:"grama",item:"unidade"}[c?.unit] || "unidade");
export const initial = {
  journey: migrateJourney(null),
  version: 2,
  entries: [],
  walks: [],
  categories: [],
  goals: {
    daily: 0,
    budget: 0,
    dailyEnabled: false,
    budgetEnabled: false,
    categoryId: "all",
  },
  displayName: "",
  birthDate: "",
  profile: {type:"icon",value:"user"},
  consent: null,
  achievements: {},
  profileDetails: {bio:"",featured:null},
  careMilestones: {},
  appearance: { palette: "cristal", auraColor: "#b7beca" },
  aura: true,
  intent: "monitor",
  welcomeDone: false,
  days: {},
  purchases: [],
  receipts: [],
  cravings: [],
  pause: null,
  preferences: { tips: true, reminderEnabled: false, reminderTime: "20:00" },
};
const finite = (v, min = 0) => Number.isFinite(v) && v >= min;
const dateValid = (s) =>
  typeof s === "string" && Number.isFinite(new Date(s).getTime());
export const validDay = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && dayKey(new Date(s + "T12:00")) === s;
export function validData(x) {
  if(x?.journey!==undefined&&!validJourney(x.journey))return false;
  if(x?.preferences?.walletBasis!==undefined&&!['purchases','consumption'].includes(x.preferences.walletBasis))return false;
  if(x?.receipts!==undefined&&(!Array.isArray(x.receipts)||!x.receipts.every(r=>isRecord(r)&&typeof r.id==='string'&&validDay(r.date)&&finite(r.amount,0.01)&&r.amount<=1e9&&(r.kind===undefined||['profit','refund','other'].includes(r.kind))&&(r.note===undefined||(typeof r.note==='string'&&r.note.length<=240)))))return false;
  if(x?.appearance?.walkingFigure!==undefined&&!["neutral","feminine","masculine","none"].includes(x.appearance.walkingFigure))return false;
  if(x?.walletBalance!==undefined&&(!isRecord(x.walletBalance)||!finite(x.walletBalance.amount)||x.walletBalance.amount>1e9||!dateValid(x.walletBalance.updatedAt)))return false;
  if(x?.walletReference!==undefined&&(!isRecord(x.walletReference)||!Number.isFinite(x.walletReference.dailyCost)||x.walletReference.dailyCost<0||x.walletReference.dailyCost>1000000||!validDay(x.walletReference.start)||x.walletReference.start<"2000-01-01"||x.walletReference.start>dayKey()))return false;
  if(x?.walks!==undefined&&(!Array.isArray(x.walks)||x.walks.length>5000||!x.walks.every(validWalk)))return false;
  if(x?.entries?.some(e=>e.location!==undefined&&(!validPoint({...e.location,timestamp:1})||typeof e.location.walkId!=="string")))return false;
  if(x?.achievements!==undefined && (!isRecord(x.achievements) || !Object.entries(x.achievements).every(([id,a])=>/^[a-z0-9-]{1,64}$/.test(id)&&isRecord(a)&&dateValid(a.earnedAt))))return false;
  if(x?.profileDetails!==undefined && (!isRecord(x.profileDetails) || (x.profileDetails.bio!==undefined&&(typeof x.profileDetails.bio!=="string"||x.profileDetails.bio.length>120)) || (x.profileDetails.featured!=null&&(!Array.isArray(x.profileDetails.featured)||x.profileDetails.featured.length>3||!x.profileDetails.featured.every(id=>typeof id==="string"&&/^[a-z0-9-]{1,64}$/.test(id))))))return false;
  if(x?.careMilestones?.backupDays!==undefined&&(!Array.isArray(x.careMilestones.backupDays)||!x.careMilestones.backupDays.every(validDay)))return false;
  if(x?.careMilestones!==undefined && (!isRecord(x.careMilestones)||(x.careMilestones.backupPreparedAt!==undefined&&!dateValid(x.careMilestones.backupPreparedAt))))return false;

  if (x?.birthDate !== undefined && x.birthDate !== "" && (!validDay(x.birthDate) || x.birthDate > dayKey() || x.birthDate < "1900-01-01")) return false;
  if (x?.profile !== undefined) {
    const p=x.profile;
    if (!p || !["icon","emoji","photo"].includes(p.type) || typeof p.value!=="string") return false;
    if (p.type==="photo" && (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.value) || p.value.length>250000)) return false;
    if (p.type==="emoji" && p.value.length>20 || p.type==="icon" && !["user","leaf","moon","sun","heart","sparkles"].includes(p.value)) return false;
  }

  if (
    x?.displayName !== undefined &&
    (typeof x.displayName !== "string" || x.displayName.length > 100)
  )
    return false;
  if (
    !x ||
    !Array.isArray(x.entries) ||
    !Array.isArray(x.categories) ||
    !x.goals
  )
    return false;
  if (
    !x.entries.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.category === "string" &&
        dateValid(e.time) &&
        finite(e.quantity, 0.001) &&
        (!e.unit || ["item", "session", "package", "gram"].includes(e.unit)) &&
        (e.note === undefined || typeof e.note === "string") &&
        (e.productForm === undefined || typeof e.productForm === "string") &&
        (e.variety === undefined || typeof e.variety === "string") &&
        (e.photo === undefined ||
          e.photo === null ||
          (typeof e.photo === "string" &&
            /^data:image\/(jpeg|png|webp);base64,/.test(e.photo) &&
            e.photo.length <= 600000)) &&
        (e.cost === null || finite(e.cost)) &&
        (e.grams == null || finite(e.grams)) &&
        (e.items == null || finite(e.items)),
    )
  )
    return false;
  if (
    !x.categories.every(
      (c) =>
        c &&
        typeof c.id === "string" &&
        typeof c.name === "string" &&
        (c.icon==null||["leaf","sun","moon","flower","heart","cup","package","spark"].includes(c.icon)||(typeof c.icon==="string"&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(c.icon)&&c.icon.length<=70000)) &&
        c.name.trim() &&
        (c.price === null || finite(c.price)) &&
        (c.gramPrice === undefined || finite(c.gramPrice)) &&
        (c.enabled === undefined || typeof c.enabled === "boolean") &&
        (c.auraTone === undefined || ["auto","attention","neutral"].includes(c.auraTone)) &&
        (c.purchaseMode === undefined || ["unit","package","bulk","both"].includes(c.purchaseMode)) &&
        (c.purchasePrice == null || finite(c.purchasePrice)) &&
        (c.purchaseQuantity == null || finite(c.purchaseQuantity,0.000001)) &&
        (c.gramsPerUse == null || finite(c.gramsPerUse,0.000001)) &&
        (!c.unit || ["item", "session", "package", "gram"].includes(c.unit)),
    )
  )
    return false;
  if (
    x.intent !== undefined &&
    !["monitor", "reduce", "stop"].includes(x.intent)
  )
    return false;
  if (
    x.preferences !== undefined &&
    (!isRecord(x.preferences) ||
      (x.preferences.achievementSound!==undefined&&typeof x.preferences.achievementSound!=="boolean") ||
      (x.preferences.reminderTime !== undefined &&
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(x.preferences.reminderTime)))
  )
    return false;
  if (
    x.appearance !== undefined &&
    (!isRecord(x.appearance) ||
      (x.appearance.auraColor !== undefined &&
        !/^#[0-9a-f]{6}$/i.test(x.appearance.auraColor)))
  )
    return false;
  if (
    new Set(x.entries.map((e) => e.id)).size !== x.entries.length ||
    new Set(x.categories.map((c) => c.id)).size !== x.categories.length ||
    !finite(x.goals.daily) ||
    !finite(x.goals.budget)
  )
    return false;
  if (
    x.days !== undefined &&
    (!isRecord(x.days) ||
      !Object.entries(x.days).every(
        ([k, v]) =>
          validDay(k) &&
          isRecord(v) &&
          (v.confirmed === undefined || typeof v.confirmed === "boolean") &&
          (v.note === undefined || typeof v.note === "string") &&
          (v.mood === undefined || typeof v.mood === "string"),
      ))
  )
    return false;
  if (
    x.purchases !== undefined &&
    (!Array.isArray(x.purchases) ||
      !x.purchases.every(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.category === "string" &&
          validDay(p.date) &&
          finite(p.amount) &&
          finite(p.quantity, 0.001) &&
          ["item", "gram", "session", "package"].includes(p.unit),
      ))
  )
    return false;
  if (
    x.cravings !== undefined &&
    (!Array.isArray(x.cravings) ||
      !x.cravings.every(
        (c) =>
          c &&
          typeof c.id === "string" &&
          dateValid(c.time) &&
          finite(c.intensity, 1) &&
          c.intensity <= 5 &&
          typeof c.context === "string",
      ))
  )
    return false;
  if (
    x.pause &&
    (!dateValid(x.pause.startedAt) ||
      (x.pause.endedAt && !dateValid(x.pause.endedAt)))
  )
    return false;
  return true;
}
function isRecord(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}
export function migrate(raw) {
  if (!validData(raw)) return structuredClone(initial);
  const x = structuredClone(raw),
    v2 = x.version === 2;
  return {
    ...structuredClone(initial),
    ...x,
    version: 2,
    journey: migrateJourney(x.journey),
    categories: x.categories.map((c) => ({
      ...c,
      enabled: c.enabled ?? !(["joint","cigarette","chamomile"].includes(c.id) && ["Cannabis","Baseado","Cigarro","Camomila"].includes(c.name) && c.price==null && !x.entries.some(e=>e.category===c.id) && !x.purchases?.some(p=>p.category===c.id)),
      name: c.id === "joint" && c.name === "Baseado" ? "Cannabis" : c.name,
      kind: c.kind || (c.id === "joint" ? "cannabis" : undefined),
      unit: c.unit || "item",
      price: !v2 && c.price === 0 ? null : c.price,
      ...(!v2 && c.price === 0 ? { legacyPrice: 0 } : {}),
      auraColor: c.auraColor === "#72bc84" ? "#63d7a1" : c.auraColor,
    })),
    entries: x.entries.map((e) => ({
      ...e,
      name:
        e.name ||
        x.categories.find((c) => c.id === e.category)?.name ||
        "Categoria",
      unit:
        e.unit || x.categories.find((c) => c.id === e.category)?.unit || "item",
      cost: !v2 && e.cost === 0 ? null : e.cost,
      ...(!v2 && e.cost === 0 ? { legacyCost: 0 } : {}),
    })),
    goals: { ...initial.goals, ...x.goals },
    preferences: { ...initial.preferences, ...x.preferences },
    appearance: { ...initial.appearance, ...x.appearance },
    profileDetails:{...initial.profileDetails,...x.profileDetails},
    careMilestones:{...x.careMilestones},
    achievements:{...x.achievements},
  };
}
export function dayEntries(data, key) {
  return data.entries.filter((e) => dayKey(new Date(e.time)) === key);
}
export function observation(data, key) {
  const entries = dayEntries(data, key);
  return {
    known: entries.length > 0 || data.days[key]?.confirmed === true,
    paused: entries.length === 0 && data.days[key]?.confirmed === true,
    entries,
    events: entries.length,
    ...total(entries),
  };
}
export function shiftDay(key, n) {
  const d = new Date(key + "T12:00");
  d.setDate(d.getDate() + n);
  return dayKey(d);
}
export const AURA_STATES = {
  unknown: {
    id: "unknown",
    label: "Conhecendo seu ritmo",
    color: "#a8a7cd",
    motion: 0.6,
    description: "Confirme os dias para construir uma leitura da sua semana.",
  },
  observing: {
    id: "observing",
    label: "Sua semana em observação",
    color: "#9faed1",
    motion: 0.6,
    description: "A AURA usa seus registros, sem classificar sua saúde.",
  },
  pause: {
    id: "pause",
    label: "Espaço para a pausa",
    color: "#b8e0da",
    motion: 0.3,
    description:
      "Os dias acompanhados deste período foram confirmados sem consumo.",
  },
  lower: {
    id: "lower",
    label: "Um ritmo mais tranquilo",
    color: "#a7d9cf",
    motion: 0.35,
    description: "Menos registros nos dias comparáveis. Continue no seu tempo.",
  },
  steady: {
    id: "steady",
    label: "Um momento de observar",
    color: "#a8b4cc",
    motion: 0.55,
    description: "O ritmo registrado está parecido nos dias comparáveis.",
  },
  higher: {
    id: "higher",
    label: "Um convite à pausa",
    color: "#929fb8",
    motion: 0.4,
    description:
      "Há mais registros nos dias comparáveis. Se quiser, faça espaço para uma pausa.",
  },
};
export function weeklyAura(data, end = dayKey()) {
  const keys = Array.from({ length: 7 }, (_, i) => shiftDay(end, i - 6));
  const days = keys.map((k) => observation(data, k)),
    known = days.filter((d) => d.known).length,
    events = days.reduce((s, d) => s + d.events, 0),
    paused = days.filter((d) => d.paused).length;
  const pairs = keys
    .map((k, i) => ({
      current: days[i],
      previous: observation(data, shiftDay(k, -7)),
    }))
    .filter((p) => p.current.known && p.previous.known);
  let state = AURA_STATES.unknown,
    change = null;
  if (known) {
    state = events === 0 ? AURA_STATES.pause : AURA_STATES.observing;
    if (events > 0 && pairs.length >= 3) {
      const a = pairs.reduce((s, p) => s + p.current.events, 0),
        b = pairs.reduce((s, p) => s + p.previous.events, 0);
      change = a - b;
      state =
        change < 0
          ? AURA_STATES.lower
          : change > 0
            ? AURA_STATES.higher
            : AURA_STATES.steady;
    }
  }
  return {
    ...state,
    known,
    events,
    paused,
    pairs: pairs.length,
    change,
    start: keys[0],
    end,
  };
}
export function monthlyFrames(data, month, today = dayKey()) {
  const first = month + "-01";
  if (!validDay(first)) return [];
  const count = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5)),
    0,
  ).getDate();
  return Array.from(
    { length: count },
    (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
  )
    .filter((k) => k <= today)
    .map((key) => ({
      key,
      day: observation(data, key),
      aura: weeklyAura(data, key),
    }));
}
export function summary(data, entries) {
  const s = total(entries),
    units = {};
  let grams = 0,
    missing = 0;
  for (const e of entries) {
    const unit =
      e.unit ||
      data.categories.find((c) => c.id === e.category)?.unit ||
      "item";
    units[unit] = round((units[unit] || 0) + e.quantity);
    grams += e.grams || 0;
    if (e.cost == null) missing++;
  }
  return {
    ...s,
    events: entries.length,
    units,
    grams: round(grams),
    missing,
    costLabel:
      entries.length === 0
        ? money(0)
        : missing === entries.length
          ? "Custo não informado"
          : money(s.cost) + (missing ? " + não informados" : ""),
  };
}
export function createEntry(category, time = new Date().toISOString()) {
  const grams =
    category.gramsPerUse ?? (category.unit === "gram" ? 1 : null);
  return {
    id: uid(),
    time,
    category: category.id,
    name: category.name,
    unit: category.unit || "item",
    quantity: 1,
    grams,
    productForm: category.productForm || "",
    variety: category.variety || "",
    cost:
      category.price != null
        ? round(category.price)
        : grams != null && category.gramPrice != null
          ? round(grams * category.gramPrice)
          : null,
    note: "",
  };
}
export function adjustCategoryTotal(data, date, category, target) {
  let entries = [...data.entries];
  const old = dayEntries(data, date)
    .filter((e) => e.category === category.id)
    .sort((a, b) => new Date(b.time) - new Date(a.time));
  let diff = round(target - total(old).count);
  if (diff > 0) {
    entries.push({
      ...createEntry(category, new Date(date + "T12:00").toISOString()),
      quantity: diff,
      cost: category.price == null ? null : round(category.price * diff),
    });
  } else {
    for (const e of old) {
      if (diff >= 0) break;
      const amount = Math.min(e.quantity, -diff);
      entries = entries
        .map((x) =>
          x.id !== e.id
            ? x
            : {
                ...x,
                quantity: round(x.quantity - amount),
                grams:
                  x.grams == null
                    ? null
                    : round((x.grams * (x.quantity - amount)) / x.quantity),
                cost:
                  x.cost == null
                    ? null
                    : round((x.cost * (x.quantity - amount)) / x.quantity),
              },
        )
        .filter((x) => x.quantity > 0);
      diff = round(diff + amount);
    }
  }
  return { ...data, entries };
}
export function csvExport(data) {
  const cell = (v) => {
    const text = String(v ?? "");
    const safe =
      typeof v === "string" && /^[=+@\-\t\r]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  return (
    "\ufeff" +
    [
      [
        "Data local",
        "Categoria",
        "Quantidade",
        "Unidade",
        "Gramas",
        "Custo R$",
        "Nota",
      ],
      ...data.entries.map((e) => [
        localTime(e.time),
        data.categories.find((c) => c.id === e.category)?.name || e.name,
        e.quantity,
        e.unit,
        e.grams,
        e.cost,
        e.note,
      ]),
    ]
      .map((r) => r.map(cell).join(";"))
      .join("\r\n")
  );
}
export function periodRange(anchor, period) {
  if (!validDay(anchor)) anchor = dayKey();
  let start = anchor,
    end = shiftDay(anchor, 1);
  if (period === "Semana") {
    const d = new Date(anchor + "T12:00");
    start = shiftDay(anchor, -((d.getDay() + 6) % 7));
    end = shiftDay(start, 7);
  }
  if (period === "Mês") {
    start = anchor.slice(0, 7) + "-01";
    const d = new Date(start + "T12:00");
    d.setMonth(d.getMonth() + 1);
    end = dayKey(d);
  }
  if (period === "Ano") {
    start = anchor.slice(0, 4) + "-01-01";
    end = `${Number(anchor.slice(0, 4)) + 1}-01-01`;
  }
  return { start, end };
}
export function timeGreeting(now = new Date()) {
  const hour = now.getHours();
  return hour < 5
    ? "Madrugada: acolha o silêncio e faça espaço para uma pausa."
    : hour < 12
      ? "Bom dia. Comece com calma e cuide do seu ritmo."
      : hour < 18
        ? "Uma pausa também pode fazer parte da sua tarde."
        : hour < 22
          ? "A noite chegou. Reserve um momento para você."
          : "Fim do dia: desacelere e observe como você está.";
}
export function dominantDay(data, key) {
  const entries = dayEntries(data, key),
    sums = new Map();
  for (const e of entries) {
    const old = sums.get(e.category) || { quantity: 0, last: "" };
    sums.set(e.category, {
      quantity: round(old.quantity + e.quantity),
      last: e.time > old.last ? e.time : old.last,
    });
  }
  const ranked = [...sums].sort(
    (a, b) =>
      b[1].quantity - a[1].quantity || b[1].last.localeCompare(a[1].last),
  );
  if (!ranked.length) return null;
  const [id, stat] = ranked[0],
    category = data.categories.find((c) => c.id === id);
  return {
    id,
    name:
      category?.name ||
      entries.find((e) => e.category === id)?.name ||
      "Categoria",
    color: /^#[0-9a-f]{6}$/i.test(category?.auraColor || "")
      ? category.auraColor
      : "#b7beca",
    quantity: stat.quantity,
    tied: ranked.length > 1 && ranked[1][1].quantity === stat.quantity,
  };
}
