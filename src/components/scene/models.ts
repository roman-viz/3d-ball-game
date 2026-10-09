import type { LevelSegment } from '../level/models';
import type { GameState } from '../../game/models';
import type { RefObject } from 'react';
import type { MovementInput } from '../../game/models';

export type SceneProps = {
  segments: LevelSegment[];
  levelIndex: number;
  gameState: GameState;
  startPosition: [number, number, number];
  fallThreshold: number;
  resetKey: number;
  joystickInput: RefObject<MovementInput>;
  onFall: () => void;
  onFinish: () => void;
  onScreamer: () => void;
};
