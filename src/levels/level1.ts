import {
  LevelSegmentType,
  TurnDirection,
  type LevelSegment,
} from '../components/level/models';

const level1: LevelSegment[] = [
  { type: LevelSegmentType.Straight, length: 4, width: 4, height: 1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 8, width: 4 },
  { type: LevelSegmentType.Straight, length: 3, width: 4, height: 1 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Left, length: 5, width: 2 },
  { type: LevelSegmentType.Straight, length: 8, width: 2 },
  { type: LevelSegmentType.Turn, direction: TurnDirection.Right, length: 2, width: 2 },
  { type: LevelSegmentType.Straight, length: 5, width: 1 },
  { type: LevelSegmentType.Slope, length: 8, width: 2, height: 5 },
  { type: LevelSegmentType.Straight, length: 5, width: 4 },
];

export default level1;
