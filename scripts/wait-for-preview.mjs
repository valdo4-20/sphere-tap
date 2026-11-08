/** Wait for HTTP readiness rather than assuming Vite starts before the browser. */
export async function waitForPreview(url,{
 server,timeoutMs=15000,pollMs=100,fetchImpl=fetch,
 now=()=>performance.now(),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms)),
 getStartupError=()=>null,
}={}){
 const deadline=now()+timeoutMs;let last='sem resposta HTTP';
 while(now()<deadline){
  const startupError=getStartupError();
  if(startupError)throw new Error(`Servidor de teste não iniciou em ${url}: ${startupError.message}`);
  if(server&&(server.exitCode!==null||server.signalCode))throw new Error(`Servidor de teste encerrou antes de ficar pronto em ${url} (código ${server.exitCode}, sinal ${server.signalCode||'nenhum'}).`);
  try{
   const response=await fetchImpl(url,{signal:AbortSignal.timeout(Math.min(1000,Math.max(1,Math.ceil(deadline-now()))))});
   if(response.ok)return;
   last=`HTTP ${response.status}`;
  }catch(error){last=error.message;}
  await delay(pollMs);
 }
 throw new Error(`Servidor de teste não ficou pronto em ${timeoutMs} ms: ${url} (${last}).`);
}
