import React, { useState } from 'react';
import { getColorById } from '../config/colorRegistry';
import {
  getModeProfileById,
  getRemainingPracticeModes,
  PRACTICE_MODE_PROFILES,
} from '../config/difficultyConfig';
import { COLOR_SWATCH_SHAPE, getShapeById } from '../config/shapeRegistry';
import {
  FailureDiagnostic,
  GameModeProfile,
  GameState,
  PracticeSubModeId,
} from '../config/types';
import {
  FacetedButton,
  FacetedWindow,
  GeometricLivesTriad,
  TactileShapeSvg,
} from './TactileUI';

interface ArenaOverlaysProps {
  gameState: GameState;
  activeModeProfile: GameModeProfile;
  score: number;
  bestScore: number;
  speedLevel: number;
  livesRemaining: number;
  failureDiagnostic: FailureDiagnostic | null;
  defaultPlayerName: string;
  scoreSaved: boolean;
  onStartStandardGame: () => void;
  onStartJumpMode: () => void;
  onRestartCurrentMode: () => void;
  onOpenPracticeMenu: () => void;
  onStartPracticeSubMode: (subMode: PracticeSubModeId) => void;
  onContinueCurrentPractice: () => void;
  onReturnToMainMenu: () => void;
  onResumeGame: () => void;
  onSaveScore: (playerName: string) => void;
  onOpenLeaderboard: () => void;
}

/**
 * Helper to return a representative shape & color emblem for each Practice Sub-Mode
 */
function getPracticeSubModeEmblem(subMode: PracticeSubModeId) {
  switch (subMode) {
    case 'SHAPE':
      return {
        shape: getShapeById('star'),
        color: getColorById('green'),
        variant: 'emerald' as const,
      };
    case 'COLOR':
      return {
        shape: COLOR_SWATCH_SHAPE,
        color: getColorById('cyan'),
        variant: 'cyan' as const,
      };
    case 'JUMP':
      return {
        shape: getShapeById('triangle'),
        color: getColorById('yellow'),
        variant: 'indigo' as const,
      };
    case 'FULL':
    default:
      return {
        shape: getShapeById('diamond'),
        color: getColorById('purple'),
        variant: 'slate' as const,
      };
  }
}

export const ArenaOverlays: React.FC<ArenaOverlaysProps> = ({
  gameState,
  activeModeProfile,
  score,
  speedLevel,
  livesRemaining,
  failureDiagnostic,
  defaultPlayerName,
  scoreSaved,
  onStartStandardGame,
  onStartJumpMode,
  onRestartCurrentMode,
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

  if (gameState === 'PLAYING' || gameState === 'COUNTDOWN') {
    return null;
  }

  const heroGreen = getColorById('green');
  const heroCyan = getColorById('cyan');
  const heroYellow = getColorById('yellow');

  const triadShapes = [
    {
      id: 'triad-triangle',
      shape: getShapeById('triangle'),
      color: heroCyan,
    },
    {
      id: 'triad-circle',
      shape: getShapeById('circle'),
      color: heroGreen,
    },
    {
      id: 'triad-star',
      shape: getShapeById('star'),
      color: heroYellow,
    },
  ];

  // 1. Main Start Screen: Dual-Layer Faceted Window + Both Competitive Modes + Practice Mode
  if (gameState === 'TITLE_MENU') {
    const runProfile = getModeProfileById('GAME');
    const jumpProfile = getModeProfileById('JUMP_MATCH');

    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06080E]/82 backdrop-blur-[3px] p-5">
        <FacetedWindow maxWidthClass="max-w-2xl" className="text-center">
          {/* Decorative Bevelled Geometric Triad */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <TactileShapeSvg
              shape={getShapeById('triangle')}
              color={heroCyan}
              size={28}
            />
            <TactileShapeSvg
              shape={getShapeById('circle')}
              color={heroGreen}
              size={36}
            />
            <TactileShapeSvg
              shape={getShapeById('star')}
              color={heroYellow}
              size={28}
            />
          </div>

          <h1 className="text-5xl font-bold text-white font-display tracking-wider">
            GeoShift
          </h1>
          <p className="text-sm text-slate-200 mt-1.5 leading-relaxed max-w-lg mx-auto">
            Choose a mode below to test your geometric reflexes.
          </p>

          {/* Two Primary Competitive Game Modes: Run Mode vs Jump Mode */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <FacetedButton
              variant="emerald"
              size="lg"
              onClick={onStartStandardGame}
            >
              <div className="flex flex-col items-center text-center py-0.5">
                <span className="text-3xl font-bold font-display tracking-wider">
                  {runProfile.name}
                </span>
                <span className="text-sm font-bold font-display tracking-wide text-emerald-100 mt-1">
                  {runProfile.menuSubtitle}
                </span>
              </div>
            </FacetedButton>

            <FacetedButton
              variant="cyan"
              size="lg"
              onClick={onStartJumpMode}
            >
              <div className="flex flex-col items-center text-center py-0.5">
                <span className="text-3xl font-bold font-display tracking-wider">
                  {jumpProfile.name}
                </span>
                <span className="text-sm font-bold font-display tracking-wide text-sky-100 mt-1">
                  {jumpProfile.menuSubtitle}
                </span>
              </div>
            </FacetedButton>
          </div>

          {/* Practice Mode Selector Button */}
          <div className="mt-3.5">
            <FacetedButton
              variant="indigo"
              size="md"
              fullWidth
              onClick={onOpenPracticeMenu}
            >
              <div className="flex items-center justify-center gap-3 py-0.5">
                <span className="text-2xl font-bold font-display tracking-wider">
                  Practice Modes
                </span>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="text-sm font-medium font-display tracking-wide text-indigo-100">
                  Step-by-Step Training: Shape · Color · Jump · Full
                </span>
              </div>
            </FacetedButton>
          </div>
        </FacetedWindow>
      </div>
    );
  }

  // 2. Practice Mode Selector: Shape, Color, Jump, Full (All with Inner Facets & Tactile Emblems)
  if (gameState === 'PRACTICE_MENU') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06080E]/85 backdrop-blur-[3px] p-5">
        <FacetedWindow maxWidthClass="max-w-2xl">
          <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-white/15">
            <div>
              <h2 className="text-3xl font-bold text-white font-display tracking-wider">
                Select Practice Mode
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Clear 5 obstacles in any mode to master each reflex dimension step-by-step
              </p>
            </div>
            <FacetedButton
              variant="slate"
              size="sm"
              onClick={onReturnToMainMenu}
              className="text-base font-bold whitespace-nowrap shrink-0"
            >
              Main Menu
            </FacetedButton>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-4">
            {PRACTICE_MODE_PROFILES.map((prof) => {
              const subMode = prof.practiceSubMode!;
              const emblem = getPracticeSubModeEmblem(subMode);

              return (
                <FacetedButton
                  key={prof.id}
                  variant={emblem.variant}
                  size="md"
                  onClick={() => onStartPracticeSubMode(subMode)}
                  className="text-left"
                >
                  <div className="w-full flex items-start gap-3.5 py-0.5">
                    <div className="mt-0.5 shrink-0">
                      <TactileShapeSvg
                        shape={emblem.shape}
                        color={emblem.color}
                        size={38}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl font-bold text-white font-display tracking-wider">
                          {prof.shortLabel}
                        </span>
                        <span className="text-sm font-mono-tabular font-bold text-white/90">
                          5 Gates
                        </span>
                      </div>
                      <p className="text-xs text-white/85 font-sans font-normal mt-1 leading-snug">
                        {prof.description}
                      </p>
                    </div>
                  </div>
                </FacetedButton>
              );
            })}
          </div>
        </FacetedWindow>
      </div>
    );
  }

  // 3. Practice Window (Shown after clearing first 5 obstacles or when pressing P in Practice mode)
  if (gameState === 'PRACTICE_COMPLETE') {
    const currentSubMode = activeModeProfile.practiceSubMode || 'SHAPE';
    const remainingModes = getRemainingPracticeModes(currentSubMode);
    const initialTarget = activeModeProfile.batchObstacleTarget || 5;

    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06080E]/85 backdrop-blur-[3px] p-5">
        <FacetedWindow maxWidthClass="max-w-xl">
          <div className="flex items-baseline justify-between gap-4 pb-3.5 border-b border-white/15">
            <div>
              <h2 className="text-3xl font-bold text-white font-display tracking-wider">
                {score >= initialTarget
                  ? `${activeModeProfile.shortLabel} Practice Cleared`
                  : `${activeModeProfile.shortLabel} Practice Paused`}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Press Enter to continue practicing {activeModeProfile.shortLabel} with no limit (press P anytime to reopen this window), or switch modes below.
              </p>
            </div>
            <span className="text-lg font-mono-tabular font-bold text-emerald-400 shrink-0">
              {score} Cleared
            </span>
          </div>

          {/* Primary Action: Continue Practicing Same Mode (Enter) */}
          <div className="mt-4">
            <FacetedButton
              variant="cyan"
              size="md"
              fullWidth
              onClick={onContinueCurrentPractice}
              className="text-lg font-bold whitespace-nowrap"
            >
              Continue Practicing {activeModeProfile.shortLabel} (Press Enter)
            </FacetedButton>
          </div>

          {/* Remaining 3 Practice Modes */}
          <div className="mt-4">
            <div className="text-sm font-bold font-display tracking-wide text-slate-300 mb-2">
              Or Practice Another Skill:
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {remainingModes.map((mode) => (
                <FacetedButton
                  key={mode.id}
                  variant="slate"
                  size="sm"
                  onClick={() =>
                    mode.practiceSubMode &&
                    onStartPracticeSubMode(mode.practiceSubMode)
                  }
                  className="text-base font-bold whitespace-nowrap"
                >
                  Practice {mode.shortLabel}
                </FacetedButton>
              ))}
            </div>
          </div>

          {/* Direct Start Game & Main Menu Options */}
          <div className="flex items-center justify-between gap-3 mt-5 pt-3.5 border-t border-white/15">
            <FacetedButton
              variant="slate"
              size="sm"
              onClick={onReturnToMainMenu}
              className="text-base font-bold whitespace-nowrap"
            >
              Main Menu
            </FacetedButton>

            <div className="flex items-center gap-2.5">
              <FacetedButton
                variant="cyan"
                size="sm"
                onClick={onStartJumpMode}
                className="text-base font-bold whitespace-nowrap shrink-0"
              >
                Start Jump Mode
              </FacetedButton>
              <FacetedButton
                variant="emerald"
                size="sm"
                onClick={onStartStandardGame}
                className="text-base font-bold whitespace-nowrap shrink-0"
              >
                Start Run Mode
              </FacetedButton>
            </div>
          </div>
        </FacetedWindow>
      </div>
    );
  }

  // 4. Game Paused Overlay (Shown when pressing P during Run Mode or Jump Mode)
  if (gameState === 'PAUSED') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06080E]/82 backdrop-blur-[3px] p-6">
        <FacetedWindow maxWidthClass="max-w-md" className="text-center">
          <h2 className="text-3xl font-bold text-white font-display tracking-wider">
            {activeModeProfile.name} Paused
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Score: <span className="font-mono-tabular text-emerald-400 font-bold">{score}</span>
            {!activeModeProfile.isPractice && ` · Level ${speedLevel}`}
          </p>

          <div className="flex flex-col gap-3 mt-5">
            <FacetedButton
              variant="emerald"
              size="md"
              fullWidth
              onClick={onResumeGame}
              className="text-lg font-bold whitespace-nowrap"
            >
              Continue (Press Enter)
            </FacetedButton>
            <FacetedButton
              variant="slate"
              size="md"
              fullWidth
              onClick={onRestartCurrentMode}
              className="text-lg font-bold whitespace-nowrap"
            >
              Restart {activeModeProfile.name}
            </FacetedButton>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-white/15">
            <FacetedButton
              variant="indigo"
              size="sm"
              onClick={onOpenPracticeMenu}
              className="text-base font-bold whitespace-nowrap"
            >
              Practice Menu
            </FacetedButton>
            <FacetedButton
              variant="slate"
              size="sm"
              onClick={onReturnToMainMenu}
              className="text-base font-bold whitespace-nowrap"
            >
              Main Menu
            </FacetedButton>
          </div>
        </FacetedWindow>
      </div>
    );
  }

  // 5. GAME_OVER State (Run Mode or Jump Mode)
  const isJumpMode = Boolean(activeModeProfile.isAutoJumpMode);

  const checkItems = isJumpMode
    ? [
        {
          label: 'Color',
          matched: failureDiagnostic ? failureDiagnostic.colorMatched : false,
        },
        {
          label: 'Shape',
          matched: failureDiagnostic ? failureDiagnostic.shapeMatched : false,
        },
      ]
    : [
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06080E]/85 backdrop-blur-[3px] p-4">
      <FacetedWindow maxWidthClass="max-w-md">
        <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-3">
          <div>
            <h2 className="text-4xl font-bold text-white font-display tracking-wider">
              Game Over
            </h2>
            <div className="text-xs font-display tracking-wide text-slate-300 mt-0.5">
              {activeModeProfile.name} · Level {speedLevel}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-display tracking-wide text-slate-300">
              Final Score
            </div>
            <div className="text-3xl font-bold font-mono-tabular text-emerald-400">
              {score}
            </div>
          </div>
        </div>

        {/* In Jump Mode, show the 3 Geometric Lives (dimmed on Game Over) */}
        {isJumpMode && (
          <div className="flex items-center justify-between px-3.5 py-2 mt-3 rounded-xl bg-[#0B0F1A] border border-[#384766]">
            <span className="text-sm font-bold font-display tracking-wider text-slate-300">
              All 3 Lives Lost
            </span>
            <GeometricLivesTriad
              livesRemaining={livesRemaining}
              maxLives={3}
              triadShapes={triadShapes}
              size={20}
            />
          </div>
        )}

        {/* Faceted Diagnostic Cards */}
        <div
          className={`grid ${
            isJumpMode ? 'grid-cols-2' : 'grid-cols-3'
          } gap-3 my-3.5`}
        >
          {checkItems.map((item) => (
            <div
              key={item.label}
              className={`relative overflow-hidden flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 font-display text-lg font-bold tracking-wide ${
                item.matched
                  ? 'bg-[#166E3D] border-[#4ADE80] text-white'
                  : 'bg-[#991B1B] border-[#FCA5A5] text-white'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-[2.5px] left-[2.5px] right-[5.5px] bottom-[5.5px] rounded-lg ${
                  item.matched ? 'bg-[#86EFAC]/30' : 'bg-[#FECACA]/25'
                }`}
              />
              <span className="relative z-10">{item.label}</span>
              <span
                className="relative z-10 text-lg font-bold font-mono-tabular"
                aria-label={item.matched ? 'Matched' : 'Missed'}
              >
                {item.matched ? '✓' : '✕'}
              </span>
            </div>
          ))}
        </div>

        {/* Save to localStorage Leaderboard, Main Menu & Play Again */}
        <div className="flex flex-col gap-3 pt-3 border-t border-white/15">
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
                className="flex-1 px-3.5 py-2 text-sm bg-[#0B0F1A] border-2 border-[#384766] rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 font-mono-tabular"
              />
              <FacetedButton
                type="submit"
                variant="cyan"
                size="sm"
                className="text-base font-bold whitespace-nowrap shrink-0"
              >
                Save Score
              </FacetedButton>
            </form>
          ) : (
            <div className="flex items-center justify-between text-sm font-display tracking-wide text-emerald-400 py-1">
              <span>Score Saved to {activeModeProfile.name} Leaderboard</span>
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="underline hover:text-emerald-300 cursor-pointer font-bold"
              >
                View Top 10
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FacetedButton
              variant="slate"
              size="md"
              onClick={onReturnToMainMenu}
              className="text-lg font-bold whitespace-nowrap"
            >
              Main Menu
            </FacetedButton>
            <FacetedButton
              variant={isJumpMode ? 'cyan' : 'emerald'}
              size="md"
              onClick={onRestartCurrentMode}
              className="text-lg font-bold whitespace-nowrap"
            >
              Play Again (Enter)
            </FacetedButton>
          </div>
        </div>
      </FacetedWindow>
    </div>
  );
};
