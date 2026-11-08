import './interfaceRepairs.css';
import ItemIcon from "./ItemIcon";
import Segmented from "./Segmented";
import GlassSelect from "./GlassSelect";
import React, { useState } from "react";
import {
  Leaf,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Pause,
  Heart,
  Clock3,
  MessageCircle,
  Activity,
} from "lucide-react";
import { PageTitle, EntryList } from "./ui";
import {
  dominantDay,
  dayKey,
  dayEntries,
  observation,
  shiftDay,
  money,
  total,
  summary,
  weeklyAura,
  uid,
} from "./model";
import { intentions } from "./Welcome";
export function DayCheck({ data, date, onSave }) {
  const info = observation(data, date),
    saved = data.days[date] || {};
  return (
    <form
      className="day-check"
      key={date + JSON.stringify(saved)}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave(date, {
          confirmed: f.get("confirmed") === "on",
          mood: f.get("mood"),
          note: f.get("note").trim(),
        });
      }}
    >
      <h3>{date === dayKey() ? "Como foi seu dia?" : "Sobre este dia"}</h3>
      <p>
        {info.entries.length
          ? "Seus registros de consumo já fazem parte deste dia."
          : "Sem registro não significa sem consumo. Confirme o dia se você o acompanhou."}
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          name="confirmed"
          defaultChecked={saved.confirmed === true}
        />
        <span>
          {info.entries.length
            ? "Confirmar acompanhamento deste dia"
            : "Confirmar este dia sem consumo"}
        </span>
      </label>
      <div className="form-grid">
        <label>
          Como você se sentiu · opcional
          <GlassSelect name="mood" defaultValue={saved.mood || ""}>
            <option value="">Prefiro não informar</option>
            {["Tranquilo", "Bem", "Cansado", "Ansioso", "Outro"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </GlassSelect>
        </label>
        <label>
          Uma nota para você
          <textarea
            name="note"
            defaultValue={saved.note || ""}
            maxLength={1000}
            rows={2}
            placeholder="Contexto, sentimentos ou algo para lembrar"
          />
        </label>
      </div>
      <button className="button secondary">
        <Check size={15} />
        Salvar check-in
      </button>
    </form>
  );
}
export default function History({ data, onEdit, onAdd, onDaySave, onAdjust }) {
  const [date, setDate] = useState(dayKey()),
    [month, setMonth] = useState(dayKey().slice(0, 7)),
    [metric, setMetric] = useState("consumo");
  const selected = observation(data, date);
  function shift(n) {
    const d = new Date(month + "-01T12:00");
    d.setMonth(d.getMonth() + n);
    setMonth(dayKey(d).slice(0, 7));
  }
  return (
    <section className="route-transition" data-guide="history">
      <PageTitle eyebrow="UM DIA DE CADA VEZ" title="Seu histórico.">
        Calendário de consulta. Para corrigir lançamentos, use Gerenciar
        registros.
      </PageTitle>
      <div className="history-layout">
        <section className="tap-card calendar-card">
          <div className="section-heading">
            <button
              className="icon-button"
              aria-label="Mês anterior"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={19} />
            </button>
            <h2>
              {new Date(month + "-01T12:00").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              className="icon-button"
              aria-label="Próximo mês"
              onClick={() => shift(1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
          <Segmented className="calendar-metric">
            <button
              className={metric === "consumo" ? "active" : ""}
              onClick={() => setMetric("consumo")}
            >
              Ocasiões
            </button>
            <button
              className={metric === "custo" ? "active" : ""}
              onClick={() => setMetric("custo")}
            >
              Custo
            </button>
          </Segmented>
          <div className="calendar-grid">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <small key={i}>{d}</small>
            ))}
            {Array.from(
              { length: new Date(month + "-01T12:00").getDay() },
              (_, i) => (
                <span key={"b" + i} />
              ),
            )}
            {Array.from(
              {
                length: new Date(
                  Number(month.slice(0, 4)),
                  Number(month.slice(5)),
                  0,
                ).getDate(),
              },
              (_, i) => {
                const key = `${month}-${String(i + 1).padStart(2, "0")}`,
                  day = observation(data, key),
                  s = summary(data, day.entries);
                return (
                  <button
                    key={key}
                    disabled={key > dayKey()}
                    className={`${date === key ? "selected" : ""} ${day.paused ? "confirmed-pause" : day.known ? "recorded" : "unknown"} level-${Math.min(3, day.events)}`}
                    onClick={() => setDate(key)}
                    aria-label={`${i + 1}: ${day.paused ? "sem consumo confirmado" : day.known ? `${day.events} ocasiões` : "sem informação"}`}
                  >
                    <b>{i + 1}</b>
                    {data.categories.find(c=>c.id===dominantDay(data,key)?.id)?.icon&&<ItemIcon icon={data.categories.find(c=>c.id===dominantDay(data,key)?.id).icon}/>}
                    <span>
                      {day.paused ? (
                        <Leaf size={12} />
                      ) : !day.known ? (
                        "·"
                      ) : metric === "consumo" ? (
                        day.events
                      ) : s.missing === day.events ? (
                        "?"
                      ) : (
                        money(s.cost).replace("R$", "").trim()
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </div>
          <div className="calendar-legend">
            <span>· Sem informação</span>
            <span>
              <Leaf size={11} />
              Sem consumo confirmado
            </span>
          </div>
          <p className="field-help">
            A intensidade mostra ocasiões ou custo registrado; não é uma
            avaliação de saúde.
          </p>
        </section>
        <section className="tap-card">
          <div className="section-heading">
            <h2>
              {new Date(date + "T12:00").toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
              })}
            </h2>
            <span className="muted">{selected.events} ocasiões</span>
          </div>
          <EntryList
            entries={selected.entries}
            pageSize={6}
            paginationKey={date}
            data={data}
            readonly
            onEdit={onEdit}
            confirmed={selected.paused}
          />
        </section>
      </div>
      <details className="settings-disclosure">
        <summary>
          Gerenciar registros
          <ChevronRight size={17} />
        </summary>
        <p className="field-help">
          A edição acontece nos lançamentos, sem alterar o calendário
          diretamente.
        </p>
        <EntryList entries={data.entries} data={data} onEdit={onEdit} pageSize={8} />
      </details>
    </section>
  );
}
export function Care({data,onChange,onDaySave,onCraving,onGoals}){
 const pause=data.pause&&!data.pause.endedAt;
 return <section className="route-transition care-minimal" data-guide="care"><PageTitle title="Seu cuidado."/>
 <label className="care-intent-picker">Sua intenção<GlassSelect aria-label="Minha intenção" value={data.intent} onChange={e=>onChange(d=>({...d,intent:e.target.value}))}>{Object.entries(intentions).map(([id,v])=><option key={id} value={id}>{v.title}</option>)}</GlassSelect></label>
 <section className="pause-focus"><Pause size={26}/><h2>{pause?"Uma pausa, no seu tempo.":"Espaço para uma pausa."}</h2>{pause&&<p>Desde {new Date(data.pause.startedAt).toLocaleDateString('pt-BR')}</p>}<button className="button primary" onClick={()=>onChange(d=>({...d,pause:pause?{...d.pause,endedAt:new Date().toISOString()}:{startedAt:new Date().toISOString(),endedAt:null}}))}>{pause?'Encerrar pausa':'Iniciar pausa'}</button><small>Dias sem consumo precisam ser confirmados.</small></section>
 <details className="compact-explanation"><summary>Como foi seu dia?</summary><DayCheck data={data} date={dayKey()} onSave={onDaySave}/></details>
 <details className="compact-explanation"><summary>Vontades e notas</summary><button className="button secondary" onClick={()=>onCraving()}><Plus size={15}/>Registrar vontade</button>{[...data.cravings].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,5).map(c=><button className="craving-row" key={c.id} onClick={()=>onCraving(c)}><span>{new Date(c.time).toLocaleDateString('pt-BR')}</span><span>Intensidade {c.intensity}/5</span></button>)}</details>
 <button className="quiet-button" onClick={onGoals}>Definir um limite opcional</button>
 </section>;
}
export function Goals({ data, onChange, onNotify }) {
  return (
    <section className="route-transition narrow">
      <PageTitle
        eyebrow="SUAS ESCOLHAS, SEM IMPOSIÇÃO"
        title="Uma direção para você."
      >
        Limites são opcionais e não representam recomendações de consumo.
      </PageTitle>
      <form
        className="tap-card"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onChange((d) => ({
            ...d,
            goals: {
              ...d.goals,
              dailyEnabled: f.get("dailyEnabled") === "on",
              daily: Number(f.get("daily") || 0),
              categoryId: f.get("categoryId"),
              budgetEnabled: d.goals.budgetEnabled,
              budget: d.goals.budget,
            },
          }));
          onNotify("Metas atualizadas.");
        }}
      >
        <label className="check-row">
          <input
            type="checkbox"
            name="dailyEnabled"
            defaultChecked={data.goals.dailyEnabled}
          />
          <span>Quero acompanhar um limite diário de ocasiões</span>
        </label>
        <div className="form-grid">
          <label>
            Limite escolhido
            <input
              name="daily"
              type="number"
              min="0"
              step="1"
              defaultValue={data.goals.daily}
            />
          </label>
          <label>
            Aplicar a
            <GlassSelect
              name="categoryId"
              defaultValue={data.goals.categoryId || "all"}
            >
              <option value="all">Todas as categorias · ocasiões</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · ocasiões
                </option>
              ))}
            </GlassSelect>
          </label>
        </div>
        <p className="field-help">
          Uma ocasião corresponde a um registro, mesmo quando contém várias
          unidades. Zero pode representar sua intenção de parar.
        </p>
        <button className="button primary full">
          <Check size={16} />
          Salvar escolhas
        </button>
      </form>
      <div className="gentle-note">
        <Leaf size={19} />
        <p>Um passo de cada vez. Seu histórico continua com você.</p>
      </div>
    </section>
  );
}
