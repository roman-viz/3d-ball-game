import type { RefObject } from 'react';
import type * as THREE from 'three';

export type CameraProps = {
  target: RefObject<THREE.Mesh | null>;
  resetKey: number;
};
