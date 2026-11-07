import test from 'node:test';
import assert from 'node:assert/strict';
import {releasePalette,releaseStyle} from './updatePalette.js';
test('identidade de cor é definida pela atualização, sem depender do tema pessoal',()=>{
 const palette={background:'#0b2424',neutral:'#17423f',accent:'#9de4d5',text:'#f0fff9'};
 assert.equal(releasePalette({version:'2.0',palette}),palette);
 assert.equal(releaseStyle({palette})['--update-accent'],'#9de4d5');
});
test('versão sem paleta ganha identidade estável e valores inválidos usam fallback seguro',()=>{
 assert.deepEqual(releasePalette({version:'1.2'}),releasePalette({version:'1.2'}));
 assert.notDeepEqual(releasePalette({version:'1.2'}),releasePalette({version:'1.3'}));
 assert.match(releasePalette({version:'1.2',palette:{accent:'url(test)'}}).accent,/^#[\da-f]{6}$/);
});
