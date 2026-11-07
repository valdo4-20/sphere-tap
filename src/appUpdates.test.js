import test from 'node:test';
import assert from 'node:assert/strict';
import {createUpdateManager} from './appUpdates.js';
function fixture(){
 const sw=new EventTarget(),registration=new EventTarget(),worker={state:'installed',scriptURL:'https://example.test/sphere-tap/sw.js',messages:[],postMessage(message){this.messages.push(message)}};
 let online=true,reloads=0,saved=false,dismissal,clock=100000;
 Object.assign(registration,{waiting:worker,active:null,update:async()=>{}});sw.controller={};sw.register=async(url,options)=>{registration.options=options;return registration};
 const manager=createUpdateManager({serviceWorker:sw,build:'old',online:()=>online,now:()=>clock,identify:async()=>({build:'new',version:'1.0.1'}),setTimeout:()=>1,clearTimeout:()=>{},reload:()=>{assert.equal(saved,true);reloads++},remember:id=>{dismissal=id},dismissed:()=>dismissal});
 return {manager,worker,registration,sw,setOnline:v=>online=v,save:()=>{saved=true},reloads:()=>reloads};
}
test('nova versão fica pendente; registro ignora cache HTTP e não recarrega sozinho',async()=>{
 const f=fixture();await f.manager.start('/sphere-tap/sw.js','/sphere-tap/');assert.equal(f.registration.options.updateViaCache,'none');assert.equal(f.manager.getSnapshot().pending.id,'new');assert.equal(f.reloads(),0);f.sw.dispatchEvent(new Event('controllerchange'));assert.equal(f.reloads(),0);
});
test('Depois guarda atualização e Configurações reabre o mesmo modal',async()=>{
 const f=fixture();await f.manager.start('sw.js','/');f.manager.dismiss();assert.equal(f.manager.getSnapshot().pending.dismissed,true);f.manager.reopen();assert.equal(f.manager.getSnapshot().pending.dismissed,false);
});
test('Atualizar salva dados antes de ativar e só recarrega quando o controlador muda',async()=>{
 const f=fixture();await f.manager.start('sw.js','/');await f.manager.apply(f.save);assert.deepEqual(f.worker.messages,[{type:'SKIP_WAITING'}]);assert.equal(f.reloads(),0);f.sw.dispatchEvent(new Event('controllerchange'));assert.equal(f.reloads(),1);f.sw.dispatchEvent(new Event('controllerchange'));assert.equal(f.reloads(),1);
});
test('falha ao salvar impede ativação e mantém versão atual',async()=>{
 const f=fixture();await f.manager.start('sw.js','/');await f.manager.apply(()=>{throw Error('quota')});assert.equal(f.worker.messages.length,0);assert.equal(f.manager.getSnapshot().applying,false);assert.ok(f.manager.getSnapshot().error);
});
test('busca offline mostra mensagem; versão ativada por outra aba também pode ser aplicada',async()=>{
 const f=fixture();await f.manager.start('sw.js','/');f.setOnline(false);await f.manager.check(true);assert.match(f.manager.getSnapshot().error,/internet/);f.setOnline(true);f.registration.waiting=null;f.registration.active=f.worker;f.worker.state='activated';await f.manager.apply(f.save);assert.equal(f.reloads(),1);
});
