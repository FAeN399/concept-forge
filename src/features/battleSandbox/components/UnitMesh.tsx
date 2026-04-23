// ASHBANNER — named by Fashadow 2026-04-23. Relic + reading in Octopus/30-concepts/ashbanner.md.

import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  type Group,
  type Mesh,
} from 'three';
import type { UnitState } from '../types';

interface UnitMeshProps {
  unit: UnitState;
  selected: boolean;
  showRanges: boolean;
  showHealthBars: boolean;
  onSelect: (id: string) => void;
}

const BOX_GEOMETRY = new BoxGeometry(1, 1, 1);
const CYLINDER_GEOMETRY = new CylinderGeometry(0.5, 0.5, 1, 14);
const SPHERE_GEOMETRY = new SphereGeometry(0.5, 18, 18);
const CONE_GEOMETRY = new ConeGeometry(0.5, 1, 14);
const PLANE_GEOMETRY = new PlaneGeometry(1, 1);
const SELECTION_RING_GEOMETRY = new RingGeometry(0.82, 1, 48);
const RANGE_RING_GEOMETRY = new RingGeometry(0.965, 1, 72);

const WHITE = new Color('#ffffff');
const HIT_RED = new Color('#ef4444');
const HEALTH_GOOD = new Color('#22c55e');
const HEALTH_WARN = new Color('#f59e0b');
const HEALTH_BAD = new Color('#ef4444');

const ATTACK_ANIMATION_SECONDS = 0.22;
const HIT_FLASH_SECONDS = 0.15;
const DEATH_ANIMATION_SECONDS = 0.4;
const POSITION_DAMPING = 18;
const ROTATION_DAMPING = 20;
const IDLE_SPEED_THRESHOLD = 0.08;

interface UnitPalette {
  body: string;
  armor: string;
  cloth: string;
  leather: string;
  trim: string;
  weapon: string;
}

interface UnitMaterials {
  body: MeshStandardMaterial;
  armor: MeshStandardMaterial;
  cloth: MeshStandardMaterial;
  leather: MeshStandardMaterial;
  trim: MeshStandardMaterial;
  team: MeshStandardMaterial;
  weapon: MeshStandardMaterial;
  selectionRing: MeshBasicMaterial;
  rangeRing: MeshBasicMaterial;
  healthFrame: MeshBasicMaterial;
  healthTrack: MeshBasicMaterial;
  healthFill: MeshBasicMaterial;
  smoke: MeshBasicMaterial;
  spark: MeshBasicMaterial;
}

function clamp01(value: number): number {
  return MathUtils.clamp(value, 0, 1);
}

function smooth01(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function dampAngle(current: number, target: number, lambda: number, delta: number): number {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * (1 - Math.exp(-lambda * delta));
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getPalette(shape: UnitState['shape']): UnitPalette {
  switch (shape) {
    case 'box':
      return {
        body: '#d9dee4',
        armor: '#7f8b98',
        cloth: '#4f5d69',
        leather: '#6c5039',
        trim: '#aab2ba',
        weapon: '#bcc6cf',
      };
    case 'cylinder':
      return {
        body: '#d0d6db',
        armor: '#8b939c',
        cloth: '#505861',
        leather: '#72533a',
        trim: '#9ca5ae',
        weapon: '#b9c3cb',
      };
    case 'sphere':
      return {
        body: '#59616a',
        armor: '#8d949c',
        cloth: '#666e76',
        leather: '#77553b',
        trim: '#a3abb2',
        weapon: '#c1c7cd',
      };
  }
}

function createUiMaterial(color: string, opacity: number): MeshBasicMaterial {
  const material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: DoubleSide,
    depthWrite: false,
  });

  material.toneMapped = false;
  return material;
}

function createAdditiveMaterial(color: string, opacity: number): MeshBasicMaterial {
  const material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: DoubleSide,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  material.toneMapped = false;
  return material;
}

function createMaterialSet(unit: UnitState): UnitMaterials {
  const palette = getPalette(unit.shape);
  const bodyRoughness = unit.shape === 'box' ? 0.62 : unit.shape === 'cylinder' ? 0.88 : 0.74;
  const bodyMetalness = unit.shape === 'box' ? 0.22 : unit.shape === 'cylinder' ? 0.06 : 0.12;

  return {
    body: new MeshStandardMaterial({
      color: palette.body,
      roughness: bodyRoughness,
      metalness: bodyMetalness,
    }),
    armor: new MeshStandardMaterial({
      color: palette.armor,
      roughness: 0.24,
      metalness: 0.58,
    }),
    cloth: new MeshStandardMaterial({
      color: palette.cloth,
      roughness: 0.94,
      metalness: 0,
    }),
    leather: new MeshStandardMaterial({
      color: palette.leather,
      roughness: 0.86,
      metalness: 0.05,
    }),
    trim: new MeshStandardMaterial({
      color: palette.trim,
      roughness: 0.46,
      metalness: 0.36,
    }),
    team: new MeshStandardMaterial({
      color: unit.color,
      roughness: 0.72,
      metalness: 0.08,
    }),
    weapon: new MeshStandardMaterial({
      color: palette.weapon,
      roughness: 0.18,
      metalness: 0.56,
    }),
    selectionRing: createUiMaterial(unit.color, 0.86),
    rangeRing: createUiMaterial(unit.color, 0.18),
    healthFrame: createUiMaterial('#020617', 0.92),
    healthTrack: createUiMaterial('#17212d', 0.95),
    healthFill: createUiMaterial('#22c55e', 0.98),
    smoke: createUiMaterial('#94a3b8', 0),
    spark: createAdditiveMaterial('#f59e0b', 0),
  };
}

function disposeMaterialSet(materials: UnitMaterials): void {
  materials.body.dispose();
  materials.armor.dispose();
  materials.cloth.dispose();
  materials.leather.dispose();
  materials.trim.dispose();
  materials.team.dispose();
  materials.weapon.dispose();
  materials.selectionRing.dispose();
  materials.rangeRing.dispose();
  materials.healthFrame.dispose();
  materials.healthTrack.dispose();
  materials.healthFill.dispose();
  materials.smoke.dispose();
  materials.spark.dispose();
}

function setEmissive(material: MeshStandardMaterial, color: Color, intensity: number): void {
  material.emissive.copy(color);
  material.emissiveIntensity = intensity;
}

function getHealthColor(ratio: number): Color {
  if (ratio > 0.55) {
    return HEALTH_GOOD;
  }

  if (ratio > 0.3) {
    return HEALTH_WARN;
  }

  return HEALTH_BAD;
}

export function UnitMesh({ unit, selected, showRanges, showHealthBars, onSelect }: UnitMeshProps) {
  const worldRef = useRef<Group | null>(null);
  const facingRef = useRef<Group | null>(null);
  const bodyRef = useRef<Group | null>(null);
  const torsoRef = useRef<Group | null>(null);
  const headRef = useRef<Group | null>(null);
  const leftArmRef = useRef<Group | null>(null);
  const rightArmRef = useRef<Group | null>(null);
  const weaponRef = useRef<Group | null>(null);
  const offhandRef = useRef<Group | null>(null);
  const bannerRef = useRef<Group | null>(null);
  const teamMarkRef = useRef<Group | null>(null);
  const selectionRingRef = useRef<Mesh | null>(null);
  const rangeRingRef = useRef<Mesh | null>(null);
  const smokeARef = useRef<Mesh | null>(null);
  const smokeBRef = useRef<Mesh | null>(null);
  const sparkARef = useRef<Mesh | null>(null);
  const sparkBRef = useRef<Mesh | null>(null);

  const materials = useMemo(() => createMaterialSet(unit), [unit.color, unit.shape]);
  const teamColor = useMemo(() => new Color(unit.color), [unit.color]);
  const selectionColor = useMemo(() => teamColor.clone().lerp(WHITE, 0.55), [teamColor]);
  const seed = useMemo(() => hashString(unit.id), [unit.id]);

  const prevCooldownRef = useRef(unit.cooldownRemaining);
  const prevDamageTakenRef = useRef(unit.damageTaken);
  const prevAliveRef = useRef(unit.alive);
  const attackRemainingRef = useRef(0);
  const hitFlashRemainingRef = useRef(0);
  const deathElapsedRef = useRef(0);

  const [deathHidden, setDeathHidden] = useState(!unit.alive);

  const healthRatio = unit.maxHealth > 0 ? clamp01(unit.health / unit.maxHealth) : 0;
  const showDistressFx = unit.alive && healthRatio < 0.3;
  const barWidth = MathUtils.clamp(unit.radius * 2.25, 1.08, 1.92);
  const barHeight = 0.16;
  const fillScale = Math.max(0.02, healthRatio);
  const phaseA = (seed % 360) * (Math.PI / 180);
  const phaseB = (((seed >>> 9) % 360) * Math.PI) / 180;
  const phaseC = (((seed >>> 18) % 360) * Math.PI) / 180;
  const fallDirection = seed & 1 ? 1 : -1;

  useEffect(() => {
    materials.healthFill.color.copy(getHealthColor(healthRatio));
  }, [healthRatio, materials]);

  useEffect(() => {
    return () => {
      disposeMaterialSet(materials);
    };
  }, [materials]);

  useEffect(() => {
    const previousCooldown = prevCooldownRef.current;
    const triggerThreshold = Math.max(0.05, unit.attackCooldown * 0.12);

    if (
      unit.alive &&
      unit.attackCooldown > 0 &&
      previousCooldown <= triggerThreshold &&
      unit.cooldownRemaining > previousCooldown &&
      unit.cooldownRemaining >= unit.attackCooldown * 0.5
    ) {
      attackRemainingRef.current = ATTACK_ANIMATION_SECONDS;
    }

    prevCooldownRef.current = unit.cooldownRemaining;
  }, [unit.alive, unit.attackCooldown, unit.cooldownRemaining]);

  useEffect(() => {
    if (unit.damageTaken > prevDamageTakenRef.current) {
      hitFlashRemainingRef.current = HIT_FLASH_SECONDS;
    }

    prevDamageTakenRef.current = unit.damageTaken;
  }, [unit.damageTaken]);

  useEffect(() => {
    if (prevAliveRef.current && !unit.alive) {
      deathElapsedRef.current = 0;
      if (deathHidden) {
        setDeathHidden(false);
      }
    }

    if (unit.alive) {
      deathElapsedRef.current = 0;
      if (deathHidden) {
        setDeathHidden(false);
      }
    }

    prevAliveRef.current = unit.alive;
  }, [deathHidden, unit.alive]);

  useFrame((state, delta) => {
    if (!unit.alive && deathHidden) {
      return;
    }

    if (worldRef.current) {
      worldRef.current.position.x = MathUtils.damp(
        worldRef.current.position.x,
        unit.position.x,
        POSITION_DAMPING,
        delta,
      );
      worldRef.current.position.z = MathUtils.damp(
        worldRef.current.position.z,
        unit.position.z,
        POSITION_DAMPING,
        delta,
      );
    }

    if (facingRef.current) {
      facingRef.current.rotation.y = dampAngle(
        facingRef.current.rotation.y,
        unit.facing,
        ROTATION_DAMPING,
        delta,
      );
    }

    attackRemainingRef.current = Math.max(0, attackRemainingRef.current - delta);
    hitFlashRemainingRef.current = Math.max(0, hitFlashRemainingRef.current - delta);

    if (!unit.alive) {
      deathElapsedRef.current = Math.min(DEATH_ANIMATION_SECONDS, deathElapsedRef.current + delta);
      if (deathElapsedRef.current >= DEATH_ANIMATION_SECONDS && !deathHidden) {
        setDeathHidden(true);
      }
    }

    const elapsed = state.clock.getElapsedTime();
    const speed = Math.hypot(unit.velocity.x, unit.velocity.z);
    const speedRatio = clamp01(speed / Math.max(unit.moveSpeed, 0.001));
    const moving = speed > IDLE_SPEED_THRESHOLD;
    const walkPhase = elapsed * (5 + speed * 1.1) + phaseA;
    const walkSwing = Math.sin(walkPhase);
    const walkLift = Math.abs(Math.sin(walkPhase)) * unit.radius * (0.05 + speedRatio * 0.02);
    const idleBob = moving ? 0 : Math.sin(elapsed * 1.9 + phaseB) * unit.radius * 0.03;
    const attackProgress =
      attackRemainingRef.current > 0
        ? 1 - attackRemainingRef.current / ATTACK_ANIMATION_SECONDS
        : 0;
    const windup = clamp01(attackProgress / 0.35);
    const strike = clamp01((attackProgress - 0.35) / 0.25);
    const recover = clamp01((attackProgress - 0.6) / 0.4);
    const attackSwing = windup * 0.9 - strike * 1.75 + recover * 0.85;
    const attackLunge = windup * 0.06 + strike * 0.12 - recover * 0.14;
    const hitFlash = smooth01(hitFlashRemainingRef.current / HIT_FLASH_SECONDS);
    const deathProgress = unit.alive ? 0 : clamp01(deathElapsedRef.current / DEATH_ANIMATION_SECONDS);
    const deathEase = smooth01(deathProgress);
    const distress = clamp01((0.3 - healthRatio) / 0.3);
    const selectionPulse = selected ? 0.5 + 0.5 * Math.sin(elapsed * 7.2 + phaseC) : 0;
    const weaponReady =
      unit.attackCooldown > 0
        ? clamp01(1 - unit.cooldownRemaining / unit.attackCooldown)
        : 1;

    if (bodyRef.current) {
      bodyRef.current.position.y =
        unit.radius + idleBob + (moving ? walkLift : 0) - unit.radius * 0.84 * deathEase;
      bodyRef.current.position.z =
        unit.radius *
        attackLunge *
        (unit.shape === 'cylinder' ? 0.7 : unit.shape === 'sphere' ? 1.1 : 0.9);
      bodyRef.current.rotation.z = fallDirection * deathEase * Math.PI * 0.58;
      bodyRef.current.rotation.x = deathEase * (unit.shape === 'sphere' ? 0.22 : 0.14);
      bodyRef.current.scale.setScalar(Math.max(0.16, 1 - deathEase * 0.38));
    }

    if (torsoRef.current) {
      const basePitch = unit.shape === 'sphere' ? 0.2 : unit.shape === 'cylinder' ? 0.04 : 0.02;
      const walkPitch = moving
        ? Math.sin(walkPhase + Math.PI / 2) *
          (unit.shape === 'sphere' ? 0.08 : 0.06) *
          speedRatio
        : 0;
      const attackPitch =
        attackSwing * (unit.shape === 'sphere' ? 0.44 : unit.shape === 'cylinder' ? 0.26 : 0.34);
      torsoRef.current.rotation.x = basePitch + walkPitch + attackPitch;
    }

    if (headRef.current) {
      headRef.current.rotation.x =
        -attackSwing * 0.1 + (moving ? -walkSwing * 0.03 * speedRatio : 0);
      headRef.current.rotation.z = Math.sin(elapsed * 1.35 + phaseC) * 0.02;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x =
        -walkSwing * (unit.shape === 'sphere' ? 0.22 : 0.38) * speedRatio +
        (unit.shape === 'cylinder'
          ? -attackSwing * 0.7
          : unit.shape === 'box'
            ? -attackSwing * 0.12
            : attackSwing * 0.14);
      leftArmRef.current.rotation.z =
        unit.shape === 'cylinder' ? -0.5 : unit.shape === 'box' ? -0.18 : 0.18;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x =
        walkSwing * (unit.shape === 'sphere' ? 0.26 : 0.4) * speedRatio +
        attackSwing * (unit.shape === 'sphere' ? 1.1 : unit.shape === 'cylinder' ? 0.82 : 0.96);
      rightArmRef.current.rotation.z =
        unit.shape === 'cylinder' ? 0.54 : unit.shape === 'box' ? 0.22 : -0.22;
    }

    if (weaponRef.current) {
      weaponRef.current.rotation.x =
        (unit.shape === 'cylinder' ? 0.1 : unit.shape === 'sphere' ? 0.16 : 0.22) +
        attackSwing * (unit.shape === 'sphere' ? 1.05 : unit.shape === 'cylinder' ? 0.88 : 1.02);
      weaponRef.current.rotation.z =
        (unit.shape === 'sphere' ? -0.08 : 0.04) + walkSwing * 0.04 * speedRatio;
    }

    if (offhandRef.current) {
      offhandRef.current.rotation.x =
        (unit.shape === 'cylinder' ? -0.24 : 0) +
        attackSwing *
          (unit.shape === 'cylinder' ? -0.5 : unit.shape === 'box' ? -0.14 : 0.08);
      offhandRef.current.rotation.z =
        unit.shape === 'sphere' ? 0.08 : unit.shape === 'box' ? -0.08 : 0.1;
    }

    if (bannerRef.current) {
      bannerRef.current.rotation.z =
        Math.sin(elapsed * (4.2 + speed * 0.4) + phaseB) * (0.08 + speedRatio * 0.08) +
        selectionPulse * 0.05;
      bannerRef.current.rotation.x = Math.sin(elapsed * 2.2 + phaseA) * 0.04;
    }

    if (teamMarkRef.current) {
      teamMarkRef.current.scale.setScalar(1 + selectionPulse * 0.16 + distress * 0.05);
    }

    if (selectionRingRef.current) {
      const scale = unit.radius * (1.8 + selectionPulse * 0.08);
      selectionRingRef.current.scale.set(scale, scale, 1);
      materials.selectionRing.opacity = 0.64 + selectionPulse * 0.22;
    }

    if (rangeRingRef.current) {
      materials.rangeRing.opacity = 0.1 + selectionPulse * 0.08;
    }

    if (showDistressFx) {
      const smokeOpacity = 0.08 + distress * 0.12;
      const sparkOpacity =
        distress * (0.06 + 0.09 * (0.5 + 0.5 * Math.sin(elapsed * 9 + phaseA)));

      materials.smoke.opacity = smokeOpacity;
      materials.spark.opacity = sparkOpacity;

      if (smokeARef.current) {
        smokeARef.current.position.set(
          Math.sin(elapsed * 0.8 + phaseA) * unit.radius * 0.16,
          unit.radius * 0.16 + Math.sin(elapsed * 1.6 + phaseB) * unit.radius * 0.04,
          Math.cos(elapsed * 0.7 + phaseC) * unit.radius * 0.12,
        );
        smokeARef.current.rotation.z = elapsed * 0.34 + phaseA;
        smokeARef.current.scale.setScalar(unit.radius * (0.72 + distress * 0.36));
      }

      if (smokeBRef.current) {
        smokeBRef.current.position.set(
          Math.cos(elapsed * 0.95 + phaseB) * unit.radius * 0.14,
          unit.radius * 0.26 + Math.sin(elapsed * 1.3 + phaseA) * unit.radius * 0.05,
          Math.sin(elapsed * 0.66 + phaseC) * unit.radius * 0.1,
        );
        smokeBRef.current.rotation.z = -elapsed * 0.28 + phaseB;
        smokeBRef.current.scale.setScalar(unit.radius * (0.56 + distress * 0.28));
      }

      if (sparkARef.current) {
        sparkARef.current.position.set(
          Math.sin(elapsed * 3.8 + phaseA) * unit.radius * 0.12,
          unit.radius * 0.1 + Math.abs(Math.sin(elapsed * 6.8 + phaseB)) * unit.radius * 0.12,
          Math.cos(elapsed * 4.1 + phaseC) * unit.radius * 0.08,
        );
        sparkARef.current.rotation.z = elapsed * 2.4;
        sparkARef.current.scale.setScalar(unit.radius * 0.24);
      }

      if (sparkBRef.current) {
        sparkBRef.current.position.set(
          Math.cos(elapsed * 3.2 + phaseB) * unit.radius * 0.1,
          unit.radius * 0.18 + Math.abs(Math.sin(elapsed * 5.3 + phaseC)) * unit.radius * 0.16,
          Math.sin(elapsed * 3.6 + phaseA) * unit.radius * 0.08,
        );
        sparkBRef.current.rotation.z = -elapsed * 2.1;
        sparkBRef.current.scale.setScalar(unit.radius * 0.18);
      }
    } else {
      materials.smoke.opacity = 0;
      materials.spark.opacity = 0;
    }

    const bodySelection = selected ? 0.05 + selectionPulse * 0.1 : 0;
    const accentSelection = selected ? 0.08 + selectionPulse * 0.18 : 0;
    const armorSelection = selected ? 0.06 + selectionPulse * 0.16 : 0;
    const weaponGlow =
      Math.pow(weaponReady, 1.5) * (unit.shape === 'cylinder' ? 0.95 : 1.18);

    if (hitFlash > 0.001) {
      setEmissive(materials.body, HIT_RED, 0.2 + hitFlash * 1.05);
      setEmissive(materials.armor, HIT_RED, 0.18 + hitFlash * 0.92);
      setEmissive(materials.cloth, HIT_RED, 0.14 + hitFlash * 0.66);
      setEmissive(materials.leather, HIT_RED, 0.1 + hitFlash * 0.42);
      setEmissive(materials.trim, HIT_RED, 0.16 + hitFlash * 0.74);
    } else {
      setEmissive(materials.body, selectionColor, bodySelection);
      setEmissive(materials.armor, teamColor, armorSelection);
      setEmissive(materials.cloth, teamColor, selected ? 0.04 + selectionPulse * 0.12 : 0);
      setEmissive(materials.leather, selectionColor, selected ? 0.02 + selectionPulse * 0.06 : 0);
      setEmissive(materials.trim, selectionColor, selected ? 0.03 + selectionPulse * 0.08 : 0);
    }

    setEmissive(materials.team, teamColor, 0.14 + accentSelection + distress * 0.06);
    setEmissive(materials.weapon, teamColor, weaponGlow + accentSelection * 0.5 + hitFlash * 0.18);
  });

  if (!unit.alive && deathHidden && !prevAliveRef.current) {
    return null;
  }

  return (
    <group ref={worldRef} position={[unit.position.x, 0, unit.position.z]}>
      {selected && unit.alive ? (
        <mesh
          ref={selectionRingRef}
          geometry={SELECTION_RING_GEOMETRY}
          material={materials.selectionRing}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.024, 0]}
          scale={[unit.radius * 1.8, unit.radius * 1.8, 1]}
        />
      ) : null}

      {selected && unit.alive && showRanges ? (
        <mesh
          ref={rangeRingRef}
          geometry={RANGE_RING_GEOMETRY}
          material={materials.rangeRing}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.016, 0]}
          scale={[unit.attackRange, unit.attackRange, 1]}
        />
      ) : null}

      <group
        ref={facingRef}
        rotation={[0, unit.facing, 0]}
        onClick={(event) => {
          event.stopPropagation();
          if (unit.alive) {
            onSelect(unit.id);
          }
        }}
      >
        <group ref={bodyRef} position={[0, unit.radius, 0]}>
          {unit.shape === 'box' ? (
            <group ref={torsoRef}>
              <mesh
                castShadow
                receiveShadow
                geometry={BOX_GEOMETRY}
                material={materials.body}
                scale={[unit.radius * 1.55, unit.radius * 1.42, unit.radius * 1.08]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[0, unit.radius * 0.26, unit.radius * 0.44]}
                scale={[unit.radius * 1.2, unit.radius * 0.44, unit.radius * 0.22]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[-unit.radius * 0.92, unit.radius * 0.34, unit.radius * 0.05]}
                scale={[unit.radius * 0.44, unit.radius * 0.48, unit.radius * 0.74]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[unit.radius * 0.92, unit.radius * 0.34, unit.radius * 0.05]}
                scale={[unit.radius * 0.44, unit.radius * 0.48, unit.radius * 0.74]}
              />

              <group ref={headRef} position={[0, unit.radius * 0.94, unit.radius * 0.1]}>
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.armor}
                  scale={[unit.radius * 0.96, unit.radius * 0.56, unit.radius * 0.82]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.trim}
                  position={[0, -unit.radius * 0.08, unit.radius * 0.32]}
                  scale={[unit.radius * 0.78, unit.radius * 0.18, unit.radius * 0.16]}
                />
              </group>

              <group
                ref={leftArmRef}
                position={[-unit.radius * 0.92, unit.radius * 0.18, unit.radius * 0.1]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.armor}
                  position={[0, -unit.radius * 0.35, 0]}
                  scale={[unit.radius * 0.34, unit.radius * 0.96, unit.radius * 0.34]}
                />
                <group
                  ref={offhandRef}
                  position={[-unit.radius * 0.18, -unit.radius * 0.08, unit.radius * 0.58]}
                >
                  <mesh
                    castShadow
                    receiveShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.armor}
                    scale={[unit.radius * 0.96, unit.radius * 1.22, unit.radius * 0.16]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.team}
                    position={[0, unit.radius * 0.18, unit.radius * 0.1]}
                    scale={[unit.radius * 0.48, unit.radius * 0.22, unit.radius * 0.08]}
                  />
                </group>
              </group>

              <group
                ref={rightArmRef}
                position={[unit.radius * 0.94, unit.radius * 0.18, unit.radius * 0.12]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.armor}
                  position={[0, -unit.radius * 0.35, 0]}
                  scale={[unit.radius * 0.34, unit.radius * 0.96, unit.radius * 0.34]}
                />
                <group
                  ref={weaponRef}
                  position={[0, -unit.radius * 0.62, unit.radius * 0.32]}
                  rotation={[0.22, 0, 0]}
                >
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.leather}
                    scale={[unit.radius * 0.14, unit.radius * 0.78, unit.radius * 0.14]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.weapon}
                    position={[0, unit.radius * 0.34, unit.radius * 0.18]}
                    scale={[unit.radius * 0.18, unit.radius * 0.86, unit.radius * 0.2]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.trim}
                    position={[0, unit.radius * 0.02, unit.radius * 0.08]}
                    scale={[unit.radius * 0.46, unit.radius * 0.1, unit.radius * 0.1]}
                  />
                </group>
              </group>

              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[-unit.radius * 0.4, -unit.radius * 1.02, 0]}
                scale={[unit.radius * 0.42, unit.radius * 0.9, unit.radius * 0.44]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[unit.radius * 0.4, -unit.radius * 1.02, 0]}
                scale={[unit.radius * 0.42, unit.radius * 0.9, unit.radius * 0.44]}
              />

              <group ref={bannerRef} position={[unit.radius * 0.18, unit.radius * 0.62, -unit.radius * 0.52]}>
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.trim}
                  position={[0, unit.radius * 0.28, 0]}
                  scale={[unit.radius * 0.06, unit.radius * 0.72, unit.radius * 0.06]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  position={[unit.radius * 0.18, unit.radius * 0.38, 0]}
                  scale={[unit.radius * 0.34, unit.radius * 0.36, unit.radius * 0.08]}
                />
              </group>

              <group
                ref={teamMarkRef}
                position={[unit.radius * 0.48, unit.radius * 0.3, unit.radius * 0.56]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  scale={[unit.radius * 0.24, unit.radius * 0.26, unit.radius * 0.08]}
                />
              </group>
            </group>
          ) : null}

          {unit.shape === 'cylinder' ? (
            <group ref={torsoRef}>
              <mesh
                castShadow
                receiveShadow
                geometry={CYLINDER_GEOMETRY}
                material={materials.cloth}
                scale={[unit.radius * 1.02, unit.radius * 1.7, unit.radius * 1.02]}
              />
              <mesh
                castShadow
                geometry={CONE_GEOMETRY}
                material={materials.cloth}
                position={[0, unit.radius * 0.82, -unit.radius * 0.02]}
                scale={[unit.radius * 1.12, unit.radius * 0.98, unit.radius * 1.12]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.leather}
                position={[0, unit.radius * 0.08, unit.radius * 0.52]}
                scale={[unit.radius * 0.88, unit.radius * 0.18, unit.radius * 0.12]}
              />

              <group ref={headRef} position={[0, unit.radius * 0.68, unit.radius * 0.16]}>
                <mesh
                  castShadow
                  geometry={SPHERE_GEOMETRY}
                  material={materials.body}
                  scale={[unit.radius * 0.54, unit.radius * 0.54, unit.radius * 0.54]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.trim}
                  position={[0, -unit.radius * 0.04, unit.radius * 0.18]}
                  scale={[unit.radius * 0.18, unit.radius * 0.12, unit.radius * 0.08]}
                />
              </group>

              <group
                ref={leftArmRef}
                position={[-unit.radius * 0.7, unit.radius * 0.16, unit.radius * 0.08]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.cloth}
                  position={[0, -unit.radius * 0.38, 0]}
                  scale={[unit.radius * 0.22, unit.radius * 1.02, unit.radius * 0.22]}
                />
                <group
                  ref={offhandRef}
                  position={[-unit.radius * 0.34, unit.radius * 0.02, -unit.radius * 0.48]}
                >
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.leather}
                    scale={[unit.radius * 0.34, unit.radius * 0.92, unit.radius * 0.24]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.team}
                    position={[0, unit.radius * 0.1, unit.radius * 0.18]}
                    scale={[unit.radius * 0.2, unit.radius * 0.24, unit.radius * 0.06]}
                  />
                </group>
              </group>

              <group
                ref={rightArmRef}
                position={[unit.radius * 0.72, unit.radius * 0.16, unit.radius * 0.1]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.cloth}
                  position={[0, -unit.radius * 0.4, 0]}
                  scale={[unit.radius * 0.22, unit.radius * 1.04, unit.radius * 0.22]}
                />
                <group
                  ref={weaponRef}
                  position={[unit.radius * 0.04, -unit.radius * 0.08, unit.radius * 0.42]}
                  rotation={[0.1, 0.06, 0]}
                >
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.leather}
                    scale={[unit.radius * 0.18, unit.radius * 0.18, unit.radius * 1.1]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.weapon}
                    position={[0, unit.radius * 0.1, unit.radius * 0.44]}
                    scale={[unit.radius * 1.08, unit.radius * 0.1, unit.radius * 0.1]}
                  />
                  <mesh
                    castShadow
                    geometry={CONE_GEOMETRY}
                    material={materials.weapon}
                    position={[0, 0, unit.radius * 0.96]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[unit.radius * 0.14, unit.radius * 0.28, unit.radius * 0.14]}
                  />
                </group>
              </group>

              <mesh
                castShadow
                geometry={CYLINDER_GEOMETRY}
                material={materials.leather}
                position={[-unit.radius * 0.24, -unit.radius * 1.02, 0]}
                scale={[unit.radius * 0.28, unit.radius * 1.02, unit.radius * 0.28]}
              />
              <mesh
                castShadow
                geometry={CYLINDER_GEOMETRY}
                material={materials.leather}
                position={[unit.radius * 0.24, -unit.radius * 1.02, 0]}
                scale={[unit.radius * 0.28, unit.radius * 1.02, unit.radius * 0.28]}
              />

              <group ref={bannerRef} position={[-unit.radius * 0.22, unit.radius * 0.54, -unit.radius * 0.56]}>
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.trim}
                  position={[0, unit.radius * 0.22, 0]}
                  scale={[unit.radius * 0.05, unit.radius * 0.56, unit.radius * 0.05]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  position={[unit.radius * 0.15, unit.radius * 0.3, 0]}
                  scale={[unit.radius * 0.3, unit.radius * 0.28, unit.radius * 0.06]}
                />
              </group>

              <group
                ref={teamMarkRef}
                position={[unit.radius * 0.42, unit.radius * 0.38, unit.radius * 0.52]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  scale={[unit.radius * 0.24, unit.radius * 0.24, unit.radius * 0.08]}
                />
              </group>
            </group>
          ) : null}

          {unit.shape === 'sphere' ? (
            <group ref={torsoRef} rotation={[0.18, 0, 0]}>
              <mesh
                castShadow
                receiveShadow
                geometry={SPHERE_GEOMETRY}
                material={materials.body}
                position={[0, -unit.radius * 0.06, unit.radius * 0.06]}
                scale={[unit.radius * 1.7, unit.radius * 1.46, unit.radius * 1.42]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[0, unit.radius * 0.14, unit.radius * 0.54]}
                scale={[unit.radius * 0.9, unit.radius * 0.32, unit.radius * 0.2]}
              />

              <group ref={headRef} position={[0, unit.radius * 0.52, unit.radius * 0.34]}>
                <mesh
                  castShadow
                  geometry={SPHERE_GEOMETRY}
                  material={materials.body}
                  scale={[unit.radius * 0.72, unit.radius * 0.64, unit.radius * 0.68]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.trim}
                  position={[0, -unit.radius * 0.02, unit.radius * 0.22]}
                  scale={[unit.radius * 0.26, unit.radius * 0.12, unit.radius * 0.08]}
                />
              </group>

              <group
                ref={leftArmRef}
                position={[-unit.radius * 1.02, unit.radius * 0.08, unit.radius * 0.18]}
              >
                <mesh
                  castShadow
                  geometry={SPHERE_GEOMETRY}
                  material={materials.body}
                  position={[0, unit.radius * 0.1, 0]}
                  scale={[unit.radius * 0.62, unit.radius * 0.62, unit.radius * 0.62]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.body}
                  position={[0, -unit.radius * 0.48, 0]}
                  scale={[unit.radius * 0.54, unit.radius * 1.08, unit.radius * 0.52]}
                />
                <group ref={offhandRef} position={[0, -unit.radius * 0.82, unit.radius * 0.16]}>
                  <mesh
                    castShadow
                    geometry={SPHERE_GEOMETRY}
                    material={materials.armor}
                    scale={[unit.radius * 0.46, unit.radius * 0.46, unit.radius * 0.46]}
                  />
                </group>
              </group>

              <group
                ref={rightArmRef}
                position={[unit.radius * 1.04, unit.radius * 0.12, unit.radius * 0.24]}
              >
                <mesh
                  castShadow
                  geometry={SPHERE_GEOMETRY}
                  material={materials.body}
                  position={[0, unit.radius * 0.08, 0]}
                  scale={[unit.radius * 0.66, unit.radius * 0.66, unit.radius * 0.66]}
                />
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.body}
                  position={[0, -unit.radius * 0.52, 0]}
                  scale={[unit.radius * 0.58, unit.radius * 1.16, unit.radius * 0.56]}
                />
                <group
                  ref={weaponRef}
                  position={[0, -unit.radius * 0.92, unit.radius * 0.24]}
                  rotation={[0.16, 0, 0]}
                >
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.leather}
                    scale={[unit.radius * 0.18, unit.radius * 1.48, unit.radius * 0.18]}
                  />
                  <mesh
                    castShadow
                    geometry={BOX_GEOMETRY}
                    material={materials.weapon}
                    position={[0, unit.radius * 0.52, unit.radius * 0.08]}
                    scale={[unit.radius * 0.98, unit.radius * 0.52, unit.radius * 0.52]}
                  />
                </group>
              </group>

              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[-unit.radius * 0.34, -unit.radius * 1.02, -unit.radius * 0.06]}
                scale={[unit.radius * 0.42, unit.radius * 0.84, unit.radius * 0.46]}
              />
              <mesh
                castShadow
                geometry={BOX_GEOMETRY}
                material={materials.armor}
                position={[unit.radius * 0.34, -unit.radius * 1.02, -unit.radius * 0.06]}
                scale={[unit.radius * 0.42, unit.radius * 0.84, unit.radius * 0.46]}
              />

              <group ref={bannerRef} position={[-unit.radius * 0.28, unit.radius * 0.44, -unit.radius * 0.48]}>
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  scale={[unit.radius * 0.22, unit.radius * 0.3, unit.radius * 0.06]}
                />
              </group>

              <group
                ref={teamMarkRef}
                position={[-unit.radius * 0.54, unit.radius * 0.34, unit.radius * 0.5]}
              >
                <mesh
                  castShadow
                  geometry={BOX_GEOMETRY}
                  material={materials.team}
                  scale={[unit.radius * 0.28, unit.radius * 0.26, unit.radius * 0.08]}
                />
              </group>
            </group>
          ) : null}
        </group>
      </group>

      {showDistressFx ? (
        <Billboard position={[0, unit.radius * 1.4, 0]} follow>
          <group>
            <mesh ref={smokeARef} geometry={PLANE_GEOMETRY} material={materials.smoke} />
            <mesh ref={smokeBRef} geometry={PLANE_GEOMETRY} material={materials.smoke} />
            <mesh ref={sparkARef} geometry={PLANE_GEOMETRY} material={materials.spark} />
            <mesh ref={sparkBRef} geometry={PLANE_GEOMETRY} material={materials.spark} />
          </group>
        </Billboard>
      ) : null}

      {showHealthBars && unit.alive ? (
        <Billboard position={[0, unit.radius * 2.14, 0]} follow>
          <group>
            <mesh
              geometry={PLANE_GEOMETRY}
              material={materials.healthFrame}
              scale={[barWidth + 0.14, barHeight + 0.08, 1]}
            />
            <mesh
              geometry={PLANE_GEOMETRY}
              material={materials.healthTrack}
              scale={[barWidth, barHeight, 1]}
              position={[0, 0, 0.001]}
            />
            <mesh
              geometry={PLANE_GEOMETRY}
              material={materials.healthFill}
              scale={[barWidth * fillScale, barHeight, 1]}
              position={[-(barWidth * (1 - fillScale)) / 2, 0, 0.002]}
            />
          </group>
        </Billboard>
      ) : null}
    </group>
  );
}
