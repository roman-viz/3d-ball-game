import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../game/models';
import './GameUI.css';

type OverlayState = Exclude<GameState, 'playing'>;

type GameUIProps = {
  gameState: GameState;
  currentLevel: number;
  totalLevels: number;
  onStart: () => void;
  onPlayAgain: () => void;
  onNextLevel: () => void;
};

function GameUI({
  gameState,
  currentLevel,
  totalLevels,
  onStart,
  onPlayAgain,
  onNextLevel,
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

  const panelState = gameState === 'playing'
    ? exitingOverlay?.state ?? null
    : gameState;
  const panelLevel = gameState === 'playing'
    ? exitingOverlay?.level ?? currentLevel
    : currentLevel;
  const isFinalLevel = panelLevel === totalLevels - 1;
  const isExiting = gameState === 'playing' && exitingOverlay !== null;

  if (panelState === 'start') {
    return (
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
        </section>

        <button
          className="start-game-button"
          type="button"
          onClick={() => dismissOverlay('start', onStart)}
        >
          <span className="start-button-copy">
            <small>READY WHEN YOU ARE</small>
            <strong>START GAME</strong>
          </span>
          <span className="start-button-arrow" aria-hidden="true" />
        </button>
      </main>
    );
  }

  return (
    <>
      {gameState === 'playing' && (
        <div className="game-hud" aria-live="polite">
          LEVEL {panelLevel + 1} <span>/ {totalLevels}</span>
        </div>
      )}
      {panelState !== null && (
        <main
          className={`game-overlay game-overlay--${panelState}${isExiting ? ' game-overlay--exiting' : ''}`}
        >
          <section className="game-card" key={panelState}>
            {panelState === 'failed' && (
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
                  onClick={() => dismissOverlay('failed', onPlayAgain)}
                >
                  PLAY AGAIN <span aria-hidden="true">↻</span>
                </button>
              </>
            )}

            {panelState === 'finished' && (
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
                    'finished',
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
