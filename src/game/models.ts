export type GameState = 'start' | 'playing' | 'failed' | 'finished' | 'screamer';

export type MovementInput = {
  x: number;
  z: number;
};
