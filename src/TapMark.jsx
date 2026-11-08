import React from 'react';
import {bodyPath,nosePath} from './tapMarkPaths';
export default function TapMark({size=64,animated=false,...props}){
 return <svg width={size} height={size} viewBox="0 0 1254 1254" className="tap-gnome-mark" aria-hidden="true" {...props}><path d={bodyPath} fill="currentColor" fillRule="evenodd"/><path d={nosePath} fill="currentColor"/></svg>;
}
