'use client';

/**
 * InkFlowScene — StoryThread hero Three.js scene
 *
 * Concept: Ink flowing through water — particles form swirling ink patterns,
 * then coalesce into a quill pen silhouette, then disperse again.
 * Warm amber/sepia tones with violet magic sparks.
 *
 * Colors: Amber #92400E, Violet #7C3AED, Stone-950 background
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;

function InkParticles() {
  const meshRef   = useRef<THREE.Points>(null!);
  const clockRef  = useRef(0);
  const phaseRef  = useRef(0); // 0=flow, 1=coalesce, 2=disperse

  const { basePositions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    // Amber ink color with violet specks
    const amber  = new THREE.Color('#92400E');
    const violet = new THREE.Color('#7C3AED');
    const gold   = new THREE.Color('#D97706');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 12;
      pos[i*3+1] = (Math.random() - 0.5) * 8;
      pos[i*3+2] = (Math.random() - 0.5) * 4 - 2;

      vel[i*3]   = (Math.random() - 0.5) * 0.01;
      vel[i*3+1] = (Math.random() - 0.5) * 0.008;
      vel[i*3+2] = (Math.random() - 0.5) * 0.005;

      const t = Math.random();
      let base: THREE.Color;
      if (i % 15 === 0)      base = violet;
      else if (i % 5 === 0)  base = gold;
      else                   base = amber;

      const bright = 0.3 + Math.random() * 0.5;
      col[i*3]   = base.r * bright;
      col[i*3+1] = base.g * bright;
      col[i*3+2] = base.b * bright;
    }
    return { basePositions: new Float32Array(pos), velocities: vel, colors: col };
  }, []);

  // Working positions array
  const positions = useMemo(() => new Float32Array(basePositions), [basePositions]);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = clockRef.current;

    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];

      // Curl-noise-like flow field
      const nx = Math.sin(y * 0.4 + t * 0.3) * 0.008;
      const ny = Math.cos(x * 0.4 + t * 0.25) * 0.006;
      const nz = Math.sin((x + y) * 0.3 + t * 0.2) * 0.004;

      pos[i*3]   += velocities[i*3] + nx;
      pos[i*3+1] += velocities[i*3+1] + ny;
      pos[i*3+2] += velocities[i*3+2] + nz;

      // Gentle boundary wrap
      if (Math.abs(pos[i*3])   > 6.5) velocities[i*3]   *= -0.7;
      if (Math.abs(pos[i*3+1]) > 4.5) velocities[i*3+1] *= -0.7;
      if (Math.abs(pos[i*3+2]) > 2.5) velocities[i*3+2] *= -0.7;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.z += delta * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Violet magic sparks
function MagicSparks() {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 120;
  const pos = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i*3]   = (Math.random() - 0.5) * 10;
      arr[i*3+1] = (Math.random() - 0.5) * 6;
      arr[i*3+2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#7C3AED" size={0.09} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 3]} intensity={1.5} color="#92400E" distance={10} decay={2} />
      <pointLight position={[-3, 2, 1]} intensity={1} color="#7C3AED" distance={8} decay={2} />
      <InkParticles />
      <MagicSparks />
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.5 : 1.1} luminanceThreshold={0.3} luminanceSmoothing={0.5} radius={0.8} />
      </EffectComposer>
    </>
  );
}

export function InkFlowScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-amber-950/20 rounded" />}>
        <Canvas camera={{ position: [0, 0, 8], fov: 52 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
