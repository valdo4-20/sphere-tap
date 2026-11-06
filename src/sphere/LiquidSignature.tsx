import { useEffect, useRef, useState } from "react";
import fragmentSource from "./liquidSignature.frag.glsl?raw";
import "./LiquidSignature.css";

export const LIQUID_SIGNATURE_DURATION_MS = 6200;

const vertexSource =
  "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";

/** The approved oil-impact signature, without the prototype's controls or icon. */
export function LiquidSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let gl: WebGLRenderingContext | null = null;
    let frame = 0;
    let stopped = false;
    let observer: ResizeObserver | undefined;
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;

    function stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    }
    function showFallback() {
      stop();
      setFallback(true);
    }
    function contextLost(event: Event) {
      event.preventDefault();
      showFallback();
    }
    function motionChanged(event: MediaQueryListEvent) {
      if (event.matches) showFallback();
    }
    canvas.addEventListener("webglcontextlost", contextLost);
    reduced.addEventListener("change", motionChanged);

    try {
      gl = canvas.getContext("webgl", { alpha: false, antialias: false });
      if (!gl) throw new Error("WebGL unavailable");
      const context = gl;
      function compile(type: number, source: string) {
        const shader = context.createShader(type);
        if (!shader) throw new Error("Shader unavailable");
        shaders.push(shader);
        context.shaderSource(shader, source);
        context.compileShader(shader);
        if (!context.getShaderParameter(shader, context.COMPILE_STATUS))
          throw new Error("Shader compilation failed");
        return shader;
      }

      program = context.createProgram();
      if (!program) throw new Error("Program unavailable");
      context.attachShader(
        program,
        compile(context.VERTEX_SHADER, vertexSource),
      );
      context.attachShader(
        program,
        compile(context.FRAGMENT_SHADER, fragmentSource),
      );
      context.linkProgram(program);
      if (!context.getProgramParameter(program, context.LINK_STATUS))
        throw new Error("Shader linking failed");
      context.useProgram(program);
      buffer = context.createBuffer();
      if (!buffer) throw new Error("Buffer unavailable");
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.bufferData(
        context.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        context.STATIC_DRAW,
      );
      const position = context.getAttribLocation(program, "p");
      context.enableVertexAttribArray(position);
      context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

      const source = document.createElement("canvas");
      source.width = 1200;
      source.height = 650;
      const text = source.getContext("2d");
      if (!text) throw new Error("Text canvas unavailable");
      text.fillStyle = "#030304";
      text.fillRect(0, 0, source.width, source.height);
      text.fillStyle = "#f4f0e8";
      text.textAlign = "center";
      text.textBaseline = "middle";
      text.font = "400 125px Arial";
      text.fillText("sphere. tap", 600, 325);

      texture = context.createTexture();
      if (!texture) throw new Error("Texture unavailable");
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.LINEAR,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MAG_FILTER,
        context.LINEAR,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_S,
        context.CLAMP_TO_EDGE,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_T,
        context.CLAMP_TO_EDGE,
      );
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        source,
      );

      const time = context.getUniformLocation(program, "time");
      const aspect = context.getUniformLocation(program, "aspect");
      context.uniform1i(context.getUniformLocation(program, "logo"), 0);
      context.uniform1f(context.getUniformLocation(program, "amount"), 1);
      context.uniform1f(context.getUniformLocation(program, "iconMode"), 0);
      const start = performance.now();
      const duration = LIQUID_SIGNATURE_DURATION_MS / 1000;
      function draw(now: number) {
        if (stopped || !canvas) return;
        const elapsed = Math.min((now - start) / 1000, duration);
        context.uniform1f(time, elapsed);
        context.uniform1f(aspect, canvas.width / canvas.height);
        context.drawArrays(context.TRIANGLES, 0, 6);
      }
      function tick(now: number) {
        draw(now);
        if (!stopped && now - start < LIQUID_SIGNATURE_DURATION_MS)
          frame = requestAnimationFrame(tick);
      }
      observer = new ResizeObserver(() => {
        const density = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * density));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * density));
        context.viewport(0, 0, canvas.width, canvas.height);
        draw(performance.now());
      });
      observer.observe(canvas);
      frame = requestAnimationFrame(tick);
    } catch {
      showFallback();
    }

    return () => {
      stop();
      canvas.removeEventListener("webglcontextlost", contextLost);
      reduced.removeEventListener("change", motionChanged);
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        for (const shader of shaders) gl.deleteShader(shader);
      }
    };
  }, []);

  return (
    <div className="liquid-signature" aria-label="Sphere Tap">
      <canvas ref={canvasRef} aria-hidden="true" hidden={fallback} />
      {fallback && (
        <span className="liquid-signature-static" aria-hidden="true">
          sphere. tap
        </span>
      )}
    </div>
  );
}
