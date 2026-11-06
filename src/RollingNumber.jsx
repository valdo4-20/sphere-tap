import React, { useLayoutEffect, useRef, useState } from "react";
// Um movimento vertical curto confirma a mudança, sem salto ou escala de prêmio.
export default function RollingNumber({ value, pulse }) {
  const number=useRef(null);
  const previous = useRef({ value, pulse });
  const [change, setChange] = useState(null);
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { value, pulse };
    if (old.value === value || (value > old.value && old.pulse === pulse)) {
      setChange(null);
      return;
    }
    const direction = value < old.value ? "down" : "up";
    setChange({ from: old.value, to: value, id: pulse, direction });
    if(Math.floor(value/10)>Math.floor(old.value/10)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)number.current?.animate([{transform:'perspective(600px) translateZ(0)'},{transform:'perspective(600px) translateZ(12px) translateY(-2px)',offset:.3},{transform:'perspective(600px) translateZ(-4px) translateY(1px)',offset:.65},{transform:'perspective(600px) translateZ(0)'}],{duration:560,easing:'cubic-bezier(.2,.7,.3,1)'});
    const timer = setTimeout(() => setChange(null), 480);
    return () => clearTimeout(timer);
  }, [value, pulse]);
  return <span ref={number} className="rolling-number" data-direction={change?.direction} aria-hidden="true"><span className="rolling-number-measure">{change?String(change.from).length>String(value).length?change.from:value:value}</span>
    {change ? <span className="rolling-number-track" key={change.id}>
      <span className="rolling-number-old">{change.from}</span>
      <span className="rolling-number-new">{change.to}</span>
    </span> : <span className="rolling-number-rest">{value}</span>}
  </span>;
}
