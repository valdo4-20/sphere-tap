export const profileBanners=[
 {id:'orbit',name:'Órbita',color:'#c6a8df',achievement:null,shape:0},
 {id:'dawn',name:'Alvorada',color:'#e6b976',achievement:'your-space',shape:1,motif:'dawn'},
 {id:'grove',name:'Jardim',color:'#85bf99',achievement:'chosen-aura',shape:2,motif:'garden'},
 {id:'voyager',name:'Explorador',color:'#e5a28d',achievement:'journey-role-1',shape:3,motif:'mountains'},
 {id:'lunar',name:'Lunar',color:'#d2c3e7',achievement:'journey-personal-5',shape:4,motif:'moon'},
 {id:'crown',name:'Coroa solar',color:'#e8c16a',achievement:'journey-role-10',shape:5,motif:'crown'},
 {id:'tide',name:'Maré',color:'#89c9d5',achievement:'pause-1',shape:6,motif:'waves'},
 {id:'fern',name:'Samambaia',color:'#a2c77d',achievement:'pause-3',shape:7,motif:'fern'},
 {id:'summit',name:'Cume',color:'#b3c4e2',achievement:'journey-personal-5',shape:8,motif:'mountains'},
 {id:'prism',name:'Prisma',color:'#d5b6ef',achievement:'backup',shape:9,motif:'crystal'},
 {id:'deco',name:'Art Déco',color:'#e9c78e',achievement:'profile-bio',shape:10,motif:'deco'},
 {id:'mycelium',name:'Micélio',color:'#9fd9a0',achievement:'chosen-aura',shape:11,motif:'mushrooms'},
 {id:'wings',name:'Asas',color:'#e7a7bc',achievement:'check-in',shape:2,motif:'wings'},
 {id:'path',name:'Caminhos',color:'#90c9c2',achievement:'pause-7',shape:3,motif:'steps'}
];
export function bannerAvailable(data,id){const b=profileBanners.find(b=>b.id===id);return Boolean(b&&(!b.achievement||data.achievements?.[b.achievement]?.earnedAt))}
export function equippedBanner(data){return profileBanners.find(b=>b.id===data.profileDetails?.banner&&bannerAvailable(data,b.id))||profileBanners[0]}
export function equipBanner(data,id){return bannerAvailable(data,id)?{...data,profileDetails:{...data.profileDetails,banner:id}}:data}
