import React from "react";
export const TERMS_VERSION="2026-11-06";
export default function Terms(){
 return <div className="terms-copy">
  <p>O Sphere Tap é um registro pessoal de consumo, gastos e pausas. Não incentiva o consumo e não oferece diagnóstico ou orientação médica.</p>
  <p>Nome, nascimento, perfil e histórico ficam neste navegador. Não há conta, anúncios, pagamentos ou sincronização.</p>
  <p>Câmera e fotos servem apenas ao perfil. A localização é opcional, consultada uma vez e descartada. Nenhum desses acessos é necessário para acompanhar seu histórico.</p>
  <p>Você pode exportar e apagar os dados nas configurações. Limpar o navegador ou trocar de aparelho pode removê-los: mantenha um backup.</p>
  <small>Termos de uso e privacidade · versão {TERMS_VERSION}</small>
 </div>;
}
