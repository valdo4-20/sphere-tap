import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
export default function GlassSelect({children,value,defaultValue,name,onChange,disabled,id,...props}) {
  const options=React.Children.toArray(children).flatMap(child=>child?.props?.children && child.type===React.Fragment ? React.Children.toArray(child.props.children):[child]).filter(React.isValidElement);
  const [local,setLocal]=useState(defaultValue ?? options[0]?.props.value ?? "");
  const selected=String(value ?? local), [open,setOpen]=useState(false);
  const root=useRef(null), input=useRef(null), trigger=useRef(null), listId=useId();
  const current=options.find(o=>String(o.props.value)===selected);
  useEffect(()=>{
    const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};
    document.addEventListener("pointerdown",close);
    return ()=>document.removeEventListener("pointerdown",close);
  },[]);
  function choose(next) {
    setLocal(next); setOpen(false);
    if(input.current)input.current.value=next;
    onChange?.({target:{value:next,form:input.current?.form},currentTarget:{value:next,form:input.current?.form}});
    trigger.current?.focus();
  }
  return <div className="sphere-select" ref={root} onKeyDown={e=>{
    if(e.key==="Escape"){setOpen(false);trigger.current?.focus();e.stopPropagation();}
    if(["ArrowDown","ArrowUp","Home","End"].includes(e.key)){
      e.preventDefault();setOpen(true);
      const buttons=[...root.current.querySelectorAll('[role="option"]:not(:disabled)')];
      const i=buttons.indexOf(document.activeElement);
      const next=e.key==="Home"?0:e.key==="End"?buttons.length-1:e.key==="ArrowDown"?(i+1)%buttons.length:(i<=0?buttons.length-1:i-1);
      buttons[next]?.focus();
    }
  }}>
    <input type="hidden" ref={input} name={name} value={selected} disabled={disabled}/>
    <button {...props} id={id} type="button" ref={trigger} disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={()=>setOpen(v=>!v)}>
      <span>{current?.props.children}</span><ChevronDown size={15}/>
    </button>
    {open&&<div role="listbox" id={listId} className="sphere-select-menu" aria-label={props["aria-label"]||"Opções"}>
      {options.map(o=><button key={o.props.value} type="button" role="option" aria-selected={String(o.props.value)===selected} disabled={o.props.disabled} onClick={()=>choose(String(o.props.value))}>{o.props.children}{String(o.props.value)===selected&&<Check size={15}/>}</button>)}
    </div>}
  </div>;
}
