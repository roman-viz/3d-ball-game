import { useRef } from 'react';
import * as THREE from 'three';
import Ball from '../ball/Ball';
import Camera from '../camera/Camera';
import { Level } from '../level/Level';
import level1 from '../../levels/level1';
import { GAME_COLORS } from '../../theme/colors';

function Scene() {
  const ballRef = useRef<THREE.Mesh>(null);

  return (
    <>
      <color attach="background" args={[GAME_COLORS.background]} />

      <ambientLight intensity={1} />

      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Level segments={level1} />

      <Ball ballRef={ballRef} />
      <Camera target={ballRef} />
    </>
  );
}

export default Scene;
