import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BallCollider,
  RigidBody,
  useRapier,
  type CollisionEnterPayload,
  type RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { GAME_COLORS } from '../../theme/colors';
import { BALL_START_POSITION } from '../level/consts';
import {
  BALL_ANGULAR_DAMPING,
  BALL_FRICTION,
  BALL_GROUND_CHECK_DISTANCE,
  BALL_INPUT_ACCELERATION,
  BALL_LINEAR_DAMPING,
  BALL_RADIUS,
  BALL_RESTITUTION,
  BALL_SPHERE_SEGMENTS,
  FINISH_MOVE_DURATION,
  ROLLING_MARK_ANGULAR_RADIUS,
  ROLLING_MARK_RADIAL_RINGS,
  ROLLING_MARK_RADIAL_SEGMENTS,
  ROLLING_MARKINGS,
} from './consts';
import type { BallGameState, BallProps, BallVisualProps } from './models';

function createRollingMarkGeometry() {
  const positions = [0, 0, 0];
  const normals = [0, 1, 0];
  const indices: number[] = [];

  for (let ring = 1; ring <= ROLLING_MARK_RADIAL_RINGS; ring += 1) {
    const angle = ROLLING_MARK_ANGULAR_RADIUS * ring / ROLLING_MARK_RADIAL_RINGS;

    for (
      let segment = 0;
      segment < ROLLING_MARK_RADIAL_SEGMENTS;
      segment += 1
    ) {
      const around = 2 * Math.PI * segment / ROLLING_MARK_RADIAL_SEGMENTS;
      const x = BALL_RADIUS * Math.sin(angle) * Math.cos(around);
      const y = BALL_RADIUS * (Math.cos(angle) - 1);
      const z = BALL_RADIUS * Math.sin(angle) * Math.sin(around);
      const normal = new THREE.Vector3(x, y + BALL_RADIUS, z).normalize();

      positions.push(x, y, z);
      normals.push(normal.x, normal.y, normal.z);
    }
  }

  for (
    let segment = 0;
    segment < ROLLING_MARK_RADIAL_SEGMENTS;
    segment += 1
  ) {
    const nextSegment = (segment + 1) % ROLLING_MARK_RADIAL_SEGMENTS;
    indices.push(0, 1 + nextSegment, 1 + segment);
  }

  for (let ring = 1; ring < ROLLING_MARK_RADIAL_RINGS; ring += 1) {
    const innerRingStart = 1 + (ring - 1) * ROLLING_MARK_RADIAL_SEGMENTS;
    const outerRingStart = innerRingStart + ROLLING_MARK_RADIAL_SEGMENTS;

    for (
      let segment = 0;
      segment < ROLLING_MARK_RADIAL_SEGMENTS;
      segment += 1
    ) {
      const nextSegment = (segment + 1) % ROLLING_MARK_RADIAL_SEGMENTS;
      const inner = innerRingStart + segment;
      const innerNext = innerRingStart + nextSegment;
      const outer = outerRingStart + segment;
      const outerNext = outerRingStart + nextSegment;

      indices.push(inner, outerNext, outer, inner, innerNext, outerNext);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals, 3),
  );
  geometry.setIndex(indices);
  return geometry;
}

function BallVisual({ ballRef, rigidBody }: BallVisualProps) {
  const { world, rapier } = useRapier();
  const rollingMarkGeometry = useMemo(() => createRollingMarkGeometry(), []);
  const previousPosition = useRef(new THREE.Vector3());
  const displacement = useRef(new THREE.Vector3());
  const surfaceNormal = useRef(new THREE.Vector3(0, 1, 0));
  const rollAxis = useRef(new THREE.Vector3());
  const rollingRotation = useRef(new THREE.Quaternion());
  const rollingOrientation = useRef(new THREE.Quaternion());
  const parentRotation = useRef(new THREE.Quaternion());
  const worldPosition = useRef(new THREE.Vector3());
  const hasPreviousPosition = useRef(false);
  const airSpinSpeed = useRef(0);
  const airSpinAxis = useRef(new THREE.Vector3(1, 0, 0));
  const ray = useRef<InstanceType<typeof rapier.Ray> | null>(null);

  if (ray.current === null) {
    ray.current = new rapier.Ray(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
    );
  }

  useFrame((_, delta) => {
    const body = rigidBody.current;
    const visualBall = ballRef.current;
    const object = visualBall?.parent;
    if (!body || !visualBall || !object) return;

    object.getWorldPosition(worldPosition.current);
    object.getWorldQuaternion(parentRotation.current);
    visualBall.quaternion
      .copy(parentRotation.current)
      .invert()
      .multiply(rollingOrientation.current);

    if (!hasPreviousPosition.current) {
      previousPosition.current.copy(worldPosition.current);
      hasPreviousPosition.current = true;
      return;
    }

    displacement.current
      .copy(worldPosition.current)
      .sub(previousPosition.current);
    previousPosition.current.copy(worldPosition.current);

    const castRay = ray.current;
    if (!castRay) return;
    castRay.origin.x = worldPosition.current.x;
    castRay.origin.y = worldPosition.current.y;
    castRay.origin.z = worldPosition.current.z;
    const surface = world.castRayAndGetNormal(
      castRay,
      BALL_RADIUS + BALL_GROUND_CHECK_DISTANCE,
      true,
      undefined,
      undefined,
      undefined,
      body,
    );
    const isOnSurface = surface !== null && surface.normal.y > 0.1;

    if (isOnSurface && surface) {
      surfaceNormal.current.set(
        surface.normal.x,
        surface.normal.y,
        surface.normal.z,
      );
    }

    const distance = displacement.current.length();
    if (distance > 0 && isOnSurface) {
      rollAxis.current
        .crossVectors(surfaceNormal.current, displacement.current)
        .normalize();

      if (rollAxis.current.lengthSq() > 0) {
        const rollAngle = distance / BALL_RADIUS;
        rollingRotation.current.setFromAxisAngle(rollAxis.current, rollAngle);
        rollingOrientation.current.premultiply(rollingRotation.current);
        airSpinAxis.current.copy(rollAxis.current);
        airSpinSpeed.current = delta > 0 ? rollAngle / delta : 0;
      }
    } else if (!isOnSurface && airSpinSpeed.current > 0 && delta > 0) {
      rollingRotation.current.setFromAxisAngle(
        airSpinAxis.current,
        airSpinSpeed.current * delta,
      );
      rollingOrientation.current.premultiply(rollingRotation.current);
    } else if (isOnSurface) {
      airSpinSpeed.current = 0;
    }

    visualBall.quaternion
      .copy(parentRotation.current)
      .invert()
      .multiply(rollingOrientation.current);
  });

  return (
    <mesh ref={ballRef}>
      <sphereGeometry
        args={[BALL_RADIUS, BALL_SPHERE_SEGMENTS, BALL_SPHERE_SEGMENTS]}
      />
      <meshStandardMaterial color={GAME_COLORS.ball} />
      {ROLLING_MARKINGS.map(({ position, rotation }, index) => (
        <mesh
          key={index}
          geometry={rollingMarkGeometry}
          position={position}
          rotation={rotation}
        >
          <meshStandardMaterial color="#f2c14e" />
        </mesh>
      ))}
    </mesh>
  );
}

function Ball({ ballRef }: BallProps) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const gameState = useRef<BallGameState>('playing');
  const finishStart = useRef(new THREE.Vector3());
  const finishTarget = useRef(new THREE.Vector3());
  const finishElapsed = useRef(0);
  const finishPosition = useRef(new THREE.Vector3());
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.current !== 'playing') return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (event.code.startsWith('Arrow')) event.preventDefault();
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (event.code.startsWith('Arrow')) event.preventDefault();
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          if (event.code.startsWith('Arrow')) event.preventDefault();
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          if (event.code.startsWith('Arrow')) event.preventDefault();
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const clearKeys = () => {
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
    };

    window.addEventListener('blur', clearKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, []);

  const handleCollisionEnter = (event: CollisionEnterPayload) => {
    const body = rigidBody.current;
    const target = event.other.rigidBodyObject?.userData.finishTarget;
    if (
      gameState.current !== 'playing'
      || !body
      || !Array.isArray(target)
      || target.length !== 3
      || !target.every((coordinate) => typeof coordinate === 'number')
    ) {
      return;
    }

    const position = body.translation();
    finishStart.current.set(position.x, position.y, position.z);
    finishTarget.current.set(target[0], target[1], target[2]);
    finishElapsed.current = 0;
    gameState.current = 'moving-to-finish';
    keys.current.forward = false;
    keys.current.backward = false;
    keys.current.left = false;
    keys.current.right = false;
    body.setGravityScale(0, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  useFrame((_, delta) => {
    const body = rigidBody.current;
    if (!body) return;

    if (gameState.current === 'moving-to-finish') {
      finishElapsed.current = Math.min(
        finishElapsed.current + delta,
        FINISH_MOVE_DURATION,
      );
      const progress = finishElapsed.current / FINISH_MOVE_DURATION;
      const easedProgress = progress * progress * (3 - 2 * progress);
      finishPosition.current
        .copy(finishStart.current)
        .lerp(finishTarget.current, easedProgress);
      body.setTranslation(
        {
          x: finishPosition.current.x,
          y: finishPosition.current.y,
          z: finishPosition.current.z,
        },
        true,
      );
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);

      if (progress >= 1) {
        gameState.current = 'finished';
      }
      return;
    }

    if (gameState.current === 'finished') return;

    let inputX = Number(keys.current.right) - Number(keys.current.left);
    let inputZ = Number(keys.current.backward) - Number(keys.current.forward);
    const inputLength = Math.hypot(inputX, inputZ);

    if (inputLength > 0) {
      inputX /= inputLength;
      inputZ /= inputLength;
      body.applyImpulse(
        {
          x: inputX * BALL_INPUT_ACCELERATION * delta,
          y: 0,
          z: inputZ * BALL_INPUT_ACCELERATION * delta,
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={rigidBody}
      type="dynamic"
      position={BALL_START_POSITION}
      linearDamping={BALL_LINEAR_DAMPING}
      angularDamping={BALL_ANGULAR_DAMPING}
      ccd
      canSleep={false}
      colliders={false}
      onCollisionEnter={handleCollisionEnter}
    >
      <BallCollider
        args={[BALL_RADIUS]}
        friction={BALL_FRICTION}
        restitution={BALL_RESTITUTION}
      />
      <BallVisual ballRef={ballRef} rigidBody={rigidBody} />
    </RigidBody>
  );
}

export default Ball;
