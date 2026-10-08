import type { RefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import type * as THREE from 'three';
import type { GameState } from '../../game/models';

export type BallProps = {
  ballRef: RefObject<THREE.Mesh | null>;
  gameState: GameState;
  startPosition: [number, number, number];
  fallThreshold: number;
  resetKey: number;
  onFall: () => void;
  onFinish: () => void;
};

export type BallVisualProps = Pick<BallProps, 'ballRef' | 'resetKey'> & {
  rigidBody: RefObject<RapierRigidBody | null>;
};

export type RollingMarkTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};
