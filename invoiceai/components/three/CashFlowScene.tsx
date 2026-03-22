'use client';

/**
 * CashFlowScene — InvoiceAI hero Three.js scene
 *
 * Concept: Money flowing as particles along river paths.
 * Green income particles flow in from left, blue expense particles flow out right.
 * A balance bar in the center rises/falls as they balance.
 * Invoice card planes float above.
 *
 * Colors: Emerald #059669, Blue #1D4ED8, background mint-tinted
 */

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const FLOW_COUNT = 600;

function MoneyFlow({ color, direction }: { color: string; direction: 1 | -1 }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const clockRef  = useRef(0);

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(FLOW_COUNT * 3);
    const off = new Float32Array(FLOW_COUNT); // phase offsets
    for (let i = 0; i < FLOW_COUNT; i++) {
      const t = Math.random();
      pos[i*3]   = direction * (2 + t * 5);
      pos[i*3+1] = (Math.random() - 0.5) * 2.5;
      pos[i*3+2] = (Math.random() - 0.5) * 1.5;
      off[i]     = Math.random() * Math.PI * 2;
    }
    return { positions: pos, offsets: off };
  }, [direction]);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < FLOW_COUNT; i++) {
      // Move toward center
      pos[i*3] -= direction * delta * (0.8 + Math.random() * 0.4);
      // Wave undulation
      pos[i*3+1] += Math.sin(clockRef.current * 2 + offsets[i]) * 0.004;

      // Reset when past center
      if (direction === 1 && pos[i*3] < -0.5) {
        pos[i*3] = 2 + Math.random() * 5;
        pos[i*3+1] = (Math.random() - 0.5) * 2.5;
      }
      if (direction === -1 && pos[i*3] > 0.5) {
        pos[i*3] = -(2 + Math.random() * 5);
        pos[i*3+1] = (Math.random() - 0.5) * 2.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={FLOW_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Floating invoice cards
function InvoiceCards() {
  const cards = useMemo(() => [
    { pos: [-4, 1.5, 0] as [number,number,number], rot: [0.1, 0.2, -0.1] as [number,number,number] },
    { pos: [-2.5, -1, 0.5] as [number,number,number], rot: [-0.1, -0.15, 0.08] as [number,number,number] },
    { pos: [2.5, 1.2, -0.5] as [number,number,number], rot: [0.05, 0.25, -0.05] as [number,number,number] },
    { pos: [4, -1.5, 0] as [number,number,number], rot: [-0.12, -0.2, 0.1] as [number,number,number] },
  ], []);

  return (
    <group>
      {cards.map((card, i) => (
        <Float key={i} speed={1 + i * 0.3} floatIntensity={0.3} rotationIntensity={0.2}>
          <mesh position={card.pos} rotation={card.rot}>
            <planeGeometry args={[1.2, 0.85]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#F0FDF4' : '#EFF6FF'}
              emissive={i % 2 === 0 ? '#059669' : '#1D4ED8'}
              emissiveIntensity={0.08}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Balance delta bar
function BalanceBar() {
  const barRef = useRef<THREE.Mesh>(null!);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const height = 0.6 + Math.sin(clockRef.current * 0.4) * 0.3;
    barRef.current.scale.y = height;
    const mat = barRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + Math.sin(clockRef.current * 1.2) * 0.2;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Bar track */}
      <mesh>
        <boxGeometry args={[0.06, 2.5, 0.06]} />
        <meshStandardMaterial color="#E5E7EB" transparent opacity={0.2} />
      </mesh>
      {/* Animated fill */}
      <mesh ref={barRef} position={[0, -0.5, 0]}>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.8} />
      </mesh>
      {/* Dollar coin at top */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
        <meshStandardMaterial color="#FCD34D" emissive="#FCD34D" emissiveIntensity={1.2} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[-4, 0, 2]} intensity={2} color="#059669" distance={10} decay={2} />
      <pointLight position={[4, 0, 2]}  intensity={1.5} color="#1D4ED8" distance={10} decay={2} />
      <MoneyFlow color="#059669" direction={1} />
      <MoneyFlow color="#1D4ED8" direction={-1} />
      <BalanceBar />
      {!isMobile && <InvoiceCards />}
      <EffectComposer>
        <Bloom intensity={isMobile ? 0.5 : 1.2} luminanceThreshold={0.3} luminanceSmoothing={0.4} radius={0.6} />
      </EffectComposer>
    </>
  );
}

export function CashFlowScene({ className = '', height = '100%', isMobile = false }: {
  className?: string; height?: string; isMobile?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full animate-pulse bg-emerald-950/20 rounded" />}>
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }} dpr={isMobile ? [1,1] : [1,1.5]}
          gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}>
          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
