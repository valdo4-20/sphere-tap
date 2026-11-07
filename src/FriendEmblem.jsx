import React from 'react';
import {Sun,Moon,Flame,Leaf,Star,Gem,Heart,Zap,Crown,Flower2,Compass,Shield} from 'lucide-react';
import {emblemFor} from './friendEmblems';
import './rewardDesign.css';
const icons={sun:Sun,moon:Moon,flame:Flame,leaf:Leaf,star:Star,gem:Gem,heart:Heart,bolt:Zap,crown:Crown,flower:Flower2,compass:Compass,shield:Shield};
export default function FriendEmblem({friend,className=''}){const Icon=icons[emblemFor(friend)];return <span className={'friend-emblem '+className} style={{'--emblem-color':friend.color||'#b79be8'}} aria-hidden='true'><svg className='emblem-frame' viewBox='0 0 48 48'><path d='M24 3Q27 2 30 6L42 18Q47 23 43 28L29 43Q24 47 19 43L5 29Q1 24 5 19L19 5Z'/></svg><Icon className='emblem-symbol' size={22}/></span>}
