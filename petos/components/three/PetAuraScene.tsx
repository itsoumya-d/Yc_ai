'use client';

/**
 * PetAuraScene — PetOS hero Three.js scene
 * Warm floating health-status icons (hearts, shields, paw prints) orbit a
 * central glowing sphere representing a pet. Particle confetti on entry.
 * Colors: Orange #F97316, Teal #0D9488, warm cream background
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Central "pet life" orb
function PetOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    ref.current.rotation.y += delta * 0.3;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + Math.sin(clockRef.current * 1.5) * 0.2;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.7, 24, 24]} />
      <meshStandardMaterial
        color="#F97316"
        emissive="#F97316"
        emissiveIntensity={0.6}
        metalness={0.2}
        roughness={0.5}
      />
    </mesh>
  );
}

// Orbiting health icons as colored rings
function HealthRings() {
  const groupRef = useRef<THREE.Group>(null!);
  const clockRef = useRef(0);

  const RINGS = useMemo(() => [
    { radius: 1.5, color: '#EF4444', speed: 0.5, tilt: 0 },          // heart (health)
    { radius: 2.0, color: '#0D9488', speed: -0.35, tilt: Math.PI/3 }, // shield (vaccination)
    { radius: 2.5, color: '#F59E0B', speed: 0.25, tilt: Math.PI/6 },  // star (care rating)
  ], []);

  useFrame((_, delta) => {
    clockRef.current += delta;
    groupRef.current.children.forEach((ring, i) => {
      ring.rotation.y += delta * RINGS[i].speed;
      ring.rotation.x = Math.sin(clockRef.current * 0.3 + i) * 0.1 + RINGS[i].tilt;
    });
  });

  return (
    <group ref={groupRef}>
      {RINGS.map((ring, i) => (
        <mesh key={i} rotation={[ring.tilt, 0, 0]}>
          <torusGeometry args={[ring.radius, 0.025, 8, 60]} />
          <meshStandardMaterial color={ring.color} emissive={ring.color} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Floating health status badges
function HealthBadges() {
  const BADGES = useMemo(() => [
    { pos: [2.2, 1, 0] as [number,number,number], color: '#EF4444' },
    { pos: [-2, 0.5, 0.5] as [number,number,number], color: '#0D9488' },
    { pos: [0.5, 2, -1] as [number,number,number], color: '#F59E0B' },
    { pos: [-1.5, -1.5, 0] as [number,number,number], color: '#F97316' },
  ], []);

  return (
    <>
      {BADGES.map((b, i) => (
        <Float key={i} speed={1.2 + i * 0.3} floatIntensity={0.4} rotationIntensity={0.2}>
          <mesh position={b.pos}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={1.0} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Warm particle field
function WarmParticles() {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 500;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i*3]   = (Math.random() - 0.5) * 12;
      arr[i*3+1] = (Math.random() - 0.5) * 8;
      arr[i*3+2] = (Math.random() - 0.5) * 6 - 3;
    }
    return arr;
  }, []);

  useFrame((state) => { ref.current.rotation.y = state.clock.elapsedTime * 0.03; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FED7AA" size={0.04} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} color="#FFFBEB" />
      <pointLight position={[0, 0, 3]}  intensity={2}   color="#F97316" distance={8}  decay={2} />
      <pointLight position={[3, 2, 1]}  intensity={1.5} color="#0D9488" distance={8}  decay={2} />
      <PetOrb />
      <HealthRings />
      <HealthBadges />
      {!isMobile && <WarmParticles />}
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.5 : 1.0} luminanceThreshold={0.35} luminanceSmoothing={0.5} radius={0.7} />
      </EffectComposer>
    </>
  );
}

export function PetAuraScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-orange-100/50 rounded" />}>
        <Canvas camera={{ position: [0, 1, 8], fov: 50 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
