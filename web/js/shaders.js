/**
 * Shader compilation helpers and GLSL source strings.
 */

// ---------------------------------------------------------------------------
// Shader compiler
// ---------------------------------------------------------------------------

export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// ---------------------------------------------------------------------------
// Cube shaders
// ---------------------------------------------------------------------------

export const cubeVertexSource = `#version 300 es
in vec3 a_position;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_worldPosition;
void main() {
    vec4 worldPosition = u_modelViewMatrix * vec4(a_position, 1.0);
    v_worldPosition = worldPosition.xyz;
    gl_Position = u_projectionMatrix * worldPosition;
}
`;

export const cubeFragmentSource = `#version 300 es
precision highp float;
in vec3 v_worldPosition;
uniform float u_time;
out vec4 outColor;
vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1., 2./3., 1./3., 3.);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6. - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0., 1.), s);
}
void main() {
    float t = u_time;
    vec4 o = vec4(0.0, 0.0, 0.0, 1.0);
    float i = 0.0, e = 0.0, g = 0.0, R = 0.0, s = 0.0;
    vec3 q = vec3(0.0), p = vec3(0.0);
    vec3 d = vec3(v_worldPosition.xy, 0.8);
    q.zy--;
    for (; i++ < 99.; ) {
        e += i / 9e9;
        if (i == 1.0) p = vec3(0.0);
        o.rgb += hsv(p.y, q.y, min(e * i, .01));
        s = 3.;
        p = q += d * e * R * .25;
        g += p.y / s;
        p = vec3(log2(R = length(p)) + t * .2, exp2(mod(-p.z, s) / R) - .23, p.x);
        for (e = --p.y; s < 6e3; s += s) {
            e += -abs(dot(sin(p.xz * s), cos(p.zy * s)) / s * .5);
        }
    }
    outColor = o;
}
`;

// ---------------------------------------------------------------------------
// Galaxy background shaders
// ---------------------------------------------------------------------------

export const galaxyVertexSource = `#version 300 es
in vec2 a_galaxy_position;
void main() {
    gl_Position = vec4(a_galaxy_position, 0.999, 1.0);
}
`;

export const galaxyFragmentSource = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    uv *= 1.5;
    float t = u_time * 0.05;
    vec3 color = vec3(0.0);

    vec2 noise_uv = uv * vec2(0.5, 0.8) + vec2(t * 0.1, t * 0.03);
    float n = 0.0;
    n += noise(noise_uv * 1.0) * 0.5;
    n += noise(noise_uv * 2.5) * 0.25;
    n += noise(noise_uv * 5.0) * 0.125;
    n = pow(n, 2.5);

    vec3 nebulaColor1 = vec3(0.05, 0.1, 0.25);
    vec3 nebulaColor2 = vec3(0.2, 0.05, 0.25);
    color = mix(nebulaColor1, nebulaColor2, smoothstep(0.1, 0.6, n));
    color *= n * 2.0;

    vec2 star_uv = gl_FragCoord.xy / u_resolution.xy * 200.0;
    star_uv += vec2(t * 0.5, -t * 0.3);
    float star_rand = random(floor(star_uv));
    float stars = 0.0;
    if (star_rand > 0.985) {
        float star_size = random(floor(star_uv) + 0.1) * 0.03 + 0.005;
        float star_intensity = random(floor(star_uv) + 0.2) * 0.5 + 0.5;
        stars += (1.0 - smoothstep(0.0, star_size, length(fract(star_uv) - 0.5))) * star_intensity;
    }

    star_uv = gl_FragCoord.xy / u_resolution.xy * 100.0;
    star_uv += vec2(-t * 0.2, t * 0.15);
    star_rand = random(floor(star_uv));
    if (star_rand > 0.975) {
        float star_size = random(floor(star_uv) + 0.3) * 0.05 + 0.01;
        float star_intensity = random(floor(star_uv) + 0.4) * 0.7 + 0.8;
        stars += (1.0 - smoothstep(0.0, star_size, length(fract(star_uv) - 0.5))) * star_intensity;
    }

    star_uv = gl_FragCoord.xy / u_resolution.xy * 400.0;
    star_uv += vec2(t * 0.8, t * 0.5);
    star_rand = random(floor(star_uv));
    if (star_rand > 0.996) {
        float star_size = random(floor(star_uv) + 0.5) * 0.015 + 0.002;
        float star_intensity = random(floor(star_uv) + 0.6) * 0.3 + 0.2;
        stars += (1.0 - smoothstep(0.0, star_size, length(fract(star_uv) - 0.5))) * star_intensity;
    }

    color += vec3(stars);
    outColor = vec4(color, 1.0);
}
`;
