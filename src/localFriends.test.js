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
 assert.equal(addFriend(one,friend('alex','Outro')),one);assert.equal(addFriend(data,friend('self','Nome')),data);assert.equal(addFriend(data,friend('abc',' ')),data);
 assert.equal(validFriends([{...one.localFriends[0],journey:{xp:-1}}]),false);assert.equal(validData({...one,localFriends:[...one.localFriends,...one.localFriends]}),false);
 const legacy=structuredClone(initial);delete legacy.localFriends;assert.deepEqual(migrate(legacy).localFriends,[]);
 assert.equal(completeFriendRound(one,'missing',1,10),one);
});
