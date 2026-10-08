import type { LevelSegment } from '../components/level/models';

const level2: LevelSegment[] = [
  { type: 'straight', length: 12, width: 4, height: 1 },
  { type: 'turn', direction: 'right', length: 6, width: 3 },
  { type: 'straight', length: 8, width: 3 },
  { type: 'slope', length: 8, width: 3, height: 3 },
  { type: 'straight', length: 6, width: 3 },
  { type: 'turn', direction: 'left', length: 6, width: 3 },
  { type: 'straight', length: 7, width: 3 },
  { type: 'gap', length: 4, width: 3 },
  { type: 'straight', length: 7, width: 3 },
  { type: 'slope', length: 7, width: 3, height: -3 },
  { type: 'turn', direction: 'right', length: 6, width: 3 },
  { type: 'straight', length: 6, width: 3 },
  { type: 'gap', length: 5, width: 3 },
  { type: 'straight', length: 8, width: 3 },
  { type: 'turn', direction: 'left', length: 6, width: 3 },
  { type: 'slope', length: 10, width: 3, height: 4 },
  { type: 'straight', length: 6, width: 3 },
  { type: 'gap', length: 4, width: 3 },
  { type: 'straight', length: 10, width: 4 },
];

export default level2;
