import {
  LevelSegmentType,
  TurnDirection,
  type LevelSegment,
} from '../components/level/models';

const level3: LevelSegment[] = [
  { type: LevelSegmentType.Straight, length: 3, width: 4 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 6, width: 3 },
  { type: LevelSegmentType.Straight, length: 7, width: 3 },
  { type: LevelSegmentType.Slope, length: 8, width: 1, height: 4 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 5, width: 0.1 },
  { type: LevelSegmentType.Straight, length: 6, width: 0.5 },
  { type: LevelSegmentType.Straight, length: 5, width: 1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 5, width: 2 },
  { type: LevelSegmentType.Straight, length: 6, width: 2 },
  { type: LevelSegmentType.Slope, length: 7, width: 1, height: -5 },
  { type: LevelSegmentType.Straight, length: 4, width: 2 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 5, width: 0.1 },
  { type: LevelSegmentType.Straight, length: 7, width: 1.5 },
  { type: LevelSegmentType.Straight, length: 5, width: 0.1 },
  { type: LevelSegmentType.Slope, length: 8, width: 1, height: 5 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 6, width: 2, screamer: true },
  { type: LevelSegmentType.Straight, length: 7, width: 0.5 },
  { type: LevelSegmentType.Straight, length: 6, width: 0.1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 5, width: 2 },
  { type: LevelSegmentType.Straight, length: 5, width: 4 },
];

export default level3;
