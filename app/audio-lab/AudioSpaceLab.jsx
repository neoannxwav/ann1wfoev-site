"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1280;
const MOBILE_PARTICLE_COUNT = 760;
const FIELD_LAYERS = 6;
const LINE_SEGMENT_COUNT = 760;
const FLOW_PATH_COUNT = 18;
const FLOW_PATH_POINTS = 170;
const SURFACE_COUNT = 4;
const FFT_SIZE = 2048;
const vertexShader = `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uTreble;
  uniform float uVolume;
  uniform float uStereoWidth;
  uniform float uPixelRatio;
  uniform float uBaseSize;

  attribute vec4 aSeed;
  attribute vec3 color;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vShard;

  float hash(float value) {
    return fract(sin(value) * 43758.5453123);
  }

  float hash3(vec3 value) {
    return fract(sin(dot(value, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  void main() {
    vec3 p = position;
    vec3 direction = normalize(p + vec3(0.0001));
    vec3 tangent = normalize(vec3(-direction.y, direction.x, direction.z * 0.22 + 0.001));
    float shard = floor(aSeed.x * 7.0);
    float flow = sin(uTime * (0.42 + aSeed.y * 0.24) + aSeed.x * 12.566 + p.z * 1.6);
    float heat = 1.0 + uBass * 0.42 + uVolume * 0.18;
    float idle = sin(uTime * 0.2 + aSeed.x * 6.2831) * 0.012;
    float detail = sin(uTime * 2.1 + aSeed.x * 17.0) * uTreble * 0.018;
    float plume = pow(aSeed.x, 1.35);
    float curl = sin(uTime * 0.54 + aSeed.x * 18.0 + p.y * 2.2);
    float drift = sin(uTime * 0.31 + aSeed.y * 10.0 + p.x * 1.8);

    p *= heat + idle;
    p += direction * (flow * uMid * 0.1 + detail + plume * (uBass * 0.24 + uVolume * 0.18));
    p += tangent * (curl * (0.05 + uMid * 0.18) + drift * uTreble * 0.045) * plume;
    p.y += sin(uTime * 0.37 + aSeed.x * 23.0) * (0.035 + uMid * 0.07) * plume;
    p.x += uStereoWidth * (0.6 + abs(p.y) * 0.22);
    p.z -= uStereoWidth * 0.25;
    p += vec3(aSeed.z, aSeed.w, hash(aSeed.x) - 0.5) * uTreble * 0.014 * plume;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);

    vShard = shard;
    vFlicker = 0.82 + 0.18 * sin(uTime * 1.8 + aSeed.x * 13.0);
    vColor = color + vec3(0.05, 0.1, 0.16) * uTreble;

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uBaseSize * uPixelRatio * (1.0 + uBass * 0.8 + uTreble * 0.9) * (300.0 / -mvPosition.z);
  }
`;
const fragmentShader = `
  uniform float uTime;
  uniform float uTreble;
  uniform float uVolume;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vShard;

  float hash(float value) {
    return fract(sin(value) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float core = smoothstep(0.5, 0.05, dist);
    float flicker = mix(vFlicker, 1.0, uTreble * 0.18);
    float alpha = core * (0.24 + uVolume * 0.22 + uTreble * 0.1) * flicker;

    if (alpha < 0.02) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`;

function averageRange(data, startRatio, endRatio) {
  const start = Math.floor(data.length * startRatio);
  const end = Math.max(start + 1, Math.floor(data.length * endRatio));
  let total = 0;

  for (let index = start; index < end; index += 1) {
    total += data[index];
  }

  return total / (end - start) / 255;
}

function createParticleField(count) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const layer = index % FIELD_LAYERS;
    const ringIndex = Math.floor(index / FIELD_LAYERS);
    const progress = ringIndex / Math.ceil(count / FIELD_LAYERS);
    const lane = index % 3;
    const angle = progress * Math.PI * (4.4 + layer * 0.18) + layer * 0.78;
    const ribbon = Math.sin(progress * Math.PI * 4.6 + layer) * 0.34 + Math.sin(progress * Math.PI * 11.0 + layer * 2.1) * 0.12;
    const radius = 0.28 + Math.pow(progress, 1.08) * (2.55 + layer * 0.08);
    const corePull = Math.exp(-progress * 4.2);
    const vapor = Math.pow(progress, 1.7);
    const x = Math.cos(angle) * radius * 1.08 + vapor * 1.34 - 0.82 + ribbon * 0.22;
    const y = Math.sin(angle) * radius * 0.48 + Math.sin(progress * Math.PI * 8 + layer) * 0.2 - corePull * 0.22 + vapor * 0.22;
    const z = (layer - (FIELD_LAYERS - 1) / 2) * 0.13 + Math.sin(angle * 1.25) * (0.2 + lane * 0.04);
    const offset = index * 3;
    const seedOffset = index * 4;
    const cool = 0.45 + layer / FIELD_LAYERS * 0.38;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;

    seeds[seedOffset] = progress;
    seeds[seedOffset + 1] = 0.62 + layer * 0.05;
    seeds[seedOffset + 2] = Math.sin(layer * 1.7) * 0.5;
    seeds[seedOffset + 3] = Math.cos(layer * 1.3) * 0.5;

    colors[offset] = 0.68 + cool * 0.28;
    colors[offset + 1] = 0.78 + cool * 0.18;
    colors[offset + 2] = 0.9 + cool * 0.1;
  }

  return { positions, seeds, colors };
}

function createLineNetwork() {
  const pairCount = LINE_SEGMENT_COUNT;
  const linePositions = new Float32Array(pairCount * 2 * 3);
  const pairs = [];

  for (let index = 0; index < pairCount; index += 1) {
    const path = index % FLOW_PATH_COUNT;
    const t = Math.floor(index / FLOW_PATH_COUNT) / Math.ceil(pairCount / FLOW_PATH_COUNT);
    const arc = 0.008 + (path % 4) * 0.002;
    const first = index * 6;
    const secondT = Math.min(1, t + arc);
    const angle = path * 0.36 + t * Math.PI * (2.1 + path * 0.025);
    const secondAngle = path * 0.36 + secondT * Math.PI * (2.1 + path * 0.025);
    const shell = 0.22 + Math.pow(t, 1.2) * (2.65 + (path % 5) * 0.12);
    const secondShell = 0.22 + Math.pow(secondT, 1.2) * (2.65 + (path % 5) * 0.12);
    const curl = Math.sin(t * Math.PI * 7 + path) * 0.18 * t;
    const secondCurl = Math.sin(secondT * Math.PI * 7 + path) * 0.18 * secondT;

    pairs.push(path, t, arc, shell, 0);

    linePositions[first] = Math.cos(angle) * (shell + curl) * 1.14 + t * 0.72 - 0.48;
    linePositions[first + 1] = Math.sin(angle) * (shell + curl) * 0.52;
    linePositions[first + 2] = ((path % FIELD_LAYERS) - 2.5) * 0.11 + Math.sin(angle * 1.4) * 0.18;
    linePositions[first + 3] = Math.cos(secondAngle) * (secondShell + secondCurl) * 1.14 + secondT * 0.72 - 0.48;
    linePositions[first + 4] = Math.sin(secondAngle) * (secondShell + secondCurl) * 0.52;
    linePositions[first + 5] = ((path % FIELD_LAYERS) - 2.5) * 0.11 + Math.sin(secondAngle * 1.4) * 0.18;
  }

  return { linePositions, pairs };
}

function createFlowPaths() {
  return Array.from({ length: FLOW_PATH_COUNT }, (_, path) => {
    const positions = new Float32Array(FLOW_PATH_POINTS * 3);

    for (let index = 0; index < FLOW_PATH_POINTS; index += 1) {
      const t = index / (FLOW_PATH_POINTS - 1);
      const angle = path * 0.36 + t * Math.PI * (2.1 + path * 0.025);
      const radius = 0.22 + Math.pow(t, 1.18) * (2.55 + (path % 5) * 0.14);
      const vapor = Math.sin(t * Math.PI * 7 + path) * 0.18 * t;
      const offset = index * 3;

      positions[offset] = Math.cos(angle) * (radius + vapor) * 1.14 + t * 0.78 - 0.48;
      positions[offset + 1] = Math.sin(angle) * (radius + vapor) * 0.5;
      positions[offset + 2] = Math.sin(angle * 1.35 + path) * 0.18 + (path - (FLOW_PATH_COUNT - 1) / 2) * 0.025;
    }

    return positions;
  });
}

function createSurfaceGeometry(surfaceIndex) {
  const widthSegments = 34;
  const heightSegments = 10;
  const geometry = new THREE.PlaneGeometry(2.9 + surfaceIndex * 0.36, 1.02 + surfaceIndex * 0.14, widthSegments, heightSegments);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const u = x / (2.9 + surfaceIndex * 0.36);
    const v = y / (1.02 + surfaceIndex * 0.14);
    const fold = Math.sin(u * Math.PI * 3 + surfaceIndex) * 0.18 + Math.cos(v * Math.PI * 4 - surfaceIndex) * 0.1;

    position.setZ(index, fold * (0.55 + Math.abs(u)));
  }

  geometry.computeVertexNormals();
  return geometry;
}

export default function AudioSpaceLab() {
  const mountRef = useRef(null);
  const inputRef = useRef(null);
  const frameRef = useRef(null);
  const rendererRef = useRef(null);
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const leftAnalyserRef = useRef(null);
  const rightAnalyserRef = useRef(null);
  const frequencyDataRef = useRef(null);
  const leftDataRef = useRef(null);
  const rightDataRef = useRef(null);
  const metricsRenderRef = useRef(0);
  const metricsRef = useRef({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    stereoWidth: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("Drop .mp3 / .wav / .m4a into the field");
  const [visualMetrics, setVisualMetrics] = useState({ bass: 0, mid: 0, treble: 0 });

  useEffect(() => {
    if (!mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.11);

    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x020204, 1);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const count = window.innerWidth < 760 ? MOBILE_PARTICLE_COUNT : PARTICLE_COUNT;
    const { positions, seeds, colors } = createParticleField(count);
    const systemGroup = new THREE.Group();
    systemGroup.position.set(0, 0.02, 0);
    scene.add(systemGroup);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 },
        uVolume: { value: 0 },
        uStereoWidth: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.8) },
        uBaseSize: { value: window.innerWidth < 760 ? 0.034 : 0.028 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    systemGroup.add(points);

    const { linePositions, pairs } = createLineNetwork();
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9fc9ff,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const structureLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    systemGroup.add(structureLines);

    const flowPathPositions = createFlowPaths();
    const flowMaterial = new THREE.LineBasicMaterial({
      color: 0xc8dcff,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flowLines = flowPathPositions.map((positions, index) => {
      const flowGeometry = new THREE.BufferGeometry();
      flowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(flowGeometry, flowMaterial);
      line.rotation.set(0.1 + index * 0.035, index * 0.07, index * 0.72);
      systemGroup.add(line);
      return line;
    });

    const shellGeometry = new THREE.IcosahedronGeometry(1.05, 2);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x9fc9ff,
      transparent: true,
      opacity: 0.035,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.scale.set(1.26, 0.86, 0.62);
    systemGroup.add(shell);

    const coreGeometry = new THREE.CircleGeometry(0.32, 96);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x020204,
      transparent: false,
      depthTest: false,
      depthWrite: false,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0.1, -0.02, 0.72);
    core.renderOrder = 20;
    systemGroup.add(core);

    const planeMaterials = [0x7bb9ff, 0xb7c5ff].map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.024,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
    );
    const planes = planeMaterials.map((planeMaterial, index) => {
      const plane = new THREE.Mesh(new THREE.CircleGeometry(1.38 + index * 0.24, 128), planeMaterial);
      plane.rotation.set(Math.PI / 2.8 + index * 0.34, index ? -0.42 : 0.32, index * 0.75);
      plane.position.z = index ? -0.55 : 0.28;
      systemGroup.add(plane);
      return plane;
    });

    const surfaceMaterials = Array.from({ length: SURFACE_COUNT }, (_, index) =>
      new THREE.MeshBasicMaterial({
        color: index % 2 ? 0xb8c9ff : 0x7faeff,
        transparent: true,
        opacity: 0.035,
        wireframe: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const surfaces = surfaceMaterials.map((surfaceMaterial, index) => {
      const surface = new THREE.Mesh(createSurfaceGeometry(index), surfaceMaterial);
      surface.position.set(0.42 + index * 0.18, -0.1 + index * 0.04, -0.18 - index * 0.16);
      surface.rotation.set(0.82 + index * 0.18, -0.36 + index * 0.16, -0.44 + index * 0.28);
      surface.scale.set(1 + index * 0.18, 0.78 + index * 0.08, 1);
      systemGroup.add(surface);
      return surface;
    });

    const haloGeometry = new THREE.RingGeometry(1.7, 1.712, 192);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x87bfff,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2.4;
    systemGroup.add(halo);

    const waveRings = [0, 1, 2, 3, 4].map((index) => {
      const geometry = new THREE.RingGeometry(0.34 + index * 0.23, 0.344 + index * 0.23, 160);
      const material = new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xd8ddff : 0x7ccfff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2.18;
      ring.rotation.z = index * 0.9;
      ring.position.z = -0.28 + index * 0.08;
      systemGroup.add(ring);
      return ring;
    });

    function resize() {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function render(time) {
      const seconds = time * 0.001;
      const metrics = metricsRef.current;
      const bassPulse = metrics.bass * 1.25;
      const loudness = metrics.volume;
      const stereoWidth = metrics.stereoWidth;
      const breath = 1 + metrics.bass * 0.28 + loudness * 0.16 + Math.sin(seconds * 0.8) * 0.018;
      const lineAttribute = lineGeometry.attributes.position;
      const liveLinePositions = lineAttribute.array;

      material.uniforms.uTime.value = seconds;
      material.uniforms.uBass.value = metrics.bass;
      material.uniforms.uMid.value = metrics.mid;
      material.uniforms.uTreble.value = metrics.treble;
      material.uniforms.uVolume.value = loudness;
      material.uniforms.uStereoWidth.value = stereoWidth;
      const centerCorrection = window.innerWidth >= 760 ? 0.26 : 0;
      systemGroup.position.x += (centerCorrection + stereoWidth * 0.08 - systemGroup.position.x) * 0.035;
      systemGroup.position.y += (0.12 + Math.sin(seconds * 0.22) * 0.025 - systemGroup.position.y) * 0.035;
      systemGroup.scale.setScalar(breath);
      systemGroup.rotation.y += 0.0012 + metrics.mid * 0.008;
      systemGroup.rotation.x = Math.sin(seconds * 0.16) * 0.06 + stereoWidth * 0.06;
      points.rotation.y += 0.0006 + metrics.mid * 0.004;
      points.rotation.x = Math.sin(seconds * 0.18) * 0.05 + stereoWidth * 0.05;

      for (let index = 0; index < pairs.length; index += 1) {
        const meta = index * 5;
        const path = pairs[meta];
        const t = pairs[meta + 1];
        const arc = pairs[meta + 2] + metrics.mid * 0.012;
        const target = index * 6;
        const drift = seconds * (0.026 + metrics.mid * 0.05 + loudness * 0.018);
        const liveT = (t + drift) % 1;
        const secondT = Math.min(1, liveT + arc);
        const angle = path * 0.36 + liveT * Math.PI * (2.1 + path * 0.025) + metrics.mid * 0.42;
        const secondAngle = path * 0.36 + secondT * Math.PI * (2.1 + path * 0.025) + metrics.mid * 0.42;
        const shell = (0.22 + Math.pow(liveT, 1.18) * (2.55 + (path % 5) * 0.14)) * (1 + metrics.bass * 0.34 + loudness * 0.18);
        const secondShell = (0.22 + Math.pow(secondT, 1.18) * (2.55 + (path % 5) * 0.14)) * (1 + metrics.bass * 0.34 + loudness * 0.18);
        const matter = Math.sin(liveT * Math.PI * 7 + path + seconds * 0.86) * (0.16 + metrics.mid * 0.22 + metrics.treble * 0.08) * liveT;
        const secondMatter = Math.sin(secondT * Math.PI * 7 + path + seconds * 0.86) * (0.16 + metrics.mid * 0.22 + metrics.treble * 0.08) * secondT;
        const layerZ = ((path % FIELD_LAYERS) - 2.5) * 0.11;

        liveLinePositions[target] = Math.cos(angle) * (shell + matter) * 1.14 + liveT * 0.78 - 0.48 + stereoWidth * 0.12;
        liveLinePositions[target + 1] = Math.sin(angle) * (shell + matter) * 0.5;
        liveLinePositions[target + 2] = layerZ + Math.sin(angle * 1.35 + seconds * 0.24) * 0.18;
        liveLinePositions[target + 3] = Math.cos(secondAngle) * (secondShell + secondMatter) * 1.14 + secondT * 0.78 - 0.48 + stereoWidth * 0.12;
        liveLinePositions[target + 4] = Math.sin(secondAngle) * (secondShell + secondMatter) * 0.5;
        liveLinePositions[target + 5] = layerZ + Math.sin(secondAngle * 1.35 + seconds * 0.24) * 0.18;
      }

      lineAttribute.needsUpdate = true;
      lineMaterial.opacity = 0.08 + metrics.mid * 0.2 + loudness * 0.1;
      structureLines.rotation.y = Math.sin(seconds * 0.18) * 0.05 + metrics.mid * 0.18;

      flowLines.forEach((line, path) => {
        const positionAttribute = line.geometry.attributes.position;
        const livePositions = positionAttribute.array;
        const pathLift = path - (FLOW_PATH_COUNT - 1) / 2;
        const radialHeat = 1 + metrics.bass * 0.48 + loudness * 0.2;
        const bend = 0.1 + metrics.mid * 0.38 + loudness * 0.08;
        const evaporation = 0.14 + metrics.treble * 0.22;

        for (let index = 0; index < FLOW_PATH_POINTS; index += 1) {
          const t = index / (FLOW_PATH_POINTS - 1);
          const tail = Math.pow(t, 1.28);
          const angle =
            path * 0.36 +
            tail * Math.PI * (2.1 + path * 0.025) +
            seconds * (0.18 + metrics.mid * 0.24 + loudness * 0.08) +
            Math.sin(seconds * 0.34 + path) * 0.18;
          const matter =
            Math.sin(t * Math.PI * 7 + seconds * 0.86 + path) * bend * tail +
            Math.sin(t * Math.PI * 15 - seconds * 0.48 + path * 1.4) * evaporation * tail +
            Math.sin(t * Math.PI * 23 + seconds * 0.19 + path * 2.7) * 0.09 * tail * (0.4 + metrics.mid);
          const radius = (0.2 + tail * (2.48 + (path % 5) * 0.14) + matter) * radialHeat;
          const lift =
            Math.sin(seconds * 0.52 + path + t * 8) * (0.06 + metrics.mid * 0.08) * tail +
            Math.cos(seconds * 0.27 + path * 1.9 + t * 17) * 0.05 * tail;
          const offset = index * 3;

          livePositions[offset] = Math.cos(angle) * radius * 1.13 + tail * 0.78 - 0.48 + stereoWidth * 0.1;
          livePositions[offset + 1] = Math.sin(angle) * radius * 0.5 + lift;
          livePositions[offset + 2] = Math.sin(angle * 1.35 + path + seconds * 0.18) * (0.18 + metrics.mid * 0.18) + pathLift * 0.055;
        }

        positionAttribute.needsUpdate = true;
        line.rotation.y += 0.0018 + metrics.mid * 0.009 + loudness * 0.004;
        line.rotation.x = Math.sin(seconds * 0.28 + path) * 0.07 + stereoWidth * 0.04;
        line.rotation.z += Math.sin(seconds * 0.2 + path) * 0.0008;
      });
      flowMaterial.opacity = 0.1 + metrics.mid * 0.2 + metrics.bass * 0.06 + loudness * 0.05;

      shell.rotation.x += 0.0006 + metrics.mid * 0.002;
      shell.rotation.y -= 0.0009 + metrics.mid * 0.004;
      shell.scale.set(
        1.18 + metrics.bass * 0.42 + loudness * 0.12,
        0.82 + metrics.bass * 0.28 + loudness * 0.08,
        0.58 + metrics.bass * 0.22 + Math.abs(stereoWidth) * 0.1
      );
      shellMaterial.opacity = 0.018 + metrics.bass * 0.04 + metrics.mid * 0.025;
      core.scale.setScalar(0.86 + metrics.bass * 0.18 + loudness * 0.08);

      planes.forEach((plane, index) => {
        const phase = seconds * 0.75 + index * 1.7;
        plane.scale.set(0.82 + metrics.bass * 0.45, 0.82 + metrics.bass * 0.24, 1);
        plane.rotation.z += 0.0012 + metrics.mid * 0.006 * (index ? -1 : 1);
        plane.position.y = Math.sin(phase) * 0.055;
        plane.material.opacity = 0.012 + metrics.bass * 0.08 + loudness * 0.025;
      });

      surfaces.forEach((surface, index) => {
        const phase = seconds * (0.22 + index * 0.03) + index;
        surface.rotation.z += 0.0009 + metrics.mid * 0.004;
        surface.rotation.y = -0.36 + index * 0.16 + Math.sin(phase) * (0.05 + metrics.mid * 0.08);
        surface.position.x = 0.42 + index * 0.18 + Math.sin(phase * 0.7) * 0.08;
        surface.position.y = -0.08 + index * 0.04 + Math.cos(phase * 0.9) * 0.06;
        surface.scale.set(
          1 + index * 0.18 + metrics.bass * 0.28,
          0.76 + index * 0.08 + metrics.bass * 0.14,
          1
        );
        surface.material.opacity = 0.012 + metrics.bass * 0.035 + metrics.mid * 0.035 + loudness * 0.025;
      });

      halo.rotation.z -= 0.0008 + metrics.mid * 0.004;
      halo.scale.setScalar(1 - bassPulse * 0.08 + loudness * 0.08);
      haloMaterial.opacity = 0.035 + loudness * 0.08 + metrics.treble * 0.035;

      waveRings.forEach((ring, index) => {
        const cycle = (seconds * (0.16 + metrics.treble * 0.74) + index * 0.2) % 1;
        const waveScale = 0.42 + cycle * (2.65 + metrics.treble * 1.65 + metrics.bass * 0.6);
        ring.scale.setScalar(waveScale);
        ring.rotation.z += 0.001 + metrics.mid * 0.006;
        ring.material.opacity = Math.max(0, (1 - cycle) * (0.025 + metrics.treble * 0.3 + metrics.mid * 0.05));
      });

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      flowLines.forEach((line) => {
        line.geometry.dispose();
      });
      flowMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      planes.forEach((plane) => {
        plane.geometry.dispose();
        plane.material.dispose();
      });
      surfaces.forEach((surface) => {
        surface.geometry.dispose();
        surface.material.dispose();
      });
      haloGeometry.dispose();
      haloMaterial.dispose();
      waveRings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    function analyse() {
      if (cancelled) {
        return;
      }

      const analyser = analyserRef.current;
      const frequencyData = frequencyDataRef.current;

      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);

        const bass = averageRange(frequencyData, 0.0, 0.08);
        const mid = averageRange(frequencyData, 0.08, 0.42);
        const treble = averageRange(frequencyData, 0.42, 0.9);
        const volume = Math.min(1, bass * 0.42 + mid * 0.36 + treble * 0.22);
        let stereoWidth = 0;

        if (leftAnalyserRef.current && rightAnalyserRef.current && leftDataRef.current && rightDataRef.current) {
          leftAnalyserRef.current.getByteFrequencyData(leftDataRef.current);
          rightAnalyserRef.current.getByteFrequencyData(rightDataRef.current);
          stereoWidth = (averageRange(rightDataRef.current, 0.02, 0.72) - averageRange(leftDataRef.current, 0.02, 0.72)) * 1.4;
        }

        metricsRef.current.bass += (bass - metricsRef.current.bass) * 0.18;
        metricsRef.current.mid += (mid - metricsRef.current.mid) * 0.14;
        metricsRef.current.treble += (treble - metricsRef.current.treble) * 0.22;
        metricsRef.current.volume += (volume - metricsRef.current.volume) * 0.16;
        metricsRef.current.stereoWidth += (stereoWidth - metricsRef.current.stereoWidth) * 0.12;

        const now = performance.now();
        if (now - metricsRenderRef.current > 140) {
          metricsRenderRef.current = now;
          setVisualMetrics({
            bass: metricsRef.current.bass,
            mid: metricsRef.current.mid,
            treble: metricsRef.current.treble,
          });
        }
      } else {
        metricsRef.current.bass *= 0.94;
        metricsRef.current.mid *= 0.95;
        metricsRef.current.treble *= 0.9;
        metricsRef.current.volume *= 0.94;
        metricsRef.current.stereoWidth *= 0.9;
      }

      requestAnimationFrame(analyse);
    }

    requestAnimationFrame(analyse);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  function cleanupAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    analyserRef.current = null;
    leftAnalyserRef.current = null;
    rightAnalyserRef.current = null;
    frequencyDataRef.current = null;
    leftDataRef.current = null;
    rightDataRef.current = null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    metricsRef.current = {
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
      stereoWidth: 0,
    };
  }

  async function prepareAudio(file) {
    if (!file || !file.type.startsWith("audio/")) {
      setMessage("Choose an audio file: .mp3 / .wav / .m4a");
      return;
    }

    cleanupAudio();

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = audioContext;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = URL.createObjectURL(file);
    audio.loop = true;
    objectUrlRef.current = audio.src;
    audioRef.current = audio;

    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    const splitter = audioContext.createChannelSplitter(2);
    const leftAnalyser = audioContext.createAnalyser();
    const rightAnalyser = audioContext.createAnalyser();

    analyser.fftSize = FFT_SIZE;
    leftAnalyser.fftSize = FFT_SIZE;
    rightAnalyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.72;
    leftAnalyser.smoothingTimeConstant = 0.76;
    rightAnalyser.smoothingTimeConstant = 0.76;

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.connect(splitter);
    splitter.connect(leftAnalyser, 0);
    splitter.connect(rightAnalyser, 1);

    sourceRef.current = source;
    analyserRef.current = analyser;
    leftAnalyserRef.current = leftAnalyser;
    rightAnalyserRef.current = rightAnalyser;
    frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    leftDataRef.current = new Uint8Array(leftAnalyser.frequencyBinCount);
    rightDataRef.current = new Uint8Array(rightAnalyser.frequencyBinCount);

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

    setFileName(file.name);
    setIsReady(true);
    setMessage("Audio loaded locally. Press play to form geometry.");
  }

  async function togglePlayback() {
    if (!audioRef.current) {
      inputRef.current?.click();
      return;
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (audioRef.current.paused) {
      await audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    prepareAudio(file);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    prepareAudio(file);
    event.target.value = "";
  }

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#020204] text-white"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_48%,rgba(93,134,190,0.12),transparent_34%),radial-gradient(circle_at_18%_38%,rgba(255,255,255,0.035),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.035),transparent_24%,transparent_82%,rgba(130,179,255,0.04))]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:130px_130px]" />
      <div className="pointer-events-none fixed inset-x-10 bottom-8 top-16 border-y border-white/[0.035]" />

      <div className="relative z-10 min-h-screen px-5 py-6 md:px-12 md:py-9">
        <header className="relative z-20 flex items-center justify-between text-[0.62rem] tracking-[0.34em] text-white/62">
          <Link href="/" className="transition hover:text-white">
            ANN1WFOEV.COM
          </Link>
          <span>1W4V AUDIO / LAB 001</span>
        </header>

        <section className="relative min-h-[calc(100vh-5rem)]">
          <div className="relative z-20 max-w-[18rem] pt-8 md:pt-24">
            <h1 className="mb-10 text-[1.5rem] font-light leading-[1.62] tracking-[0.54em] text-white/88 md:text-[2.6rem]">
              <span className="block">1W4V</span>
              <span className="block tracking-[0.42em]">AUDIO</span>
              <span className="block text-[0.72em] tracking-[0.48em]">SPACE LAB</span>
            </h1>
            <span className="mb-7 block h-px w-8 bg-white/48" />
            <p className="max-w-xs text-[0.54rem] leading-5 tracking-[0.26em] text-white/38 md:max-w-sm">
              DRAG AUDIO INTO SPACE
            </p>
            <p className="mt-7 max-w-[11rem] text-[0.5rem] uppercase leading-6 tracking-[0.34em] text-white/22">
              LET SOUND FORM ITS OWN GEOMETRY
            </p>
            <p className="hidden">
              拖入音频，让声音生成它自己的空间形态。
            </p>
          </div>

          <div className="pointer-events-none absolute left-0 top-[58%] z-20 hidden w-36 -translate-y-1/2 text-[0.46rem] tracking-[0.34em] text-white/26 md:hidden">
            <p className="mb-5 text-white/38">{isPlaying ? "SIGNAL ACTIVE" : "IDLE DRIFT"}</p>
            {[
              ["BASS", visualMetrics.bass],
              ["MID", visualMetrics.mid],
              ["TREBLE", visualMetrics.treble],
            ].map(([label, value]) => (
              <div key={label} className="mb-4">
                <div className="mb-2 flex justify-between">
                  <span>{label}</span>
                  <span className="tracking-[0.18em]">{value.toFixed(2)}</span>
                </div>
                <span className="block h-px bg-white/[0.06]">
                  <span className="block h-px bg-white/50" style={{ width: `${Math.max(8, value * 100)}%` }} />
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-[5vh] top-[0vh] z-10 overflow-hidden md:bottom-[4vh] md:top-[-5vh]">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-[54%] top-[21%] -translate-x-1/2 text-[0.48rem] tracking-[0.34em] text-white/12 md:hidden">
              {isPlaying ? "SIGNAL ACTIVE" : "IDLE DRIFT"}
            </div>
          </div>
        </section>

        <footer className="absolute bottom-6 left-5 right-5 z-30 grid gap-3 md:bottom-8 md:left-12 md:right-12 md:grid-cols-[1fr_auto] md:items-end">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`group max-w-[24rem] text-left transition ${
              isDragging
                ? "text-cyan-100"
                : "text-white/54 hover:text-white"
            }`}
          >
            <span className="block border-t border-white/8 pt-3 text-[0.56rem] tracking-[0.42em] group-hover:border-white/24">
              DROP AUDIO
            </span>
            <span className="mt-3 block truncate text-[0.52rem] tracking-[0.22em] text-white/22 group-hover:text-white/42">
              {fileName || message}
            </span>
          </button>

          <div className="flex items-center gap-8 text-[0.56rem] tracking-[0.38em]">
            <button
              type="button"
              onClick={togglePlayback}
              className="bg-transparent text-white/58 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              {isPlaying ? "PAUSE" : isReady ? "PLAY" : "SELECT"}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-transparent text-white/26 transition hover:text-white/72"
            >
              RELOAD
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a,.mp3,.wav,.m4a"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-[0.5rem] tracking-[0.26em] text-white/18 md:col-span-2 md:text-right">
            Local audio processing only. No upload.
          </p>
        </footer>
      </div>
    </main>
  );
}
