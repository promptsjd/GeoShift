import React, { useState } from 'react';
import {
  getRemainingPracticeModes,
  PRACTICE_MODE_PROFILES,
} from '../config/difficultyConfig';
import {
  FailureDiagnostic,
  GameModeProfile,
  GameState,
  PracticeSubModeId,
} from '../config/types';

interface ArenaOverlaysProps {
  gameState: GameState;
  activeModeProfile: GameModeProfile;
  score: number;
  bestScore: number;
  speedLevel: number;
  failureDiagnostic: FailureDiagnostic | null;
  defaultPlayerName: string;
  scoreSaved: boolean;
  onStartStandardGame: () => void;
  onOpenPracticeMenu: () => void;
  onStartPracticeSubMode: (subMode: PracticeSubModeId) => void;
  onContinueCurrentPractice: () => void;
  onReturnToMainMenu: () => void;
  onResumeGame: () => void;
  onSaveScore: (playerName: string) => void;
  onOpenLeaderboard: () => void;
}

export const ArenaOverlays: React.FC<ArenaOverlaysProps> = ({
  gameState,
  activeModeProfile,
  score,
  bestScore,
  speedLevel,
  failureDiagnostic,
  defaultPlayerName,
  scoreSaved,
  onStartStandardGame,
  onOpenPracticeMenu,
  onStartPracticeSubMode,
  onContinueCurrentPractice,
  onReturnToMainMenu,
  onResumeGame,
  onSaveScore,
  onOpenLeaderboard,
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName);

  React.useEffect(() => {
    setPlayerName(defaultPlayerName);
  }, [defaultPlayerName, gameState]);

  if (gameState === 'PLAYING') {
    return null;
  }

  // 1. Main Start Screen: Only "Game" and "Practice"
  if (gameState === 'TITLE_MENU') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07080D]/82 backdrop-blur-[2px] p-6">
        <div className="w-full max-w-lg rounded-xl bg-slate-900/95 border border-slate-800 p-7 shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-slate-100 font-display tracking-tight">
            GeoShift
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Shift color, shape, and vertical jump position to pass approaching obstacle gates.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-7">
            <button
              type="button"
              onClick={onStartStandardGame}
              className="flex flex-col items-center justify-center p-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer group"
            >
              <span className="text-lg font-bold font-display">Game</span>
              <span className="text-xs font-medium text-slate-900 mt-1">
                Start Progressive Run
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenPracticeMenu}
              className="flex flex-col items-center justify-center p-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer"
            >
              <span className="text-lg font-bold font-display">Practice</span>
              <span className="text-xs font-medium text-slate-300 mt-1">
                Shape · Color · Jump · Full
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Practice Mode Selector: Shape, Color, Jump, Full
  if (gameState === 'PRACTICE_MENU') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07080D]/86 backdrop-blur-[2px] p-5">
        <div className="w-full max-w-2xl rounded-xl bg-slate-900/95 border border-slate-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display">
                Select Practice Mode
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clear 5 obstacles in any mode to master each skill step-by-step
              </p>
            </div>
            <button
              type="button"
              onClick={onReturnToMainMenu}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Main Menu
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {PRACTICE_MODE_PROFILES.map((prof) => {
              const subMode = prof.practiceSubMode!;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => onStartPracticeSubMode(subMode)}
                  className="text-left p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-400/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-slate-100 font-display">
                      {prof.shortLabel}
                    </span>
                    <span className="text-xs font-mono-tabular text-sky-400">
                      5 Obstacles
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {prof.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Practice Batch Complete Modal (After clearing 5 obstacles)
  if (gameState === 'PRACTICE_COMPLETE') {
    const currentSubMode = activeModeProfile.practiceSubMode || 'SHAPE';
    const remainingModes = getRemainingPracticeModes(currentSubMode);

    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07080D]/86 backdrop-blur-[2px] p-5">
        <div className="w-full max-w-xl rounded-xl bg-slate-900/95 border border-slate-800 p-6 shadow-2xl">
          <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display">
                {activeModeProfile.shortLabel} Practice Cleared
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Press Spacebar to continue practicing {activeModeProfile.shortLabel}, or switch to another mode below.
              </p>
            </div>
            <span className="text-sm font-mono-tabular font-bold text-emerald-400 shrink-0">
              {score} Cleared
            </span>
          </div>

          {/* Primary Action: Continue Practicing Same Mode (Spacebar) */}
          <div className="mt-4">
            <button
              type="button"
              onClick={onContinueCurrentPractice}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Continue Practicing {activeModeProfile.shortLabel} (Press Space)
            </button>
          </div>

          {/* Remaining 3 Practice Modes */}
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-400 mb-2">
              Or Practice Another Skill:
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {remainingModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    mode.practiceSubMode &&
                    onStartPracticeSubMode(mode.practiceSubMode)
                  }
                  className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Practice {mode.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Start Game & Main Menu Options */}
          <div className="flex items-center justify-between gap-3 mt-5 pt-3.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onReturnToMainMenu}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Main Menu
            </button>

            <button
              type="button"
              onClick={onStartStandardGame}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Start Game Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Paused Overlay
  if (gameState === 'PAUSED') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07080D]/80 backdrop-blur-[2px] p-6">
        <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-slate-100 font-display">
            {activeModeProfile.isPractice
              ? `${activeModeProfile.name} Paused`
              : 'Run Paused'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cleared: <span className="font-mono-tabular text-slate-200 font-semibold">{score}</span>
            {!activeModeProfile.isPractice && ` · Speed Tier ${speedLevel}`}
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={onResumeGame}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Resume (P)
            </button>
            {activeModeProfile.isPractice && (
              <button
                type="button"
                onClick={onOpenPracticeMenu}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Practice Menu
              </button>
            )}
            <button
              type="button"
              onClick={onReturnToMainMenu}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. GAME_OVER State (Standard Game Run)
  const checkItems = [
    {
      label: 'Color',
      matched: failureDiagnostic ? failureDiagnostic.colorMatched : false,
    },
    {
      label: 'Shape',
      matched: failureDiagnostic ? failureDiagnostic.shapeMatched : false,
    },
    {
      label: 'Jump',
      matched: failureDiagnostic ? failureDiagnostic.heightMatched : false,
    },
  ];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07080D]/86 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900/95 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-100 font-display">
            Game Over
          </h2>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Final Score</div>
            <div className="text-2xl font-bold font-mono-tabular text-emerald-400">
              {score}
            </div>
          </div>
        </div>

        {/* Simple Tick / Cross list for Color, Shape, Jump */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {checkItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-semibold ${
                item.matched
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                  : 'bg-red-950/30 border-red-800/70 text-red-200'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-base font-bold font-mono-tabular ${
                  item.matched ? 'text-emerald-400' : 'text-red-400'
                }`}
                aria-label={item.matched ? 'Matched' : 'Missed'}
              >
                {item.matched ? '✓' : '✕'}
              </span>
            </div>
          ))}
        </div>

        {/* Save to localStorage Leaderboard, Practice & Play Again */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
          {!scoreSaved ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveScore(playerName);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 15))}
                maxLength={15}
                placeholder="Name"
                aria-label="Player name for leaderboard"
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 font-mono-tabular"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Save Score
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between text-xs text-emerald-400 py-1">
              <span>Score Saved</span>
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="underline hover:text-emerald-300 cursor-pointer"
              >
                View Top 10
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenPracticeMenu}
              className="py-2.5 px-4 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Practice
            </button>
            <button
              type="button"
              onClick={onStartStandardGame}
              className="py-2.5 px-4 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Play Again (Press Spacebar)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
