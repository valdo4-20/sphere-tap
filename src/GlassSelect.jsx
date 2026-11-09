import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function GlassSelect({children,value,defaultValue,name,onChange,disabled,id,...props}) {
  const options=React.Children.toArray(children).flatMap(child=>child?.props?.children && child.type===React.Fragment ? React.Children.toArray(child.props.children):[child]).filter(React.isValidElement);
  const [local,setLocal]=useState(defaultValue ?? options[0]?.props.value ?? "");
  const selected=String(value ?? local), [open,setOpen]=useState(false);
  const [placement,setPlacement]=useState({side:"bottom",maxHeight:220});
  const root=useRef(null), input=useRef(null), trigger=useRef(null), pendingFocus=useRef(null), listId=useId();
  const current=options.find(o=>String(o.props.value)===selected);

  useEffect(()=>{
    const close=e=>{if(!root.current?.contains(e.target))setOpen(false)};
    document.addEventListener("pointerdown",close);
    return ()=>document.removeEventListener("pointerdown",close);
  },[]);

  useEffect(()=>{
    if(!open)return;
    const measure=()=>{
      const button=trigger.current, body=root.current?.closest(".dialog-body");
      if(!button||!body)return;
      const rect=button.getBoundingClientRect(), bounds=body.getBoundingClientRect();
      const viewport=window.visualViewport;
      const visibleTop=Math.max(bounds.top,viewport?.offsetTop??0);
      const visibleBottom=Math.min(bounds.bottom,(viewport?.offsetTop??0)+(viewport?.height??window.innerHeight));
      const below=Math.max(0,visibleBottom-rect.bottom-10);
      const above=Math.max(0,rect.top-visibleTop-10);
      const side=below>=Math.min(180,options.length*48+12)||below>=above?"bottom":"top";
      const room=side==="bottom"?below:above;
      setPlacement({side,maxHeight:Math.max(88,Math.min(260,room))});
    };
    const frame=requestAnimationFrame(measure);
    window.addEventListener("resize",measure);
    window.addEventListener("scroll",measure,true);
    window.visualViewport?.addEventListener("resize",measure);
    window.visualViewport?.addEventListener("scroll",measure);
    const buttons=[...root.current.querySelectorAll('[role="option"]:not(:disabled)')];
    const target=pendingFocus.current==="End"?buttons.at(-1):pendingFocus.current==="Home"?buttons[0]:buttons.find(b=>b.getAttribute("aria-selected")==="true")||buttons[0];
    pendingFocus.current=null;target?.focus({preventScroll:true});
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("resize",measure);
      window.removeEventListener("scroll",measure,true);
      window.visualViewport?.removeEventListener("resize",measure);
      window.visualViewport?.removeEventListener("scroll",measure);
    };
  },[open,options.length]);

  function choose(next) {
    setLocal(next);setOpen(false);
    if(input.current)input.current.value=next;
    onChange?.({target:{value:next,form:input.current?.form},currentTarget:{value:next,form:input.current?.form}});
    trigger.current?.focus({preventScroll:true});
  }

  return <div className="sphere-select" ref={root} onKeyDown={e=>{
    if(disabled)return;
    if(e.key==="Escape"&&open){setOpen(false);trigger.current?.focus({preventScroll:true});e.stopPropagation();}
    if(["ArrowDown","ArrowUp","Home","End"].includes(e.key)){
      e.preventDefault();
      if(!open){pendingFocus.current=e.key;setOpen(true);return;}
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
    {open&&<div role="listbox" id={listId} className={`sphere-select-menu sphere-select-menu-${placement.side}`} style={{maxHeight:placement.maxHeight}} aria-label={props["aria-label"]||"Opções"}>
      {options.map(o=><button key={o.props.value} type="button" role="option" aria-selected={String(o.props.value)===selected} disabled={o.props.disabled} onClick={()=>choose(String(o.props.value))}>{o.props.children}{String(o.props.value)===selected&&<Check size={15}/>}</button>)}
    </div>}
  </div>;
}
