/**
 * Deep Galaxy Cube — main entry point.
 * Initializes WebGL2, runs the animation loop, handles resize and cleanup.
 */
import { mat4 } from './mat4.js';
import { initCube, renderCube, destroyCube } from './cube.js';
import { initGalaxy, renderGalaxy, destroyGalaxy } from './galaxy.js';

let gl = null;
let animationFrameId = 0;
let projectionMatrix = mat4.create();
let cubeRotation = 0.0;
let then = 0;

function initWebGL() {
    const canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl2');
    if (!gl) { console.error('WebGL2 not supported'); return false; }

    if (!initCube(gl)) return false;
    if (!initGalaxy(gl)) return false;

    return true;
}

function resizeCanvas() {
    if (!gl) return;
    const canvas = gl.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    mat4.perspective(projectionMatrix, (45 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 100.0);
}

function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;
    if (!gl) return;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderGalaxy(gl, now);
    renderCube(gl, projectionMatrix, cubeRotation, now);

    cubeRotation += deltaTime;
    animationFrameId = requestAnimationFrame(render);
}

window.addEventListener('load', () => {
    if (initWebGL()) {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animationFrameId = requestAnimationFrame(render);
    }
});

window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', resizeCanvas);
    cancelAnimationFrame(animationFrameId);
    if (gl) {
        destroyCube(gl);
        destroyGalaxy(gl);
    }
});
