import CareCalendar from "./CareCalendar";
import ProfileInsights from "./ProfileInsights";
import DatePicker from "./DatePicker";
import Segmented from "./Segmented";
import AuraChart from "./AuraChart";
import GlassSelect from "./GlassSelect";
import React, { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Plus,
} from "lucide-react";
import Aura from "./Aura";
import { appearanceFor } from "./appearance";
import { Coverage, PageTitle } from "./ui";
import {
  dayKey,
  monthlyFrames,
  summary,
  money,
  periodRange,
  observation,
  weeklyAura,
  shiftDay,
} from "./model";
export function MonthlyRewind({ data, initialMonth = dayKey().slice(0, 7) }) {
  const [month, setMonth] = useState(initialMonth),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const change = (e) => {
      setReduced(e.matches);
      if (e.matches) setPlaying(false);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  const frames = monthlyFrames(data, month),
    frame = frames[Math.min(index, frames.length - 1)],
    known = frames.filter((f) => f.day.known).length;
  useEffect(() => {
    setPlaying(false);
    setIndex(0);
  }, [month]);
  useEffect(() => {
    if (!playing || reduced) return;
    const t = setInterval(
      () =>
        setIndex((i) => {
          if (i >= frames.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [playing, frames.length, reduced]);
  return (
    <section className="rewind-experience">
      <div className="row between">
        <span className="eyebrow">SUA AURA, AO LONGO DO MÊS</span>
        <div className="month-control" aria-label="Mês da retrospectiva">
          <button
            className="icon-button"
            aria-label="Mês anterior da retrospectiva"
            onClick={() => {
              const d = new Date(month + "-01T12:00");
              d.setMonth(d.getMonth() - 1);
              setMonth(dayKey(d).slice(0, 7));
            }}
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            {new Date(month + "-01T12:00").toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            className="icon-button"
            disabled={month >= dayKey().slice(0, 7)}
            aria-label="Próximo mês da retrospectiva"
            onClick={() => {
              const d = new Date(month + "-01T12:00");
              d.setMonth(d.getMonth() + 1);
              setMonth(dayKey(d).slice(0, 7));
            }}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {frame ? (
        <>
          <div className="rewind-sky">
            <Aura
              preset={data.appearance?.preset||"cover"}
              color={appearanceFor(data).color}
              motion={frame.aura.motion}
              enabled={data.aura && playing && !reduced}
            />
            <div className="rewind-frame">
              <span>
                {new Date(frame.key + "T12:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </span>
              <h2>{frame.aura.label}</h2>
              <small>
                {frame.day.paused
                  ? "Dia confirmado sem consumo"
                  : frame.day.known
                    ? `${frame.day.events} registro(s) neste dia`
                    : "Dia sem informação"}
              </small>
            </div>
          </div>
          <div className="rewind-timeline">
            {frames.map((f, i) => (
              <button
                key={f.key}
                onClick={() => {
                  setIndex(i);
                  setPlaying(false);
                }}
                className={`${i === index ? "active" : ""} ${f.day.paused ? "pause-day" : f.day.known ? "observed-day" : "unknown-day"}`}
                aria-label={`${i + 1}: ${f.day.paused ? "sem consumo confirmado" : f.day.known ? "com registros" : "sem informação"}`}
                aria-current={i === index ? "step" : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="row between">
            <span className="muted">
              {known}/{frames.length} dias acompanhados
            </span>
            <div className="row">
              <button
                className="icon-button"
                aria-label="Dia anterior"
                onClick={() => {
                  setPlaying(false);
                  setIndex(Math.max(0, index - 1));
                }}
                disabled={!index}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="button secondary"
                disabled={!known || reduced}
                onClick={() => {
                  if (index >= frames.length - 1) setIndex(0);
                  setPlaying((p) => !p);
                }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
                {playing ? "Pausar" : "Reproduzir"}
              </button>
              <button
                className="icon-button"
                aria-label="Próximo dia"
                disabled={index >= frames.length - 1}
                onClick={() => {
                  setPlaying(false);
                  setIndex(Math.min(frames.length - 1, index + 1));
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <p className="field-help">
            Cada quadro usa os 7 dias anteriores àquela data. Não é uma
            avaliação de saúde.{" "}
            {reduced
              ? "Movimento reduzido ativo: explore os dias manualmente."
              : !known
                ? "A retrospectiva ganha informação conforme você acompanha os dias."
                : "Pausas e menor frequência recebem uma expressão mais tranquila; consumo alto não é premiado."}
          </p>
        </>
      ) : (
        <div className="empty-state">
          <p>Este mês ainda não começou.</p>
        </div>
      )}
    </section>
  );
}
export const unitsText = (s) =>
  Object.entries(s.units)
    .map(([unit, n]) => `${n} ${({session:"sessão(ões)",package:"pacote(s)",gram:"g",item:"un."})[unit] || "un."}`)
    .join(" · ") || "Sem consumo registrado";
export default function Insights({ data, onPurchase, onRewind, onHistory }) {
  const [period, setPeriod] = useState("Mês"),
    [anchor, setAnchor] = useState(dayKey()),
    [category, setCategory] = useState("all");
  const range = periodRange(anchor, period),
    entries = data.entries.filter((e) => {
      const k = dayKey(new Date(e.time));
      return (
        k >= range.start &&
        k < range.end &&
        (category === "all" || e.category === category)
      );
    });
  const days = [];
  for (let k = range.start; k < range.end && k <= dayKey(); k = shiftDay(k, 1))
    days.push(observation(data, k));
  const known = days.filter((d) => d.known).length;
  return (
    <section className="route-transition" data-guide="insights">
      <PageTitle title="Seu progresso."/>
      <div className="progress-links"><button className="quiet-button" onClick={onHistory}>Histórico</button></div>
      <div className="filter-bar">
        <Segmented className="">
          {["Dia", "Semana", "Mês", "Ano"].map((p) => (
            <button
              key={p}
              className={period === p ? "active" : ""}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </Segmented>
        <details className="compact-explanation progress-filter-options"><summary>Data e item</summary><DatePicker
          aria-label="Data de referência da análise"
          type="date"
          value={anchor}
          onChange={(e) => e.target.value && setAnchor(e.target.value)}
        />
        <GlassSelect
          aria-label="Filtrar categoria da análise"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          {data.categories.filter(c=>c.enabled!==false).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </GlassSelect></details>
      </div>
      <div className="period-caption">
        <span>
          {new Date(range.start + "T12:00").toLocaleDateString("pt-BR")} —{" "}
          {new Date(shiftDay(range.end, -1) + "T12:00").toLocaleDateString(
            "pt-BR",
          )}
        </span>
        <Coverage known={known} total={days.length || 0} />
      </div>
      <AuraChart entries={entries} range={range}/>
      <details className="compact-explanation"><summary>Por item</summary><section className="tap-card">
        <div className="section-heading">
          <h2>Por item</h2>
          <span className="muted">Unidades diferentes ficam separadas</span>
        </div>
        {data.categories
          .filter((c) => category === "all" || c.id === category)
          .map((c) => {
            const group = summary(
              data,
              entries.filter((e) => e.category === c.id),
            );
            return (
              <div className="category-summary" key={c.id}>
                <span>
                  <b>{c.name}</b>
                  <small>
                    {group.events} ocasiões · {unitsText(group)}
                    {group.grams > 0 ? ` · ${group.grams} g` : ""}
                  </small>
                </span>
                <strong>{group.costLabel}</strong>
              </div>
            );
          })}
      </section>
      </details>
      <details className="compact-explanation"><summary>Calendário de cuidado</summary><CareCalendar data={data}/></details>
      <details className="compact-explanation"><summary>Pausas e bem-estar</summary><ProfileInsights data={data}/></details>
      <button className="quiet-button" onClick={onRewind}>Retrospectiva da AURA</button>
    </section>
  );
}
