import DateTimePicker from "./DateTimePicker";
import DatePicker from "./DatePicker";
import GlassSelect from "./GlassSelect";
import React from "react";
import { Check, Trash2 } from "lucide-react";
import { dayKey, uid, round, localTime, money } from "./model";
export function PurchaseForm({ purchase, data, onSave, onDelete }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave(
          {
            id: purchase?.id || uid(),
            date: f.get("date"),
            category: f.get("category"),
            quantity: Number(f.get("quantity")),
            unit: f.get("unit"),
            amount: Number(f.get("amount")),
            note: f.get("note").trim(),
          },
          f.get("updatePrice") === "on",
        );
      }}
    >
      <label>
        Data da compra
        <DatePicker
          name="date"
          type="date"
          defaultValue={purchase?.date || dayKey()}
          max={dayKey()}
          required
        />
      </label>
      <label>
        Categoria
        <GlassSelect
          name="category"
          defaultValue={purchase?.category || data.categories.find(c=>c.enabled!==false)?.id||""}
        >
          {data.categories.filter(c=>c.enabled!==false || c.id===purchase?.category).map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </GlassSelect>
      </label>
      <div className="form-grid">
        <label>
          Quantidade comprada
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={purchase?.quantity || ""}
          />
        </label>
        <label>
          Medida
          <GlassSelect name="unit" defaultValue={purchase?.unit || "item"}>
            <option value="item">Unidades</option>
            <option value="package">Pacotes / conjuntos</option>
            <option value="gram">Gramas</option>
            <option value="session">Sessões</option>
          </GlassSelect>
        </label>
      </div>
      <label>
        Total pago (R$)
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={purchase?.amount ?? ""}
        />
      </label>
      <label>
        Nota · opcional
        <textarea
          name="note"
          maxLength={500}
          rows={2}
          defaultValue={purchase?.note || ""}
        />
      </label>
      <label className="check-row">
        <input type="checkbox" name="updatePrice" />
        <span>
          Usar o valor dividido pela quantidade como custo sugerido de novos
          registros
        </span>
      </label>
      <p className="field-help">
        Gramas só calculam custos quando o consumo tem gramas informadas.
        Unidades e sessões precisam combinar com a categoria. Compras e custo
        consumido não são somados.
      </p>
      <button className="button primary full">
        <Check size={16} />
        Salvar compra
      </button>
      {onDelete && (
        <button className="button danger full" type="button" onClick={onDelete}>
          <Trash2 size={16} />
          Excluir compra
        </button>
      )}
    </form>
  );
}
export function CravingForm({ craving, onSave, onDelete }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: craving?.id || uid(),
          time: new Date(f.get("time")).toISOString(),
          intensity: Number(f.get("intensity")),
          context: f.get("context").trim(),
          note: f.get("note").trim(),
        });
      }}
    >
      <p>
        Observar uma vontade é diferente de registrar consumo. Este diário é
        opcional.
      </p>
      <fieldset className="entry-datetime">
        <legend>Data e horário</legend>
        <DateTimePicker
          name="time"
          type="datetime-local"
          required
          max={localTime(new Date().toISOString())}
          defaultValue={localTime(craving?.time || new Date().toISOString())}
        />
      </fieldset>
      <label>
        Intensidade
        <GlassSelect name="intensity" defaultValue={craving?.intensity || 3}>
          {[1, 2, 3, 4, 5].map((v) => (
            <option key={v} value={v}>
              {v} / 5{v === 1 ? " · leve" : v === 5 ? " · intensa" : ""}
            </option>
          ))}
        </GlassSelect>
      </label>
      <label>
        Contexto · opcional
        <input
          name="context"
          maxLength={120}
          defaultValue={craving?.context || ""}
          placeholder="Como você estava ou o que acontecia"
        />
      </label>
      <label>
        Nota pessoal · opcional
        <textarea
          name="note"
          maxLength={1000}
          defaultValue={craving?.note || ""}
          rows={3}
        />
      </label>
      <button className="button primary full">Salvar vontade</button>
      {onDelete && (
        <button className="button danger full" type="button" onClick={onDelete}>
          Excluir vontade
        </button>
      )}
    </form>
  );
}
