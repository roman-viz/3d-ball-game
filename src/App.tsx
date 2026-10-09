import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/scene/Scene';
import GameUI from './components/game-ui/GameUI';
import { BALL_START_POSITION } from './components/level/consts';
import { FALL_OVERLAY_DELAY_MS } from './game/consts';
import { getFallThreshold, levels } from './game/levels';
import { GameState, type MovementInput } from './game/models';
import mainThemeAsset from './assets/main_theme.mp3';
import screamerSoundAsset from './assets/screamer.mp3';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [screamerReady, setScreamerReady] = useState(false);
  const joystickInput = useRef<MovementInput>({ x: 0, z: 0 });
  const gameStateRef = useRef(gameState);
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screamerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainTheme = useRef<HTMLAudioElement | null>(null);
  const screamerSound = useRef<HTMLAudioElement | null>(null);

  useLayoutEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const transitionTo = useCallback((nextState: GameState) => {
    if (nextState !== GameState.Playing) {
      joystickInput.current = { x: 0, z: 0 };
    }
    gameStateRef.current = nextState;
    setGameState(nextState);
  }, []);

  const clearFailTimer = useCallback(() => {
    if (failTimer.current !== null) {
      clearTimeout(failTimer.current);
      failTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const theme = new Audio(mainThemeAsset);
    theme.loop = true;
    const screamer = new Audio(screamerSoundAsset);
    screamer.volume = 1;
    mainTheme.current = theme;
    screamerSound.current = screamer;

    return () => {
      theme.pause();
      screamer.pause();
      mainTheme.current = null;
      screamerSound.current = null;
    };
  }, []);

  const playMainTheme = useCallback(() => {
    const theme = mainTheme.current;
    if (!theme || !theme.paused) return;

    void theme.play().catch((error: unknown) => {
      console.error('Unable to play the main theme.', error);
    });
  }, []);

  useEffect(() => {
    const theme = mainTheme.current;
    if (!theme) return;

    if (
      !musicStarted
      || !soundEnabled
      || gameState === GameState.Start
      || gameState === GameState.Screamer
    ) {
      theme.pause();
      return;
    }

    playMainTheme();
  }, [gameState, musicStarted, playMainTheme, soundEnabled]);

  const handleFall = useCallback(() => {
    if (
      gameStateRef.current !== GameState.Playing
      || failTimer.current !== null
    ) return;

    failTimer.current = setTimeout(() => {
      failTimer.current = null;
      if (gameStateRef.current === GameState.Playing) {
        transitionTo(GameState.Failed);
      }
    }, FALL_OVERLAY_DELAY_MS);
  }, [transitionTo]);

  const handleFinish = useCallback(() => {
    if (gameStateRef.current !== GameState.Playing) return;
    clearFailTimer();
    transitionTo(GameState.Finished);
  }, [clearFailTimer, transitionTo]);

  const resetCurrentLevel = useCallback(() => {
    clearFailTimer();
    setResetKey((key) => key + 1);
    transitionTo(GameState.Playing);
  }, [clearFailTimer, transitionTo]);

  const handleStart = useCallback(() => {
    setMusicStarted(true);
    if (soundEnabled) playMainTheme();
    transitionTo(GameState.Playing);
  }, [playMainTheme, soundEnabled, transitionTo]);

  const handleToggleSound = useCallback(() => {
    if (soundEnabled) {
      setSoundEnabled(false);
      mainTheme.current?.pause();
      return;
    }

    setSoundEnabled(true);
    if (
      musicStarted
      && gameStateRef.current !== GameState.Start
      && gameStateRef.current !== GameState.Screamer
    ) {
      playMainTheme();
    }
  }, [musicStarted, playMainTheme, soundEnabled]);

  const handlePlayAgain = useCallback(() => {
    if (gameStateRef.current === GameState.Finished) {
      setCurrentLevelIndex(0);
    }
    resetCurrentLevel();
  }, [resetCurrentLevel]);

  const handleNextLevel = useCallback(() => {
    if (
      gameStateRef.current !== GameState.Finished
      || currentLevelIndex >= levels.length - 1
    ) return;

    clearFailTimer();
    setCurrentLevelIndex((index) => index + 1);
    setResetKey((key) => key + 1);
    transitionTo(GameState.Playing);
  }, [clearFailTimer, currentLevelIndex, transitionTo]);

  const handleScreamer = useCallback(() => {
    if (gameStateRef.current !== GameState.Playing) return;
    clearFailTimer();
    setScreamerReady(false);
    transitionTo(GameState.Screamer);
    mainTheme.current?.pause();

    const audio = screamerSound.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch((error: unknown) => {
        console.error('Unable to play the screamer sound.', error);
      });
    }

    if (screamerTimer.current !== null) clearTimeout(screamerTimer.current);
    screamerTimer.current = setTimeout(() => {
      screamerTimer.current = null;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setScreamerReady(true);
    }, 3000);
  }, [clearFailTimer, transitionTo]);

  const handleScreamerPlayAgain = useCallback(() => {
    if (screamerTimer.current !== null) {
      clearTimeout(screamerTimer.current);
      screamerTimer.current = null;
    }
    if (screamerSound.current) {
      screamerSound.current.pause();
      screamerSound.current.currentTime = 0;
    }
    joystickInput.current = { x: 0, z: 0 };
    setScreamerReady(false);
    setCurrentLevelIndex(0);
    setResetKey((key) => key + 1);
    transitionTo(GameState.Start);
  }, [transitionTo]);

  useEffect(() => () => {
    clearFailTimer();
    if (screamerTimer.current !== null) clearTimeout(screamerTimer.current);
  }, [clearFailTimer]);

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
          joystickInput={joystickInput}
          onFall={handleFall}
          onFinish={handleFinish}
          onScreamer={handleScreamer}
        />
      </Canvas>
      <GameUI
        gameState={gameState}
        currentLevel={currentLevelIndex}
        totalLevels={levels.length}
        soundEnabled={soundEnabled}
        screamerReady={screamerReady}
        onStart={handleStart}
        onPlayAgain={handlePlayAgain}
        onPlayAgainToStart={handleScreamerPlayAgain}
        onNextLevel={handleNextLevel}
        onToggleSound={handleToggleSound}
        onJoystickInput={(input) => {
          joystickInput.current = input;
        }}
      />
    </div>
  );
}
