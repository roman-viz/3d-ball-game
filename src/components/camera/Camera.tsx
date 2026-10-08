import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CAMERA_FOLLOW_SPEED,
  CAMERA_OFFSET,
} from './consts';
import type { CameraProps } from './models';

function Camera({ target }: CameraProps) {
  const { camera } = useThree();
  const desiredPosition = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const targetPosition = useRef(new THREE.Vector3());
  const desiredLookTarget = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    if (!target.current) return;

    target.current.getWorldPosition(targetPosition.current);
    desiredPosition.current.copy(targetPosition.current).add(CAMERA_OFFSET);
    desiredLookTarget.current.copy(targetPosition.current);

    if (!initialized.current) {
      camera.position.copy(desiredPosition.current);
      lookTarget.current.copy(desiredLookTarget.current);
      initialized.current = true;
    } else {
      const smoothing = 1 - Math.exp(-CAMERA_FOLLOW_SPEED * delta);
      camera.position.lerp(desiredPosition.current, smoothing);
      lookTarget.current.lerp(desiredLookTarget.current, smoothing);
    }

    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default Camera;
