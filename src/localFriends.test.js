import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,migrate,validData} from './model.js';
import {addFriend,editFriend,removeFriend,completeFriendRound,localRanking,validFriends,friendColors} from './localFriends.js';
const friend=(id,name)=>({id,name,color:friendColors[0]});
test('amigos permanecem após reload e backup, com edições preservando os pontos',()=>{
 let data=addFriend(structuredClone(initial),friend('alex','Alex'));data=addFriend(data,friend('greg','Greg'));
 data=completeFriendRound(data,'alex',1,20);const user=structuredClone(data.journey);
 assert.equal(data.localFriends[0].journey.xp,300);assert.deepEqual(data.journey,user);
 assert.equal(completeFriendRound(data,'alex',1,20),data);
 data=migrate(JSON.parse(JSON.stringify(data)));assert.equal(data.localFriends.length,2);assert.equal(data.localFriends[0].journey.role,1);
 data=editFriend(data,'alex',{name:'Alexandre',color:friendColors[2]});assert.equal(data.localFriends[0].journey.xp,300);
 assert.equal(localRanking(data)[0].id,'alex');assert.equal(localRanking(data)[1].id,'self');
 data=removeFriend(data,'greg');assert.deepEqual(data.localFriends.map(f=>f.id),['alex']);assert.equal(validData(data),true);
});
test('cadastro valida limites, duplicatas, nomes e backup sem descartar progresso válido',()=>{
 const data=structuredClone(initial),one=addFriend(data,friend('alex','Alex'));
 assert.equal(addFriend(one,friend('alex','Outro')),one);assert.equal(addFriend(data,friend('self','Nome')),data);assert.equal(addFriend(data,friend('abc',' ')),data);assert.equal(addFriend(data,{name:'Sem ID',color:friendColors[0]}),data);
 assert.equal(validFriends([{...one.localFriends[0],journey:{xp:-1}}]),false);assert.equal(validData({...one,localFriends:[...one.localFriends,...one.localFriends]}),false);
 const legacy=structuredClone(initial);delete legacy.localFriends;assert.deepEqual(migrate(legacy).localFriends,[]);
 assert.equal(completeFriendRound(one,'missing',1,10),one);
});
test('Rolê compartilha as respostas e recompensa todos de uma vez sem repetir crédito',async()=>{
 const {completeGroupRound,groupRanking}=await import('./localFriends.js');
 let data=addFriend(structuredClone(initial),friend('alex','Alex'));data=addFriend(data,friend('greg','Greg'));data.journey.role=10;
 const original=data;assert.equal(completeGroupRound(data,'grupo-1',11,20,[]),data);assert.equal(completeGroupRound(data,'grupo-1',11,20,['missing']),data);
 data=completeGroupRound(data,'grupo-1',11,20,['alex']);assert.equal(data.journey.role,11);assert.equal(data.journey.xp,330);assert.equal(original.journey.xp,0);
 assert.equal(data.localFriends[0].journey.role,1);assert.equal(data.localFriends[0].journey.xp,330);assert.equal(data.localFriends[1].journey.xp,0);assert.equal(validData(data),true);
 assert.equal(completeGroupRound(data,'grupo-1',11,20,['alex']),data);
 const restored=migrate(JSON.parse(JSON.stringify(data)));assert.equal(restored.localFriends[0].journey.lastMatchId,'grupo-1');assert.equal(completeGroupRound(restored,'grupo-1',11,20,['alex']),restored);
 assert.deepEqual(groupRanking(data).map(r=>[r.id,r.place]),[['self',1],['alex',1],['greg',3]]);
 const next=completeGroupRound(data,'grupo-2',12,10,['greg']);assert.equal(next.localFriends[0].journey.xp,330);assert.equal(next.localFriends[1].journey.xp,154);assert.equal(next.journey.xp,484);assert.equal(next.localFriends[0].journey.role,1);assert.equal(next.localFriends[1].journey.role,1);
});
