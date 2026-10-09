export enum GameState {
  Start = 'start',
  Playing = 'playing',
  Failed = 'failed',
  Finished = 'finished',
  Screamer = 'screamer',
}

export enum MovementKeyCode {
  Forward = 'KeyW',
  Backward = 'KeyS',
  Left = 'KeyA',
  Right = 'KeyD',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}

export type MovementInput = {
  x: number;
  z: number;
};
