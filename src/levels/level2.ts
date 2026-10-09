import {
  LevelSegmentType,
  TurnDirection,
  type LevelSegment,
} from '../components/level/models';

const level2: LevelSegment[] = [
  { type: LevelSegmentType.Straight, length: 6, width: 3, height: 1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 7, width: 1 },
  { type: LevelSegmentType.Straight, length: 6, width: 3 },
  { type: LevelSegmentType.Slope, length: 3, width: 3, height: 2 },
  { type: LevelSegmentType.Straight, length: 5, width: 1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 6, width: 2 },
  { type: LevelSegmentType.Straight, length: 7, width: 2 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 4, width: 1 },
  { type: LevelSegmentType.Straight, length: 6, width: 1 },
  { type: LevelSegmentType.Straight, length: 6, width: 3 },
  { type: LevelSegmentType.Slope, length: 8, width: 3, height: -4 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 5, width: 1 },
  { type: LevelSegmentType.Straight, length: 8, width: 1 },
];

export default level2;
