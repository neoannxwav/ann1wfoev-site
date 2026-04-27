"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 760;
const MOBILE_PARTICLE_COUNT = 520;
const FIELD_LAYERS = 6;
const LINE_SEGMENT_COUNT = 520;
const FLOW_PATH_COUNT = 5;
const FLOW_PATH_POINTS = 180;
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
    float shard = floor(aSeed.x * 7.0);
    float flow = sin(uTime * (0.42 + aSeed.y * 0.24) + aSeed.x * 12.566 + p.z * 1.6);
    float heat = 1.0 + uBass * 0.42 + uVolume * 0.18;
    float idle = sin(uTime * 0.2 + aSeed.x * 6.2831) * 0.012;
    float detail = sin(uTime * 2.1 + aSeed.x * 17.0) * uTreble * 0.018;

    p *= heat + idle;
    p += direction * (flow * uMid * 0.09 + detail);
    p.x += uStereoWidth * (0.6 + abs(p.y) * 0.22);
    p.z -= uStereoWidth * 0.25;
    p += vec3(aSeed.z, aSeed.w, hash(aSeed.x) - 0.5) * uTreble * 0.018;

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
    const angle = progress * Math.PI * 2 * (1.15 + layer * 0.04) + layer * 0.84;
    const shell = 0.26 + layer * 0.22 + Math.pow(progress, 1.7) * 0.9;
    const spiral = Math.sin(progress * Math.PI * 6 + layer) * 0.09;
    const x = Math.cos(angle) * (shell + spiral) * 1.18;
    const y = Math.sin(angle) * (shell + spiral) * 0.82;
    const z = (layer - (FIELD_LAYERS - 1) / 2) * 0.2 + Math.sin(angle * 0.7) * 0.18;
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
    const layer = index % FIELD_LAYERS;
    const t = Math.floor(index / FIELD_LAYERS) / Math.ceil(pairCount / FIELD_LAYERS);
    const arc = 0.012 + layer * 0.002;
    const first = index * 6;
    const secondT = Math.min(1, t + arc);
    const angle = t * Math.PI * 2 * (1.15 + layer * 0.04) + layer * 0.84;
    const secondAngle = secondT * Math.PI * 2 * (1.15 + layer * 0.04) + layer * 0.84;
    const shell = 0.34 + layer * 0.22 + Math.pow(t, 1.7) * 0.86;
    const secondShell = 0.34 + layer * 0.22 + Math.pow(secondT, 1.7) * 0.86;
    const spiral = Math.sin(t * Math.PI * 6 + layer) * 0.08;
    const secondSpiral = Math.sin(secondT * Math.PI * 6 + layer) * 0.08;

    pairs.push(layer, t, arc, shell, 0);

    linePositions[first] = Math.cos(angle) * (shell + spiral) * 1.18;
    linePositions[first + 1] = Math.sin(angle) * (shell + spiral) * 0.82;
    linePositions[first + 2] = (layer - (FIELD_LAYERS - 1) / 2) * 0.2 + Math.sin(angle * 0.7) * 0.18;
    linePositions[first + 3] = Math.cos(secondAngle) * (secondShell + secondSpiral) * 1.18;
    linePositions[first + 4] = Math.sin(secondAngle) * (secondShell + secondSpiral) * 0.82;
    linePositions[first + 5] = (layer - (FIELD_LAYERS - 1) / 2) * 0.2 + Math.sin(secondAngle * 0.7) * 0.18;
  }

  return { linePositions, pairs };
}

function createFlowPaths() {
  return Array.from({ length: FLOW_PATH_COUNT }, (_, path) => {
    const positions = new Float32Array(FLOW_PATH_POINTS * 3);

    for (let index = 0; index < FLOW_PATH_POINTS; index += 1) {
      const t = index / (FLOW_PATH_POINTS - 1);
      const angle = t * Math.PI * 2 * (1.05 + path * 0.06) + path * 0.9;
      const radius = 1.15 + path * 0.18 + Math.sin(t * Math.PI * 6 + path) * 0.05;
      const offset = index * 3;

      positions[offset] = Math.cos(angle) * radius * 1.18;
      positions[offset + 1] = Math.sin(angle) * radius * 0.72;
      positions[offset + 2] = Math.sin(angle * 1.6 + path) * 0.28 + (path - 2) * 0.08;
    }

    return positions;
  });
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

  useEffect(() => {
    if (!mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.11);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

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
      line.rotation.set(0.18 + index * 0.08, index * 0.16, index * 0.72);
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
      systemGroup.scale.setScalar(breath);
      systemGroup.rotation.y += 0.0008 + metrics.mid * 0.006;
      systemGroup.rotation.x = Math.sin(seconds * 0.16) * 0.06 + stereoWidth * 0.06;
      points.rotation.y += 0.0006 + metrics.mid * 0.004;
      points.rotation.x = Math.sin(seconds * 0.18) * 0.05 + stereoWidth * 0.05;

      for (let index = 0; index < pairs.length; index += 1) {
        const meta = index * 5;
        const layer = pairs[meta];
        const t = pairs[meta + 1];
        const arc = pairs[meta + 2] + metrics.mid * 0.012;
        const target = index * 6;
        const drift = seconds * (0.018 + metrics.mid * 0.034);
        const liveT = (t + drift) % 1;
        const secondT = Math.min(1, liveT + arc);
        const angle = liveT * Math.PI * 2 * (1.15 + layer * 0.04) + layer * 0.84 + metrics.mid * 0.26;
        const secondAngle = secondT * Math.PI * 2 * (1.15 + layer * 0.04) + layer * 0.84 + metrics.mid * 0.26;
        const shell = (0.34 + layer * 0.22 + Math.pow(liveT, 1.7) * 0.86) * (1 + metrics.bass * 0.34 + loudness * 0.12);
        const secondShell = (0.34 + layer * 0.22 + Math.pow(secondT, 1.7) * 0.86) * (1 + metrics.bass * 0.34 + loudness * 0.12);
        const matter = Math.sin(liveT * Math.PI * 6 + layer + seconds * 0.7) * (0.08 + metrics.mid * 0.08);
        const secondMatter = Math.sin(secondT * Math.PI * 6 + layer + seconds * 0.7) * (0.08 + metrics.mid * 0.08);
        const layerZ = (layer - (FIELD_LAYERS - 1) / 2) * 0.2;

        liveLinePositions[target] = Math.cos(angle) * (shell + matter) * 1.18 + stereoWidth * 0.16;
        liveLinePositions[target + 1] = Math.sin(angle) * (shell + matter) * 0.82;
        liveLinePositions[target + 2] = layerZ + Math.sin(angle * 0.7 + seconds * 0.2) * 0.18;
        liveLinePositions[target + 3] = Math.cos(secondAngle) * (secondShell + secondMatter) * 1.18 + stereoWidth * 0.16;
        liveLinePositions[target + 4] = Math.sin(secondAngle) * (secondShell + secondMatter) * 0.82;
        liveLinePositions[target + 5] = layerZ + Math.sin(secondAngle * 0.7 + seconds * 0.2) * 0.18;
      }

      lineAttribute.needsUpdate = true;
      lineMaterial.opacity = 0.16 + metrics.mid * 0.22 + loudness * 0.08;
      structureLines.rotation.y = Math.sin(seconds * 0.22) * 0.08 + metrics.mid * 0.22;

      flowLines.forEach((line, path) => {
        const positionAttribute = line.geometry.attributes.position;
        const livePositions = positionAttribute.array;
        const pathLift = path - (FLOW_PATH_COUNT - 1) / 2;
        const radialHeat = 1 + metrics.bass * 0.52 + loudness * 0.16;
        const bend = 0.12 + metrics.mid * 0.26;

        for (let index = 0; index < FLOW_PATH_POINTS; index += 1) {
          const t = index / (FLOW_PATH_POINTS - 1);
          const angle = t * Math.PI * 2 * (1.05 + path * 0.06) + path * 0.9 + seconds * (0.08 + metrics.mid * 0.12);
          const matter =
            Math.sin(t * Math.PI * 5 + seconds * 0.48 + path) * bend +
            Math.sin(t * Math.PI * 11 - seconds * 0.27 + path * 1.4) * metrics.treble * 0.045;
          const radius = (1.06 + path * 0.17 + matter) * radialHeat;
          const offset = index * 3;

          livePositions[offset] = Math.cos(angle) * radius * 1.2 + stereoWidth * 0.12;
          livePositions[offset + 1] = Math.sin(angle) * radius * 0.74;
          livePositions[offset + 2] = Math.sin(angle * 1.55 + path) * (0.22 + metrics.mid * 0.18) + pathLift * 0.08;
        }

        positionAttribute.needsUpdate = true;
        line.rotation.y += 0.0008 + metrics.mid * 0.003;
        line.rotation.x = Math.sin(seconds * 0.18 + path) * 0.045 + stereoWidth * 0.04;
      });
      flowMaterial.opacity = 0.07 + metrics.mid * 0.16 + metrics.bass * 0.05;

      shell.rotation.x += 0.0006 + metrics.mid * 0.002;
      shell.rotation.y -= 0.0009 + metrics.mid * 0.004;
      shell.scale.set(
        1.18 + metrics.bass * 0.42 + loudness * 0.12,
        0.82 + metrics.bass * 0.28 + loudness * 0.08,
        0.58 + metrics.bass * 0.22 + Math.abs(stereoWidth) * 0.1
      );
      shellMaterial.opacity = 0.018 + metrics.bass * 0.04 + metrics.mid * 0.025;

      planes.forEach((plane, index) => {
        const phase = seconds * 0.75 + index * 1.7;
        plane.scale.set(0.82 + metrics.bass * 0.45, 0.82 + metrics.bass * 0.24, 1);
        plane.rotation.z += 0.0012 + metrics.mid * 0.006 * (index ? -1 : 1);
        plane.position.y = Math.sin(phase) * 0.055;
        plane.material.opacity = 0.012 + metrics.bass * 0.08 + loudness * 0.025;
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
      planes.forEach((plane) => {
        plane.geometry.dispose();
        plane.material.dispose();
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_68%_48%,rgba(56,132,210,0.2),transparent_32%),radial-gradient(circle_at_12%_40%,rgba(100,118,180,0.08),transparent_30%),linear-gradient(110deg,rgba(255,255,255,0.03),transparent_18%,transparent_74%,rgba(91,255,236,0.04))]" />
      <div className="pointer-events-none fixed bottom-0 left-0 top-0 w-[42vw] opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 min-h-screen px-5 py-6 md:px-12 md:py-9">
        <header className="relative z-20 flex items-center justify-between text-[0.62rem] tracking-[0.34em] text-white/62">
          <Link href="/" className="transition hover:text-white">
            ANN1WFOEV.COM
          </Link>
          <span>1W4V AUDIO / LAB 001</span>
        </header>

        <section className="relative min-h-[calc(100vh-5rem)]">
          <div className="relative z-20 max-w-[16rem] pt-8 md:pt-10">
            <h1 className="mb-5 text-[1.35rem] font-light leading-[1.08] tracking-[0.48em] text-white/72 md:text-[2.15rem]">
              <span className="block">1W4V</span>
              <span className="block tracking-[0.42em]">AUDIO</span>
              <span className="block text-[0.72em] tracking-[0.48em]">SPACE LAB</span>
            </h1>
            <p className="max-w-xs text-[0.54rem] leading-5 tracking-[0.26em] text-white/28 md:max-w-sm">
              DRAG AUDIO INTO SPACE
            </p>
            <p className="mt-3 max-w-sm text-xs leading-6 tracking-[0.12em] text-white/0 transition hover:text-white/36">
              拖入音频，让声音生成它自己的空间形态。
            </p>
          </div>

          <div className="absolute inset-x-[-6vw] bottom-[8vh] top-[2vh] z-10 overflow-hidden md:inset-x-[-8vw] md:bottom-[6vh] md:top-[-2vh]">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-[50%] top-[21%] -translate-x-1/2 text-[0.48rem] tracking-[0.34em] text-white/14">
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
