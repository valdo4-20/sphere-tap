import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {UpdateLifecycle} from './AppUpdate';
import TapIntro from './TapIntro';

function Root(){
 const [preview,setPreview]=React.useState(()=>new URLSearchParams(location.search).get('preview')==='intro');
 return preview?<TapIntro onDone={()=>{const url=new URL(location.href);url.searchParams.delete('preview');history.replaceState(null,'',url);setPreview(false);}}/>:<App/>;
}

createRoot(document.getElementById("root")).render(<><UpdateLifecycle/><Root /></>);
