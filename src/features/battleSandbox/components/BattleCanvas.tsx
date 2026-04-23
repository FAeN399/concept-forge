import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import { useBattleSandboxStore } from '../store/useBattleSandboxStore';
import { UnitMesh } from './UnitMesh';
import styles from '../BattleSandboxPage.module.css';

function SimulationDriver() {
  const advance = useBattleSandboxStore((state) => state.advance);

  useFrame((_, delta) => {
    advance(Math.min(delta, 0.25));
  });

  return null;
}

export function BattleCanvas() {
  const arena = useBattleSandboxStore((state) => state.scenario.arena);
  const units = useBattleSandboxStore((state) => state.runtime.units);
  const view = useBattleSandboxStore((state) => state.view);
  const selectedUnitId = useBattleSandboxStore((state) => state.selectedUnitId);
  const selectUnit = useBattleSandboxStore((state) => state.selectUnit);

  const groundSize = useMemo(
    () => Math.max(arena.width, arena.depth) + 6,
    [arena.depth, arena.width],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 24, 26], fov: 42 }}
      onPointerMissed={() => selectUnit(null)}
      fallback={<div className={styles.canvasFallback}>WebGL is not available.</div>}
    >
      <SimulationDriver />

      <color attach="background" args={['#071018']} />
      <fog attach="fog" args={['#071018', 30, 64]} />

      <ambientLight intensity={1.3} />
      <hemisphereLight intensity={0.55} groundColor="#0f172a" />
      <directionalLight
        castShadow
        position={[16, 22, 12]}
        intensity={2.3}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <group>
        <mesh
          rotation-x={-Math.PI / 2}
          receiveShadow
          position={[0, 0, 0]}
        >
          <planeGeometry args={[arena.width, arena.depth]} />
          <meshStandardMaterial color="#0b1621" />
        </mesh>

        {view.showGrid ? (
          <gridHelper args={[groundSize, Math.floor(groundSize), '#294359', '#162435']} position={[0, 0.01, 0]} />
        ) : null}

        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[groundSize + 4, 0.5, groundSize + 4]} />
          <meshStandardMaterial color="#050b12" />
        </mesh>

        <mesh position={[0, 0.45, arena.depth / 2 + 0.3]}>
          <boxGeometry args={[arena.width + 0.8, 0.9, 0.28]} />
          <meshStandardMaterial color="#223142" />
        </mesh>
        <mesh position={[0, 0.45, -arena.depth / 2 - 0.3]}>
          <boxGeometry args={[arena.width + 0.8, 0.9, 0.28]} />
          <meshStandardMaterial color="#223142" />
        </mesh>
        <mesh position={[arena.width / 2 + 0.3, 0.45, 0]}>
          <boxGeometry args={[0.28, 0.9, arena.depth + 0.8]} />
          <meshStandardMaterial color="#223142" />
        </mesh>
        <mesh position={[-arena.width / 2 - 0.3, 0.45, 0]}>
          <boxGeometry args={[0.28, 0.9, arena.depth + 0.8]} />
          <meshStandardMaterial color="#223142" />
        </mesh>
      </group>

      {units.map((unit) => (
        <UnitMesh
          key={unit.id}
          unit={unit}
          selected={unit.id === selectedUnitId}
          showRanges={view.showRanges}
          showHealthBars={view.showHealthBars}
          onSelect={selectUnit}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={70}
      />
    </Canvas>
  );
}
