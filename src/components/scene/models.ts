import type { LevelSegment } from '../level/models';
import type { GameState } from '../../game/models';

export type SceneProps = {
  segments: LevelSegment[];
  levelIndex: number;
  gameState: GameState;
  startPosition: [number, number, number];
  fallThreshold: number;
  resetKey: number;
  onFall: () => void;
  onFinish: () => void;
};
