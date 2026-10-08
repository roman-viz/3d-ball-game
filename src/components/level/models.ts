export type SegmentBase = {
  length: number;
  width: number;
  color?: string;
};

export type StraightSegment = SegmentBase & {
  type: 'straight';
  height?: number;
};

export type TurnSegment = SegmentBase & {
  type: 'turn';
  direction: 'left' | 'right';
};

export type SlopeSegment = SegmentBase & {
  type: 'slope';
  height: number;
};

export type GapSegment = SegmentBase & {
  type: 'gap';
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
  finishTarget?: [number, number, number];
};

export type LevelProps = {
  segments: LevelSegment[];
};
