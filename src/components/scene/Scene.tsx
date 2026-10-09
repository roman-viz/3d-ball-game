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

      <hemisphereLight
        args={['#dce6ff', '#20283a', 0.85]}
      />

      <ambientLight intensity={0.55} />

      <directionalLight
        position={[5, 12, 7]}
        intensity={2.4}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.00015}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />

      <pointLight
        position={[-6, 5, -4]}
        intensity={16}
        distance={45}
        color="#8296ff"
      />

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
