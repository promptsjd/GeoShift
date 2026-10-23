import React from 'react';
import { GameState } from '../config/types';
import { FacetedButton } from './TactileUI';

export type ActiveModal = 'NONE' | 'HOW_TO_PLAY' | 'LEADERBOARD';

interface TopBarProps {
  gameState: GameState;
  activeModal: ActiveModal;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectModal: (modal: ActiveModal) => void;
  onPrimaryAction: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  activeModal,
  isMuted,
  onToggleMute,
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
    <header className="flex items-center justify-between gap-8 px-8 py-3.5 border-b-2 border-[#28334A] bg-[#0B0F1A]">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#arena"
        onClick={(e) => {
          e.preventDefault();
          onSelectModal('NONE');
        }}
        className="text-3xl font-bold tracking-wider text-white whitespace-nowrap shrink-0 font-display focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        GeoShift
      </a>

      {/* Zone 2: Clean single-line text navigation links in Barlow Condensed */}
      <nav className="flex items-center gap-8 text-lg font-bold font-display tracking-wide text-slate-300">
        <button
          type="button"
          onClick={() => onSelectModal('NONE')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
            activeModal === 'NONE'
              ? 'text-white border-sky-400'
              : 'border-transparent text-slate-400'
          }`}
        >
          Arena
        </button>
        <button
          type="button"
          onClick={() =>
            onSelectModal(activeModal === 'HOW_TO_PLAY' ? 'NONE' : 'HOW_TO_PLAY')
          }
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
            activeModal === 'HOW_TO_PLAY'
              ? 'text-white border-sky-400'
              : 'border-transparent text-slate-400'
          }`}
        >
          Rules & Controls
        </button>
        <button
          type="button"
          onClick={() =>
            onSelectModal(activeModal === 'LEADERBOARD' ? 'NONE' : 'LEADERBOARD')
          }
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 ${
            activeModal === 'LEADERBOARD'
              ? 'text-white border-sky-400'
              : 'border-transparent text-slate-400'
          }`}
        >
          Leaderboard
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={!isMuted}
          aria-label={isMuted ? 'Unmute game sound' : 'Mute game sound'}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b-2 border-transparent ${
            isMuted ? 'text-slate-500' : 'text-emerald-400'
          }`}
        >
          {isMuted ? 'Sound: Off' : 'Sound: On'}
        </button>
      </nav>

      {/* Zone 3: 1 primary action with inner facet */}
      <div className="flex items-center gap-3 shrink-0">
        <FacetedButton
          variant="emerald"
          size="sm"
          onClick={onPrimaryAction}
          className="text-base font-bold whitespace-nowrap shrink-0"
        >
          {primaryLabel}
        </FacetedButton>
      </div>
    </header>
  );
};
