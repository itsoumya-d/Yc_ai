'use client';

/**
 * ClaimFlowScene — ClaimForge hero Three.js scene
 * Documents flowing through AI scanner → resolved status cards.
 * Violet AI beam sweeps across, processing documents.
 * Colors: Cyan #0E7490, Violet #6D28D9, sky-blue background
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Conveyor of claim documents
function ClaimDocuments() {
  const groupRef = useRef<THREE.Group>(null!);
  const clockRef = useRef(0);
  const DOCS = 6;

  useFrame((_, delta) => {
    clockRef.current += delta;
    groupRef.current.children.forEach((doc, i) => {
      // Move left along conveyor
      doc.position.x = ((doc.position.x - delta * 0.6 + 8) % 14) - 7;
      doc.rotation.y = Math.sin(clockRef.current * 0.4 + i) * 0.08;
      doc.position.y = Math.sin(clockRef.current * 0.5 + i * 1.3) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: DOCS }).map((_, i) => (
        <mesh key={i} position={[-6 + i * 2.2, 0, 0]}>
          <boxGeometry args={[1.4, 1.0, 0.04]} />
          <meshStandardMaterial
            color="#F0F9FF"
            emissive="#0E7490"
            emissiveIntensity={0.06}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// AI scanner beam — violet vertical plane sweeping
function AIScannerBeam() {
  const ref = useRef<THREE.Mesh>(null!);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    // Sweep back and forth over document zone
    ref.current.position.x = Math.sin(clockRef.current * 0.7) * 4;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.12 + Math.sin(clockRef.current * 4) * 0.05;
  });

  return (
    <mesh ref={ref} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[3, 1.4]} />
      <meshBasicMaterial color="#6D28D9" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

// AI particles swirling around scanner
function ScannerParticles() {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i*3]   = (Math.random() - 0.5) * 10;
      arr[i*3+1] = (Math.random() - 0.5) * 2;
      arr[i*3+2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.15;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#6D28D9" size={0.04} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Status output cards (Approved / Review / Denied)
function StatusCards() {
  const clockRef = useRef(0);
  const refs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];

  useFrame((_, delta) => {
    clockRef.current += delta;
    refs.forEach((ref, i) => {
      ref.current.position.y = 1.8 + Math.sin(clockRef.current * 0.6 + i * 1.5) * 0.12;
    });
  });

  const CARDS = [
    { pos: [-2.5, 1.8, 1] as [number,number,number], color: '#10B981', label: 'Approved' },
    { pos: [0,    2.0, 1] as [number,number,number], color: '#F59E0B', label: 'Review'   },
    { pos: [2.5,  1.8, 1] as [number,number,number], color: '#EF4444', label: 'Denied'   },
  ];

  return (
    <group>
      {CARDS.map((card, i) => (
        <mesh key={i} ref={refs[i]} position={card.pos}>
          <boxGeometry args={[1.1, 0.5, 0.04]} />
          <meshStandardMaterial color={card.color} emissive={card.color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} color="#F0F9FF" />
      <pointLight position={[0, 3, 3]}   intensity={2}   color="#6D28D9" distance={10} decay={2} />
      <pointLight position={[5, -1, 2]}  intensity={1.5} color="#10B981" distance={8}  decay={2} />
      <pointLight position={[-5, -1, 2]} intensity={1}   color="#0E7490" distance={8}  decay={2} />
      <ClaimDocuments />
      <AIScannerBeam />
      <ScannerParticles />
      {!isMobile && <StatusCards />}
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.5 : 1.2} luminanceThreshold={0.3} luminanceSmoothing={0.4} radius={0.6} />
      </EffectComposer>
    </>
  );
}

export function ClaimFlowScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-sky-100/50 rounded" />}>
        <Canvas camera={{ position: [0, 1, 9], fov: 50 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
