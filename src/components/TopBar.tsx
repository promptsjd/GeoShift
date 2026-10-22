import React from 'react';
import { GameState } from '../config/types';

export type ActiveModal = 'NONE' | 'HOW_TO_PLAY' | 'LEADERBOARD';

interface TopBarProps {
  gameState: GameState;
  activeModal: ActiveModal;
  onSelectModal: (modal: ActiveModal) => void;
  onPrimaryAction: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  activeModal,
  onSelectModal,
  onPrimaryAction,
}) => {
  const primaryLabel =
    gameState === 'PLAYING'
      ? 'Restart Run'
      : gameState === 'PAUSED'
      ? 'Resume Run'
      : 'Start Game';

  return (
    <header className="flex items-center justify-between gap-8 px-8 py-4 border-b border-slate-800/80 bg-[#07080D]">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#arena"
        onClick={(e) => {
          e.preventDefault();
          onSelectModal('NONE');
        }}
        className="text-xl font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 font-display focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        GeoShift
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onSelectModal('NONE')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
            activeModal === 'NONE'
              ? 'text-slate-100 border-sky-400'
              : 'border-transparent'
          }`}
        >
          Arena
        </button>
        <button
          type="button"
          onClick={() =>
            onSelectModal(activeModal === 'HOW_TO_PLAY' ? 'NONE' : 'HOW_TO_PLAY')
          }
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
            activeModal === 'HOW_TO_PLAY'
              ? 'text-slate-100 border-sky-400'
              : 'border-transparent'
          }`}
        >
          Rules & Controls
        </button>
        <button
          type="button"
          onClick={() =>
            onSelectModal(activeModal === 'LEADERBOARD' ? 'NONE' : 'LEADERBOARD')
          }
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
            activeModal === 'LEADERBOARD'
              ? 'text-slate-100 border-sky-400'
              : 'border-transparent'
          }`}
        >
          Leaderboard
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-slate-100 rounded-lg hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400"
        >
          {primaryLabel}
        </button>
      </div>
    </header>
  );
};
