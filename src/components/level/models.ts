export enum LevelSegmentType {
  Straight = 'straight',
  Turn = 'turn',
  Slope = 'slope',
  Gap = 'gap',
}

export enum TurnDirection {
  Left = 'left',
  Right = 'right',
}

export type SegmentBase = {
  length: number;
  width: number;
  color?: string;
  screamer?: boolean;
};

export type StraightSegment = SegmentBase & {
  type: LevelSegmentType.Straight;
  height?: number;
};

export type TurnSegment = SegmentBase & {
  type: LevelSegmentType.Turn;
  direction: TurnDirection;
};

export type SlopeSegment = SegmentBase & {
  type: LevelSegmentType.Slope;
  height: number;
};

export type GapSegment = SegmentBase & {
  type: LevelSegmentType.Gap;
};

export type LevelSegment =
  | StraightSegment
  | TurnSegment
  | SlopeSegment
  | GapSegment;

export type PlatformPiece = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  screamer?: boolean;
  finishTarget?: [number, number, number];
};

export type LevelProps = {
  segments: LevelSegment[];
};
