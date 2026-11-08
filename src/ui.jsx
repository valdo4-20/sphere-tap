import {lockQuizScroll as lockDocumentScroll} from "./quizScroll";
import DateTimePicker from "./DateTimePicker";
import GlassSelect from "./GlassSelect";
import React, { useEffect, useRef, useState } from "react";
import { X, Check, ChevronDown, Pencil, Leaf } from "lucide-react";
import { auraForCategory } from "./Aura";
import { dayKey, localTime, money, unitLabel, round } from "./model";
export function PageTitle({ eyebrow, title, children, action }) {
  return (
    <div className="page-intro">
      <div>
        
        <h1 className="page-title">{title}</h1>
        {children && <p className="page-description">{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function Dialog({ title, onClose, children, className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog=ref.current,opener=document.activeElement;
    const unlock=lockDocumentScroll();
    dialog.showModal();
    return () => {
      dialog.close();
      unlock();
      if(opener?.isConnected)opener.focus({preventScroll:true});
    };
  }, []);
  return (
    <dialog
      className={`tap-dialog ${className}`}
      style={style}
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
    >
      <div className="dialog-header">
        <h2>{title}</h2>
        <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}
export function CategoryPicker({ categories, value, onChange, onAdd }) {
  const [up, setUp] = useState(false);
  const ref = useRef(null),
    current = categories.find((c) => c.id === value) || categories[0];
  useEffect(() => {
    function close(e) {
      if (!ref.current?.contains(e.target))
        ref.current?.removeAttribute("open");
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <details
      className={`category-picker ${up ? "open-up" : ""}`}
      ref={ref}
      data-guide="category"
      onToggle={(e) => {
        if (e.currentTarget.open) {
          const picker = e.currentTarget;
          const summary = picker.querySelector("summary");
          const options = picker.querySelector(".category-options");
          const summaryRect = summary.getBoundingClientRect();
          const optionsHeight =
            options.getBoundingClientRect().height ||
            Math.min(280, categories.length * 62 + 70);
          const careActions = picker
            .closest(".today-focused")
            ?.querySelector(".today-care-actions");
          const careRect = careActions?.getBoundingClientRect();
          const menuTop = summaryRect.bottom + 9;
          const overlapsCare =
            careRect &&
            menuTop < careRect.bottom &&
            menuTop + optionsHeight > careRect.top;
          const needsUp =
            window.innerHeight - summaryRect.bottom < optionsHeight + 9 ||
            overlapsCare;
          setUp(needsUp && summaryRect.top >= optionsHeight + 9);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          ref.current.open = false;
          ref.current.querySelector("summary").focus();
        }
      }}
    >
      <summary aria-label={`Categoria selecionada: ${current.name}`}>
        <i style={{ background: auraForCategory(current) }} />
        <span className="category-name">{current.name}</span>
        <ChevronDown size={14} />
      </summary>
      <div className="category-options" aria-label="Escolher categoria">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={value === c.id}
            aria-label={`${c.name}, +1 = 1 ${unitLabel(c)}`}
            onClick={() => {
              onChange(c.id);
              ref.current.open = false;
              ref.current.querySelector("summary").focus();
            }}
          >
            <i style={{ background: auraForCategory(c) }} />
            <span>
              {c.name}
              <small>+1 = 1 {unitLabel(c)}</small>
            </span>
            {value === c.id && <Check size={15} />}
          </button>
        ))}
        {onAdd&&<button type="button" onClick={()=>{ref.current.open=false;onAdd();}}>Adicionar novo item</button>}
      </div>
    </details>
  );
}
export function EntryList({
  entries,
  data,
  onEdit,
  confirmed = false,
  readonly = false,
  pageSize = 0,
  paginationKey = "entries",
}) {
  const [page,setPage]=useState(0);
  useEffect(()=>setPage(0),[paginationKey]);
  const pages=pageSize?Math.max(1,Math.ceil(entries.length/pageSize)):1,currentPage=Math.min(page,pages-1);
  const ordered=[...entries].sort((a,b)=>new Date(b.time)-new Date(a.time));
  const shown=pageSize?ordered.slice(currentPage*pageSize,(currentPage+1)*pageSize):ordered;
  if (!entries.length)
    return (
      <div className="empty-state">
        <Leaf size={24} />
        <p>
          {confirmed
            ? "Dia confirmado sem consumo."
            : "Nenhum consumo registrado."}
        </p>
        <small>
          {confirmed
            ? "Seu check-in faz parte do acompanhamento."
            : "Um dia sem registros ainda não é um dia confirmado sem consumo."}
        </small>
      </div>
    );
  return (
    <div className="entry-list-container"><div className="entries">
      {shown.map((e) => (
          <button
            key={e.id}
            className="entry-row"
            disabled={readonly}
            onClick={readonly ? undefined : () => onEdit(e)}
          >
            <i
              style={{
                background: auraForCategory(
                  data.categories.find((c) => c.id === e.category),
                ),
              }}
            />
            <span>
              <b>
                {data.categories.find((c) => c.id === e.category)?.name ||
                  e.name}
              </b>
              <small>
                {new Date(e.time).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {e.quantity} {({session:"sessão(ões)",package:"pacote(s)",gram:"g",item:"un."})[e.unit] || "un."}
                {e.grams != null ? ` · ${e.grams} g` : ""}
              </small>
            </span>
            <strong>
              {e.cost == null
                ? "Não informado"
                : money(Math.round(e.cost * 100))}
            </strong>
            {!readonly && <Pencil size={13} />}
          </button>
        ))}
    </div>
    {pages>1&&<nav className="entry-pagination" aria-label="Páginas de registros"><button className="button secondary" disabled={currentPage===0} onClick={()=>setPage(v=>Math.max(0,v-1))}>Anterior</button><span>{currentPage+1} / {pages}</span><button className="button secondary" disabled={currentPage===pages-1} onClick={()=>setPage(v=>Math.min(pages-1,v+1))}>Próxima</button></nav>}
    </div>
  );
}
export function EntryForm({ entry, categories, onSave, onDelete }) {
  const ref = useRef(null);
  function estimate() {
    const f = ref.current,
      c = categories.find((c) => c.id === f.elements.category.value);
    f.elements.cost.value =
      f.elements.grams.value !== "" && c.gramPrice != null
        ? (Number(f.elements.grams.value) * c.gramPrice).toFixed(2)
        : c.price == null
          ? ""
          : (Number(f.elements.quantity.value) * c.price).toFixed(2);
  }
  return (
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget),
          c = categories.find((x) => x.id === f.get("category"));
        onSave({
          ...entry,
          time: new Date(f.get("time")).toISOString(),
          category: c.id,
          name: c.name,
          unit: c.unit || "item",
          quantity: Number(f.get("quantity")),
          grams: f.get("grams") === "" ? null : Number(f.get("grams")),
          cost: f.get("cost") === "" ? null : Number(f.get("cost")),
          note: f.get("note").trim(),
        });
      }}
    >
      <label>
        Data e horário
        <DateTimePicker
          name="time"
          type="datetime-local"
          required
          defaultValue={localTime(entry.time)}
          max={localTime(new Date().toISOString())}
        />
      </label>
      <label>
        O que foi consumido
        <GlassSelect
          name="category"
          defaultValue={entry.category}
          onChange={estimate}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {unitLabel(c)}
            </option>
          ))}
        </GlassSelect>
      </label>
      <div className="form-grid">
        <label>
          Quantidade da categoria
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={entry.quantity}
            required
            onChange={estimate}
          />
        </label>
        <label>
          Material em gramas · opcional
          <input
            name="grams"
            type="number"
            min="0"
            step="0.01"
            defaultValue={entry.grams ?? ""}
            onChange={estimate}
            placeholder="Não informado"
          />
        </label>
      </div>
      <label>
        Custo estimado deste consumo (R$)
        <input
          name="cost"
          type="number"
          min="0"
          step="0.01"
          defaultValue={entry.cost == null ? "" : round(entry.cost)}
          placeholder="Não informado"
        />
      </label>
      <p className="field-help">
        Quantidade e gramas são medidas separadas. Custo vazio fica como não
        informado.
      </p>
      <label>
        Nota pessoal · opcional
        <textarea
          name="note"
          maxLength={500}
          defaultValue={entry.note || ""}
          placeholder="Algo que você queira lembrar"
          rows={2}
        />
      </label>
      <button className="button primary full">Salvar registro</button>
      {onDelete && (
        <button type="button" className="button danger full" onClick={onDelete}>
          Excluir registro
        </button>
      )}
    </form>
  );
}
export function Coverage({ known, total: count = 7 }) {
  return (
    <span className="coverage">
      {known}/{count} dias acompanhados
    </span>
  );
}
