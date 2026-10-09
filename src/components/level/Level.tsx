import { useMemo } from 'react';
import Platform from '../platform/Platform';
import { GAME_COLORS } from '../../theme/colors';
import {
  LevelSegmentType,
  TurnDirection,
  type LevelProps,
  type LevelSegment,
  type PlatformPiece,
} from './models';
import {
  DEFAULT_PLATFORM_COLOR,
  DEFAULT_PLATFORM_HEIGHT,
  FINISH_PLATFORM_COLOR,
  FINISH_PLATFORM_SIZE,
  SLOPE_PLATFORM_THICKNESS,
  START_PLATFORM_POSITION,
  START_PLATFORM_SIZE,
} from './consts';
import * as THREE from 'three';

export type { LevelSegment } from './models';

function buildLevel(segments: LevelSegment[]): PlatformPiece[] {
  const cursor = {
    x: 0,
    y: 0,
    z: -START_PLATFORM_SIZE[2] / 2,
    directionX: 0,
    directionZ: -1,
  };
  let currentWidth = START_PLATFORM_SIZE[0];
  const pieces: PlatformPiece[] = [{
    position: START_PLATFORM_POSITION,
    rotation: [0, 0, 0],
    size: START_PLATFORM_SIZE,
    color: GAME_COLORS.startPlatform,
  }];

  function addStraightPiece(
    length: number,
    width: number,
    height: number,
    color: string,
    screamer?: boolean,
  ) {
    const yaw = Math.atan2(-cursor.directionX, -cursor.directionZ);

    pieces.push({
      position: [
        cursor.x + cursor.directionX * length / 2,
        cursor.y - height / 2,
        cursor.z + cursor.directionZ * length / 2,
      ],
      rotation: [0, yaw, 0],
      size: [width, height, length],
      color,
      screamer,
    });

    cursor.x += cursor.directionX * length;
    cursor.z += cursor.directionZ * length;
  }

  for (const segment of segments) {
    const color = segment.color ?? DEFAULT_PLATFORM_COLOR;

    switch (segment.type) {
      case LevelSegmentType.Straight:
        addStraightPiece(
          segment.length,
          segment.width,
          segment.height ?? DEFAULT_PLATFORM_HEIGHT,
          color,
          segment.screamer,
        );
        currentWidth = segment.width;
        break;

      case LevelSegmentType.Turn: {
        const halfLength = segment.length / 2;
        addStraightPiece(
          halfLength,
          currentWidth,
          DEFAULT_PLATFORM_HEIGHT,
          color,
          segment.screamer,
        );

        const turnPlatformWidth = Math.max(currentWidth, segment.width);
        pieces.push({
          position: [
            cursor.x,
            cursor.y - DEFAULT_PLATFORM_HEIGHT / 2,
            cursor.z,
          ],
          rotation: [0, 0, 0],
          size: [
            turnPlatformWidth,
            DEFAULT_PLATFORM_HEIGHT,
            turnPlatformWidth,
          ],
          color,
          screamer: segment.screamer,
        });

        const { directionX, directionZ } = cursor;
        if (segment.direction === TurnDirection.Left) {
          cursor.directionX = directionZ;
          cursor.directionZ = -directionX;
        } else {
          cursor.directionX = -directionZ;
          cursor.directionZ = directionX;
        }

        addStraightPiece(
          halfLength,
          segment.width,
          DEFAULT_PLATFORM_HEIGHT,
          color,
          segment.screamer,
        );
        currentWidth = segment.width;
        break;
      }

      case LevelSegmentType.Slope: {
        const angle = Math.atan2(segment.height, segment.length);
        const slopeLength = Math.hypot(segment.length, segment.height);
        const yaw = Math.atan2(-cursor.directionX, -cursor.directionZ);
        const thickness = SLOPE_PLATFORM_THICKNESS;
        const yawRotation = new THREE.Quaternion()
          .setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const tiltRotation = new THREE.Quaternion()
          .setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle);
        const slopeRotation = new THREE.Euler()
          .setFromQuaternion(yawRotation.multiply(tiltRotation), 'XYZ');

        pieces.push({
          position: [
            cursor.x + cursor.directionX * segment.length / 2
            + cursor.directionX * Math.sin(angle) * thickness / 2,
            cursor.y + segment.height / 2
            - Math.cos(angle) * thickness / 2,
            cursor.z + cursor.directionZ * segment.length / 2
            + cursor.directionZ * Math.sin(angle) * thickness / 2,
          ],
          rotation: [slopeRotation.x, slopeRotation.y, slopeRotation.z],
          size: [segment.width, thickness, slopeLength],
          color,
          screamer: segment.screamer,
        });

        cursor.x += cursor.directionX * segment.length;
        cursor.y += segment.height;
        cursor.z += cursor.directionZ * segment.length;
        currentWidth = segment.width;
        break;
      }

      case LevelSegmentType.Gap:
        cursor.x += cursor.directionX * segment.length;
        cursor.z += cursor.directionZ * segment.length;
        currentWidth = segment.width;
        break;
    }
  }

  if (segments.length > 0) {
    const finishPosition: [number, number, number] = [
      cursor.x + cursor.directionX * FINISH_PLATFORM_SIZE / 2,
      cursor.y - DEFAULT_PLATFORM_HEIGHT / 2,
      cursor.z + cursor.directionZ * FINISH_PLATFORM_SIZE / 2,
    ];

    pieces.push({
      position: finishPosition,
      rotation: [
        0,
        Math.atan2(-cursor.directionX, -cursor.directionZ),
        0,
      ],
      size: [
        FINISH_PLATFORM_SIZE,
        DEFAULT_PLATFORM_HEIGHT,
        FINISH_PLATFORM_SIZE,
      ],
      color: FINISH_PLATFORM_COLOR,
      finishTarget: [
        finishPosition[0],
        cursor.y + DEFAULT_PLATFORM_HEIGHT / 2,
        finishPosition[2],
      ],
    });
  }

  return pieces;
}

export function Level({ segments }: LevelProps) {
  const pieces = useMemo(() => buildLevel(segments), [segments]);

  return (
    <group>
      {pieces.map((piece, index) => (
        <Platform
          key={index}
          position={piece.position}
          rotation={piece.rotation}
          size={piece.size}
          color={piece.color}
          screamer={piece.screamer}
          finishTarget={piece.finishTarget}
        />
      ))}
    </group>
  );
}
