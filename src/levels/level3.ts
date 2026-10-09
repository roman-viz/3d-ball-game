import type { LevelSegment } from '../components/level/models';

const level3: LevelSegment[] = [
  { type: 'straight', length: 3, width: 4 },
  { type: 'turn', direction: 'left', length: 6, width: 3 },
  { type: 'straight', length: 7, width: 3 },
  { type: 'slope', length: 8, width: 1, height: 4 },
  { type: 'turn', direction: 'right', length: 5, width: 0.1 },
  { type: 'straight', length: 6, width: 0.5 },
  { type: 'straight', length: 5, width: 1 },
  { type: 'turn', direction: 'right', length: 5, width: 2 },
  { type: 'straight', length: 6, width: 2 },
  { type: 'slope', length: 7, width: 1, height: -5 },
  { type: 'straight', length: 4, width: 2 },
  { type: 'turn', direction: 'left', length: 5, width: 0.1 },
  { type: 'straight', length: 7, width: 1.5 },
  { type: 'straight', length: 5, width: 0.1 },
  { type: 'slope', length: 8, width: 1, height: 5 },
  { type: 'turn', direction: 'left', length: 6, width: 2, screamer: true },
  { type: 'straight', length: 7, width: 0.5 },
  { type: 'straight', length: 6, width: 0.1 },
  { type: 'turn', direction: 'right', length: 5, width: 2 },
  { type: 'straight', length: 5, width: 4 },
];

export default level3;
