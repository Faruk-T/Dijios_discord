import { useEffect, useRef } from "react";
import { useShellPreferences } from "./shell-preferences.store.js";

const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
const FRAGMENT =
  "precision mediump float;uniform float t;void main(){vec2 u=gl_FragCoord.xy/vec2(900.0,600.0);float w=sin(u.x*4.0+t)*0.15;gl_FragColor=vec4(0.0,0.13+w,0.28+u.y*0.27,1.0);}";

function paintStatic(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (context === null) {
    return;
  }
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#002147");
  gradient.addColorStop(1, "#457B9D");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function startAurora(canvas: HTMLCanvasElement): () => void {
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    paintStatic(canvas);
    return () => undefined;
  }
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (vertex === null || fragment === null) {
    return () => undefined;
  }
  gl.shaderSource(vertex, VERTEX);
  gl.shaderSource(fragment, FRAGMENT);
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  const program = gl.createProgram();
  if (program === null) {
    return () => undefined;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  const clock = gl.getUniformLocation(program, "t");
  let frame = 0;
  const draw = (time: number): void => {
    gl.uniform1f(clock, time / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = window.requestAnimationFrame(draw);
  };
  frame = window.requestAnimationFrame(draw);
  return () => window.cancelAnimationFrame(frame);
}

export function AuroraWallpaperCanvas(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useShellPreferences((state) => state.reducedMotion);
  const smartboard = useShellPreferences((state) => state.smartboardPerformanceMode);
  const still = reduced || smartboard;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return undefined;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (still) {
      paintStatic(canvas);
      return undefined;
    }
    return startAurora(canvas);
  }, [still]);

  return <canvas ref={canvasRef} className="osgl-wallpaper" aria-hidden="true" />;
}
