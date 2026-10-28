// tslint:disable
/* eslint-disable */
import React, {useRef, useMemo, useState} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import {getConfig} from './constants';
import {
  StaffMember,
  VolunteerActor,
  ProductionPhase,
  GridTileItem,
  ActiveFlubBug,
  FloatingPointItem,
  TheaterRoomZone,
  ScriptDef,
  HeatmapMode,
  RoomType,
  TileEnvironmentalData,
  FacilityAudit,
  TheaterBrandConfig,
  WallViewMode,
  LabelViewMode,
  PlacedStage,
  PlacedWing,
  DragBoxState,
} from './types';
import {ROOM_DEFINITIONS, ROOM_MIN_DIMENSIONS} from './constants';

// Module-scope temporary vectors to prevent memory churn
const _tempCamTarget = new THREE.Vector3();
const _tempCamPos = new THREE.Vector3();

interface GameSceneProps {
  phase: ProductionPhase;
  phaseProgress?: number;
  script: ScriptDef | null;
  staff: StaffMember[];
  volunteers: VolunteerActor[];
  assignedCastIds: string[];
  gridItems: GridTileItem[];
  activeFlubs: ActiveFlubBug[];
  floatingBubbles: FloatingPointItem[];
  occupancyRate: number; // 0 to 1.0
  isBuildMode: boolean;
  selectedBuildItem: GridTileItem['itemId'] | null;
  cameraOrbit: {rotY: number; zoom: number; panX: number; panZ: number};
  heatmapMode?: HeatmapMode;
  isGhostLightLit?: boolean;
  tileRooms?: Record<string, RoomType>;
  envMatrix?: TileEnvironmentalData[][];
  activeZoningBrush?: RoomType | null;
  brandConfig?: TheaterBrandConfig;
  wallViewMode?: WallViewMode;
  labelViewMode?: LabelViewMode;
  placedStage?: PlacedStage | null;
  placedWings?: PlacedWing[];
  dragBox?: DragBoxState | null;
  onTileClick?: (gridX: number, gridZ: number) => void;
  onZoneTile?: (gridX: number, gridZ: number) => void;
  onDragStart?: (gx: number, gz: number) => void;
  onDragMove?: (gx: number, gz: number) => void;
  onDragEnd?: () => void;
  onSquashFlub?: (flubId: string) => void;
  onSelectActor?: (actor: VolunteerActor) => void;
  onSelectStaff?: (member: StaffMember) => void;
  onSelectRoom?: (room: TheaterRoomZone) => void;
  facilityAudit?: FacilityAudit;
}

/** 3D Animated Director / Staff Character */
function StaffCharacter({
  staff,
  position,
  rotationY = 0,
  activity = 'idle',
  isBuildMode = false,
  onClick,
}: {
  staff: StaffMember;
  position: [number, number, number];
  rotationY?: number;
  activity?: 'directing' | 'managing' | 'crafting' | 'ushering' | 'idle';
  isBuildMode?: boolean;
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);

  const clothesMat = useMemo(() => new THREE.MeshStandardMaterial({color: staff.clothesColor, roughness: 0.5}), [staff.clothesColor]);
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({color: staff.skinColor, roughness: 0.6}), [staff.skinColor]);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({color: staff.pantsColor, roughness: 0.7}), [staff.pantsColor]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 3.0;
    if (activity === 'directing') {
      if (armRef.current) armRef.current.rotation.x = Math.sin(t * 1.6) * 0.6 + 0.4;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    } else if (activity === 'managing') {
      if (armRef.current) armRef.current.rotation.x = 0.8 + Math.sin(t * 2.0) * 0.2;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 1.5)) * 0.05;
    } else if (activity === 'crafting') {
      if (armRef.current) armRef.current.rotation.x = Math.sin(t * 2.8) * 0.8 + 0.5;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      {/* Torso */}
      <mesh position={[0, 0.8, 0]} material={clothesMat} castShadow>
        <boxGeometry args={[0.38, 0.52, 0.26]} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.28, 0]} material={skinMat} castShadow>
        <boxGeometry args={[0.28, 0.3, 0.28]} />
        {/* Beret on Director */}
        {staff.id === 'arthur_director' && (
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 8]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        )}
      </mesh>
      {/* Arm with Tool / Clipboard */}
      <group ref={armRef} position={[0.24, 0.95, 0]}>
        <mesh position={[0, -0.2, 0]} material={clothesMat} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
        </mesh>
        {staff.id === 'arthur_director' && (
          <mesh position={[0, -0.36, 0.12]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.22, 0.3, 0.02]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        )}
        {staff.id === 'milo_tech' && (
          <mesh position={[0, -0.36, 0.12]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.08, 0.28, 0.08]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        )}
      </group>
      {/* Left Arm */}
      <mesh position={[-0.24, 0.8, 0]} material={clothesMat} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.3, 0]} material={pantsMat} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
      </mesh>
      <mesh position={[0.1, 0.3, 0]} material={pantsMat} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
      </mesh>
      {/* Title Badge - Hidden in Build Mode */}
      {!isBuildMode && (
        <Html pointerEvents="none" position={[0, 1.75, 0]} center distanceFactor={14} zIndexRange={[10, 40]}>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded shadow border border-amber-500/50 whitespace-nowrap pointer-events-none">
            {staff.roleTitle.split(' ')[0].toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
}

/** 3D Animated Volunteer Actor */
function VolunteerActorMesh({
  actor,
  position,
  rotationY = 0,
  activity = 'idle',
  isLead = false,
  isBuildMode = false,
  onClick,
}: {
  actor: VolunteerActor;
  position: [number, number, number];
  rotationY?: number;
  activity?: 'acting' | 'singing' | 'dancing' | 'flubbing' | 'idle';
  isLead?: boolean;
  isBuildMode?: boolean;
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({color: actor.skinColor, roughness: 0.6}), [actor.skinColor]);
  const clothesMat = useMemo(() => new THREE.MeshStandardMaterial({color: actor.clothesColor, roughness: 0.5}), [actor.clothesColor]);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({color: actor.pantsColor, roughness: 0.7}), [actor.pantsColor]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 3.2;
    if (activity === 'acting') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t) * 0.7 + 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.cos(t * 0.9) * 0.8 + 0.4;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 1.5)) * 0.06;
    } else if (activity === 'singing') {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = -1.1 + Math.sin(t * 0.6) * 0.15;
        leftArmRef.current.rotation.x = 0.4;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = 1.1 - Math.sin(t * 0.6) * 0.15;
        rightArmRef.current.rotation.x = 0.4;
      }
      if (headRef.current) headRef.current.rotation.x = -0.25 + Math.sin(t * 0.8) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      {/* Torso */}
      <mesh position={[0, 0.8, 0]} material={clothesMat} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.52, 0.26]} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.28, 0]} material={skinMat} castShadow>
        <boxGeometry args={[0.28, 0.3, 0.28]} />
        {isLead && (
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.06, 8]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        )}
      </mesh>
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.24, 0.95, 0]}>
        <mesh position={[0, -0.2, 0]} material={clothesMat} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
        </mesh>
      </group>
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.24, 0.95, 0]}>
        <mesh position={[0, -0.2, 0]} material={clothesMat} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
        </mesh>
      </group>
      {/* Legs */}
      <mesh position={[-0.1, 0.3, 0]} material={pantsMat} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
      </mesh>
      <mesh position={[0.1, 0.3, 0]} material={pantsMat} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
      </mesh>
      {/* Actor Name Badge - Hidden in Build Mode */}
      {!isBuildMode && (
        <Html pointerEvents="none" position={[0, 0.05, 0]} center distanceFactor={18} zIndexRange={[5, 30]}>
          <div className="bg-slate-950/80 text-[9px] font-bold text-slate-200 px-1 py-0.5 rounded border border-slate-700 whitespace-nowrap pointer-events-none">
            {actor.name} {isLead && '★'}
          </div>
        </Html>
      )}
    </group>
  );
}

/** 3D Physical Furniture Renderers placed on the Storefront Grid */
function RenderedFurniture({
  items,
  isGhostLightLit = true,
  wallViewMode = 'FULL',
}: {
  items: GridTileItem[];
  isGhostLightLit?: boolean;
  wallViewMode?: WallViewMode;
}) {
  return (
    <group>
      {items.map((item) => {
        // Grid mapping: gridX (0..15) -> worldX (-7.5 .. 7.5), gridZ (0..23) -> worldZ (-11.5 .. 11.5)
        const wx = (item.x - 7.5) * 0.9;
        const wz = (item.z - 11.5) * 0.9;

        if (item.itemId === 'seat_folding') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.06, 0.45]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.5, 0.2]} castShadow>
                <boxGeometry args={[0.5, 0.45, 0.05]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[-0.22, 0.15, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[0.22, 0.15, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'seat_plush') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.55, 0.12, 0.5]} />
                <meshStandardMaterial color="#991b1b" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.55, 0.22]} castShadow>
                <boxGeometry args={[0.55, 0.5, 0.1]} />
                <meshStandardMaterial color="#991b1b" roughness={0.8} />
              </mesh>
              <mesh position={[-0.26, 0.3, 0]}>
                <boxGeometry args={[0.06, 0.2, 0.4]} />
                <meshStandardMaterial color="#b45309" />
              </mesh>
              <mesh position={[0.26, 0.3, 0]}>
                <boxGeometry args={[0.06, 0.2, 0.4]} />
                <meshStandardMaterial color="#b45309" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'seat_rocker') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.15, 0.55]} />
                <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.62, 0.22]} castShadow>
                <boxGeometry args={[0.6, 0.55, 0.12]} />
                <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
              </mesh>
              <mesh position={[-0.3, 0.35, 0]}>
                <boxGeometry args={[0.08, 0.22, 0.45]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} />
              </mesh>
              <mesh position={[0.3, 0.35, 0]}>
                <boxGeometry args={[0.08, 0.22, 0.45]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'aisle_carpet') {
          return (
            <mesh key={item.id} position={[wx, 0.02, wz]} receiveShadow>
              <boxGeometry args={[0.85, 0.02, 0.85]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.9} />
            </mesh>
          );
        }
        if (item.itemId === 'table_snack') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.2, 0.08, 0.7]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[1.1, 0.5, 0.6]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
              <mesh position={[-0.3, 0.6, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              <mesh position={[0.3, 0.6, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'bar_cocktail') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[1.6, 0.1, 0.8]} />
                <meshStandardMaterial color="#451a03" roughness={0.3} metalness={0.4} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[1.5, 0.6, 0.7]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'water_cooler') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.4, 0.8, 0.4]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 0.95, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.35, 12]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'makeup_vanity') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.8, 0.75, 0.5]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 1.0, -0.2]}>
                <boxGeometry args={[0.7, 0.5, 0.04]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.1} />
              </mesh>
              <pointLight position={[0, 1.0, 0.1]} color="#fef08a" intensity={8} distance={2.5} />
            </group>
          );
        }
        if (item.itemId === 'ghost_light') {
          return (
            <group key={item.id} position={[wx, 0.3, wz]}>
              {/* Rolling brass stand */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.08, 12]} />
                <meshStandardMaterial color="#78350f" metalness={0.6} />
              </mesh>
              {/* Single bulb on top */}
              <mesh position={[0, 1.25, 0]}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshStandardMaterial
                  color={isGhostLightLit ? '#fef08a' : '#52525b'}
                  emissive={isGhostLightLit ? '#f59e0b' : '#000000'}
                  emissiveIntensity={isGhostLightLit ? 2.5 : 0}
                />
              </mesh>
              {isGhostLightLit && (
                <pointLight position={[0, 1.3, 0]} color="#fde047" intensity={18} distance={5} />
              )}
            </group>
          );
        }
        if (item.itemId === 'electric_radiator') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.8, 0.6, 0.25]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.5} />
              </mesh>
              <pointLight position={[0, 0.4, 0.2]} color="#f97316" intensity={5} distance={2} />
            </group>
          );
        }
        if (item.itemId === 'proscenium_arch') {
          return (
            <group key={item.id} position={[wx, 0.3, wz]}>
              <mesh position={[0, 2.8, 0]} castShadow>
                <boxGeometry args={[2.5, 4.8, 0.4]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
            </group>
          );
        }

        // --- ROOM STRUCTURE: WALLS & DOORS ---
        if (item.itemId === 'wall_partition') {
          const wHeight = wallViewMode === 'DOWN' ? 0.06 : wallViewMode === 'CUTAWAY' ? 0.45 : 2.4;
          const wY = wHeight / 2;
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              <mesh position={[0, wY, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.88, wHeight, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
              </mesh>
              {wallViewMode !== 'DOWN' && (
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[0.9, 0.1, 0.18]} />
                  <meshStandardMaterial color="#78350f" roughness={0.5} />
                </mesh>
              )}
            </group>
          );
        }
        if (item.itemId === 'wall_soundproof') {
          const wHeight = wallViewMode === 'DOWN' ? 0.06 : wallViewMode === 'CUTAWAY' ? 0.45 : 2.6;
          const wY = wHeight / 2;
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              <mesh position={[0, wY, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.88, wHeight, 0.22]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
              {wallViewMode === 'FULL' && (
                <>
                  <mesh position={[0, wY, 0.12]}>
                    <boxGeometry args={[0.76, 2.2, 0.04]} />
                    <meshStandardMaterial color="#0284c7" roughness={0.8} />
                  </mesh>
                  <mesh position={[0, wY, -0.12]}>
                    <boxGeometry args={[0.76, 2.2, 0.04]} />
                    <meshStandardMaterial color="#0284c7" roughness={0.8} />
                  </mesh>
                </>
              )}
            </group>
          );
        }
        if (item.itemId === 'door_standard') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Door Frame */}
              <mesh position={[-0.4, 1.2, 0]}>
                <boxGeometry args={[0.08, 2.3, 0.14]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              <mesh position={[0.4, 1.2, 0]}>
                <boxGeometry args={[0.08, 2.3, 0.14]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              <mesh position={[0, 2.3, 0]}>
                <boxGeometry args={[0.88, 0.1, 0.14]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              {/* Slightly ajar wood slab */}
              <mesh position={[0.12, 1.1, 0.18]} rotation={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.68, 2.1, 0.06]} />
                <meshStandardMaterial color="#b45309" roughness={0.4} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'door_acoustic') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Heavy Gasketed Door Frame */}
              <mesh position={[0, 1.25, 0]} castShadow>
                <boxGeometry args={[0.88, 2.4, 0.22]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0.1, 1.15, 0.16]} rotation={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.7, 2.1, 0.1]} />
                <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Sound Lock Yellow/Black Badge */}
              <mesh position={[0.1, 1.4, 0.22]} rotation={[0, 0.4, 0]}>
                <boxGeometry args={[0.2, 0.15, 0.02]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'door_backstage') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Restricted Backstage Door Frame */}
              <mesh position={[0, 1.25, 0]} castShadow>
                <boxGeometry args={[0.88, 2.4, 0.2]} />
                <meshStandardMaterial color="#1e1b4b" metalness={0.6} />
              </mesh>
              <mesh position={[0.1, 1.15, 0.15]} rotation={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.68, 2.1, 0.08]} />
                <meshStandardMaterial color="#78350f" roughness={0.6} />
              </mesh>
              {/* Brass Padlock Emblem */}
              <mesh position={[0.1, 1.4, 0.22]} rotation={[0, 0.35, 0]}>
                <boxGeometry args={[0.22, 0.18, 0.04]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'door_shop_standard') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* 1x1 Shop Door */}
              <mesh position={[0, 1.3, 0]} castShadow>
                <boxGeometry args={[0.9, 2.5, 0.22]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Hazard caution stripe header */}
              <mesh position={[0, 2.45, 0.12]}>
                <boxGeometry args={[0.9, 0.12, 0.02]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'door_shop_double') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* 2x1 Double Load-In Doors */}
              <mesh position={[0, 1.4, 0]} castShadow>
                <boxGeometry args={[1.7, 2.6, 0.25]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
              </mesh>
              {/* Center split seam */}
              <mesh position={[0, 1.4, 0.14]}>
                <boxGeometry args={[0.04, 2.5, 0.02]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              {/* Yellow Caution Lintel */}
              <mesh position={[0, 2.6, 0.14]}>
                <boxGeometry args={[1.7, 0.14, 0.04]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'door_shop_rollup') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* 3x1 Industrial Roll-Up Bay */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[2.6, 2.8, 0.3]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Corrugated horizontal slatted slats */}
              {[-0.8, -0.4, 0, 0.4, 0.8, 1.2].map((sy, idx) => (
                <mesh key={idx} position={[0, 1.4 + sy * 0.9, 0.16]}>
                  <boxGeometry args={[2.4, 0.06, 0.04]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
              ))}
              {/* Hazard Stripe Header */}
              <mesh position={[0, 2.8, 0.16]}>
                <boxGeometry args={[2.6, 0.2, 0.06]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'box_office_counter') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Ticket Counter */}
              <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[1.3, 1.0, 0.7]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
              {/* Brass speak hole grille */}
              <mesh position={[0, 1.2, 0.32]}>
                <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Ticket slot */}
              <mesh position={[0, 0.85, 0.36]}>
                <boxGeometry args={[0.3, 0.04, 0.04]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'vending_machine') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[0.75, 1.7, 0.65]} />
                <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.5} />
              </mesh>
              {/* Illuminated Glass front */}
              <mesh position={[0, 1.1, 0.34]}>
                <boxGeometry args={[0.6, 0.9, 0.04]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.1} emissive="#0284c7" emissiveIntensity={0.6} />
              </mesh>
              {/* Coin slot & return */}
              <mesh position={[0.22, 0.45, 0.34]}>
                <boxGeometry args={[0.1, 0.15, 0.02]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'rolling_garment_rack') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Wheeled base */}
              <mesh position={[0, 0.08, 0]}>
                <boxGeometry args={[1.2, 0.05, 0.4]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
              {/* Silver uprights and top rail */}
              <mesh position={[-0.55, 0.8, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
              </mesh>
              <mesh position={[0.55, 0.8, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
              </mesh>
              <mesh position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
              </mesh>
              {/* Hanging Costumes */}
              {[-0.35, -0.15, 0.05, 0.25].map((hx, idx) => (
                <mesh key={idx} position={[hx, 1.0, 0]}>
                  <boxGeometry args={[0.16, 0.85, 0.22]} />
                  <meshStandardMaterial color={['#f59e0b', '#ec4899', '#3b82f6', '#10b981'][idx]} roughness={0.8} />
                </mesh>
              ))}
            </group>
          );
        }
        if (item.itemId === 'full_length_mirror') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]} rotation={[0.08, 0, 0]}>
              {/* Gilded frame */}
              <mesh position={[0, 0.95, 0]} castShadow>
                <boxGeometry args={[0.7, 1.8, 0.08]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Mirror glass */}
              <mesh position={[0, 0.95, 0.045]}>
                <boxGeometry args={[0.58, 1.65, 0.01]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.05} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'lighted_vanity') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* White vanity desk */}
              <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[1.1, 0.75, 0.6]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.3} />
              </mesh>
              {/* Mirror frame */}
              <mesh position={[0, 1.25, -0.22]}>
                <boxGeometry args={[0.9, 0.8, 0.06]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.1} />
              </mesh>
              {/* Hollywood rim bulbs */}
              {[-0.38, 0, 0.38].map((bx, idx) => (
                <mesh key={idx} position={[bx, 1.62, -0.18]}>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.5} />
                </mesh>
              ))}
              <pointLight position={[0, 1.3, 0]} color="#fef08a" intensity={8} distance={2.5} />
            </group>
          );
        }
        if (item.itemId === 'porcelain_toilet') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Toilet bowl */}
              <mesh position={[0, 0.25, 0.1]} castShadow>
                <cylinderGeometry args={[0.2, 0.16, 0.4, 12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
              {/* Tank */}
              <mesh position={[0, 0.55, -0.15]} castShadow>
                <boxGeometry args={[0.42, 0.45, 0.22]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'restroom_sink') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Wall Basin */}
              <mesh position={[0, 0.65, 0]} castShadow>
                <boxGeometry args={[0.55, 0.2, 0.4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
              {/* Chrome faucet */}
              <mesh position={[0, 0.8, -0.12]}>
                <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          );
        }

        // --- SPECIALIZED ROOM APPARATUS ---
        if (item.itemId === 'quick_change_booth') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* 2x2 Curtained Wing Booth */}
              <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 2.2, 12, 1, true]} />
                <meshStandardMaterial color="#881337" roughness={0.8} side={THREE.DoubleSide} />
              </mesh>
              {/* Hanging clothes rail */}
              <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[0.7, 0.04, 0.04]} />
                <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
              </mesh>
              {/* Hanging Costumes */}
              <mesh position={[-0.15, 1.3, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.15]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
              <mesh position={[0.15, 1.3, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.15]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'scene_shop_saw') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              {/* Carpentry Workbench */}
              <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[1.3, 0.7, 0.8]} />
                <meshStandardMaterial color="#78350f" roughness={0.7} />
              </mesh>
              {/* Steel Table Top */}
              <mesh position={[0, 0.77, 0]} castShadow>
                <boxGeometry args={[1.36, 0.06, 0.84]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Circular Saw Blade */}
              <mesh position={[0.1, 0.86, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Sawdust Pile */}
              <mesh position={[0.4, 0.04, 0.2]}>
                <coneGeometry args={[0.2, 0.08, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.9} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'wardrobe_sewing') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              {/* Sewing Table */}
              <mesh position={[-0.15, 0.38, 0]} castShadow>
                <boxGeometry args={[0.9, 0.7, 0.6]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
              </mesh>
              {/* Sewing Machine */}
              <mesh position={[-0.15, 0.78, 0]}>
                <boxGeometry args={[0.3, 0.18, 0.18]} />
                <meshStandardMaterial color="#0f172a" metalness={0.7} />
              </mesh>
              {/* Dressmaker Mannequin Dummy */}
              <mesh position={[0.35, 0.75, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.22, 0.7, 10]} />
                <meshStandardMaterial color="#fde047" roughness={0.6} />
              </mesh>
              <mesh position={[0.35, 0.25, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'hvac_blower') {
          return (
            <group key={item.id} position={[wx, 1.6, wz]}>
              {/* Wall-Mounted Central A/C Unit */}
              <mesh castShadow>
                <boxGeometry args={[1.1, 0.45, 0.35]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.3} />
              </mesh>
              {/* Vent Grille */}
              <mesh position={[0, -0.1, 0.18]}>
                <boxGeometry args={[0.95, 0.12, 0.02]} />
                <meshStandardMaterial color="#38bdf8" />
              </mesh>
              <pointLight position={[0, -0.2, 0.3]} color="#38bdf8" intensity={2} distance={3} />
            </group>
          );
        }
        if (item.itemId === 'trash_can') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.18, 0.65, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'janitor_closet') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              {/* Yellow Mop Bucket */}
              <mesh position={[-0.15, 0.2, 0]} castShadow>
                <boxGeometry args={[0.38, 0.36, 0.35]} />
                <meshStandardMaterial color="#eab308" roughness={0.4} />
              </mesh>
              {/* Mop Broom handle leaning */}
              <mesh position={[0.1, 0.65, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              {/* Wet Floor Caution Cone */}
              <mesh position={[0.25, 0.22, 0.15]}>
                <coneGeometry args={[0.14, 0.42, 4]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'restroom_stall') {
          return (
            <group key={item.id} position={[wx, 0.1, wz]}>
              {/* Restroom Partition Stall */}
              <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[1.2, 1.8, 1.0]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
              </mesh>
              {/* Porcelain Sink */}
              <mesh position={[0, 0.5, 0.55]}>
                <boxGeometry args={[0.5, 0.2, 0.3]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'chandelier_lobby') {
          return (
            <group key={item.id} position={[wx, 3.2, wz]}>
              {/* Tiered Crystal Chandelier */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.3, 0.6, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.28, 0.12, 0.4, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
              </mesh>
              <pointLight position={[0, -0.3, 0]} color="#fef08a" intensity={14} distance={6} />
            </group>
          );
        }
        if (item.itemId === 'velvet_rope') {
          return (
            <group key={item.id} position={[wx, 0.05, wz]}>
              {/* Brass Stanchion Post */}
              <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.95, 8]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.06, 12]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} />
              </mesh>
              {/* Red Velvet Swag */}
              <mesh position={[0.2, 0.82, 0]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
                <meshStandardMaterial color="#991b1b" roughness={0.8} />
              </mesh>
            </group>
          );
        }
        if (item.itemId === 'framed_playbill') {
          return (
            <group key={item.id} position={[wx, 1.4, wz]}>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.55, 0.8, 0.04]} />
                <meshStandardMaterial color="#b45309" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <boxGeometry args={[0.45, 0.7, 0.01]} />
                <meshStandardMaterial color="#fef08a" roughness={0.3} />
              </mesh>
            </group>
          );
        }

        return null;
      })}
    </group>
  );
}

/** 3D Audience Crowd occupying seats during Box Office Run */
function AudienceCrowd({
  items,
  occupancyRate,
  isRunActive,
}: {
  items: GridTileItem[];
  occupancyRate: number;
  isRunActive: boolean;
}) {
  const seatItems = useMemo(
    () => items.filter((i) => i.itemId.startsWith('seat_')),
    [items]
  );
  const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8'];
  const occupiedCount = isRunActive ? Math.round(seatItems.length * occupancyRate) : 0;

  return (
    <group>
      {seatItems.slice(0, occupiedCount).map((seat, idx) => {
        const wx = (seat.x - 7.5) * 0.9;
        const wz = (seat.z - 11.5) * 0.9;
        const color = colors[idx % colors.length];

        return (
          <group key={`aud_${seat.id}`} position={[wx, 0.45, wz]}>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#fed7aa" />
            </mesh>
            <mesh position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.3, 0.32, 0.22]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Interactive 16x24 Floor Grid for Build Mode, Room Dragging, and Environmental Heatmaps */
function InteractiveBuildGrid({
  isBuildMode,
  heatmapMode = 'NONE',
  gridItems = [],
  tileRooms = {},
  envMatrix = [],
  activeZoningBrush = null,
  selectedBuildItem = null,
  labelViewMode = 'ALL',
  dragBox = null,
  onTileClick,
  onZoneTile,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  isBuildMode: boolean;
  heatmapMode?: HeatmapMode;
  gridItems?: GridTileItem[];
  tileRooms?: Record<string, RoomType>;
  envMatrix?: TileEnvironmentalData[][];
  activeZoningBrush?: RoomType | null;
  selectedBuildItem?: GridTileItem['itemId'] | null;
  labelViewMode?: LabelViewMode;
  dragBox?: DragBoxState | null;
  onTileClick?: (gx: number, gz: number) => void;
  onZoneTile?: (gx: number, gz: number) => void;
  onDragStart?: (gx: number, gz: number) => void;
  onDragMove?: (gx: number, gz: number) => void;
  onDragEnd?: () => void;
}) {
  const [hoveredTile, setHoveredTile] = useState<{x: number; z: number} | null>(null);

  const isVisible = isBuildMode || heatmapMode !== 'NONE' || Boolean(activeZoningBrush) || Boolean(dragBox);
  if (!isVisible) return null;

  return (
    <group position={[0, 0.05, 0]}>
      {Array.from({length: 24}).map((_, gz) =>
        Array.from({length: 16}).map((_, gx) => {
          const wx = (gx - 7.5) * 0.9;
          const wz = (gz - 11.5) * 0.9;
          const isHovered = hoveredTile?.x === gx && hoveredTile?.z === gz;

          const tileKey = `${gx}_${gz}`;
          const roomType = tileRooms[tileKey] || 'UNZONED';
          const roomDef = ROOM_DEFINITIONS[roomType] || ROOM_DEFINITIONS.UNZONED;
          const env = envMatrix[gx]?.[gz];

          let tileColor = gz < 6 ? '#78350f' : gz < 12 ? '#1e3a8a' : '#334155';
          let opacity = isHovered ? 0.9 : 0.35;

          // 1. ZONING LAYER or ACTIVE BRUSH
          if (heatmapMode === 'ZONING' || activeZoningBrush) {
            tileColor = roomDef.color;
            opacity = isHovered ? 0.95 : 0.6;
          }
          // 2. THERMAL HEATMAP LAYER
          else if (heatmapMode === 'THERMAL') {
            const temp = env ? env.temperature : 68;
            if (temp < 60) {
              tileColor = '#1d4ed8'; // Cold Floor (<60°F)
              opacity = 0.75;
            } else if (temp < 65) {
              tileColor = '#0284c7'; // Chilly (60-64°F)
              opacity = 0.65;
            } else if (temp <= 73) {
              tileColor = '#10b981'; // Ideal 68°F Target Comfort
              opacity = 0.7;
            } else if (temp <= 82) {
              tileColor = '#f59e0b'; // Warm Footlights (74-81°F)
              opacity = 0.7;
            } else {
              tileColor = '#dc2626'; // Overheating (>82°F)
              opacity = 0.85;
            }
          }
          // 3. ACOUSTIC DECIBEL HEATMAP LAYER
          else if (heatmapMode === 'ACOUSTIC') {
            const noise = env ? env.noiseDecibels : 32;
            if (noise < 40) {
              tileColor = '#0f766e'; // Quiet (<40 dB)
              opacity = 0.55;
            } else if (noise <= 48) {
              tileColor = '#0284c7'; // Moderate (40-48 dB)
              opacity = 0.6;
            } else if (noise <= 55) {
              tileColor = '#eab308'; // Warning Edge (49-55 dB)
              opacity = 0.7;
            } else {
              tileColor = '#dc2626'; // High Auditory Interference (>55 dB)
              opacity = 0.85;
            }
          }
          // 4. SANITATION & CLEANLINESS HEATMAP LAYER
          else if (heatmapMode === 'SANITATION') {
            const clean = env ? env.cleanliness : 90;
            if (clean >= 85) {
              tileColor = '#059669'; // Spotless Sanitized Floor
              opacity = 0.6;
            } else if (clean >= 65) {
              tileColor = '#d97706'; // Sawdust / Wrapper Clutter
              opacity = 0.7;
            } else {
              tileColor = '#7f1d1d'; // Filthy Floor / Trip Hazard!
              opacity = 0.85;
            }
          }
          // 5. AESTHETIC QUALITY AURA
          else if (heatmapMode === 'AESTHETIC') {
            const aes = env ? env.aesthetic : 15;
            if (aes >= 60) {
              tileColor = '#fbbf24'; // High Opulence / In the Zone
              opacity = 0.8;
            } else if (aes >= 35) {
              tileColor = '#d97706'; // Pleasing Decor Aura
              opacity = 0.65;
            } else {
              tileColor = '#451a03'; // Bland Bare Floor
              opacity = 0.5;
            }
          }

          return (
            <mesh
              key={`grid_${gx}_${gz}`}
              position={[wx, 0, wz]}
              rotation={[-Math.PI / 2, 0, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!dragBox?.isDragging) {
                  setHoveredTile({x: gx, z: gz});
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                if (!dragBox?.isDragging) {
                  setHoveredTile(null);
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (onDragStart) onDragStart(gx, gz);
              }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                if (dragBox && dragBox.isDragging) {
                  if (dragBox.current.gx !== gx || dragBox.current.gz !== gz) {
                    if (onDragMove) onDragMove(gx, gz);
                  }
                } else {
                  setHoveredTile({x: gx, z: gz});
                }
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                if (onDragEnd) onDragEnd();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (activeZoningBrush && onZoneTile) {
                  onZoneTile(gx, gz);
                } else if (onTileClick) {
                  onTileClick(gx, gz);
                }
              }}
            >
              <planeGeometry args={[0.85, 0.85]} />
              <meshBasicMaterial
                color={isHovered ? '#fbbf24' : tileColor}
                transparent
                opacity={opacity}
                wireframe={!isHovered && heatmapMode === 'NONE' && !activeZoningBrush}
              />
            </mesh>
          );
        })
      )}

      {/* Drag-to-Box Room Ghost Preview (Mad Game Tycoon style) */}
      {dragBox && (() => {
        const minX = Math.min(dragBox.start.gx, dragBox.current.gx);
        const maxX = Math.max(dragBox.start.gx, dragBox.current.gx);
        const minZ = Math.min(dragBox.start.gz, dragBox.current.gz);
        const maxZ = Math.max(dragBox.start.gz, dragBox.current.gz);
        const wTiles = maxX - minX + 1;
        const dTiles = maxZ - minZ + 1;
        const minReq = ROOM_MIN_DIMENSIONS[dragBox.roomType] || { minW: 2, minD: 2 };
        const isValid = wTiles >= minReq.minW && dTiles >= minReq.minD;
        const cX = ((minX + maxX) / 2 - 7.5) * 0.9;
        const cZ = ((minZ + maxZ) / 2 - 11.5) * 0.9;
        const bW = wTiles * 0.9;
        const bD = dTiles * 0.9;
        const boxColor = isValid ? '#10b981' : '#ef4444';

        return (
          <group position={[cX, 0, cZ]}>
            {/* 1. Floor plane at Y = 0.05 */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[bW, bD]} />
              <meshStandardMaterial
                color={boxColor}
                transparent
                opacity={0.4}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[bW, bD]} />
              <meshBasicMaterial color={boxColor} wireframe />
            </mesh>

            {/* 2. Two rear wall outlines at height = 1.2m */}
            {/* Rear North wall outline at Z = -bD / 2 */}
            <group position={[0, 0.65, -bD / 2]}>
              <mesh>
                <boxGeometry args={[bW, 1.2, 0.04]} />
                <meshStandardMaterial
                  color={boxColor}
                  transparent
                  opacity={0.35}
                />
              </mesh>
              <mesh>
                <boxGeometry args={[bW + 0.01, 1.21, 0.05]} />
                <meshBasicMaterial color={boxColor} wireframe />
              </mesh>
            </group>

            {/* Rear West wall outline at X = -bW / 2 */}
            <group position={[-bW / 2, 0.65, 0]}>
              <mesh>
                <boxGeometry args={[0.04, 1.2, bD]} />
                <meshStandardMaterial
                  color={boxColor}
                  transparent
                  opacity={0.35}
                />
              </mesh>
              <mesh>
                <boxGeometry args={[0.05, 1.21, bD + 0.01]} />
                <meshBasicMaterial color={boxColor} wireframe />
              </mesh>
            </group>
          </group>
        );
      })()}
    </group>
  );
}

/** Clickable Flub Bug Markers on Stage during Tech Week */
function FlubBugMarkers({
  flubs,
  onSquash,
}: {
  flubs: ActiveFlubBug[];
  onSquash?: (id: string) => void;
}) {
  return (
    <group>
      {flubs.map((flub) => (
        <group
          key={flub.id}
          position={[flub.x, flub.y, flub.z]}
          onClick={(e) => {
            e.stopPropagation();
            if (onSquash) onSquash(flub.id);
          }}
        >
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <octahedronGeometry args={[0.28, 0]} />
            <meshBasicMaterial color="#fbbf24" wireframe />
          </mesh>
          <pointLight position={[0, 0.6, 0]} color="#ef4444" intensity={12} distance={3} />
          <Html pointerEvents="none" position={[0, 1.1, 0]} center distanceFactor={14} zIndexRange={[50, 100]}>
            <div className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] px-2 py-0.5 rounded shadow-xl border-2 border-white cursor-pointer hover:scale-110 transition-transform whitespace-nowrap animate-bounce pointer-events-none">
              💥 SQUASH: {flub.title} (+{flub.acumenReward}💡)
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

/** Floating Tycoon Point Bubbles */
function FloatingPointBubbles({bubbles}: {bubbles: FloatingPointItem[]}) {
  return (
    <group>
      {bubbles.map((b) => (
        <Html pointerEvents="none" key={b.id} position={[b.x, b.y, b.z]} center distanceFactor={14} zIndexRange={[50, 100]}>
          <div
            className="px-2 py-0.5 rounded-full font-black text-xs shadow-lg animate-bounce pointer-events-none border border-white/40 whitespace-nowrap"
            style={{backgroundColor: b.color, color: '#ffffff'}}
          >
            {b.text}
          </div>
        </Html>
      ))}
    </group>
  );
}

/** Unit 12B Storefront Physical Architecture, Stage Archetypes & Walls */
function StorefrontArchitecture({
  phase,
  phaseProgress = 0,
  script,
  isGhostLightLit = true,
  brandConfig,
  wallViewMode = 'FULL',
  labelViewMode = 'ALL',
  placedStage = null,
  placedWings = [],
  onSelectRoom,
}: {
  phase: ProductionPhase;
  phaseProgress?: number;
  script: ScriptDef | null;
  isGhostLightLit?: boolean;
  brandConfig?: TheaterBrandConfig;
  wallViewMode?: WallViewMode;
  labelViewMode?: LabelViewMode;
  placedStage?: PlacedStage | null;
  placedWings?: PlacedWing[];
  onSelectRoom?: (room: TheaterRoomZone) => void;
}) {
  // Checkpoint visual states
  const showScenicFlats = phase !== 'SEASON_IDLE' && phase !== 'PROPOSAL' && (phase !== 'PRE_PROD_ALPHA' || phaseProgress >= 40);
  const showStageLights = phase !== 'SEASON_IDLE' && phase !== 'PROPOSAL' && (phase !== 'PRE_PROD_ALPHA' || phaseProgress >= 80);

  // Sightline Wall Height Calculations
  const extWallH = wallViewMode === 'DOWN' ? 0.06 : wallViewMode === 'CUTAWAY' ? 0.45 : 4.5;
  const extWallY = extWallH / 2;
  const curtainColor = brandConfig?.primaryColor || '#991b1b';
  const theaterName = brandConfig?.theaterName || 'CURTAIN CALL PLAYHOUSE';
  const showLabels = labelViewMode === 'ALL';

  return (
    <group>
      {/* 1. Base Concrete Floor (Unit 12B) */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[18, 0.5, 26]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* 2. Modular Stage Platform (Only rendered when placedStage exists) */}
      {placedStage && (
        <group onClick={(e) => { e.stopPropagation(); onSelectRoom?.('STAGE'); }}>
          {placedStage.tier === 'BLACK_BOX' ? (
            // --- BLACK BOX STUDIO (10x5, flat floor, pipe wash) ---
            <group position={[0, 0.04, -4.0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[9.0, 0.08, 4.5]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
              {/* Overhead basic pipe lighting grid */}
              <mesh position={[0, 3.8, 0]}>
                <boxGeometry args={[8.8, 0.05, 4.2]} />
                <meshStandardMaterial color="#475569" metalness={0.8} wireframe />
              </mesh>
              <pointLight position={[0, 3.5, 0]} color="#fed7aa" intensity={18} distance={8} />
            </group>
          ) : placedStage.tier === 'GRAND_STAGE' ? (
            // --- GRAND OPERA STAGE (20x15, deep proscenium, orchestra pit) ---
            <group position={[0, 0.5, -4.0]}>
              {/* Raised Deck */}
              <mesh receiveShadow castShadow>
                <boxGeometry args={[17.5, 1.0, 11.5]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
              {/* Grand Proscenium Arch */}
              <mesh position={[-8.4, 2.8, 4.8]} castShadow>
                <boxGeometry args={[0.7, 6.2, 0.6]} />
                <meshStandardMaterial color={curtainColor} roughness={0.5} />
              </mesh>
              <mesh position={[8.4, 2.8, 4.8]} castShadow>
                <boxGeometry args={[0.7, 6.2, 0.6]} />
                <meshStandardMaterial color={curtainColor} roughness={0.5} />
              </mesh>
              <mesh position={[0, 5.8, 4.8]} castShadow>
                <boxGeometry args={[17.5, 0.8, 0.6]} />
                <meshStandardMaterial color={curtainColor} roughness={0.5} />
              </mesh>
              {/* Gold Arch Trim */}
              <mesh position={[0, 5.3, 4.9]}>
                <boxGeometry args={[16.5, 0.1, 0.1]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Sunken Orchestra Pit Cavity along downstage front */}
              <group position={[0, -0.4, 6.0]}>
                <mesh position={[0, 0, 0]} receiveShadow>
                  <boxGeometry args={[13.5, 0.7, 1.8]} />
                  <meshStandardMaterial color="#020617" roughness={0.9} />
                </mesh>
                {/* Conductor podium & 4 brass music stands */}
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.8, 0.3, 0.6]} />
                  <meshStandardMaterial color="#78350f" />
                </mesh>
                {[-3.5, -1.5, 1.5, 3.5].map((mx, idx) => (
                  <group key={idx} position={[mx, 0.25, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
                    <meshStandardMaterial color="#eab308" metalness={0.9} />
                    <pointLight position={[0, 0.3, 0]} color="#fef08a" intensity={3} distance={1.2} />
                  </group>
                ))}
              </group>
            </group>
          ) : (
            // --- MAIN PROSCENIUM STAGE (15x10, standard platform, fly loft) ---
            <group position={[0, 0.3, -4.0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[15, 0.6, 6.5]} />
                <meshStandardMaterial color="#78350f" roughness={0.5} />
              </mesh>

              {/* Proscenium Frame & Brand Curtains */}
              <mesh position={[-7.4, 2.5, -0.8]} castShadow>
                <boxGeometry args={[0.5, 5.0, 0.5]} />
                <meshStandardMaterial color={curtainColor} />
              </mesh>
              <mesh position={[7.4, 2.5, -0.8]} castShadow>
                <boxGeometry args={[0.5, 5.0, 0.5]} />
                <meshStandardMaterial color={curtainColor} />
              </mesh>
              <mesh position={[0, 4.8, -0.8]} castShadow>
                <boxGeometry args={[15.3, 0.6, 0.5]} />
                <meshStandardMaterial color={curtainColor} />
              </mesh>
              {/* Gold valance fringe */}
              <mesh position={[0, 4.45, -0.75]}>
                <boxGeometry args={[14.8, 0.08, 0.08]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} />
              </mesh>
            </group>
          )}

          {/* Stage Footlights on edge (illuminated if 80% tech checkpoint reached) */}
          {showStageLights && (
            <group position={[0, 0.65, -0.8]}>
              {[-5, -2.5, 0, 2.5, 5].map((fx, idx) => (
                <pointLight key={idx} position={[fx, 0.1, 0]} color="#fed7aa" intensity={10} distance={3.5} />
              ))}
            </group>
          )}

          {/* Painted Cardboard Flats on Stage Backing (appears at 40% scenic checkpoint) */}
          {showScenicFlats && (
            <mesh position={[0, 2.0, -7.0]} receiveShadow castShadow>
              <boxGeometry args={[14.5, 3.8, 0.1]} />
              <meshStandardMaterial
                color={
                  script?.genre === 'Musical'
                    ? '#0f172a'
                    : script?.genre === 'Drama'
                    ? '#334155'
                    : '#1e1b4b'
                }
                roughness={0.9}
              />
            </mesh>
          )}

          {/* Eerie spirit light when Ghost Light is unlit */}
          {!isGhostLightLit && (
            <pointLight position={[0, 1.5, -4.0]} color="#60a5fa" intensity={4} distance={6} />
          )}
        </group>
      )}

      {/* Stage Wings (Left & Right) - Rendered only if placedWings has entries */}
      {placedWings && placedWings.length > 0 && placedWings.map((wing, idx) => (
        <group key={idx} position={[wing.side === 'STAGE_LEFT' ? -7.0 : 7.0, 0.02, -4.0]}>
          <mesh receiveShadow>
            <boxGeometry args={[wing.width || 2.0, 0.02, 6.0]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.9} />
          </mesh>
          <pointLight position={[0, 0.3, 0]} color="#3b82f6" intensity={4} distance={2.5} />
        </group>
      ))}

      {/* Side Brick Walls with dynamic height */}
      <mesh position={[-8.0, extWallY, 0]} receiveShadow>
        <boxGeometry args={[0.4, extWallH, 25]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[8.0, extWallY, 0]} receiveShadow>
        <boxGeometry args={[0.4, extWallH, 25]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Front Lobby Glass Entry & Marquee (Z: 12.8) anchored flat against exterior wall */}
      <group position={[0, extWallY, 12.8]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[16.4, extWallH, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>
        <Html pointerEvents="none" position={[0, Math.min(extWallH / 2 + 0.8, 3.2), 0.22]} center occlude distanceFactor={14} zIndexRange={[1, 30]}>
          <div
            className="text-amber-300 font-serif font-black px-3 py-1 rounded border-2 text-center tracking-widest uppercase shadow-2xl min-w-[190px] md:min-w-[240px] pointer-events-none transform scale-75 origin-center"
            style={{backgroundColor: '#1c1917', borderColor: curtainColor}}
          >
            <div className="text-[9px] text-amber-200/90 font-sans tracking-normal flex items-center justify-center gap-1.5">
              <span>★</span>
              <span>{brandConfig?.logoId ? `${brandConfig.logoId} PLAYHOUSE` : 'CIVIC THEATER'}</span>
              <span>★</span>
            </div>
            <div className="text-xs md:text-sm font-bold text-yellow-300">
              {theaterName}
            </div>
            {script?.title && (
              <div className="text-[8px] md:text-[9px] text-emerald-400 font-mono tracking-normal pt-0.5">
                NOW SHOWING: {script.title}
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}

/** Controlled Camera Rig */
function CameraRig({
  cameraOrbit,
}: {
  cameraOrbit: {rotY: number; zoom: number; panX: number; panZ: number};
}) {
  const {camera} = useThree();

  useFrame(() => {
    const radius = 22 * cameraOrbit.zoom;
    const height = 16 * cameraOrbit.zoom;
    const angle = cameraOrbit.rotY;

    const targetX = cameraOrbit.panX;
    const targetY = 1.6;
    const targetZ = cameraOrbit.panZ;

    _tempCamPos.set(
      targetX + Math.sin(angle) * radius,
      targetY + height,
      targetZ + Math.cos(angle) * radius
    );
    _tempCamTarget.set(targetX, targetY, targetZ);

    camera.position.lerp(_tempCamPos, 0.08);
    camera.lookAt(_tempCamTarget);
  });

  return null;
}

export default function Game(props: GameSceneProps) {
  const {
    phase,
    phaseProgress = 0,
    script,
    staff,
    volunteers,
    assignedCastIds,
    gridItems,
    activeFlubs,
    floatingBubbles,
    occupancyRate,
    isBuildMode,
    selectedBuildItem,
    cameraOrbit,
    heatmapMode = 'NONE',
    isGhostLightLit = true,
    tileRooms,
    envMatrix,
    activeZoningBrush,
    brandConfig,
    wallViewMode = 'FULL',
    labelViewMode = 'ALL',
    placedStage = null,
    placedWings = [],
    dragBox = null,
    onTileClick,
    onZoneTile,
    onDragStart,
    onDragMove,
    onDragEnd,
    onSquashFlub,
    onSelectActor,
    onSelectStaff,
    onSelectRoom,
    facilityAudit,
  } = props;

  const assignedCast = volunteers.filter((v) => assignedCastIds.includes(v.id));

  return (
    <>
      <CameraRig cameraOrbit={cameraOrbit} />

      {/* Lighting Rig */}
      <hemisphereLight
        args={[
          getConfig('hemiSkyColor'),
          getConfig('hemiGroundColor'),
          getConfig('hemiIntensity'),
        ]}
      />
      <directionalLight
        position={[10, 16, 12]}
        intensity={getConfig('sunIntensity')}
        color={getConfig('sunColor')}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <spotLight
        position={[0, 8.5, 0]}
        target-position={[0, 0.5, -4.0]}
        intensity={phase === 'BOX_OFFICE_RUN' ? 60 : 35}
        angle={0.7}
        penumbra={0.6}
        color="#fed7aa"
        castShadow
      />

      {/* Unit 12B Storefront Shell */}
      <StorefrontArchitecture
        phase={phase}
        phaseProgress={phaseProgress}
        script={script}
        isGhostLightLit={isGhostLightLit}
        brandConfig={brandConfig}
        wallViewMode={wallViewMode}
        labelViewMode={labelViewMode}
        placedStage={placedStage}
        placedWings={placedWings}
        onSelectRoom={onSelectRoom}
      />

      {/* Placed Furniture on Grid */}
      <RenderedFurniture
        items={gridItems}
        isGhostLightLit={isGhostLightLit}
        wallViewMode={wallViewMode}
      />

      {/* Interactive Floor Grid in Build Mode, Zoning, or Heatmap mode */}
      <InteractiveBuildGrid
        isBuildMode={isBuildMode}
        heatmapMode={heatmapMode}
        gridItems={gridItems}
        tileRooms={tileRooms}
        envMatrix={envMatrix}
        activeZoningBrush={activeZoningBrush}
        selectedBuildItem={selectedBuildItem}
        labelViewMode={labelViewMode}
        dragBox={dragBox}
        onTileClick={onTileClick}
        onZoneTile={onZoneTile}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />

      {/* Technical Paid Staff Characters */}
      {staff.map((member) => {
        const posX = member.id === 'arthur_director' ? 0 : member.id === 'jasmine_sm' ? -5.5 : member.id === 'milo_tech' ? -4.0 : 4.5;
        const posZ = member.id === 'arthur_director' ? -0.5 : member.id === 'jasmine_sm' ? -4.0 : member.id === 'milo_tech' ? -9.5 : 10.5;
        const activity = member.id === 'arthur_director' ? 'directing' : member.id === 'jasmine_sm' ? 'managing' : member.id === 'milo_tech' ? 'crafting' : 'ushering';
        return (
          <StaffCharacter
            key={member.id}
            staff={member}
            position={[posX, 0.4, posZ]}
            rotationY={member.id === 'arthur_director' ? Math.PI : 0}
            activity={activity}
            isBuildMode={isBuildMode}
            onClick={() => onSelectStaff && onSelectStaff(member)}
          />
        );
      })}

      {/* Volunteer Cast Characters on Stage / Green Room */}
      {assignedCast.map((actor, idx) => {
        const posX = (idx - assignedCast.length / 2 + 0.5) * 2.4;
        const posZ = -4.0;
        const isLead = actor.assignedRole === 'Lead 1';
        return (
          <VolunteerActorMesh
            key={actor.id}
            actor={actor}
            position={[posX, 0.6, posZ]}
            rotationY={phase === 'BOX_OFFICE_RUN' ? 0 : idx % 2 === 0 ? Math.PI / 4 : -Math.PI / 4}
            activity={phase === 'BOX_OFFICE_RUN' ? (isLead ? 'singing' : 'acting') : 'acting'}
            isLead={isLead}
            isBuildMode={isBuildMode}
            onClick={() => onSelectActor && onSelectActor(actor)}
          />
        );
      })}

      {/* Audience Occupying Seats during Show Run */}
      <AudienceCrowd
        items={gridItems}
        occupancyRate={occupancyRate}
        isRunActive={phase === 'BOX_OFFICE_RUN'}
      />

      {/* Clickable Flub Bug Markers during Tech Week */}
      <FlubBugMarkers flubs={activeFlubs} onSquash={onSquashFlub} />

      {/* Floating Resource Point Bubbles */}
      <FloatingPointBubbles bubbles={floatingBubbles} />
    </>
  );
}
