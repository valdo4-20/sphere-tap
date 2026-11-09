// Keep the entry sheet inside the visible area during zoom and keyboard resize.
export function trackEntryViewport(dialog,win=window){
 const viewport=win.visualViewport;let frame;
 const update=()=>{
  const values={'--entry-view-width':viewport?.width??win.innerWidth,'--entry-view-height':viewport?.height??win.innerHeight,'--entry-view-x':viewport?.offsetLeft??0,'--entry-view-y':viewport?.offsetTop??0};
  for(const [key,value] of Object.entries(values))dialog.style.setProperty(key,`${value}px`);
 };
 const measure=()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(update)};
 update();viewport?.addEventListener('resize',measure);viewport?.addEventListener('scroll',measure);win.addEventListener('resize',measure);
 return()=>{win.cancelAnimationFrame(frame);viewport?.removeEventListener('resize',measure);viewport?.removeEventListener('scroll',measure);win.removeEventListener('resize',measure)};
}
