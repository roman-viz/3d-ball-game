import type { RefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';

export type BallProps = {
  ballRef: RefObject<THREE.Mesh | null>;
};

export type BallVisualProps = BallProps & {
  rigidBody: RefObject<RapierRigidBody | null>;
};

export type BallGameState = 'playing' | 'moving-to-finish' | 'finished';

export type RollingMarkTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};
