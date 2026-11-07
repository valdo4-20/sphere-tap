import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {UpdateLifecycle} from './AppUpdate';
import TapIntro from './TapIntro';

function Root(){
 const [preview,setPreview]=React.useState(true);
 return preview?<TapIntro onDone={()=>{const url=new URL(location.href);url.searchParams.delete('preview');history.replaceState(null,'',url);try{sessionStorage.setItem("sphere-tap-opened","yes");}catch{}setPreview(false);}}/>:<App/>;
}

createRoot(document.getElementById("root")).render(<><UpdateLifecycle/><Root /></>);
