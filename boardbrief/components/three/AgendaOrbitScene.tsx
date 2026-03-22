'use client';

/**
 * AgendaOrbitScene — BoardBrief hero Three.js scene
 * Agenda item cards orbit a central gold meeting ring.
 * The "active" item scales up and glows gold when in the spotlight.
 * Premium & Minimal — charcoal/cream with executive gold.
 * Colors: Charcoal #1C1917, Gold #A16207/#FCD34D, cream background
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const ITEMS = ['Strategy Review', 'Q1 Financials', 'Board Resolutions', 'Risk Update', 'ESG Report', 'AOB'];
const RADIUS = 3.2;

function AgendaCards() {
  const groupRef = useRef<THREE.Group>(null!);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const angle = clockRef.current * 0.25; // orbit speed

    groupRef.current.children.forEach((card, i) => {
      const theta = angle + (i / ITEMS.length) * Math.PI * 2;
      const x = Math.cos(theta) * RADIUS;
      const z = Math.sin(theta) * RADIUS;

      // Active card = front position (z closest to camera)
      const isFront = Math.cos(theta) > 0.7;

      card.position.set(x, Math.sin(clockRef.current * 0.4 + i) * 0.15, z);
      card.rotation.y = -theta + Math.PI / 2;

      const targetScale = isFront ? 1.25 : 0.82;
      card.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);

      const mat = (card as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isFront ? 0.35 : 0.04;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {ITEMS.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[1.5, 1.0, 0.04]} />
          <meshStandardMaterial
            color="#FAFAF9"
            emissive="#A16207"
            emissiveIntensity={0.05}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Central gold meeting ring
function MeetingRing() {
  const ringRef  = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    ringRef.current.rotation.z += delta * 0.15;
    lightRef.current.intensity = 1.5 + Math.sin(clockRef.current * 1.8) * 0.4;
  });

  return (
    <group>
      <mesh ref={ringRef}>
        <torusGeometry args={[RADIUS + 0.1, 0.04, 8, 80]} />
        <meshStandardMaterial color="#A16207" emissive="#FCD34D" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={2} color="#FCD34D" distance={6} decay={2} />
    </group>
  );
}

// Spotlight on active position (front)
function Spotlight() {
  return (
    <spotLight
      position={[0, 6, 5]}
      angle={0.2}
      penumbra={0.5}
      intensity={4}
      color="#FCD34D"
      target-position={[RADIUS, 0, 0]}
    />
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} color="#FAFAF9" />
      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#FFFBEB" />
      <Spotlight />
      <MeetingRing />
      <AgendaCards />
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.4 : 0.9} luminanceThreshold={0.4} luminanceSmoothing={0.5} radius={0.6} />
      </EffectComposer>
    </>
  );
}

export function AgendaOrbitScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-amber-50 rounded" />}>
        <Canvas camera={{ position: [0, 2, 10], fov: 45 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
