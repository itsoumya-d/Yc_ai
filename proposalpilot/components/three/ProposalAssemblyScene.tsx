'use client';

/**
 * ProposalAssemblyScene — ProposalPilot hero Three.js scene
 * Document pages fly in from different directions and stack into a proposal.
 * A golden "Approved" stamp drops onto the stack with a bounce.
 * Colors: Deep navy #1E3A5F, Blue #3B82F6, slate-white background
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const PAGE_COUNT = 5;
const FINAL_Y = 0; // stacked y-position for each page

function ProposalPages() {
  const groupRef = useRef<THREE.Group>(null!);
  const clockRef = useRef(0);
  const phasesRef = useRef(Array.from({ length: PAGE_COUNT }, (_, i) => ({
    startTime: i * 0.6,
    fromX: (Math.random() - 0.5) * 10,
    fromY: (Math.random() - 0.5) * 8 + 4,
    fromZ: (Math.random() - 0.5) * 4,
    settled: false,
  })));

  useFrame((_, delta) => {
    clockRef.current += delta;

    groupRef.current.children.forEach((page, i) => {
      const phase = phasesRef.current[i];
      const elapsed = Math.max(0, clockRef.current - phase.startTime);
      const t = Math.min(elapsed / 1.2, 1); // 1.2s animation per page
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

      const targetX = 0;
      const targetY = FINAL_Y - i * 0.05;
      const targetZ = -i * 0.02;

      page.position.set(
        phase.fromX + (targetX - phase.fromX) * eased,
        phase.fromY + (targetY - phase.fromY) * eased,
        phase.fromZ + (targetZ - phase.fromZ) * eased,
      );

      page.rotation.y = (1 - eased) * (Math.random() > 0.5 ? 0.5 : -0.5);
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: PAGE_COUNT }).map((_, i) => (
        <mesh key={i} position={[0, 10, 0]}>
          <planeGeometry args={[1.8, 2.4]} />
          <meshStandardMaterial
            color={i === 0 ? '#F8FAFC' : '#FFFFFF'}
            emissive="#1E3A5F"
            emissiveIntensity={0.04}
            side={THREE.DoubleSide}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// Golden approval stamp
function ApprovalStamp() {
  const ref = useRef<THREE.Mesh>(null!);
  const clockRef = useRef(0);
  const droppedRef = useRef(false);

  useFrame((_, delta) => {
    clockRef.current += delta;

    if (clockRef.current > 3.5 && !droppedRef.current) {
      // Drop animation
      const elapsed = clockRef.current - 3.5;
      const bounce = Math.max(0, 1 - elapsed * 2.5);
      ref.current.position.y = bounce * 2 + 0.15;
      ref.current.rotation.z = Math.sin(elapsed * 8) * (0.3 * Math.exp(-elapsed * 2));
    }
  });

  return (
    <mesh ref={ref} position={[0, 8, 0.1]}>
      <cylinderGeometry args={[0.5, 0.5, 0.08, 24]} />
      <meshStandardMaterial
        color="#B45309"
        emissive="#FCD34D"
        emissiveIntensity={0.9}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

// Floating mini bar charts on proposal pages
function MiniCharts() {
  const BAR_SETS = useMemo(() => [
    { pos: [2.5, 0.5, 0.5] as [number,number,number], heights: [0.3, 0.5, 0.4, 0.7, 0.55] },
    { pos: [-2.5, -0.5, 0] as [number,number,number], heights: [0.6, 0.3, 0.8, 0.45, 0.65] },
  ], []);

  return (
    <>
      {BAR_SETS.map((set, si) => (
        <group key={si} position={set.pos}>
          {set.heights.map((h, bi) => (
            <mesh key={bi} position={[(bi - 2) * 0.15, h / 2 - 0.25, 0]}>
              <boxGeometry args={[0.1, h, 0.05]} />
              <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} color="#F8FAFC" />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#EFF6FF" />
      <pointLight position={[0, 2, 3]} intensity={1.5} color="#3B82F6" distance={10} decay={2} />
      <pointLight position={[0, 0.2, 2]} intensity={2} color="#FCD34D" distance={6} decay={2} />
      <ProposalPages />
      <ApprovalStamp />
      {!isMobile && <MiniCharts />}
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.4 : 0.9} luminanceThreshold={0.4} luminanceSmoothing={0.5} radius={0.6} />
      </EffectComposer>
    </>
  );
}

export function ProposalAssemblyScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-100/50 rounded" />}>
        <Canvas camera={{ position: [0, 1, 8], fov: 50 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
