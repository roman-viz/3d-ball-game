import { useRef } from 'react';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import Ball from '../ball/Ball';
import Camera from '../camera/Camera';
import { Level } from '../level/Level';
import level1 from '../../levels/level1';
import { GAME_COLORS } from '../../theme/colors';
import {
  PHYSICS_GRAVITY,
  PHYSICS_SOLVER_ITERATIONS,
  PHYSICS_TIME_STEP,
} from './consts';

function Scene() {
  const ballRef = useRef<THREE.Mesh>(null);

  return (
    <>
      <color attach="background" args={[GAME_COLORS.background]} />

      <ambientLight intensity={1} />

      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Physics
        gravity={PHYSICS_GRAVITY}
        timeStep={PHYSICS_TIME_STEP}
        numSolverIterations={PHYSICS_SOLVER_ITERATIONS}
      >
        <Level segments={level1} />

        <Ball ballRef={ballRef} />
      </Physics>
      <Camera target={ballRef} />
    </>
  );
}

export default Scene;
