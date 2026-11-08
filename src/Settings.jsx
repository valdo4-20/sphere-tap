import './interfaceRepairs.css';
import DatePicker from "./DatePicker";
import {AppUpdateSettings} from './AppUpdate';
import AuraPreview from "./AuraPreview";
import ItemForm from "./ItemForm";
import ProfilePicker from "./ProfilePicker";
import Terms from "./Terms";
import GlassSelect from "./GlassSelect";
import React, {useState} from "react";
import {
  Check,
  Plus,
  Download,
  Upload,
  ShieldCheck,
  HelpCircle,
  Play,
  Trash2,
  ChevronDown,
  Leaf,
} from "lucide-react";
import { PaletteGallery, ColorChoices } from "./PaletteGallery";
import { appearanceFor } from "./appearance";
import { PageTitle } from "./ui";
import { auraForCategory } from "./Aura";
import { uid, money, unitLabel } from "./model";
export default function Settings({
  data,
  onChange,
  onNotify,
  onWelcome,
  onGuide,
  onOpening,
  onExport,
  onImport,
  onClear,
  onInstall,
}) {
  const [editing,setEditing]=useState(null);
  return (
    <section className="route-transition settings-page" data-guide="settings">
      <PageTitle eyebrow="SEU ESPAÇO" title="Do seu jeito.">
        Categorias, privacidade e apoio para usar o Tap.
      </PageTitle>
      <AppUpdateSettings/>
      <details className="settings-disclosure" data-guide="aura-customization" open>
        <summary>
          AURA e paletas de interface
          <ChevronDown size={17} />
        </summary>
        <p className="field-help">
          Escolha uma proposta de paleta ou defina sua própria cor. A AURA ocupa
          a tela inteira; o ritmo semanal continua independente da cor.
        </p>
        <label>Movimento da AURA</label>
        <div className="palette-gallery aura-preset-choices">
          {[["cover","Personalizada"],["cosmic","Cósmica"],["event-horizon","Horizonte de Eventos"],["eclipse","Eclipse"],["frequency","Frequência"],["oblivion","Oblivion"]].map(([id,name])=><button type="button" className={"palette-card aura-preset-card preset-"+id} key={id} aria-pressed={(data.appearance?.preset||"cover")===id} onClick={()=>onChange(d=>({...d,appearance:{...d.appearance,preset:id}}))}><AuraPreview preset={id} color={appearanceFor(data).color} enabled={data.aura}/><strong>{name}</strong></button>)}
        </div>
        <PaletteGallery
          current={appearanceFor(data).palette.id}
          onChoose={(p) =>
            onChange((d) => ({
              ...d,
              appearance: { ...d.appearance, palette: p.id, auraColor: p.aura },
            }))
          }
        />
        <label>
          Cor personalizada da AURA
          <input
            type="color"
            value={appearanceFor(data).color}
            onChange={(e) =>
              onChange((d) => ({
                ...d,
                appearance: { ...d.appearance, auraColor: e.target.value },
              }))
            }
          />
        </label>
        <ColorChoices
          value={appearanceFor(data).color}
          onChange={(color) =>
            onChange((d) => ({
              ...d,
              appearance: { ...d.appearance, auraColor: color },
            }))
          }
        />
      </details>
      <details className="settings-disclosure">
        <summary>Seu perfil<ChevronDown size={17}/></summary>
        <ProfilePicker value={data.profile} onChange={profile=>onChange(d=>({...d,profile}))}/>
        <label>Data de nascimento<DatePicker type="date" min="1900-01-01" max={new Date().toLocaleDateString("en-CA")} value={data.birthDate||""} onChange={e=>onChange(d=>({...d,birthDate:e.target.value}))}/></label>
      </details>
      <form
        className="profile-name-form"
        onSubmit={(e) => {
          e.preventDefault();
          const displayName = new FormData(e.currentTarget)
            .get("displayName")
            .trim();
          onChange((d) => ({ ...d, displayName }));
          onNotify("Seu nome foi atualizado.");
        }}
      >
        <label>
          Seu nome na saudação
          <input
            name="displayName"
            defaultValue={data.displayName || ""}
            maxLength={32}
            placeholder="Nome ou apelido"
            autoComplete="nickname"
          />
        </label>
        <button className="button secondary">
          <Check size={15} />
          Salvar nome
        </button>
      </form>
      <details className="settings-disclosure" open>
        <summary>
          Categorias e custos
          <ChevronDown size={17} />
        </summary>
        <p className="field-help">
          Adicione só os itens que você quer acompanhar.
        </p>
        {data.categories.filter(c=>c.enabled!==false).map(c=><div key={c.id} className="item-settings-row"><i style={{background:c.auraColor}}/><span><b>{c.name}</b><small>{unitLabel(c)} · {c.price==null?"Custo não informado":money(Math.round(c.price*100))+" por registro"}</small></span><button className="button secondary" onClick={()=>setEditing(c)}>Editar</button><button className="quiet-button" onClick={()=>onChange(d=>({...d,categories:d.categories.map(x=>x.id===c.id?{...x,enabled:false}:x)}))}>Ocultar</button></div>)}
        {editing!==null?<ItemForm key={editing.id||"new"} item={editing.id?editing:null} onCancel={()=>setEditing(null)} onSave={item=>{onChange(d=>({...d,categories:d.categories.some(c=>c.id===item.id)?d.categories.map(c=>c.id===item.id?item:c):[...d.categories,item]}));setEditing(null);onNotify("Item salvo. Custos anteriores preservados.");}}/>:<button className="button secondary" onClick={()=>setEditing({})}><Plus size={16}/>Adicionar novo item</button>}
        {data.categories.some(c=>c.enabled===false)&&<details className="compact-explanation"><summary>Itens ocultos</summary>{data.categories.filter(c=>c.enabled===false).map(c=><div className="item-settings-row" key={c.id}><span>{c.name}</span><button className="button secondary" onClick={()=>setEditing(c)}>Configurar e mostrar</button></div>)}</details>}
      </details>
      <details className="settings-disclosure">
        <summary>
          Aparência e dicas
          <ChevronDown size={17} />
        </summary>
        <label className="toggle-row"><span><b>Sons da Jornada</b><small>Botões, perguntas e conclusão do desafio.</small></span><input type="checkbox" role="switch" aria-label="Sons da Jornada" checked={data.preferences.journeySound!==false} onChange={e=>onChange(d=>({...d,preferences:{...d.preferences,journeySound:e.target.checked}}))}/></label>
        <label className="toggle-row"><span><b>Som de conquista</b><small>Apenas para novos marcos de cuidado.</small></span><input type="checkbox" role="switch" aria-label="Som de conquista" checked={data.preferences.achievementSound!==false} onChange={e=>onChange(d=>({...d,preferences:{...d.preferences,achievementSound:e.target.checked}}))}/></label>
        <label className="toggle-row">
          <span>
            <b>Movimento da AURA</b>
            <small>Respeita também o movimento reduzido do aparelho.</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Movimento da AURA"
            checked={data.aura}
            onChange={(e) =>
              onChange((d) => ({ ...d, aura: e.target.checked }))
            }
          />
        </label>
        <label className="toggle-row">
          <span>
            <b>Dicas contextuais</b>
            <small>Pequenas orientações quando fizerem sentido.</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Dicas contextuais"
            checked={data.preferences.tips}
            onChange={(e) =>
              onChange((d) => ({
                ...d,
                preferences: { ...d.preferences, tips: e.target.checked },
              }))
            }
          />
        </label>
        <label className="toggle-row">
          <span>
            <b>Lembrete de check-in no app</b>
            <small>
              Aparece enquanto o Tap estiver aberto. Sem notificações externas.
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Lembrete de check-in no app"
            checked={data.preferences.reminderEnabled}
            onChange={(e) =>
              onChange((d) => ({
                ...d,
                preferences: {
                  ...d.preferences,
                  reminderEnabled: e.target.checked,
                },
              }))
            }
          />
        </label>
        {data.preferences.reminderEnabled && (
          <label className="reminder-time-field">
            Horário do lembrete
            <input
              type="time"
              aria-label="Horário do lembrete"
              required
              value={data.preferences.reminderTime}
              onChange={(e) => {const value=e.target.value;if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return;onChange(d=>({...d,preferences:{...d.preferences,reminderTime:value}}));}}
            />
          </label>
        )}
        <div className="stack-actions">
          <button className="button secondary" onClick={onWelcome}>
            <Leaf size={16} />
            Rever boas-vindas
          </button>
          <button className="button secondary" onClick={onGuide}>
            <HelpCircle size={16} />
            Abrir guia interativo
          </button>
          <button className="button secondary" onClick={onOpening}>
            <Play size={16} />
            Rever abertura Sphere Tap
          </button>
        </div>
      </details>
      <details className="settings-disclosure">
        <summary>
          Seus dados e privacidade
          <ChevronDown size={17} />
        </summary>
        <div className="privacy-copy">
          <ShieldCheck size={24} />
          <p>
            Sem conta, rastreamento, anúncios ou pagamentos. Os dados ficam
            neste navegador e endereço. Outros aparelhos não recebem o histórico
            automaticamente.
          </p>
        </div>
        <p className="field-help">
          O backup contém informações pessoais em texto simples, sem
          criptografia. Guarde-o em um lugar seguro. Limpar o navegador pode
          apagar o histórico.
        </p>
        <div className="stack-actions">
          <button className="button secondary" onClick={() => onExport("json")}>
            <Download size={16} />
            Exportar backup completo
          </button>
          <button className="button secondary" onClick={() => onExport("csv")}>
            <Download size={16} />
            Exportar registros em CSV
          </button>
          <button className="button secondary" onClick={onImport}>
            <Upload size={16} />
            Restaurar backup
          </button>
          <button className="button secondary" onClick={onInstall}>
            <Plus size={16} />
            Instalar aplicativo
          </button>
          <button className="button danger" onClick={onClear}>
            <Trash2 size={16} />
            Apagar os dados deste dispositivo
          </button>
        </div>
      </details>
      <details className="settings-disclosure"><summary>Termos e privacidade<ChevronDown size={17}/></summary><Terms/></details>
    </section>
  );
}
