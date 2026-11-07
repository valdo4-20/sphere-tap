// Fixed body prevents iOS Safari from losing the map's scroll offset on a modal.
export function lockQuizScroll(doc=document,win=window){
 const body=doc.body,x=win.scrollX,y=win.scrollY,previous={overflow:body.style.overflow,position:body.style.position,top:body.style.top,left:body.style.left,width:body.style.width};
 Object.assign(body.style,{overflow:'hidden',position:'fixed',top:`${-y}px`,left:`${-x}px`,width:'100%'});
 return()=>{
  Object.assign(body.style,previous);
  const restore=()=>win.scrollTo({top:y,left:x,behavior:'instant'});
  restore();
  // Wait for the restored document and focus layout before the browser paints.
  win.requestAnimationFrame?.(restore);
 }; 
}
