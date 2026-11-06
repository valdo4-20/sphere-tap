// Keep the mobile dock compact and intact while scrolling.
export function navigationState(previous,y,delta,distance){
 const atTop=y<=32;
 return {atTop,hidden:false,collapsed:false};
}
