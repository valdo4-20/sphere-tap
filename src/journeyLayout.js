// One centered axis; reserve enough height for the island, caption and entry action.
export function journeyPositions(nodes,{current,selected,done,playable}){
 let top=0;
 return nodes.map(n=>{const revealed=n<=done||n===done+1&&playable,height=revealed?(n===current&&selected?360:300):142,row={n,x:180,y:top+(revealed?92:48),height};top+=height;return row});
}
