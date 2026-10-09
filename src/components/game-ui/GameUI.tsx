import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { GameState, type MovementInput } from '../../game/models';
import screamerImage from '../../assets/screamer.webp';
import './GameUI.css';

type OverlayState = Exclude<GameState, GameState.Playing | GameState.Screamer>;

type GameUIProps = {
  gameState: GameState;
  currentLevel: number;
  totalLevels: number;
  soundEnabled: boolean;
  screamerReady: boolean;
  onStart: () => void;
  onPlayAgain: () => void;
  onPlayAgainToStart: () => void;
  onNextLevel: () => void;
  onToggleSound: () => void;
  onJoystickInput: (input: MovementInput) => void;
};

type VirtualJoystickProps = {
  onInputChange: (input: MovementInput) => void;
  className?: string;
  enabled?: boolean;
};

function VirtualJoystick({
  onInputChange,
  className = '',
  enabled = true,
}: VirtualJoystickProps) {
  const [thumbPosition, setThumbPosition] = useState({ x: 0, y: 0 });
  const activePointer = useRef<number | null>(null);

  const updateInput = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const maxDistance = bounds.width * 0.34;
    let x = event.clientX - (bounds.left + bounds.width / 2);
    let y = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(x, y);
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }

    setThumbPosition({ x, y });
    const strength = Math.hypot(x, y) / maxDistance;
    const deadZone = 0.12;
    const adjustedStrength = strength <= deadZone
      ? 0
      : (strength - deadZone) / (1 - deadZone);
    const directionLength = Math.hypot(x, y) || 1;
    onInputChange({
      x: (x / directionLength) * adjustedStrength,
      z: (y / directionLength) * adjustedStrength,
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    event.preventDefault();
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateInput(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (enabled && activePointer.current === event.pointerId) {
      updateInput(event);
    }
  };

  const stopInput = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event
      && activePointer.current !== null
      && activePointer.current !== event.pointerId
    ) return;
    activePointer.current = null;
    setThumbPosition({ x: 0, y: 0 });
    onInputChange({ x: 0, z: 0 });
  };

  return (
    <div
      className={`virtual-joystick ${className}`}
      aria-label={enabled ? 'Virtual joystick' : undefined}
      aria-hidden={enabled ? undefined : true}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopInput}
      onPointerCancel={stopInput}
      onLostPointerCapture={stopInput}
    >
      <span className="virtual-joystick-ring" />
      <span
        className="virtual-joystick-thumb"
        style={{ transform: `translate(${thumbPosition.x}px, ${thumbPosition.y}px)` }}
      />
    </div>
  );
}

function GameUI({
  gameState,
  currentLevel,
  totalLevels,
  soundEnabled,
  screamerReady,
  onStart,
  onPlayAgain,
  onPlayAgainToStart,
  onNextLevel,
  onToggleSound,
  onJoystickInput,
}: GameUIProps) {
  const [exitingOverlay, setExitingOverlay] = useState<{
    state: OverlayState;
    level: number;
  } | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimer.current !== null) clearTimeout(exitTimer.current);
    };
  }, []);

  const dismissOverlay = (overlay: OverlayState, action: () => void) => {
    if (exitTimer.current !== null) clearTimeout(exitTimer.current);
    setExitingOverlay({ state: overlay, level: currentLevel });
    exitTimer.current = setTimeout(() => {
      exitTimer.current = null;
      setExitingOverlay(null);
    }, 300);
    action();
  };

  const panelState = gameState === GameState.Playing
    ? exitingOverlay?.state ?? null
    : gameState === GameState.Screamer
      ? null
      : gameState;
  const panelLevel = gameState === GameState.Playing
    ? exitingOverlay?.level ?? currentLevel
    : currentLevel;
  const isFinalLevel = panelLevel === totalLevels - 1;
  const isExiting = gameState === GameState.Playing && exitingOverlay !== null;

  return (
    <>
      {(gameState !== GameState.Screamer || screamerReady) && (
        <button
          className="sound-button"
          type="button"
          aria-label={soundEnabled ? 'Mute game audio' : 'Unmute game audio'}
          aria-pressed={soundEnabled}
          onClick={onToggleSound}
        >
          <span aria-hidden="true">{soundEnabled ? '🔊' : '🔇'}</span>
        </button>
      )}
      {panelState === GameState.Start && (
        <main
          className={`game-overlay game-start-screen${isExiting ? ' game-overlay--exiting' : ''}`}
        >
          <header className="start-title">
            <p className="start-kicker">A LITTLE ADVENTURE AWAITS</p>
            <h1>BALL<span>RUN</span></h1>
            <div className="start-title-rule"><span /></div>
          </header>

          <aside className="start-mission" aria-label="Game objective">
            <div className="start-level-count">
              <span className="start-info-label">LEVELS</span>
              <strong>{String(totalLevels).padStart(2, '0')}</strong>
            </div>
            <i aria-hidden="true" />
            <div className="start-reward-details">
              <span className="start-info-label">REWARD</span>
              <strong className="start-reward" aria-label="Gift">🎁</strong>
              <span className="start-reward-line">
                COMPLETE ALL {totalLevels} LEVELS
                <br />
                TO CLAIM YOUR GIFT
              </span>
            </div>
          </aside>

          <section className="start-controls" aria-label="Movement controls">
            <p className="start-section-label">MOVE</p>
            <div className="key-layout">
              <div className="wasd-keys" aria-label="W A S D keys">
                <kbd className="key-cap key-w">W</kbd>
                <kbd className="key-cap key-a">A</kbd>
                <kbd className="key-cap key-s">S</kbd>
                <kbd className="key-cap key-d">D</kbd>
              </div>
              <span className="controls-or">OR</span>
              <div className="arrow-keys" aria-label="Arrow keys">
                <kbd className="key-cap arrow-up" aria-label="Up">↑</kbd>
                <kbd className="key-cap arrow-left" aria-label="Left">←</kbd>
                <kbd className="key-cap arrow-down" aria-label="Down">↓</kbd>
                <kbd className="key-cap arrow-right" aria-label="Right">→</kbd>
              </div>
            </div>
            <div className="joystick-preview">
              <VirtualJoystick onInputChange={() => undefined} enabled={false} />
              <span>TOUCH TO MOVE</span>
            </div>
          </section>

          <button
            className="start-game-button"
            type="button"
            onClick={() => dismissOverlay(GameState.Start, onStart)}
          >
            <span className="start-button-copy">
              <small>READY WHEN YOU ARE</small>
              <strong>START GAME</strong>
            </span>
            <span className="start-button-arrow" aria-hidden="true" />
          </button>
        </main>
      )}

      {gameState === GameState.Playing && (
        <>
          <div className="game-hud" aria-live="polite">
            LEVEL {panelLevel + 1} <span>/ {totalLevels}</span>
          </div>
          <div className="game-joystick">
            <VirtualJoystick onInputChange={onJoystickInput} />
          </div>
        </>
      )}

      {gameState === GameState.Screamer && (
        <main className={`screamer-screen${screamerReady ? ' screamer-screen--calm' : ''}`}>
          <img className="screamer-image" src={screamerImage} alt="" />
          {screamerReady && (
            <button
              className="screamer-play-again"
              type="button"
              onClick={onPlayAgainToStart}
            >
              PLAY AGAIN <span aria-hidden="true">→</span>
            </button>
          )}
        </main>
      )}

      {panelState !== null && panelState !== GameState.Start && (
        <main
          className={`game-overlay game-overlay--${panelState}${isExiting ? ' game-overlay--exiting' : ''}`}
        >
          <section className="game-card" key={panelState}>
            {panelState === GameState.Failed && (
              <>
                <p className="game-eyebrow">LEVEL {currentLevel + 1}</p>
                <div className="game-result-icon game-result-icon--fail" aria-hidden="true">
                  ↘
                </div>
                <h2>Level failed</h2>
                <p className="game-description">One more try. You’ve got this.</p>
                <button
                  className="game-button"
                  type="button"
                  onClick={() => dismissOverlay(GameState.Failed, onPlayAgain)}
                >
                  PLAY AGAIN <span aria-hidden="true">↻</span>
                </button>
              </>
            )}

            {panelState === GameState.Finished && (
              <>
                <p className="game-eyebrow">
                  LEVEL {panelLevel + 1} / {totalLevels}
                </p>
                <div className="game-result-icon game-result-icon--success" aria-hidden="true">
                  ✓
                </div>
                <h2>{isFinalLevel ? 'All levels complete!' : 'Level complete!'}</h2>
                <p className="game-description">
                  {isFinalLevel
                    ? `You completed all ${totalLevels} levels. Your gift awaits! 🎁`
                    : `Level ${panelLevel + 1} completed`}
                </p>
                <button
                  className="game-button"
                  type="button"
                  onClick={() => dismissOverlay(
                    GameState.Finished,
                    isFinalLevel ? onPlayAgain : onNextLevel,
                  )}
                >
                  {isFinalLevel ? 'PLAY AGAIN' : 'NEXT LEVEL'}
                  <span aria-hidden="true">{isFinalLevel ? '↻' : '→'}</span>
                </button>
              </>
            )}
          </section>
        </main>
      )}
    </>
  );
}

export default GameUI;
