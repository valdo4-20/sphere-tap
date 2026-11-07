export const emblemNames={sun:'Sol',moon:'Lua',flame:'Chama',leaf:'Folha',star:'Estrela',gem:'Cristal',heart:'Coração',bolt:'Raio',crown:'Coroa',flower:'Flor',compass:'Bússola',shield:'Escudo'};
export const emblemIds=Object.keys(emblemNames);
export function emblemFor(friend){if(emblemIds.includes(friend?.emblem))return friend.emblem;const text=friend?.id||'self';return emblemIds[[...text].reduce((n,c)=>n+c.charCodeAt(0),0)%emblemIds.length]}
