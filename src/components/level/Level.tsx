import Platform from '../platform/Platform';

type SegmentBase = {
  length: number;
  width: number;
  color?: string;
};

type StraightSegment = SegmentBase & {
  type: 'straight';
  height?: number;
};

type TurnSegment = SegmentBase & {
  type: 'turn';
  direction: 'left' | 'right';
};

type SlopeSegment = SegmentBase & {
  type: 'slope';
  height: number;
};

type GapSegment = SegmentBase & {
  type: 'gap';
};

export type LevelSegment =
  | StraightSegment
  | TurnSegment
  | SlopeSegment
  | GapSegment;

type PlatformPiece = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
};

const DEFAULT_PLATFORM_COLOR = 'white';
const FINISH_PLATFORM_COLOR = '#b7d8ff';
const DEFAULT_PLATFORM_HEIGHT = 1;
const SLOPE_PLATFORM_THICKNESS = 1;

function buildLevel(segments: LevelSegment[]): PlatformPiece[] {
  const cursor = {
    x: 0,
    y: 0,
    z: 0,
    directionX: 0,
    directionZ: -1,
  };
  const pieces: PlatformPiece[] = [];

  function addStraightPiece(
    length: number,
    width: number,
    height: number,
    color: string,
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
    });

    cursor.x += cursor.directionX * length;
    cursor.z += cursor.directionZ * length;
  }

  for (const [index, segment] of segments.entries()) {
    const isLastSegment = index === segments.length - 1;

    const color = isLastSegment
      ? FINISH_PLATFORM_COLOR
      : segment.color ?? DEFAULT_PLATFORM_COLOR;

    switch (segment.type) {
      case 'straight':
        addStraightPiece(
          segment.length,
          segment.width,
          segment.height ?? DEFAULT_PLATFORM_HEIGHT,
          color,
        );
        break;

      case 'turn': {
        const halfLength = segment.length / 2;
        addStraightPiece(
          halfLength,
          segment.width,
          DEFAULT_PLATFORM_HEIGHT,
          color,
        );

        const { directionX, directionZ } = cursor;
        if (segment.direction === 'left') {
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
        );
        break;
      }

      case 'slope': {
        const angle = Math.atan2(segment.height, segment.length);
        const slopeLength = Math.hypot(segment.length, segment.height);
        const yaw = Math.atan2(-cursor.directionX, -cursor.directionZ);
        const thickness = SLOPE_PLATFORM_THICKNESS;

        pieces.push({
          position: [
            cursor.x + cursor.directionX * segment.length / 2
            + cursor.directionX * Math.sin(angle) * thickness / 2,
            cursor.y + segment.height / 2
            - Math.cos(angle) * thickness / 2,
            cursor.z + cursor.directionZ * segment.length / 2
            + cursor.directionZ * Math.sin(angle) * thickness / 2,
          ],
          rotation: [angle, yaw, 0],
          size: [segment.width, thickness, slopeLength],
          color,
        });

        cursor.x += cursor.directionX * segment.length;
        cursor.y += segment.height;
        cursor.z += cursor.directionZ * segment.length;
        break;
      }

      case 'gap':
        cursor.x += cursor.directionX * segment.length;
        cursor.z += cursor.directionZ * segment.length;
        break;
    }
  }

  return pieces;
}

type LevelProps = {
  segments: LevelSegment[];
};

export function Level({ segments }: LevelProps) {
  const pieces = buildLevel(segments);

  return (
    <group>
      {pieces.map((piece, index) => (
        <Platform
          key={index}
          position={piece.position}
          rotation={piece.rotation}
          size={piece.size}
          color={piece.color}
        />
      ))}
    </group>
  );
}
