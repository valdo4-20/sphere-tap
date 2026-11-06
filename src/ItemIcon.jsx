import React from 'react';
export const itemIcons={leaf:'Folha',sun:'Sol',moon:'Lua',flower:'Flor',heart:'Coração',cup:'Xícara',package:'Pacote',spark:'Estrela'};
export const validItemIcon=icon=>icon===undefined||icon===null||Object.hasOwn(itemIcons,icon)||(typeof icon==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(icon)&&icon.length<=70000);
export default function ItemIcon({icon,label=''}){if(!icon)return null;return <img className='item-mono-icon' src={icon.startsWith('data:')?icon:'./item-icons/'+icon+'.png'} alt={label}/>}
