// A release has its own editorial palette; it never changes the person's app theme.
const fallbackPalettes=[
 {background:'#120e1f',neutral:'#2d1742',accent:'#cfa9ef',text:'#fdf4ff'},
 {background:'#0b2424',neutral:'#17423f',accent:'#9de4d5',text:'#f0fff9'},
 {background:'#261b0e',neutral:'#49351e',accent:'#f0cb8d',text:'#fff8eb'},
 {background:'#101c30',neutral:'#1e3550',accent:'#abcdf3',text:'#f3f8ff'},
 {background:'#2a1420',neutral:'#492436',accent:'#efb0cd',text:'#fff4f9'},
 ];
export function releasePalette(release){
 if(release?.palette&&['background','neutral','accent','text'].every(key=>/^#[\da-f]{6}$/i.test(release.palette[key]||'')))return release.palette;
 const version=release?.version||'1.0.1';
 const hash=[...version].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);
 return fallbackPalettes[hash%fallbackPalettes.length];
}
export function releaseStyle(release){const p=releasePalette(release);return {'--update-bg':p.background,'--update-neutral':p.neutral,'--update-accent':p.accent,'--update-text':p.text}}
