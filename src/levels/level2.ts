import type { LevelSegment } from '../components/level/models';

const level2: LevelSegment[] = [
  { type: 'straight', length: 6, width: 3, height: 1 },
  { type: 'turn', direction: 'right', length: 7, width: 1 },
  { type: 'straight', length: 6, width: 3 },
  { type: 'slope', length: 3, width: 3, height: 2 },
  { type: 'straight', length: 5, width: 1 },
  { type: 'turn', direction: 'left', length: 6, width: 2 },
  { type: 'straight', length: 7, width: 2 },
  { type: 'turn', direction: 'left', length: 4, width: 1 },
  { type: 'straight', length: 6, width: 1 },
  { type: 'straight', length: 6, width: 3 },
  { type: 'slope', length: 8, width: 3, height: -4 },
  { type: 'turn', direction: 'right', length: 5, width: 1 },
  { type: 'straight', length: 8, width: 1 },
];

export default level2;
