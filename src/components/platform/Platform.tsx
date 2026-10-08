import { CuboidCollider, RigidBody } from '@react-three/rapier';
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
  finishTarget,
}: PlatformProps) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      rotation={rotation}
      userData={finishTarget ? { finishTarget } : undefined}
    >
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        friction={PLATFORM_FRICTION}
        restitution={PLATFORM_RESTITUTION}
      />
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export default Platform;