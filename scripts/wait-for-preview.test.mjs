import {test} from 'node:test';
import assert from 'node:assert/strict';
import {waitForPreview} from './wait-for-preview.mjs';
test('aguarda inicialização lenta e HTTP válido antes de liberar a navegação',async()=>{let calls=0,waits=0;await waitForPreview('http://127.0.0.1:4179',{fetchImpl:async()=>{calls++;if(calls===1)throw new Error('ECONNREFUSED');return {ok:calls===3,status:calls===3?200:503}},delay:async()=>{waits++}});assert.equal(calls,3);assert.equal(waits,2)});
test('servidor encerrado ou erro de inicialização falham com a causa original',async()=>{await assert.rejects(waitForPreview('http://preview',{server:{exitCode:1,signalCode:null}}),/encerrou.*código 1/);await assert.rejects(waitForPreview('http://preview',{getStartupError:()=>new Error('EADDRINUSE')}),/EADDRINUSE/)});
test('HTTP indisponível tem prazo e diagnóstico, sem deixar o teste navegar',async()=>{let clock=0;await assert.rejects(waitForPreview('http://preview',{timeoutMs:20,now:()=>clock,fetchImpl:async()=>({ok:false,status:503}),delay:async()=>{clock+=10}}),/20 ms.*http:\/\/preview.*HTTP 503/)});
