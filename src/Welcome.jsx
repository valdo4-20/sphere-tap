import './interfaceRepairs.css';
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MousePointer2,
  Leaf,
  Pause,
  Eye,
  Check,
  X,
} from "lucide-react";
import Aura from "./Aura";
import DotCounter from "./DotCounter";
export {intentions} from "./intentions";
export { default } from "./Onboarding";
export const guideSteps = [
  {
    route: "Hoje",
    target: '[data-guide="aura"]',
    title: "O toque registra.",
    body: "Toque para registrar um consumo que já aconteceu.",
  },
  {
    route: "Hoje",
    target: '[data-guide="category"]',
    title: "Escolha o que acompanha.",
    body: "Dê nome ao item e escolha a unidade. Preço e visual são opcionais.",
  },
  {
    route: "Hoje",
    target: '[data-guide="details"]',
    title: "Os detalhes ficam com você.",
    body: "Edite horário, quantidade ou custo quando precisar.",
  },
  {
    route: "Histórico",
    target: '[data-guide="history"]',
    title: "Consulte seu histórico.",
    body: "Em Progresso, abra Histórico. Para corrigir algo, use Gerenciar registros.",
  },
  {
    route: "Análises",
    target: '[data-guide="insights"]',
    title: "Veja o caminho inteiro.",
    body: "Períodos, histórico e carteira ficam em Progresso.",
  },
  {
    route: "Cuidado",
    target: '[data-guide="care"]',
    title: "Faça espaço para você.",
    body: "Comece uma pausa. Check-ins e notas são opcionais.",
  },
  {
    route: "Configurações",
    target: '[data-guide="settings"]',
    title: "Tudo sob seu controle.",
    body: "No Perfil, abra as preferências para personalizar e fazer backup.",
  },
];
export function Guide({ step, onStep, onDone, onRoute }) {
  const [rect, setRect] = useState(null);
  const companion = useRef(null);
  const transition = useRef(null);
  const [changing, setChanging] = useState(false);
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (!reducedMotion()) {
      transition.current = companion.current?.animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 220, easing: "ease-out" },
      );
    }
    return () => transition.current?.cancel();
  }, [step]);
  async function changeStep(next) {
    if (changing) return;
    if (reducedMotion()) { onStep(next); return; }
    setChanging(true);
    transition.current?.cancel();
    const animation = companion.current?.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 140, easing: "ease-in", fill: "forwards" },
    );
    transition.current = animation;
    try { await animation?.finished; }
    catch { return; }
    onStep(next);
    setChanging(false);
  }
  const current = guideSteps[step];
  useEffect(() => {
    onRoute(current.route);
    setRect(null);
    let frame,
      attempt = 0;
    function find() {
      const target = document.querySelector(current.target);
      if (!target && attempt++ < 40) {
        frame = requestAnimationFrame(find);
        return;
      }
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "instant" });
        measure();
      }
    }
    function measure() {
      const target = document.querySelector(current.target);
      if (target) {
        const r = target.getBoundingClientRect();
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      }
    }
    frame = requestAnimationFrame(find);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [step, onRoute]);
  return (
    <div className="guide-layer">
      {rect && (
        <div
          className="guide-spotlight"
          style={{ ...rect, borderRadius: step === 0 ? "50%" : 24 }}
        />
      )}
      <div className="guide-companion" ref={companion} aria-busy={changing}>
       <div className="guide-mascot-peek" aria-hidden="true"><img className="guide-mascot" src={`./artwork/tip-${step<3?'record':step<5?'history':step===5?'care':'history'}.png`} alt=""/></div>
      <aside
        className="guide-card"
        role="region"
        aria-label="Guia do Sphere Tap"
      >
        <div className="row between">
          <span className="eyebrow">
            GUIA · {step + 1}/{guideSteps.length}
          </span>
          <button
            className="icon-button"
            aria-label="Sair do guia"
            onClick={onDone}
          >
            <X size={18} />
          </button>
        </div>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="row between">
          <button
            className="quiet-button"
            disabled={step === 0 || changing}
            onClick={() => changeStep(step - 1)}
          >
            Voltar
          </button>
          <button
            className="button primary"
            disabled={changing}
            onClick={() =>
              step === guideSteps.length - 1 ? onDone() : changeStep(step + 1)
            }
          >
            {step === guideSteps.length - 1 ? "Concluir" : "Próximo"}
            <ArrowRight size={15} />
          </button>
        </div>
      </aside>
      </div>
    </div>
  );
}
