import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/scene/Scene';
import GameUI from './components/game-ui/GameUI';
import { BALL_START_POSITION } from './components/level/consts';
import { FALL_OVERLAY_DELAY_MS } from './game/consts';
import { getFallThreshold, levels } from './game/levels';
import type { GameState } from './game/models';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const gameStateRef = useRef(gameState);
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const transitionTo = useCallback((nextState: GameState) => {
    gameStateRef.current = nextState;
    setGameState(nextState);
  }, []);

  const clearFailTimer = useCallback(() => {
    if (failTimer.current !== null) {
      clearTimeout(failTimer.current);
      failTimer.current = null;
    }
  }, []);

  const handleFall = useCallback(() => {
    if (
      gameStateRef.current !== 'playing'
      || failTimer.current !== null
    ) return;

    failTimer.current = setTimeout(() => {
      failTimer.current = null;
      if (gameStateRef.current === 'playing') {
        transitionTo('failed');
      }
    }, FALL_OVERLAY_DELAY_MS);
  }, [transitionTo]);

  const handleFinish = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    clearFailTimer();
    transitionTo('finished');
  }, [clearFailTimer, transitionTo]);

  const resetCurrentLevel = useCallback(() => {
    clearFailTimer();
    setResetKey((key) => key + 1);
    transitionTo('playing');
  }, [clearFailTimer, transitionTo]);

  const handleStart = useCallback(() => {
    transitionTo('playing');
  }, [transitionTo]);

  const handlePlayAgain = useCallback(() => {
    if (gameStateRef.current === 'finished') {
      setCurrentLevelIndex(0);
    }
    resetCurrentLevel();
  }, [resetCurrentLevel]);

  const handleNextLevel = useCallback(() => {
    if (
      gameStateRef.current !== 'finished'
      || currentLevelIndex >= levels.length - 1
    ) return;

    clearFailTimer();
    setCurrentLevelIndex((index) => index + 1);
    setResetKey((key) => key + 1);
    transitionTo('playing');
  }, [clearFailTimer, currentLevelIndex, transitionTo]);

  useEffect(() => () => clearFailTimer(), [clearFailTimer]);

  const currentLevel = levels[currentLevelIndex];
  const fallThreshold = getFallThreshold(currentLevel);

  return (
    <div className="game-shell">
      <Canvas
        camera={{
          position: [4.5, 7.5, 10],
          fov: 55,
        }}
      >
        <Scene
          segments={currentLevel}
          levelIndex={currentLevelIndex}
          gameState={gameState}
          startPosition={BALL_START_POSITION}
          fallThreshold={fallThreshold}
          resetKey={resetKey}
          onFall={handleFall}
          onFinish={handleFinish}
        />
      </Canvas>
      <GameUI
        gameState={gameState}
        currentLevel={currentLevelIndex}
        totalLevels={levels.length}
        onStart={handleStart}
        onPlayAgain={handlePlayAgain}
        onNextLevel={handleNextLevel}
      />
    </div>
  );
}
