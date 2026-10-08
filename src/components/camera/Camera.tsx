import { useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type CameraProps = {
  target: RefObject<THREE.Mesh | null>;
};

const CAMERA_OFFSET = new THREE.Vector3(4.5, 7, 10);
const LOOK_AHEAD_OFFSET = new THREE.Vector3(0, 0.5, -4);
const FOLLOW_SPEED = 5;

function Camera({ target }: CameraProps) {
  const { camera } = useThree();
  const desiredPosition = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    if (!target.current) return;

    desiredPosition.current.copy(target.current.position).add(CAMERA_OFFSET);
    const desiredLookTarget = target.current.position.clone().add(LOOK_AHEAD_OFFSET);

    if (!initialized.current) {
      camera.position.copy(desiredPosition.current);
      lookTarget.current.copy(desiredLookTarget);
      initialized.current = true;
    } else {
      const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
      camera.position.lerp(desiredPosition.current, smoothing);
      lookTarget.current.lerp(desiredLookTarget, smoothing);
    }

    camera.lookAt(lookTarget.current);
  });

  return null;
}

export default Camera;
