/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArenaOverlays } from './components/ArenaOverlays';
import { ColorCarousel } from './components/ColorCarousel';
import { GameArenaCanvas } from './components/GameArenaCanvas';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShapeCarousel } from './components/ShapeCarousel';
import { ActiveModal, TopBar } from './components/TopBar';
import { COLOR_REGISTRY, getActiveColors, getColorById } from './config/colorRegistry';
import { resolveControlAction } from './config/controlConfig';
import {
  DEFAULT_PHYSICS_CONFIG,
  getModeProfileById,
  getPracticeModeBySubMode,
} from './config/difficultyConfig';
import { getActiveShapes, SHAPE_REGISTRY } from './config/shapeRegistry';
import { getTierById, VERTICAL_TIER_REGISTRY } from './config/tierRegistry';
import {
  FailureDiagnostic,
  GameModeProfile,
  GameState,
  GateClearEffect,
  LeaderboardEntry,
  ObstacleEntity,
  PlayerEntity,
  PracticeSubModeId,
  RunModeId,
} from './config/types';
import { getShapeAnimationProfile } from './config/visualConfig';
import { shiftClampedIndex } from './engine/carouselUtils';
import { evaluatePlayerObstacleInteraction } from './engine/collisionEvaluator';
import { createNextObstacle } from './engine/obstacleSpawner';
import {
  getSpeedProgression,
  stepPlayerPhysics,
  triggerPlayerJump,
} from './engine/physicsEngine';
import {
  clearLeaderboard,
  getLastPlayerName,
  loadBestScore,
  loadLeaderboard,
  saveBestScore,
  saveLeaderboardEntry,
} from './services/leaderboardService';
import {
  loadSoundMuted,
  playSoundEvent,
  saveSoundMuted,
} from './services/soundService';

export default function App() {
  // Modular Registry State
  const [enabledColorIds] = useState<string[]>(() =>
    COLOR_REGISTRY.filter((c) => c.enabledByDefault).map((c) => c.id)
  );
  const [enabledShapeIds] = useState<string[]>(() =>
    SHAPE_REGISTRY.filter((s) => s.isPlayable && s.enabledByDefault).map((s) => s.id)
  );
  const [runModeId, setRunModeId] = useState<RunModeId>('GAME');
  const [showJumpGuides] = useState<boolean>(true);

  const activeColors = useMemo(
    () => getActiveColors(enabledColorIds),
    [enabledColorIds]
  );
  const activeShapes = useMemo(
    () => getActiveShapes(enabledShapeIds),
    [enabledShapeIds]
  );
  const activeModeProfile = useMemo(
    () => getModeProfileById(runModeId),
    [runModeId]
  );
  const physics = DEFAULT_PHYSICS_CONFIG;

  // Game Loop & UI State
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');
  const [score, setScore] = useState<number>(0);
  const [speedUpFlashProgress, setSpeedUpFlashProgress] = useState<number>(0);
  const [failureDiagnostic, setFailureDiagnostic] =
    useState<FailureDiagnostic | null>(null);
  const [scoreSaved, setScoreSaved] = useState<boolean>(false);
  const [isProximityPaused, setIsProximityPaused] = useState<boolean>(false);
  const [practiceRetryMessage, setPracticeRetryMessage] = useState<
    string | null
  >(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    loadLeaderboard()
  );
  const [persistedBestScore, setPersistedBestScore] = useState<number>(() =>
    loadBestScore()
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => loadSoundMuted());
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      saveSoundMuted(next);
      return next;
    });
  }, []);

  // Initial indices (Green + Circle)
  const initialColorIdx = useMemo(() => {
    const idx = activeColors.findIndex((c) => c.id === 'green');
    return idx >= 0 ? idx : Math.floor(activeColors.length / 2);
  }, [activeColors]);

  const initialShapeIdx = useMemo(() => {
    const idx = activeShapes.findIndex((s) => s.id === 'circle');
    return idx >= 0 ? idx : Math.floor(activeShapes.length / 2);
  }, [activeShapes]);

  const [player, setPlayer] = useState<PlayerEntity>(() => ({
    colorIndex: initialColorIdx,
    shapeIndex: initialShapeIdx,
    heightAboveFloor: 0,
    velocityY: 0,
    jumpsUsed: 0,
    isGrounded: true,
    lastJumpTimeMs: 0,
    lastLandedTimeMs: 0,
    lastShiftTimeMs: 0,
  }));

  const buildInitialObstaclesForMode = useCallback(
    (
      profile: GameModeProfile,
      lockedColorId: string,
      lockedShapeId: string
    ): ObstacleEntity[] => {
      const list: ObstacleEntity[] = [];
      let prev: ObstacleEntity | null = null;
      for (let i = 1; i <= 4; i++) {
        const obs = createNextObstacle({
          sequenceNumber: i,
          previousObstacle: prev,
          obstaclesCleared: 0,
          activeColors,
          activeShapes,
          tiers: VERTICAL_TIER_REGISTRY,
          modeProfile: profile,
          physics,
          lockedColorId,
          lockedShapeId,
        });
        if (i === 1) {
          obs.x = 520;
        }
        list.push(obs);
        prev = obs;
      }
      return list;
    },
    [activeColors, activeShapes, physics]
  );

  const [obstacles, setObstacles] = useState<ObstacleEntity[]>(() => {
    const defaultCol = activeColors[initialColorIdx]?.id || activeColors[0].id;
    const defaultShp = activeShapes[initialShapeIdx]?.id || activeShapes[0].id;
    return buildInitialObstaclesForMode(
      getModeProfileById('GAME'),
      defaultCol,
      defaultShp
    );
  });
  const [effects, setEffects] = useState<GateClearEffect[]>([]);

  // Mutable refs for 60fps requestAnimationFrame loop
  const playerRef = useRef<PlayerEntity>(player);
  const obstaclesRef = useRef<ObstacleEntity[]>(obstacles);
  const effectsRef = useRef<GateClearEffect[]>(effects);
  const scoreRef = useRef<number>(score);
  const batchTargetRef = useRef<number>(5);
  const nextSeqRef = useRef<number>(5);
  const speedFlashRef = useRef<number>(0);

  playerRef.current = player;
  obstaclesRef.current = obstacles;
  effectsRef.current = effects;
  scoreRef.current = score;

  const speedInfo = useMemo(
    () => getSpeedProgression(score, activeModeProfile.difficulty),
    [score, activeModeProfile.difficulty]
  );

  const bestScore = useMemo(() => {
    const topStored = leaderboard.length > 0 ? leaderboard[0].score : 0;
    const currentGameScore = activeModeProfile.isPractice ? 0 : score;
    return Math.max(topStored, persistedBestScore, currentGameScore);
  }, [leaderboard, persistedBestScore, score, activeModeProfile.isPractice]);

  // Automatically persist any new high score for the session and browser
  useEffect(() => {
    if (bestScore > persistedBestScore) {
      const saved = saveBestScore(bestScore);
      setPersistedBestScore(saved);
    }
  }, [bestScore, persistedBestScore]);

  useEffect(() => {
    setPlayer((prev) => ({
      ...prev,
      colorIndex: Math.min(prev.colorIndex, Math.max(0, activeColors.length - 1)),
      shapeIndex: Math.min(prev.shapeIndex, Math.max(0, activeShapes.length - 1)),
    }));
  }, [activeColors.length, activeShapes.length]);

  // Launch any mode (Standard Game or one of the 4 Practice Modes)
  const launchModeRun = useCallback(
    (targetModeId: RunModeId) => {
      const profile = getModeProfileById(targetModeId);
      const cIdx = initialColorIdx;
      const sIdx = initialShapeIdx;
      const lockedColorId = activeColors[cIdx]?.id || activeColors[0].id;
      const lockedShapeId = activeShapes[sIdx]?.id || activeShapes[0].id;

      const startPlayer: PlayerEntity = {
        colorIndex: cIdx,
        shapeIndex: sIdx,
        heightAboveFloor: 0,
        velocityY: 0,
        jumpsUsed: 0,
        isGrounded: true,
        lastJumpTimeMs: 0,
        lastLandedTimeMs: 0,
        lastShiftTimeMs: 0,
      };

      const initialObs = buildInitialObstaclesForMode(
        profile,
        lockedColorId,
        lockedShapeId
      );
      nextSeqRef.current = initialObs.length + 1;
      speedFlashRef.current = 0;
      batchTargetRef.current = profile.batchObstacleTarget || 5;

      playerRef.current = startPlayer;
      obstaclesRef.current = initialObs;
      effectsRef.current = [];
      scoreRef.current = 0;

      setRunModeId(targetModeId);
      setPlayer(startPlayer);
      setObstacles(initialObs);
      setEffects([]);
      setScore(0);
      setSpeedUpFlashProgress(0);
      setFailureDiagnostic(null);
      setScoreSaved(false);
      setIsProximityPaused(false);
      setPracticeRetryMessage(null);
      setActiveModal('NONE');
      setGameState('PLAYING');
    },
    [
      activeColors,
      activeShapes,
      buildInitialObstaclesForMode,
      initialColorIdx,
      initialShapeIdx,
    ]
  );

  // Continue practicing the current Practice mode with no obstacle limit after the first 5
  const handleContinueCurrentPractice = useCallback(() => {
    const initialTarget = activeModeProfile.batchObstacleTarget || 5;
    if (scoreRef.current >= initialTarget) {
      batchTargetRef.current = Number.POSITIVE_INFINITY;
    }
    setPracticeRetryMessage(null);
    setIsProximityPaused(false);
    setGameState('PLAYING');
  }, [activeModeProfile.batchObstacleTarget]);

  const handleStartPracticeSubMode = useCallback(
    (subMode: PracticeSubModeId) => {
      const profile = getPracticeModeBySubMode(subMode);
      launchModeRun(profile.id);
    },
    [launchModeRun]
  );

  // Clamped Selector Shift Handlers (hard stop at ends, no wrap-around loop)
  const handleShiftColor = useCallback(
    (delta: number) => {
      if (!activeModeProfile.allowColorShift && gameState === 'PLAYING') {
        return;
      }
      const current = playerRef.current;
      const nextIndex = shiftClampedIndex(
        current.colorIndex,
        delta,
        activeColors.length
      );
      if (nextIndex === current.colorIndex) return;

      const nowMs = performance.now();
      const updated = {
        ...playerRef.current,
        colorIndex: nextIndex,
        lastShiftTimeMs: nowMs,
      };
      playerRef.current = updated;
      setPlayer(updated);
      playSoundEvent('SHIFT', isMutedRef.current);
    },
    [activeColors.length, activeModeProfile.allowColorShift, gameState]
  );

  const handleShiftShape = useCallback(
    (delta: number) => {
      if (!activeModeProfile.allowShapeShift && gameState === 'PLAYING') {
        return;
      }
      const current = playerRef.current;
      const nextIndex = shiftClampedIndex(
        current.shapeIndex,
        delta,
        activeShapes.length
      );
      if (nextIndex === current.shapeIndex) return;

      const nowMs = performance.now();
      const updated = {
        ...playerRef.current,
        shapeIndex: nextIndex,
        lastShiftTimeMs: nowMs,
      };
      playerRef.current = updated;
      setPlayer(updated);
      playSoundEvent('SHIFT', isMutedRef.current);
    },
    [activeShapes.length, activeModeProfile.allowShapeShift, gameState]
  );

  const handleJump = useCallback(() => {
    if (!activeModeProfile.allowJump) {
      return;
    }
    const current = playerRef.current;
    const activeShape = activeShapes[current.shapeIndex] || activeShapes[0];
    const animProfile = getShapeAnimationProfile(activeShape.id);
    const updated = triggerPlayerJump(
      current,
      physics,
      performance.now(),
      animProfile
    );
    if (updated.jumpsUsed > current.jumpsUsed) {
      playerRef.current = updated;
      setPlayer(updated);
      playSoundEvent(
        updated.jumpsUsed === 1 ? 'JUMP_SINGLE' : 'JUMP_DOUBLE',
        isMutedRef.current
      );
    }
  }, [activeModeProfile.allowJump, activeShapes, physics]);

  // Global Keyboard Controller
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (activeModal !== 'NONE') {
        if (e.code === 'Escape') {
          e.preventDefault();
          setActiveModal('NONE');
        }
        return;
      }

      // Spacebar continues practicing the same mode when Practice window is open
      if (gameState === 'PRACTICE_COMPLETE' && e.code === 'Space') {
        e.preventDefault();
        handleContinueCurrentPractice();
        return;
      }

      // Spacebar continues / resumes the game when Game Pause window is open
      if (gameState === 'PAUSED' && e.code === 'Space') {
        e.preventDefault();
        setGameState('PLAYING');
        return;
      }

      // Spacebar or Enter starts / restarts Game on Game Over (and Enter on Title Menu)
      if (
        (gameState === 'GAME_OVER' &&
          (e.code === 'Space' || e.code === 'Enter')) ||
        (gameState === 'TITLE_MENU' && e.code === 'Enter')
      ) {
        e.preventDefault();
        launchModeRun('GAME');
        return;
      }

      const action = resolveControlAction(e.code);
      if (!action) return;

      e.preventDefault();

      if (action === 'PAUSE') {
        if (activeModeProfile.isPractice) {
          if (gameState === 'PLAYING') {
            setGameState('PRACTICE_COMPLETE');
          } else if (
            gameState === 'PRACTICE_COMPLETE' ||
            gameState === 'PAUSED'
          ) {
            handleContinueCurrentPractice();
          }
        } else {
          if (gameState === 'PLAYING') {
            setGameState('PAUSED');
          } else if (gameState === 'PAUSED') {
            setGameState('PLAYING');
          }
        }
        return;
      }

      if (action === 'COLOR_LEFT') {
        handleShiftColor(-1);
        return;
      }
      if (action === 'COLOR_RIGHT') {
        handleShiftColor(1);
        return;
      }
      if (action === 'SHAPE_UP') {
        handleShiftShape(-1);
        return;
      }
      if (action === 'SHAPE_DOWN') {
        handleShiftShape(1);
        return;
      }

      if (action === 'JUMP' && gameState === 'PLAYING' && !e.repeat) {
        handleJump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeModal,
    activeModeProfile.isPractice,
    gameState,
    handleContinueCurrentPractice,
    handleJump,
    handleShiftColor,
    handleShiftShape,
    launchModeRun,
  ]);

  // Main 60fps Game & Practice Loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || activeModal !== 'NONE') {
      return;
    }

    let animationFrameId: number;
    let lastTimeMs = performance.now();

    const stepFrame = (nowMs: number) => {
      const rawDt = (nowMs - lastTimeMs) / 1000;
      lastTimeMs = nowMs;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      // 1. Step Player Jump Physics & Landing Detection
      const nextPlayer = stepPlayerPhysics(
        playerRef.current,
        physics,
        dt,
        nowMs
      );
      playerRef.current = nextPlayer;

      const currentPlayerColor =
        activeColors[nextPlayer.colorIndex] || activeColors[0];
      const currentPlayerShape =
        activeShapes[nextPlayer.shapeIndex] || activeShapes[0];

      // 2. Compute Current Scroll Speed
      const currentScore = scoreRef.current;
      const { speedPxPerSec } = getSpeedProgression(
        currentScore,
        activeModeProfile.difficulty
      );

      // 3. Check Full Practice Proximity Threshold Stop Condition
      let effectiveScrollSpeed = speedPxPerSec;
      let waitingAtThreshold = false;

      if (activeModeProfile.stopAtProximityUntilMatched) {
        const frontObs = obstaclesRef.current.find((o) => !o.cleared);
        if (frontObs && !frontObs.proximityUnlocked) {
          const stopX = physics.playerX + activeModeProfile.proximityStopOffsetPx;
          const nextX = frontObs.x - speedPxPerSec * dt;

          const colorMatches = currentPlayerColor.id === frontObs.colorId;
          const shapeMatches = currentPlayerShape.id === frontObs.shapeId;

          if (nextX <= stopX) {
            if (colorMatches && shapeMatches) {
              // Both matched! Unlock the obstacle so it continues scrolling and player can jump
              frontObs.proximityUnlocked = true;
              waitingAtThreshold = false;
            } else {
              // Clamp obstacle at the proximity threshold and pause horizontal wall movement
              frontObs.x = stopX;
              effectiveScrollSpeed = 0;
              waitingAtThreshold = true;
            }
          }
        }
      }

      setIsProximityPaused(waitingAtThreshold);

      // 4. Move Obstacles & Evaluate Collisions / Gate Matches
      let updatedScore = currentScore;
      let triggeredFailure: FailureDiagnostic | null = null;
      let rewoundForPracticeRetry = false;
      const nextEffects: GateClearEffect[] = [];

      const movedObstacles = obstaclesRef.current.map((obs) => {
        const nextObs: ObstacleEntity = {
          ...obs,
          x: obs.x - effectiveScrollSpeed * dt,
        };

        if (!nextObs.cleared && !triggeredFailure && !rewoundForPracticeRetry) {
          const evalResult = evaluatePlayerObstacleInteraction({
            player: nextPlayer,
            obstacle: nextObs,
            activeColors,
            activeShapes,
            physics,
          });

          if (evalResult.status === 'CLEARED') {
            nextObs.cleared = true;
            updatedScore += 1;
            setPracticeRetryMessage(null);

            const tier = getTierById(nextObs.tierId);
            const color = getColorById(nextObs.colorId);
            nextEffects.push({
              id: `fx-${nextObs.id}-${nowMs}`,
              x: nextObs.x + nextObs.width / 2,
              y: physics.corridorHeight - tier.targetCenterHeightAboveFloor,
              colorHex: color.hex,
              shapeId: nextObs.shapeId,
              progress: 0,
            });

            if (
              !activeModeProfile.isPractice &&
              updatedScore % activeModeProfile.difficulty.obstaclesPerSpeedStep === 0
            ) {
              speedFlashRef.current = 0.01;
            }
          } else if (evalResult.status === 'FAILED' && evalResult.diagnostic) {
            if (activeModeProfile.forgivingRetryOnFail) {
              // Non-punitive Practice Retry: rewind all obstacles back by 340px so player can retry cleanly
              rewoundForPracticeRetry = true;
              setPracticeRetryMessage(
                `Try Again · ${evalResult.diagnostic.headline}: ${evalResult.diagnostic.detail}`
              );
            } else {
              triggeredFailure = evalResult.diagnostic;
            }
          }
        }

        return nextObs;
      });

      let finalObstacles = movedObstacles;
      if (rewoundForPracticeRetry) {
        const frontUncleared = movedObstacles.find((o) => !o.cleared);
        const shiftRightPx = frontUncleared
          ? Math.max(320, 500 - frontUncleared.x)
          : 340;

        finalObstacles = movedObstacles.map((o) =>
          o.cleared
            ? o
            : {
                ...o,
                x: o.x + shiftRightPx,
                proximityUnlocked: false,
              }
        );

        // Reset player cleanly onto corridor floor for retry
        const resetPlayer: PlayerEntity = {
          ...nextPlayer,
          heightAboveFloor: 0,
          velocityY: 0,
          jumpsUsed: 0,
          isGrounded: true,
          lastLandedTimeMs: nowMs,
        };
        playerRef.current = resetPlayer;
        setPlayer(resetPlayer);
      }

      // 5. Prune off-screen obstacles and spawn new ones according to activeModeProfile
      const visibleObstacles = finalObstacles.filter(
        (obs) => obs.x + obs.width > -80
      );

      while (visibleObstacles.length < 5) {
        const lastObs =
          visibleObstacles.length > 0
            ? visibleObstacles[visibleObstacles.length - 1]
            : null;
        const spawned = createNextObstacle({
          sequenceNumber: nextSeqRef.current++,
          previousObstacle: lastObs,
          obstaclesCleared: updatedScore,
          activeColors,
          activeShapes,
          tiers: VERTICAL_TIER_REGISTRY,
          modeProfile: activeModeProfile,
          physics,
          lockedColorId: currentPlayerColor.id,
          lockedShapeId: currentPlayerShape.id,
        });
        visibleObstacles.push(spawned);
      }

      // 6. Advance Visual Effects
      const steppedEffects = [
        ...effectsRef.current
          .map((fx) => ({
            ...fx,
            x: fx.x - effectiveScrollSpeed * dt * 0.35,
            progress: fx.progress + dt * 2.4,
          }))
          .filter((fx) => fx.progress < 1),
        ...nextEffects,
      ];

      if (speedFlashRef.current > 0) {
        speedFlashRef.current = Math.min(1, speedFlashRef.current + dt * 1.6);
        if (speedFlashRef.current >= 1) {
          speedFlashRef.current = 0;
        }
        setSpeedUpFlashProgress(speedFlashRef.current);
      }

      obstaclesRef.current = visibleObstacles;
      effectsRef.current = steppedEffects;

      if (!rewoundForPracticeRetry) {
        setPlayer(nextPlayer);
      }
      setObstacles(visibleObstacles);
      setEffects(steppedEffects);

      if (updatedScore !== currentScore) {
        scoreRef.current = updatedScore;
        setScore(updatedScore);

        // Check if Practice Batch Target (e.g., 5 obstacles) is reached
        if (
          activeModeProfile.isPractice &&
          activeModeProfile.batchObstacleTarget &&
          updatedScore >= batchTargetRef.current
        ) {
          setGameState('PRACTICE_COMPLETE');
          return;
        }
      }

      if (triggeredFailure) {
        playSoundEvent('GAME_OVER', isMutedRef.current);
        setFailureDiagnostic(triggeredFailure);
        setGameState('GAME_OVER');
        return;
      }

      animationFrameId = requestAnimationFrame(stepFrame);
    };

    animationFrameId = requestAnimationFrame(stepFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    activeColors,
    activeModal,
    activeModeProfile,
    activeShapes,
    gameState,
    physics,
  ]);

  const handleSaveScore = (playerName: string) => {
    const updated = saveLeaderboardEntry({
      playerName,
      score,
      obstaclesCleared: score,
      speedLevelReached: speedInfo.speedLevel,
      modeId: 'Game',
    });
    setLeaderboard(updated);
    setPersistedBestScore(loadBestScore());
    setScoreSaved(true);
  };

  const handleClearLeaderboard = () => {
    setLeaderboard(clearLeaderboard());
    setPersistedBestScore(0);
  };

  const activeColor = activeColors[player.colorIndex] || activeColors[0];
  const isColorCarouselDisabled =
    gameState === 'PLAYING' && !activeModeProfile.allowColorShift;
  const isShapeCarouselDisabled =
    gameState === 'PLAYING' && !activeModeProfile.allowShapeShift;

  return (
    <div className="min-h-screen flex flex-col bg-[#06080E] text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <TopBar
        gameState={gameState}
        activeModal={activeModal}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSelectModal={(modal) => {
          if (modal !== 'NONE' && gameState === 'PLAYING') {
            setGameState(
              activeModeProfile.isPractice ? 'PRACTICE_COMPLETE' : 'PAUSED'
            );
          }
          setActiveModal(modal);
        }}
        onPrimaryAction={() => {
          if (gameState === 'PAUSED') {
            setActiveModal('NONE');
            setGameState('PLAYING');
          } else if (gameState === 'PRACTICE_COMPLETE') {
            setActiveModal('NONE');
            handleContinueCurrentPractice();
          } else {
            launchModeRun('GAME');
          }
        }}
      />

      {/* Main Arena Stage */}
      <main
        id="arena"
        className="flex-1 flex flex-col items-center justify-center px-8 py-6 max-w-[1360px] w-full mx-auto"
      >
        {/* Top HUD Strip: Score on Left, Centered Color Carousel in Middle, Best Score on Right */}
        <div className="w-full max-w-[1008px] grid grid-cols-3 items-center mb-6">
          {/* Score Readout with Inner Facet */}
          <div className="flex items-center justify-start">
            <div className="relative overflow-hidden rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] px-6 py-2.5 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[3px] left-[3px] right-[7px] bottom-[7px] rounded-xl bg-[#1E293B]/65 border border-white/10"
              />
              <div className="relative z-10 flex items-baseline gap-3">
                <span className="text-2xl font-bold font-display text-slate-200 tracking-wider">
                  Score
                </span>
                <span className="text-3xl font-bold font-mono-tabular text-emerald-400 whitespace-nowrap">
                  {score}
                </span>
              </div>
            </div>
          </div>

          {/* Centered Horizontal Color Carousel */}
          <div className="flex justify-center">
            <ColorCarousel
              colors={activeColors}
              selectedIndex={player.colorIndex}
              disabled={isColorCarouselDisabled}
              onShiftColor={handleShiftColor}
              onSelectDirectIndex={(idx) => {
                if (idx === playerRef.current.colorIndex) return;
                const nowMs = performance.now();
                const updated = {
                  ...playerRef.current,
                  colorIndex: idx,
                  lastShiftTimeMs: nowMs,
                };
                playerRef.current = updated;
                setPlayer(updated);
                playSoundEvent('SHIFT', isMutedRef.current);
              }}
            />
          </div>

          {/* Best Score Readout with Inner Facet (Right of Color Carousel) */}
          <div className="flex items-center justify-end">
            <div className="relative overflow-hidden rounded-2xl bg-[#0B0F1A] border-2 border-[#384766] px-6 py-2.5 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.8)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[3px] left-[3px] right-[7px] bottom-[7px] rounded-xl bg-[#1E293B]/65 border border-white/10"
              />
              <div className="relative z-10 flex items-baseline gap-3">
                <span className="text-2xl font-bold font-display text-slate-200 tracking-wider">
                  Best
                </span>
                <span className="text-3xl font-bold font-mono-tabular text-emerald-400 whitespace-nowrap">
                  {bestScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Play Area: Left Vertical Shape Carousel + Corridor Viewport */}
        <div className="flex items-center justify-center gap-7 w-full">
          {/* Left Vertical Shape Selector (All shapes rendered in user's selected color) */}
          <ShapeCarousel
            shapes={activeShapes}
            selectedIndex={player.shapeIndex}
            activeColor={activeColor}
            disabled={isShapeCarouselDisabled}
            onShiftShape={handleShiftShape}
            onSelectDirectIndex={(idx) => {
              if (idx === playerRef.current.shapeIndex) return;
              const nowMs = performance.now();
              const updated = {
                ...playerRef.current,
                shapeIndex: idx,
                lastShiftTimeMs: nowMs,
              };
              playerRef.current = updated;
              setPlayer(updated);
              playSoundEvent('SHIFT', isMutedRef.current);
            }}
          />

          {/* Fixed-Camera Horizontal Corridor & State Overlays */}
          <div className="relative">
            <GameArenaCanvas
              gameState={gameState}
              modeProfile={activeModeProfile}
              player={player}
              obstacles={obstacles}
              effects={effects}
              activeColors={activeColors}
              activeShapes={activeShapes}
              physics={physics}
              currentSpeedPxPerSec={speedInfo.speedPxPerSec}
              speedUpFlashProgress={speedUpFlashProgress}
              failureDiagnostic={failureDiagnostic}
              showJumpGuides={showJumpGuides}
              isProximityPaused={isProximityPaused}
              practiceRetryMessage={practiceRetryMessage}
            />

            <ArenaOverlays
              gameState={gameState}
              activeModeProfile={activeModeProfile}
              score={score}
              bestScore={bestScore}
              speedLevel={speedInfo.speedLevel}
              failureDiagnostic={failureDiagnostic}
              defaultPlayerName={getLastPlayerName()}
              scoreSaved={scoreSaved}
              onStartStandardGame={() => launchModeRun('GAME')}
              onOpenPracticeMenu={() => {
                const defaultPlayer: PlayerEntity = {
                  colorIndex: initialColorIdx,
                  shapeIndex: initialShapeIdx,
                  heightAboveFloor: 0,
                  velocityY: 0,
                  jumpsUsed: 0,
                  isGrounded: true,
                  lastJumpTimeMs: 0,
                  lastLandedTimeMs: 0,
                  lastShiftTimeMs: 0,
                };
                playerRef.current = defaultPlayer;
                setPlayer(defaultPlayer);
                setPracticeRetryMessage(null);
                setIsProximityPaused(false);
                setGameState('PRACTICE_MENU');
              }}
              onStartPracticeSubMode={handleStartPracticeSubMode}
              onContinueCurrentPractice={handleContinueCurrentPractice}
              onReturnToMainMenu={() => {
                const defaultPlayer: PlayerEntity = {
                  colorIndex: initialColorIdx,
                  shapeIndex: initialShapeIdx,
                  heightAboveFloor: 0,
                  velocityY: 0,
                  jumpsUsed: 0,
                  isGrounded: true,
                  lastJumpTimeMs: 0,
                  lastLandedTimeMs: 0,
                  lastShiftTimeMs: 0,
                };
                playerRef.current = defaultPlayer;
                setPlayer(defaultPlayer);
                setPracticeRetryMessage(null);
                setIsProximityPaused(false);
                setGameState('TITLE_MENU');
              }}
              onResumeGame={() => setGameState('PLAYING')}
              onSaveScore={handleSaveScore}
              onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeModal === 'HOW_TO_PLAY' && (
        <HowToPlayModal
          onClose={() => setActiveModal('NONE')}
          onStartGame={() => launchModeRun('GAME')}
        />
      )}

      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal
          entries={leaderboard}
          onClearLeaderboard={handleClearLeaderboard}
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </div>
  );
}
