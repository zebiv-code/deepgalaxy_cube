/**
 * Galaxy / starfield background rendering.
 */
import { createProgram, galaxyVertexSource, galaxyFragmentSource } from './shaders.js';

let program = null;
let positionBuffer = null;
let positionAttr = -1;
let resolutionUniform = null;
let timeUniform = null;

export function initGalaxy(gl) {
    program = createProgram(gl, galaxyVertexSource, galaxyFragmentSource);
    if (!program) return false;

    positionAttr = gl.getAttribLocation(program, 'a_galaxy_position');
    resolutionUniform = gl.getUniformLocation(program, 'u_resolution');
    timeUniform = gl.getUniformLocation(program, 'u_time');

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    return true;
}

export function renderGalaxy(gl, now) {
    if (!program || positionAttr === -1) return;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttr);
    gl.uniform2f(resolutionUniform, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeUniform, now);

    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.DEPTH_TEST);
}

export function destroyGalaxy(gl) {
    if (positionBuffer) gl.deleteBuffer(positionBuffer);
    if (program) gl.deleteProgram(program);
}
