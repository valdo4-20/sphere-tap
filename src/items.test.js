import {test} from "node:test";
import assert from "node:assert/strict";
import {auraMessageForCategory,auraToneForCategory,inferAuraTone,itemPricing} from "./items.js";
import {createEntry,initial,validData} from "./model.js";
test("preço de pacote é distribuído sem alterar registros já criados",()=>{
 const pricing=itemPricing({mode:"package",amount:120,quantity:20});
 assert.equal(pricing.price,6);
 const c={id:"custom",name:"Meu item",unit:"item",...pricing};
 const entry=createEntry(c);c.price=9;
 assert.equal(entry.cost,6);
});
test("granel usa o peso comprado e os gramas de cada registro",()=>{
 const pricing=itemPricing({mode:"bulk",amount:20,quantity:100,gramsPerUse:.5,unit:"item"});
 assert.equal(pricing.price,.1);assert.equal(pricing.gramPrice,.2);
 const e=createEntry({id:"herb",name:"Erva",unit:"item",...pricing});
 assert.equal(e.grams,.5);assert.equal(e.cost,.1);
});
test("item registra preço por unidade e por grama sem misturar os custos",()=>{
 const pricing=itemPricing({mode:"both",amount:8,gramAmount:.4,gramsPerUse:1,unit:"item"});
 assert.equal(pricing.price,8);assert.equal(pricing.gramPrice,.4);assert.equal(pricing.gramsPerUse,1);
 const e=createEntry({id:"cannabis",name:"Cannabis",unit:"item",...pricing});
 assert.equal(e.cost,8);assert.equal(e.grams,1);
 const byGram=createEntry({id:"cannabis",name:"Cannabis",unit:"item",...pricing,price:null});
 assert.equal(byGram.cost,.4);
 assert.throws(()=>itemPricing({mode:"both",amount:"",gramAmount:-1,unit:"item"}));
});
test("peso desconhecido não cria custo gratuito, e preço zero explícito continua zero",()=>{
 assert.equal(itemPricing({mode:"bulk",amount:20,quantity:100,gramsPerUse:"",unit:"item"}).price,null);
 assert.equal(itemPricing({mode:"package",amount:0,quantity:20}).price,0);
 assert.equal(itemPricing({mode:"unit",amount:""}).price,null);
 assert.throws(()=>itemPricing({mode:"package",amount:20,quantity:0}));
});
test("AURA sugere alertas com cautela e deixa cannabis sem contexto neutra",()=>{
 assert.equal(inferAuraTone("Cigarro"),"attention");
 assert.equal(inferAuraTone("Balinha de menta"),"attention");
 assert.equal(inferAuraTone("Cannabis"),"neutral");
 assert.equal(inferAuraTone("Cannabis fumada"),"attention");
 assert.equal(inferAuraTone("Cigarro de cannabis"),"attention");
 assert.equal(inferAuraTone("Bala de menta sem açúcar"),"neutral");
 assert.equal(auraToneForCategory({name:"Cigarro",auraTone:"neutral"}),"neutral");
 assert.match(auraMessageForCategory({name:"Cannabis fumada"}),/forma inalada/);
 assert.match(auraMessageForCategory({name:"Cigarro"}),/sem sermão/);
});
test("perfil de reação da AURA é validado no backup sem exigir novos campos",()=>{
 const data=structuredClone(initial);
 data.categories=[{id:"tracked",name:"Meu item",unit:"item",price:null,auraTone:"attention"}];
 assert.equal(validData(data),true);
 delete data.categories[0].auraTone;
 assert.equal(validData(data),true);
 data.categories[0].auraTone="punitive";
 assert.equal(validData(data),false);
});
test("backup aceita preço configurado por unidade e por grama",()=>{
 const data=structuredClone(initial);
 data.categories=[{id:"tracked",name:"Cannabis",unit:"item",price:8,gramPrice:.4,purchaseMode:"both",auraTone:"neutral"}];
 assert.equal(validData(data),true);
 data.categories[0].purchaseMode="unknown";
 assert.equal(validData(data),false);
});
