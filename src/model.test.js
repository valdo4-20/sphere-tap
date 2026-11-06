import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayKey,
  total,
  validData,
  initial,
  migrate,
  observation,
  weeklyAura,
  monthlyFrames,
  shiftDay,
  summary,
  adjustCategoryTotal,
  uid,
  createEntry,
  csvExport,
  periodRange,
  timeGreeting,
  AURA_STATES,
} from "./model.js";
const sampleCategories=[{id:"joint",name:"Cannabis",unit:"item",price:null,auraColor:"#63d7a1"},{id:"cigarette",name:"Cigarro",unit:"item",price:null,auraColor:"#b5b8bd"},{id:"chamomile",name:"Camomila",unit:"item",price:null,auraColor:"#efce6b"}];
const fresh = () => ({...structuredClone(initial),categories:structuredClone(sampleCategories)});
const entry = (
  date,
  id = "e",
  quantity = 1,
  cost = null,
  category = "joint",
) => ({
  id,
  category,
  name: "Baseado",
  time: new Date(date + "T12:00").toISOString(),
  quantity,
  cost,
  unit: "item",
});
test("datas locais e virada de mês são estáveis", () => {
  assert.equal(dayKey(new Date(2026, 0, 2, 23, 59)), "2026-01-02");
  assert.equal(shiftDay("2026-03-01", -1), "2026-02-28");
});
test("somatórios usam centavos e arredondam quantidades fracionárias", () =>
  assert.deepEqual(
    total([
      { quantity: 0.1, cost: 0.1 },
      { quantity: 0.2, cost: 0.2 },
    ]),
    { count: 0.3, cost: 30 },
  ));
test("identificador funciona sem randomUUID no HTTP da rede local", () => {
  const id = uid({
    getRandomValues: (b) => {
      b.fill(3);
      return b;
    },
  });
  assert.equal(id, "03".repeat(16));
  assert.equal(typeof uid(null), "string");
});
test("custo ausente é diferente de custo explicitamente zero", () => {
  const d = fresh();
  d.entries = [
    entry("2026-11-01", "a", 1, null),
    entry("2026-11-01", "b", 1, 0),
  ];
  const s = summary(d, d.entries);
  assert.equal(s.missing, 1);
  assert.equal(s.cost, 0);
  assert.match(s.costLabel, /não informados/);
  assert.equal(createEntry(d.categories[0]).cost, null);
});
test("backup aceita versão atual e rejeita unidades, duplicatas e dias inválidos", () => {
  assert.ok(validData(initial));
  const d = fresh();
  d.entries = [entry("2026-11-01")];
  assert.ok(validData(d));
  assert.ok(!validData({ ...d, entries: [...d.entries, ...d.entries] }));
  assert.ok(
    !validData({ ...d, entries: [{ ...d.entries[0], unit: "__proto__" }] }),
  );
  assert.ok(!validData({ ...d, days: { "2026-02-30": { confirmed: true } } }));
  assert.ok(!validData({ ...d, purchases: null }));
  assert.ok(!validData({ ...d, intent: "reward" }));
});
test("migração preserva registros, preços conhecidos e zeros legados para auditoria", () => {
  const old = {
    entries: [entry("2026-11-01", "a", 2, 5), entry("2026-11-02", "b", 1, 0)],
    categories: [{ id: "joint", name: "Baseado", price: 0 }],
    goals: { daily: 10, budget: 150 },
    aura: true,
  };
  const d = migrate(old);
  assert.equal(d.entries.length, 2);
  assert.equal(d.entries[0].cost, 5);
  assert.equal(d.entries[1].cost, null);
  assert.equal(d.entries[1].legacyCost, 0);
  assert.equal(d.categories[0].legacyPrice, 0);
  assert.equal(d.goals.dailyEnabled, false);
  assert.ok(validData(d));
  assert.equal(old.entries[1].cost, 0);
});
test("dia vazio é desconhecido, e não uma pausa automática", () => {
  const d = fresh();
  assert.equal(observation(d, "2026-11-01").known, false);
  assert.equal(weeklyAura(d, "2026-11-07").id, "unknown");
  d.days["2026-11-01"] = { confirmed: true };
  assert.equal(observation(d, "2026-11-01").paused, true);
  assert.equal(weeklyAura(d, "2026-11-07").paused, 1);
  assert.equal(weeklyAura(d, "2026-11-07").known, 1);
});
test("registro de consumo impede tratar confirmação como dia sem consumo", () => {
  const d = fresh();
  d.days["2026-11-01"] = { confirmed: true };
  d.entries = [entry("2026-11-01")];
  assert.equal(observation(d, "2026-11-01").paused, false);
});
function weeks(nowCounts, previousCounts) {
  const d = fresh();
  for (let i = 0; i < nowCounts.length; i++) {
    const now = shiftDay("2026-11-07", i - 6),
      before = shiftDay(now, -7);
    d.days[now] = { confirmed: true };
    d.days[before] = { confirmed: true };
    for (let j = 0; j < nowCounts[i]; j++)
      d.entries.push(entry(now, "n" + i + "-" + j));
    for (let j = 0; j < previousCounts[i]; j++)
      d.entries.push(entry(before, "p" + i + "-" + j));
  }
  return d;
}
test("AURA exige pelo menos três pares com dados para comparar semanas", () => {
  const d = weeks([1, 1], [2, 2]);
  assert.equal(weeklyAura(d, "2026-11-07").id, "observing");
  assert.equal(weeklyAura(d, "2026-11-07").pairs, 2);
});
test("AURA reconhece menor frequência usando dias equivalentes", () => {
  const w = weeklyAura(weeks([1, 0, 1], [2, 1, 2]), "2026-11-07");
  assert.equal(w.id, "lower");
  assert.equal(w.change, -3);
  assert.equal(w.pairs, 3);
});
test("mais consumo não dá movimento mais intenso como recompensa", () => {
  const w = weeklyAura(weeks([3, 2, 3], [1, 1, 1]), "2026-11-07");
  assert.equal(w.id, "higher");
  assert.ok(w.motion <= AURA_STATES.observing.motion);
  assert.match(w.label, /pausa/);
});
test("retrospectiva não inventa dias futuros ou informação ausente", () => {
  const frames = monthlyFrames(fresh(), "2026-11", "2026-11-06");
  assert.equal(frames.length, 6);
  assert.ok(frames.every((f) => !f.day.known && f.aura.id === "unknown"));
  assert.equal(monthlyFrames(fresh(), "2026-12", "2026-11-06").length, 0);
});
test("quadros do passado não mudam por consumo em dias posteriores", () => {
  const d = fresh();
  d.entries = [entry("2026-11-06")];
  const f = monthlyFrames(d, "2026-11", "2026-11-06");
  assert.equal(f[0].aura.events, 0);
  assert.equal(f[5].aura.events, 1);
});
test("ocasiões, unidades e gramas são mantidas separadas", () => {
  const d = fresh();
  d.entries = [
    { ...entry("2026-11-01", "a", 2, 4), grams: 0.4 },
    { ...entry("2026-11-01", "b", 1, null), unit: "session", grams: 0.2 },
  ];
  const s = summary(d, d.entries);
  assert.equal(s.events, 2);
  assert.deepEqual(s.units, { item: 2, session: 1 });
  assert.equal(s.grams, 0.6);
});
test("ajustar total afeta somente a categoria e reduz custos e gramas proporcionalmente", () => {
  const d = fresh();
  d.entries = [
    { ...entry("2026-11-01", "a", 2, 8), grams: 1 },
    entry("2026-11-01", "b", 3, 6, "cigarette"),
  ];
  const out = adjustCategoryTotal(d, "2026-11-01", d.categories[0], 1);
  assert.equal(out.entries[0].cost, 4);
  assert.equal(out.entries[0].grams, 0.5);
  assert.equal(out.entries[1].quantity, 3);
  assert.equal(d.entries[0].quantity, 2);
});
test("aumentar total sem preço mantém custo desconhecido", () => {
  const d = adjustCategoryTotal(
    fresh(),
    "2026-11-01",
    sampleCategories[0],
    2,
  );
  assert.equal(d.entries[0].quantity, 2);
  assert.equal(d.entries[0].cost, null);
});
test("preços novos não recalculam registros anteriores", () => {
  const d = fresh();
  d.entries = [entry("2026-11-01", "a", 1, 3)];
  d.categories[0].price = 10;
  assert.equal(summary(d, d.entries).cost, 300);
  assert.equal(createEntry(d.categories[0]).cost, 10);
});
test("períodos incluem semana de segunda a domingo e ano bissexto", () => {
  assert.deepEqual(periodRange("2026-11-04", "Semana"), {
    start: "2026-11-02",
    end: "2026-11-09",
  });
  assert.deepEqual(periodRange("2024-02-29", "Mês"), {
    start: "2024-02-01",
    end: "2024-03-01",
  });
});
test("CSV escapa aspas e neutraliza fórmulas em textos livres", () => {
  const d = fresh();
  d.entries = [{ ...entry("2026-11-01"), note: '=1+1; "teste"' }];
  const csv = csvExport(d);
  assert.ok(csv.startsWith("\ufeff"));
  assert.match(csv, /'=1\+1/);
  assert.match(csv, /""teste""/);
});
test("saudação acompanha o horário sem sugerir consumo", () => {
  assert.match(timeGreeting(new Date(2026, 10, 6, 2)), /Madrugada/);
  assert.match(timeGreeting(new Date(2026, 10, 6, 8)), /Bom dia/);
  assert.match(timeGreeting(new Date(2026, 10, 6, 15)), /pausa/);
});
import {dominantDay} from './model.js';
test('cor diária acompanha a maior quantidade, com desempate pelo registro mais recente',()=>{const d=fresh();d.entries=[entry('2026-11-01','a',2,null,'joint'),entry('2026-11-01','b',3,null,'cigarette')];assert.equal(dominantDay(d,'2026-11-01').id,'cigarette');assert.equal(dominantDay(d,'2026-11-02'),null)});
test('migração muda somente o nome padrão Baseado, preservando nomes escolhidos',()=>{const d=fresh();d.categories[0].name='Meu nome';assert.equal(migrate(d).categories[0].name,'Meu nome');d.categories[0].name='Baseado';assert.equal(migrate(d).categories[0].name,'Cannabis')});

test("perfil local e nascimento sobrevivem ao backup sem alterar histórico", () => {
  const d=fresh();d.birthDate="1990-05-20";d.profile={type:"emoji",value:"🌙"};d.entries=[entry("2026-11-01")];
  const restored=migrate(JSON.parse(JSON.stringify(d)));
  assert.equal(restored.birthDate,d.birthDate);
  assert.deepEqual(restored.profile,d.profile);
  assert.deepEqual(restored.entries,d.entries);
});
test("backup rejeita perfil com imagem remota e nascimento inválido", () => {
  const d=fresh();d.profile={type:"photo",value:"https://example.com/track.png"};
  assert.equal(validData(d),false);
  d.profile={type:"icon",value:"leaf"};d.birthDate="2027-02-30";
  assert.equal(validData(d),false);
});


test("primeiro acesso não vem com itens escolhidos", () => {
 assert.deepEqual(initial.categories,[]);
 assert.equal(validData(initial),true);
 const d=fresh();d.entries=[entry("2026-11-01")];
 const out=migrate(d);
 assert.equal(out.categories[0].enabled,true);
 assert.equal(out.categories[1].enabled,false);
 assert.equal(out.categories[2].enabled,false);
 assert.equal(out.entries.length,1);
});
test("pacotes e gramas são unidades válidas no backup",()=>{
 const d=fresh();d.categories[0].unit="package";
 d.entries=[{...entry("2026-11-01"),unit:"package"}];
 assert.equal(validData(d),true);
 d.entries[0].unit="gram";
 assert.equal(validData(d),true);
});
