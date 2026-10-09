import { useRef } from 'react';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import Ball from '../ball/Ball';
import Camera from '../camera/Camera';
import { Level } from '../level/Level';
import { GAME_COLORS } from '../../theme/colors';
import { GameState } from '../../game/models';
import type { SceneProps } from './models';
import {
  PHYSICS_GRAVITY,
  PHYSICS_SOLVER_ITERATIONS,
  PHYSICS_TIME_STEP,
} from './consts';

function Scene({
  segments,
  levelIndex,
  gameState,
  startPosition,
  fallThreshold,
  resetKey,
  joystickInput,
  onFall,
  onFinish,
  onScreamer,
}: SceneProps) {
  const ballRef = useRef<THREE.Mesh>(null);

  return (
    <>
      <color attach="background" args={[GAME_COLORS.background]} />

      <ambientLight intensity={1} />

      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Physics
        paused={gameState !== GameState.Playing}
        gravity={PHYSICS_GRAVITY}
        timeStep={PHYSICS_TIME_STEP}
        numSolverIterations={PHYSICS_SOLVER_ITERATIONS}
      >
        <Level key={levelIndex} segments={segments} />

        <Ball
          ballRef={ballRef}
          gameState={gameState}
          startPosition={startPosition}
          fallThreshold={fallThreshold}
          resetKey={resetKey}
          joystickInput={joystickInput}
          onFall={onFall}
          onFinish={onFinish}
          onScreamer={onScreamer}
        />
      </Physics>
      <Camera target={ballRef} resetKey={resetKey} />
    </>
  );
}

export default Scene;
