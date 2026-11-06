import React from "react";
import { timeGreeting } from "./model";
export default function Greeting({ name, now }) {
  return (
    <div className="hero-copy tap-greeting">
      <h1 className="home-greeting-aura greeting-arrive">
        {name?.trim() ? `Olá, ${name.trim()}.` : "Olá. Que bom ter você aqui."}
      </h1>
      <p>{timeGreeting(now)}</p>
    </div>
  );
}
