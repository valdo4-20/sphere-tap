import {geometryFor} from './planetPack/planetAssets.mjs';
export const biomeEnergy={
 forest:{colors:['#7bbf72','#d9de8a'],particle:'firefly',ore:'#598b57',light:'#f1dd9e'},
 water:{colors:['#54b8c2','#b0dfd1'],particle:'spray',ore:'#d5a58b',light:'#f5d89e'},
 desert:{colors:['#dcb271','#f4d68c'],particle:'dust',ore:'#b08b60',light:'#e5ba71'},
 crystal:{colors:['#b69bdd','#a8e4e4'],particle:'glint',ore:'#a697d3',light:'#d7c9f1'},
 lava:{colors:['#dc7149','#f4b657'],particle:'ember',ore:'#a75239',light:'#ffb34c'},
 moon:{colors:['#a6b8cd','#e2e3cf'],particle:'star',ore:'#8998a2',light:'#e6dfbb'},
 snow:{colors:['#b9d9df','#e1eee5'],particle:'snow',ore:'#b8d6db',light:'#e5f1eb'},
 swamp:{colors:['#5eae88','#d0d889'],particle:'mist',ore:'#756c49',light:'#c4d68e'},
 fungal:{colors:['#b47ab6','#e2aece'],particle:'spore',ore:'#a681a4',light:'#eed298'},
 ruins:{colors:['#acb786','#dec897'],particle:'dust',ore:'#a69672',light:'#e6ca88'},
 golden:{colors:['#e5bc5d','#fff0ae'],particle:'glint',ore:'#c6933d',light:'#ffe6a1'},
};
export function sceneryFor(asset){
 const energy=biomeEnergy[asset.biome],raw=geometryFor(asset),result=[];
 const keepGem=v=>asset.biome==='crystal'||asset.biome==='snow'&&v.s>=.8||asset.golden&&asset.variant%4===2&&v.s>=.8;
 for(const v of raw){
  if(v.shape==='gem'&&!keepGem(v)){
   if(v.s>=.3&&v.s<=.4){const {x,y,z}=v;
    if(['forest','swamp'].includes(asset.biome))result.push({x,y,z,s:.16,h:.4,c:'#886d4c',k:'wood'},{x:x-.13,y:y-.13,z:z+.25,s:.45,h:.28,c:asset.biome==='swamp'?'#57977b':'#77b361',k:'leaf'});
    else if(asset.biome==='water')result.push({x,y,z,s:.25,h:.45,c:'#e5a88f',k:'coral'});
    else if(asset.biome==='desert')result.push({x,y,z,s:.22,h:.55,c:'#849c5e',k:'cactus'});
    else if(asset.biome==='fungal')result.push({x,y,z,s:.15,h:.28,c:'#dfc9ab',k:'wood'},{x:x-.1,y:y-.1,z:z+.23,s:.38,h:.12,c:'#b477a9',k:'mushroom'});
    else if(asset.biome==='golden')result.push({x,y,z,s:.34,h:.18,c:'#e5bc5d',k:'gold'});
    else result.push({x,y,z,s:.32,h:.22,c:energy.ore,k:'pebble'});
   }
   continue;
  }
  if(v.k==='crystal'&&v.shape!=='gem'&&asset.biome!=='crystal'&&asset.biome!=='snow')result.push({...v,k:'glow',c:energy.light});
  else if(v.k==='ore'&&asset.biome!=='crystal')result.push({...v,c:energy.ore});
  else result.push(v);
 }
 return result;
}
