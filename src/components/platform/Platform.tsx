import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GAME_COLORS } from '../../theme/colors';
import {
  DEFAULT_PLATFORM_MATERIAL_COLOR,
  PLATFORM_FRICTION,
  PLATFORM_RESTITUTION,
} from './consts';
import type { PlatformProps } from './models';

function Platform({
  position,
  size,
  rotation = [0, 0, 0],
  color = DEFAULT_PLATFORM_MATERIAL_COLOR,
  screamer,
  finishTarget,
}: PlatformProps) {
  const [width, height, depth] = size;
  const isStartPlatform = color === GAME_COLORS.startPlatform;
  const isFinishPlatform = color === GAME_COLORS.finishPlatform;
  const platformColor = isStartPlatform
    ? GAME_COLORS.startPlatformBody
    : isFinishPlatform
      ? GAME_COLORS.finishPlatformBody
      : color;
  const topColor = isStartPlatform
    ? GAME_COLORS.startPlatformTop
    : isFinishPlatform
      ? GAME_COLORS.finishPlatformTop
      : GAME_COLORS.platformTop;
  const accentColor = isStartPlatform
    ? GAME_COLORS.startPlatformAccent
    : isFinishPlatform
      ? GAME_COLORS.finishPlatformAccent
      : GAME_COLORS.platformAccent;
  const bevelRadius = Math.max(0.001, Math.min(
    0.045,
    size[0] * 0.08,
    size[1] * 0.08,
    size[2] * 0.08,
  ));
  const inset = Math.min(0.075, size[0] * 0.16, size[2] * 0.16);
  const panelHeight = Math.min(0.018, height * 0.04);
  const panelWidth = Math.max(0.01, width - inset * 2);
  const panelDepth = Math.max(0.01, depth - inset * 2);
  const panelBevelRadius = Math.max(0.001, Math.min(
    bevelRadius * 0.55,
    panelWidth * 0.08,
    panelDepth * 0.08,
  ));
  const bodyGeometry = useMemo(
    () => new RoundedBoxGeometry(
      width,
      height,
      depth,
      3,
      bevelRadius,
    ),
    [bevelRadius, depth, height, width],
  );
  const panelGeometry = useMemo(
    () => new RoundedBoxGeometry(
      panelWidth,
      panelHeight,
      panelDepth,
      2,
      panelBevelRadius,
    ),
    [panelBevelRadius, panelDepth, panelHeight, panelWidth],
  );

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      rotation={rotation}
      userData={finishTarget || screamer ? { finishTarget, screamer } : undefined}
    >
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        friction={PLATFORM_FRICTION}
        restitution={PLATFORM_RESTITUTION}
      />
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={platformColor}
          roughness={0.5}
          metalness={0.24}
          clearcoat={0.18}
          clearcoatRoughness={0.42}
        />
      </mesh>
      <mesh
        geometry={panelGeometry}
        position={[0, height / 2 - panelHeight / 2 + 0.004, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={topColor}
          roughness={0.38}
          metalness={0.2}
          clearcoat={0.26}
          clearcoatRoughness={0.3}
          emissive={accentColor}
          emissiveIntensity={0.025}
        />
      </mesh>
    </RigidBody>
  );
}

export default Platform;