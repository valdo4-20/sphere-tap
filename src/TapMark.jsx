import React,{useId} from 'react';
import {bodyPath,nosePath} from './tapMarkPaths';
export default function TapMark({size=64,animated=false,...props}){
 const id=useId().replaceAll(':','');
 return <svg width={size} height={size} viewBox="0 0 1254 1254" className={animated?'tap-gnome-mark is-animated':'tap-gnome-mark'} aria-hidden="true" {...props}>
  <defs><clipPath id={id+'hat'}><path d="M0 0H1254V760H880L850 728 724 665H482L348 718 320 755H0Z"/></clipPath><clipPath id={id+'beard'}><path d="M0 755H320L348 718 482 665H724L850 728 880 760H1254V1254H0Z"/></clipPath></defs>
  <g className="tap-gnome-hat"><g clipPath={`url(#${id}hat)`}><path d={bodyPath} fill="currentColor" fillRule="evenodd"/></g></g>
  <g className="tap-gnome-beard"><g clipPath={`url(#${id}beard)`}><path d={bodyPath} fill="currentColor" fillRule="evenodd"/></g></g>
  <path d={nosePath} fill="currentColor"/>
 </svg>;
}
