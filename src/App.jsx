import Journey from './Journey.jsx';
import Wallet from "./Wallet.jsx";
import {AppUpdateNotice} from './AppUpdate';

import AchievementCelebration from "./AchievementCelebration";
import {prepareAchievementAudio,playAchievementSound} from "./achievementAudio";
import GlassSelect from "./GlassSelect";
import ItemForm from "./ItemForm";
import Profile from "./Profile";
import {unlockAchievements} from "./achievements";
import {auraMessageForCategory,auraToneForCategory} from "./items";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, Undo2, Download, Info } from "lucide-react";
import Opening from "./Opening";
import Aura, { auraForCategory } from "./Aura";
import Brand from "./Brand";
import { appearanceFor, themeVariables, greetingGradient } from "./appearance";
import SphereShell from "./SphereShell";
import Welcome, { Guide } from "./Welcome";
import Today from "./Today";
import History, { Care, Goals } from "./HistoryCare";
import Insights, { MonthlyRewind } from "./Insights";
import Settings from "./Settings";
import { Dialog, EntryForm } from "./ui";
import { PurchaseForm, CravingForm } from "./Forms";
import {
  initial,
  migrate,
  validData,
  uid,
  dayKey,
  localTime,
  total,
  createEntry,
  adjustCategoryTotal,
  csvExport,
  round,
  money,
  weeklyAura,
} from "./model";
import "./style.css";
import "./sphere/shell.css";
import "./tap.css";
import "./refinements.css";
import "./focus.css";
import "./responsive.css";
import "./revision.css";
const STORAGE = "sphere-tap-v1";
function App() {
  const [data, setData] = useState(() => {
    try {
      const text = localStorage.getItem(STORAGE);
      return text ? migrate(JSON.parse(text)) : structuredClone(initial);
    } catch {
      return structuredClone(initial);
    }
  });
  const [route, setRouteState] = useState("Hoje"),
    [category, setCategory] = useState(data.categories.find(c=>c.enabled!==false)?.id||""),
    [modal, setModal] = useState(null),
    [guide, setGuide] = useState(null),
    [welcome, setWelcome] = useState(!data.welcomeDone),
    [opening, setOpening] = useState(() => {
      try {
        return sessionStorage.getItem("sphere-tap-opened") !== "yes";
      } catch {
        return true;
      }
    }),
    [toast, setToast] = useState(""),
    [pulse, setPulse] = useState(0),
    [now, setNow] = useState(new Date()),
    [storageError, setStorageError] = useState(false),
    [install, setInstall] = useState(null);
  const setRoute = useCallback((nextRoute) => {
    const update = () => setRouteState(nextRoute);
    if (
      nextRoute === route ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof document.startViewTransition !== "function"
    ) {
      update();
      return;
    }
    document.startViewTransition(update);
  }, [route]);
  const [celebration,setCelebration]=useState(null);
  const achievementsReady=useRef(false);
  const undo = useRef(null),
    file = useRef(null),
    recovery = useRef(null);
  const visual = appearanceFor(data);
  useEffect(()=>{
    const updated=unlockAchievements(data,now.toISOString());
    if(updated!==data){
      const ids=Object.keys(updated.achievements).filter(id=>!data.achievements?.[id]);
      setData(updated);
      if(achievementsReady.current&&ids.length){
        setCelebration({id:ids[0],count:ids.length});
        if(data.preferences.achievementSound!==false)playAchievementSound();
      }
    }
    achievementsReady.current=true;
  },[data,dayKey(now)]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = visual.palette.light ? "light" : "dark";
    for (const [k, v] of Object.entries(themeVariables(visual.palette)))
      root.style.setProperty(k, v);
    root.style.setProperty("--active-aura", visual.color);
    root.style.setProperty(
      "--greeting-aura-gradient",
      greetingGradient(visual.color),
    );
  }, [visual.palette.id, visual.color]);
  const notify = useCallback((message) => setToast(message), []);
  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE);
      let parsed;
      try {
        parsed = current ? JSON.parse(current) : null;
      } catch {
        recovery.current = current;
        setStorageError(true);
        return;
      }
      if (current && !validData(parsed)) {
        recovery.current = current;
        setStorageError(true);
        return;
      }
      localStorage.setItem(STORAGE, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    const before = (e) => {
      e.preventDefault();
      setInstall(e);
    };
    window.addEventListener("beforeinstallprompt", before);
    return () => {
      clearInterval(t);
      window.removeEventListener("beforeinstallprompt", before);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(t);
  }, [toast]);
  const finishOpening = useCallback(() => {
    try {
      sessionStorage.setItem("sphere-tap-opened", "yes");
    } catch {}
    setOpening(false);
  }, []);
  function mutate(fn) {
    if(data.preferences.achievementSound!==false)prepareAchievementAudio();
    undo.current = data;
    setData(fn);
  }
  const chosen =
    data.categories.find((c) => c.id === category && c.enabled!==false) || data.categories.find(c=>c.enabled!==false);
  function invalidate(days, dates) {
    const result = { ...days };
    for (const date of dates)
      if (result[date]?.confirmed)
        result[date] = { ...result[date], confirmed: false };
    return result;
  }
  function add() {
    if(!chosen){setRoute("Configurações");return;}
    const time = new Date(),
      entry = createEntry(chosen, time.toISOString());
    mutate((d) => ({
      ...d,
      entries: [...d.entries, entry],
      days: invalidate(d.days, [dayKey(time)]),
    }));
    setNow(time);
    setPulse((p) => p + 1);
    const feedback=auraMessageForCategory(chosen);
    notify(`${feedback} ${entry.cost == null
      ? "Custo não informado."
      : `${money(Math.round(entry.cost * 100))} a mais em gastos.`}`);
  }
  function details(entry, date = dayKey()) {
    if(!chosen&&!entry){setRoute("Configurações");return;}
    const time =
      date === dayKey()
        ? new Date().toISOString()
        : new Date(`${date}T12:00`).toISOString();
    setModal({
      kind: "entry",
      entry: entry || createEntry(chosen, time),
      isNew: !entry,
    });
  }
  function saveEntry(entry) {
    const previous = data.entries.find((e) => e.id === entry.id);
    mutate((d) => ({
      ...d,
      entries: [...d.entries.filter((e) => e.id !== entry.id), entry],
      days: invalidate(d.days, [
        dayKey(new Date(entry.time)),
        ...(previous ? [dayKey(new Date(previous.time))] : []),
      ]),
    }));
    setModal(null);
    notify("Registro salvo.");
  }
  function deleteEntry(entry) {
    mutate((d) => ({
      ...d,
      entries: d.entries.filter((e) => e.id !== entry.id),
      days: invalidate(d.days, [dayKey(new Date(entry.time))]),
    }));
    setModal(null);
    notify("Registro excluído. Você pode desfazer.");
  }
  function saveDay(date, day) {
    mutate((d) => ({ ...d, days: { ...d.days, [date]: day } }));
    notify(day.confirmed ? "Dia acompanhado e salvo." : "Check-in salvo.");
  }
  function finishWelcome(options, showGuide) {
    if(data.preferences.achievementSound!==false)prepareAchievementAudio();
    setData((d) => ({ ...d, ...options, welcomeDone: true }));
    setWelcome(false);
    setRoute("Hoje");
    if (showGuide) setGuide(0);
  }
  function openGuide() {
    setModal(null);
    setRoute("Hoje");
    setGuide(0);
  }
  function download(text, name, type) {
    const url = URL.createObjectURL(new Blob([text], { type })),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportData(type) {
    const exportable=type==="json"?unlockAchievements({...data,careMilestones:{...data.careMilestones,backupPreparedAt:new Date().toISOString(),backupDays:[...new Set([...(data.careMilestones?.backupDays||[]),dayKey()])]}}):data;
    if(type==="json"){
      if(data.preferences.achievementSound!==false)prepareAchievementAudio();
      setData({...exportable,achievements:data.achievements});
    }
    download(
      type === "csv" ? csvExport(data) : JSON.stringify(exportable, null, 2),
      `sphere-tap-${dayKey()}.${type}`,
      type === "csv" ? "text/csv;charset=utf-8" : "application/json",
    );
  }
  async function importData(e) {
    try {
      if (!e.target.files?.[0]) return;
      const x = JSON.parse(await e.target.files[0].text());
      if (!validData(x)) throw Error();
      setModal({ kind: "import", data: migrate(x) });
    } catch {
      notify("Backup inválido. Os dados atuais não foram alterados.");
    } finally {
      e.target.value = "";
    }
  }
  function savePurchase(purchase, update) {
    const cat = data.categories.find((c) => c.id === purchase.category),
      matches =
        purchase.unit === "gram" || purchase.unit === (cat.unit || "item");
    mutate((d) => ({
      ...d,
      purchases: [...d.purchases.filter((p) => p.id !== purchase.id), purchase],
      categories:
        update && matches
          ? d.categories.map((c) =>
              c.id !== purchase.category
                ? c
                : {
                    ...c,
                    [purchase.unit === "gram" ? "gramPrice" : "price"]:
                      purchase.amount / purchase.quantity,
                  },
            )
          : d.categories,
    }));
    setModal(null);
    notify(
      update && !matches
        ? "Compra salva. O custo da categoria foi mantido porque as unidades são diferentes."
        : "Compra salva. O custo de registros anteriores foi preservado.",
    );
  }
  function saveCraving(c) {
    mutate((d) => ({
      ...d,
      cravings: [...d.cravings.filter((x) => x.id !== c.id), c],
    }));
    setModal(null);
    notify("Vontade registrada. Nenhum consumo foi adicionado.");
  }
  async function installApp() {
    if (install) {
      await install.prompt();
      setInstall(null);
    } else
      notify(
        "iPhone: Compartilhar → Adicionar à Tela de Início. Android: menu do navegador → Instalar aplicativo.",
      );
  }
  if (opening) return <Opening onComplete={finishOpening} />;
  if (welcome)
    return (
      <Welcome
        color={visual.color}
        initialName={data.displayName}
        initialProfile={data.profile}
        initialBirthDate={data.birthDate}
        initialIntent={data.intent}
        onComplete={finishWelcome}
      />
    );
  let title =
    modal?.kind === "entry"
      ? modal.isNew
        ? "Novo registro"
        : "Editar registro"
      : modal?.kind === "purchase"
        ? "Registrar compra"
        : modal?.kind === "craving"
          ? "Observar uma vontade"
          : modal?.kind === "rewind"
            ? "Sua AURA no mês"
            : modal?.kind === "adjust"
              ? "Ajustar quantidade do dia"
              : modal?.kind === "import"
                ? "Restaurar backup"
                : modal?.kind === "clear"
                  ? "Apagar dados deste dispositivo"
                  : modal?.kind==="item" ? "Adicionar novo item" : "Sobre a sua AURA";
  return (
    <>
      <AppUpdateNotice data={data} storageError={storageError} blocked={Boolean(modal)||guide!==null||Boolean(celebration)}/>
      <div className="aura-viewport">
        <Aura
          fullscreen
          preset={data.appearance?.preset||"cover"}
          enabled={data.aura}
          color={visual.color}
          motion={weeklyAura(data).motion}
          pulse={pulse}
          pulseColor={auraToneForCategory(chosen)==="attention"?"#d95d6d":auraForCategory(chosen)}
          alert={auraToneForCategory(chosen)==="attention"}
        />
      </div>
      {route==="Hoje"&&<Brand
        light={visual.palette.light&&!(route==="Perfil"&&data.profile.type==="photo")}
        photo={route==="Perfil"&&data.profile.type==="photo"}
        onHome={() => {
          setRoute("Hoje");
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
      />}
      <SphereShell route={["Configurações","Metas"].includes(route)?"Perfil":["Cuidado","Jornada"].includes(route)?"Hoje":route==="Histórico"?"Análises":route} onRoute={setRoute} guide={guide !== null}>
        {storageError && (
          <div className="storage-warning" role="alert">
            <p>
              O navegador não pôde salvar seus dados. Exporte um backup antes de
              sair. Se havia um arquivo de dados inválido, ele não foi
              sobrescrito.
            </p>
            <button
              className="button secondary"
              onClick={() => exportData("json")}
            >
              Exportar dados atuais
            </button>
            {recovery.current && (
              <button
                className="quiet-button"
                onClick={() =>
                  download(
                    recovery.current,
                    "sphere-tap-recuperacao.txt",
                    "text/plain",
                  )
                }
              >
                Baixar conteúdo anterior para recuperação
              </button>
            )}
          </div>
        )}
        {route === "Jornada" && <Journey progress={data.journey} onChange={update=>setData(d=>({...d,journey:typeof update==="function"?update(d.journey):update}))}/>}
        {route === "Hoje" && (
          <Today
            data={data}
            onNewItem={()=>setModal({kind:"item"})}
            category={category}
            onCategory={setCategory}
            onAdd={add}
            onDetails={details}
            onRoute={setRoute}
            onRewind={() => setModal({ kind: "rewind" })}
            onDaySave={saveDay}
            onGuide={openGuide}
            onExplain={() => setModal({ kind: "auraInfo" })}
            pulse={pulse}
            now={now}
          />
        )}
        {route === "Histórico" && (
          <History
            data={data}
            onEdit={details}
            onAdd={(date) => details(null, date)}
            onDaySave={saveDay}
            onAdjust={(date) => setModal({ kind: "adjust", date })}
          />
        )}
        {route === "Carteira" && <Wallet data={data} onChange={mutate} onNotify={notify} onNewItem={()=>setModal({kind:"item"})} onPurchase={purchase=>chosen||purchase?setModal({kind:"purchase",purchase}):setModal({kind:"item"})}/>}
        {route === "Análises" && (
          <Insights
            onHistory={()=>setRoute("Histórico")}
            data={data}
            onPurchase={(purchase) => chosen||purchase?setModal({ kind: "purchase", purchase }):setRoute("Configurações")}
            onRewind={() => setModal({ kind: "rewind" })}
          />
        )}
        {route === "Cuidado" && (
          <Care
            onGoals={()=>setRoute("Metas")}
            data={data}
            onChange={mutate}
            onDaySave={saveDay}
            onCraving={(craving) => setModal({ kind: "craving", craving })}
          />
        )}
        {route === "Metas" && (
          <Goals data={data} onChange={mutate} onNotify={notify} />
        )}
        {route==="Perfil"&&<Profile onCare={()=>setRoute("Cuidado")} data={data} onChange={mutate} onNotify={notify} onBack={()=>setRoute("Hoje")} onSettings={()=>setRoute("Configurações")}/>}
        {route === "Configurações" && (
          <Settings
            data={data}
            onChange={mutate}
            onNotify={notify}
            onWelcome={() => setWelcome(true)}
            onGuide={openGuide}
            onOpening={() => setOpening(true)}
            onExport={exportData}
            onImport={() => file.current.click()}
            onClear={() => setModal({ kind: "clear" })}
            onInstall={installApp}
          />
        )}
      </SphereShell>
      <input
        className="sr-only"
        ref={file}
        type="file"
        accept="application/json,.json"
        onChange={importData}
        tabIndex={-1}
        aria-label="Importar backup"
      />
      {modal && (
        <Dialog
          key={
            modal.kind +
            (modal.entry?.id || modal.purchase?.id || modal.craving?.id || "")
          }
          title={title}
          className={modal.kind==="entry"?"compact-entry-dialog":""}
          onClose={() => setModal(null)}
        >
          {modal.kind === "entry" && (
            <EntryForm
              entry={modal.entry}
              categories={data.categories.filter(c=>c.enabled!==false || c.id===modal.entry?.category)}
              onSave={saveEntry}
              onDelete={modal.isNew ? null : () => deleteEntry(modal.entry)}
            />
          )}
          {modal.kind==="item"&&<ItemForm onSave={item=>{
            mutate(d=>({...d,categories:[...d.categories,item]}));
            setCategory(item.id);setModal(null);notify("Item adicionado.");
          }}/>}
          {modal.kind === "purchase" && (
            <PurchaseForm
              purchase={modal.purchase}
              data={data}
              onSave={savePurchase}
              onDelete={
                modal.purchase
                  ? () => {
                      mutate((d) => ({
                        ...d,
                        purchases: d.purchases.filter(
                          (p) => p.id !== modal.purchase.id,
                        ),
                      }));
                      setModal(null);
                      notify(
                        "Compra excluída. Você pode desfazer. O preço sugerido não foi alterado.",
                      );
                    }
                  : null
              }
            />
          )}
          {modal.kind === "craving" && (
            <CravingForm
              craving={modal.craving}
              onSave={saveCraving}
              onDelete={
                modal.craving
                  ? () => {
                      mutate((d) => ({
                        ...d,
                        cravings: d.cravings.filter(
                          (c) => c.id !== modal.craving.id,
                        ),
                      }));
                      setModal(null);
                      notify("Vontade excluída. Você pode desfazer.");
                    }
                  : null
              }
            />
          )}
          {modal.kind === "rewind" && <MonthlyRewind data={data} />}
          {modal.kind === "adjust" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  c = data.categories.find((c) => c.id === f.get("category"));
                mutate((d) => {
                  const result = adjustCategoryTotal(
                    d,
                    modal.date,
                    c,
                    Number(f.get("target")),
                  );
                  return { ...result, days: invalidate(d.days, [modal.date]) };
                });
                setModal(null);
                notify("Quantidade ajustada. Você pode desfazer.");
              }}
            >
              <p>
                O ajuste vale apenas para a categoria escolhida. Reduções afetam
                os registros mais recentes e seus custos proporcionalmente.
              </p>
              <label>
                Categoria
                <GlassSelect
                  name="category"
                  defaultValue={chosen.id}
                  onChange={(e) => {
                    e.target.form.elements.target.value = total(
                      data.entries.filter(
                        (x) =>
                          x.category === e.target.value &&
                          dayKey(new Date(x.time)) === modal.date,
                      ),
                    ).count;
                  }}
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </GlassSelect>
              </label>
              <label>
                Total desejado na categoria
                <input
                  name="target"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={
                    total(
                      data.entries.filter(
                        (e) =>
                          e.category === chosen.id &&
                          dayKey(new Date(e.time)) === modal.date,
                      ),
                    ).count
                  }
                />
              </label>
              <p className="field-help">
                Ao aumentar, a diferença vira um novo registro ao meio-dia.
                Gramas desconhecidas não são estimadas.
              </p>
              <button className="button primary full">Salvar ajuste</button>
            </form>
          )}
          {modal.kind === "auraInfo" && (
            <div className="aura-explanation">
              <Info size={25} />
              <h3>{weeklyAura(data).label}</h3>
              <p>Seu histórico da semana, em movimento. Menos consumo e pausas confirmadas deixam a AURA mais tranquila.</p>
              <details className="compact-explanation"><summary>Como funciona</summary>
                <p>A comparação usa pelo menos 3 dias com informação nas duas semanas. Dias sem registros só contam como pausa quando confirmados.</p>
                <p>A AURA não avalia saúde ou segurança. Registrar consumo não dá recompensas.</p>
              </details>
            </div>
          )}
          {modal.kind === "import" && (
            <>
              <p>
                O backup tem {modal.data.entries.length} registros,{" "}
                {modal.data.purchases.length} compras e seus check-ins.
                Restaurar substitui os dados deste navegador.
              </p>
              <button
                className="button secondary full"
                onClick={() => exportData("json")}
              >
                <Download size={15} />
                Exportar dados atuais primeiro
              </button>
              <button
                className="button primary full"
                onClick={() => {
                  try {
                    localStorage.setItem(STORAGE, JSON.stringify(modal.data));
                    recovery.current = null;
                  } catch {
                    setStorageError(true);
                  }
                  mutate(() => modal.data);
                  setCategory(modal.data.categories.find(c=>c.enabled!==false)?.id||"");
                  setWelcome(false);
                  setRoute("Hoje");
                  setModal(null);
                  notify("Backup restaurado. Você pode desfazer.");
                }}
              >
                Restaurar e substituir
              </button>
            </>
          )}
          {modal.kind === "clear" && (
            <>
              <p>
                Esta ação remove o histórico, compras, check-ins e preferências
                deste navegador. Faça um backup para poder recuperar depois.
              </p>
              <button
                className="button secondary full"
                onClick={() => exportData("json")}
              >
                Exportar backup antes de apagar
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  undo.current = null;
                  recovery.current = null;
                  const reset = structuredClone(initial);
                  try {
                    localStorage.removeItem(STORAGE);
                  } catch {
                    setStorageError(true);
                  }
                  setData(reset);
                  setCategory(reset.categories.find(c=>c.enabled!==false)?.id||"");
                  setModal(null);
                  setWelcome(true);
                  setRoute("Hoje");
                  setToast("");
                }}
              >
                <label>
                  Digite APAGAR para confirmar
                  <input
                    name="confirmation"
                    required
                    pattern="APAGAR"
                    autoComplete="off"
                  />
                </label>
                <button className="button danger full">
                  Apagar dados deste dispositivo
                </button>
              </form>
            </>
          )}
        </Dialog>
      )}
      {guide !== null && (
        <Guide
          step={guide}
          onStep={setGuide}
          onDone={() => {
            setGuide(null);
            setRoute("Hoje");
          }}
          onRoute={setRoute}
        />
      )}
      {celebration&&<AchievementCelebration achievement={celebration} onClose={()=>setCelebration(null)} onProfile={()=>{setCelebration(null);setRoute("Perfil");}}/>}
      {toast && (
        <div className="tap-toast" role="status">
          {toast.startsWith("Consumo registrado") ? <Info size={16}/> : <Check size={16}/>}
          <span>{toast}</span>
          {undo.current && (
            <button
              className="icon-button"
              aria-label="Desfazer última alteração"
              onClick={() => {
                setData(undo.current);
                undo.current = null;
                notify("Alteração desfeita.");
              }}
            >
              <Undo2 size={17} />
            </button>
          )}
          <button
            className="icon-button"
            aria-label="Fechar aviso"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
export default App;
