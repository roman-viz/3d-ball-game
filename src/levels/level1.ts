import type { LevelSegment } from '../components/level/Level';

const level1: LevelSegment[] = [
  { type: 'straight', length: 18, width: 4, height: 1 },
  { type: 'turn', direction: 'left', length: 8, width: 4 },
  { type: 'straight', length: 12, width: 4 },
  { type: 'turn', direction: 'right', length: 8, width: 4 },
  { type: 'straight', length: 10, width: 4 },
  { type: 'slope', length: 12, width: 4, height: 5 },
  { type: 'straight', length: 10, width: 4 },
  { type: 'gap', length: 3, width: 4 },
  { type: 'straight', length: 12, width: 4 },
];

export default level1;
