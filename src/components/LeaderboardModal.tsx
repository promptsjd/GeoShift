import React, { useState } from 'react';
import { getModeProfileById } from '../config/difficultyConfig';
import { CompetitiveModeId, LeaderboardEntry } from '../config/types';
import { normalizeCompetitiveModeId } from '../services/leaderboardService';
import { FacetedButton, FacetedWindow } from './TactileUI';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  initialTab?: CompetitiveModeId;
  onClearLeaderboard: (modeId: CompetitiveModeId) => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  initialTab = 'GAME',
  onClearLeaderboard,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<CompetitiveModeId>(initialTab);

  const runProfile = getModeProfileById('GAME');
  const jumpProfile = getModeProfileById('JUMP_MATCH');

  const filteredEntries = entries.filter(
    (entry) => normalizeCompetitiveModeId(entry.modeId) === selectedTab
  );

  const activeProfile = selectedTab === 'JUMP_MATCH' ? jumpProfile : runProfile;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/84 backdrop-blur-xs p-6">
      <FacetedWindow maxWidthClass="max-w-2xl">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <h2 className="text-4xl font-bold text-white font-display tracking-wider">
              High-Score Leaderboard
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Top 10 local runs saved in browser storage for each game mode
            </p>
          </div>
          <div className="flex items-center gap-3">
            {filteredEntries.length > 0 && (
              <FacetedButton
                variant="crimson"
                size="sm"
                onClick={() => onClearLeaderboard(selectedTab)}
                className="text-base font-bold whitespace-nowrap shrink-0"
              >
                Clear {activeProfile.shortLabel}
              </FacetedButton>
            )}
            <FacetedButton
              variant="emerald"
              size="sm"
              onClick={onClose}
              className="text-base font-bold whitespace-nowrap shrink-0"
            >
              Close
            </FacetedButton>
          </div>
        </div>

        {/* Mode Switcher Tabs: Run Mode vs Jump Mode */}
        <div className="grid grid-cols-2 gap-3 mt-4 p-1.5 rounded-xl bg-[#0B0F1A] border border-[#384766]">
          <button
            type="button"
            onClick={() => setSelectedTab('GAME')}
            className={`px-4 py-2.5 rounded-lg font-display transition-colors cursor-pointer text-left flex flex-col ${
              selectedTab === 'GAME'
                ? 'bg-[#166E3D] border-2 border-[#4ADE80] text-white shadow-sm'
                : 'bg-transparent border-2 border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-bold tracking-wider whitespace-nowrap">
                {runProfile.name}
              </span>
              <span className="text-xs font-mono-tabular opacity-90 whitespace-nowrap">
                {
                  entries.filter(
                    (e) => normalizeCompetitiveModeId(e.modeId) === 'GAME'
                  ).length
                }{' '}
                Saved
              </span>
            </div>
            <span className="text-xs text-white/80 tracking-wide mt-0.5 whitespace-nowrap truncate">
              {runProfile.menuSubtitle}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('JUMP_MATCH')}
            className={`px-4 py-2.5 rounded-lg font-display transition-colors cursor-pointer text-left flex flex-col ${
              selectedTab === 'JUMP_MATCH'
                ? 'bg-[#0284C7] border-2 border-[#7DD3FC] text-white shadow-sm'
                : 'bg-transparent border-2 border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-bold tracking-wider whitespace-nowrap">
                {jumpProfile.name}
              </span>
              <span className="text-xs font-mono-tabular opacity-90 whitespace-nowrap">
                {
                  entries.filter(
                    (e) => normalizeCompetitiveModeId(e.modeId) === 'JUMP_MATCH'
                  ).length
                }{' '}
                Saved
              </span>
            </div>
            <span className="text-xs text-white/80 tracking-wide mt-0.5 whitespace-nowrap truncate">
              {jumpProfile.menuSubtitle}
            </span>
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-2xl font-bold font-display tracking-wide text-white">
              No Recorded {activeProfile.name} Runs Yet
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Complete a run in {activeProfile.name} to record your first high score here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-base font-bold font-display tracking-wider text-slate-300">
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">
                    {selectedTab === 'JUMP_MATCH' ? 'Pace Tier' : 'Speed Tier'}
                  </th>
                  <th className="py-3 pl-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="py-3.5 pr-4 font-mono-tabular font-bold text-slate-300">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-display text-lg tracking-wide text-white">
                      {entry.playerName}
                    </td>
                    <td className="py-3.5 px-4 font-display text-base text-slate-300">
                      {activeProfile.name}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-200">
                      Level {entry.speedLevelReached}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono-tabular text-lg font-bold text-emerald-400">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FacetedWindow>
    </div>
  );
};
