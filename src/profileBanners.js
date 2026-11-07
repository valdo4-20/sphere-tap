export const profileBanners=[
 {id:'orbit',name:'Órbita',color:'#c6a8df',achievement:null,shape:0},
 {id:'dawn',name:'Alvorada',color:'#e6b976',achievement:'your-space',shape:1},
 {id:'grove',name:'Jardim',color:'#85bf99',achievement:'chosen-aura',shape:2},
 {id:'voyager',name:'Explorador',color:'#e5a28d',achievement:'journey-role-1',shape:3},
 {id:'lunar',name:'Lunar',color:'#d2c3e7',achievement:'journey-personal-5',shape:4},
 {id:'crown',name:'Coroa solar',color:'#e8c16a',achievement:'journey-role-10',shape:5}
];
export function bannerAvailable(data,id){const b=profileBanners.find(b=>b.id===id);return Boolean(b&&(!b.achievement||data.achievements?.[b.achievement]?.earnedAt))}
export function equippedBanner(data){return profileBanners.find(b=>b.id===data.profileDetails?.banner&&bannerAvailable(data,b.id))||profileBanners[0]}
export function equipBanner(data,id){return bannerAvailable(data,id)?{...data,profileDetails:{...data.profileDetails,banner:id}}:data}
