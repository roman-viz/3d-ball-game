import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BallCollider,
  RigidBody,
  useRapier,
  type CollisionEnterPayload,
  type RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { GameState, MovementKeyCode } from '../../game/models';
import { GAME_COLORS } from '../../theme/colors';
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
import type { BallProps, BallVisualProps } from './models';

const ARROW_KEY_CODES: ReadonlySet<string> = new Set([
  MovementKeyCode.ArrowUp,
  MovementKeyCode.ArrowDown,
  MovementKeyCode.ArrowLeft,
  MovementKeyCode.ArrowRight,
]);

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

function BallVisual({ ballRef, rigidBody, resetKey }: BallVisualProps) {
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

  useLayoutEffect(() => {
    rollingOrientation.current.identity();
    hasPreviousPosition.current = false;
    airSpinSpeed.current = 0;
  }, [resetKey]);

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

function Ball({
  ballRef,
  gameState,
  startPosition,
  fallThreshold,
  resetKey,
  joystickInput,
  onFall,
  onFinish,
  onScreamer,
}: BallProps) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const gameStateRef = useRef(gameState);
  const appliedResetKey = useRef(resetKey);
  const fallPending = useRef(false);
  const finishTriggered = useRef(false);
  const finishReported = useRef(false);
  const finishElapsed = useRef(0);
  const finishStart = useRef(new THREE.Vector3());
  const finishTarget = useRef(new THREE.Vector3());
  const finishPosition = useRef(new THREE.Vector3());
  const joystickMovement = useRef({ x: 0, z: 0 });
  const screamerTriggered = useRef(false);
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useLayoutEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useLayoutEffect(() => {
    if (appliedResetKey.current === resetKey) return;
    appliedResetKey.current = resetKey;

    const body = rigidBody.current;
    if (!body) return;

    fallPending.current = false;
    finishTriggered.current = false;
    finishReported.current = false;
    finishElapsed.current = 0;
    screamerTriggered.current = false;
    joystickMovement.current.x = 0;
    joystickMovement.current.z = 0;
    keys.current.forward = false;
    keys.current.backward = false;
    keys.current.left = false;
    keys.current.right = false;
    body.setTranslation(
      { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
      true,
    );
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    body.setGravityScale(1, true);
    body.wakeUp();
  }, [resetKey, startPosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        gameStateRef.current !== GameState.Playing
        || fallPending.current
        || finishTriggered.current
      ) return;

      switch (event.code) {
        case MovementKeyCode.Forward:
        case MovementKeyCode.ArrowUp:
          if (ARROW_KEY_CODES.has(event.code)) event.preventDefault();
          keys.current.forward = true;
          break;
        case MovementKeyCode.Backward:
        case MovementKeyCode.ArrowDown:
          if (ARROW_KEY_CODES.has(event.code)) event.preventDefault();
          keys.current.backward = true;
          break;
        case MovementKeyCode.Left:
        case MovementKeyCode.ArrowLeft:
          if (ARROW_KEY_CODES.has(event.code)) event.preventDefault();
          keys.current.left = true;
          break;
        case MovementKeyCode.Right:
        case MovementKeyCode.ArrowRight:
          if (ARROW_KEY_CODES.has(event.code)) event.preventDefault();
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case MovementKeyCode.Forward:
        case MovementKeyCode.ArrowUp:
          keys.current.forward = false;
          break;
        case MovementKeyCode.Backward:
        case MovementKeyCode.ArrowDown:
          keys.current.backward = false;
          break;
        case MovementKeyCode.Left:
        case MovementKeyCode.ArrowLeft:
          keys.current.left = false;
          break;
        case MovementKeyCode.Right:
        case MovementKeyCode.ArrowRight:
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

  useEffect(() => {
    if (gameState !== GameState.Playing) {
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
      joystickMovement.current.x = 0;
      joystickMovement.current.z = 0;
    }
  }, [gameState]);

  const handleCollisionEnter = (event: CollisionEnterPayload) => {
    const otherUserData = event.other.rigidBodyObject?.userData;
    const target = otherUserData?.finishTarget;
    if (
      gameStateRef.current === GameState.Playing
      && !screamerTriggered.current
      && otherUserData?.screamer === true
    ) {
      const body = rigidBody.current;
      if (!body) return;

      screamerTriggered.current = true;
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
      body.setGravityScale(0, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      onScreamer();
      return;
    }

    if (
      gameStateRef.current !== GameState.Playing
      || fallPending.current
      || finishTriggered.current
      || !Array.isArray(target)
      || target.length !== 3
      || !target.every((coordinate) => typeof coordinate === 'number')
    ) {
      return;
    }

    const body = rigidBody.current;
    if (!body) return;

    finishTriggered.current = true;
    finishReported.current = false;
    const position = body.translation();
    finishStart.current.set(position.x, position.y, position.z);
    finishTarget.current.set(target[0], target[1], target[2]);
    finishElapsed.current = 0;
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
    if (!body || gameStateRef.current !== GameState.Playing) return;

    if (finishTriggered.current) {
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

      if (progress >= 1 && !finishReported.current) {
        finishReported.current = true;
        onFinish();
      }
      return;
    }

    if (!fallPending.current && body.translation().y < fallThreshold) {
      fallPending.current = true;
      keys.current.forward = false;
      keys.current.backward = false;
      keys.current.left = false;
      keys.current.right = false;
      onFall();
      return;
    }

    if (fallPending.current) return;

    let keyboardX = Number(keys.current.right) - Number(keys.current.left);
    let keyboardZ = Number(keys.current.backward) - Number(keys.current.forward);
    const keyboardLength = Math.hypot(keyboardX, keyboardZ);
    if (keyboardLength > 0) {
      keyboardX /= keyboardLength;
      keyboardZ /= keyboardLength;
    }

    const smoothing = 1 - Math.exp(-18 * delta);
    joystickMovement.current.x += (
      joystickInput.current.x - joystickMovement.current.x
    ) * smoothing;
    joystickMovement.current.z += (
      joystickInput.current.z - joystickMovement.current.z
    ) * smoothing;

    let inputX = keyboardX + joystickMovement.current.x;
    let inputZ = keyboardZ + joystickMovement.current.z;
    const inputLength = Math.hypot(inputX, inputZ);
    if (inputLength > 1) {
      inputX /= inputLength;
      inputZ /= inputLength;
    }

    if (inputLength > 0.001) {
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
      position={startPosition}
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
      <BallVisual
        ballRef={ballRef}
        rigidBody={rigidBody}
        resetKey={resetKey}
      />
    </RigidBody>
  );
}

export default Ball;
