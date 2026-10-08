import type { LevelSegment } from '../components/level/models';

const level1: LevelSegment[] = [
  { type: 'straight', length: 4, width: 4, height: 1 },
  { type: 'turn', direction: 'left', length: 8, width: 4 },
  { type: 'straight', length: 3, width: 4, height: 1 },
  { type: 'turn', direction: 'left', length: 6, width: 2 },
  { type: 'straight', length: 8, width: 3 },
  { type: 'turn', direction: 'right', length: 2, width: 2 },
  { type: 'straight', length: 5, width: 1 },
  { type: 'slope', length: 8, width: 2, height: 5 },
  { type: 'straight', length: 5, width: 4 },
];

export default level1;
