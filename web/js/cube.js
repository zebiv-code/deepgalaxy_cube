/**
 * Cube geometry, shader setup, and rendering.
 */
import { mat4 } from './mat4.js';
import { createProgram, cubeVertexSource, cubeFragmentSource } from './shaders.js';

let program = null;
let positionBuffer = null;
let indexBuffer = null;
let positionAttr = -1;
let projectionMatrixUniform = null;
let modelViewMatrixUniform = null;
let timeUniform = null;

export function initCube(gl) {
    program = createProgram(gl, cubeVertexSource, cubeFragmentSource);
    if (!program) return false;

    positionAttr = gl.getAttribLocation(program, 'a_position');
    projectionMatrixUniform = gl.getUniformLocation(program, 'u_projectionMatrix');
    modelViewMatrixUniform = gl.getUniformLocation(program, 'u_modelViewMatrix');
    timeUniform = gl.getUniformLocation(program, 'u_time');

    const positions = new Float32Array([
        -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1,
        -1,-1,-1, -1, 1,-1,  1, 1,-1,  1,-1,-1,
        -1, 1,-1, -1, 1, 1,  1, 1, 1,  1, 1,-1,
        -1,-1,-1,  1,-1,-1,  1,-1, 1, -1,-1, 1,
         1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1, 1,
        -1,-1,-1, -1,-1, 1, -1, 1, 1, -1, 1,-1
    ]);
    const indices = new Uint16Array([
        0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11,
        12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23
    ]);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return true;
}

export function renderCube(gl, projectionMatrix, cubeRotation, now) {
    if (!program || positionAttr === -1) return;

    gl.useProgram(program);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [1, 0, 1]);

    gl.uniformMatrix4fv(projectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, modelViewMatrix);
    gl.uniform1f(timeUniform, now);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttr);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.depthFunc(gl.LEQUAL);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

export function destroyCube(gl) {
    if (positionBuffer) gl.deleteBuffer(positionBuffer);
    if (indexBuffer) gl.deleteBuffer(indexBuffer);
    if (program) gl.deleteProgram(program);
}
