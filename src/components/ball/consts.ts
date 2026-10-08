import type { RollingMarkTransform } from './models';

export const BALL_RADIUS = 0.5;
export const BALL_INPUT_ACCELERATION = 16;
export const BALL_LINEAR_DAMPING = 0.2;
export const BALL_ANGULAR_DAMPING = 0.1;
export const BALL_FRICTION = 0.8;
export const BALL_RESTITUTION = 0.03;
export const BALL_GROUND_CHECK_DISTANCE = 0.08;
export const BALL_SPHERE_SEGMENTS = 32;
export const FINISH_MOVE_DURATION = 0.8;
export const ROLLING_MARK_ANGULAR_RADIUS = 0.15;
export const ROLLING_MARK_RADIAL_SEGMENTS = 16;
export const ROLLING_MARK_RADIAL_RINGS = 4;

export const ROLLING_MARKINGS: RollingMarkTransform[] = [
  { position: [0, BALL_RADIUS, 0], rotation: [0, 0, 0] },
  { position: [0, -BALL_RADIUS, 0], rotation: [Math.PI, 0, 0] },
  { position: [BALL_RADIUS, 0, 0], rotation: [0, 0, -Math.PI / 2] },
  { position: [-BALL_RADIUS, 0, 0], rotation: [0, 0, Math.PI / 2] },
  { position: [0, 0, BALL_RADIUS], rotation: [Math.PI / 2, 0, 0] },
  { position: [0, 0, -BALL_RADIUS], rotation: [-Math.PI / 2, 0, 0] },
];
