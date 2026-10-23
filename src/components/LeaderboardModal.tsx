import React from 'react';
import { LeaderboardEntry } from '../config/types';
import { FacetedButton, FacetedWindow } from './TactileUI';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClearLeaderboard: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  onClearLeaderboard,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/84 backdrop-blur-xs p-6">
      <FacetedWindow maxWidthClass="max-w-2xl">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <h2 className="text-4xl font-bold text-white font-display tracking-wider">
              High-Score Leaderboard
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Top 10 local runs saved in browser storage
            </p>
          </div>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <FacetedButton
                variant="crimson"
                size="sm"
                onClick={onClearLeaderboard}
                className="text-base font-bold whitespace-nowrap shrink-0"
              >
                Clear Scores
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

        {entries.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-2xl font-bold font-display tracking-wide text-white">
              No Recorded Runs Yet
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Complete a run in the GeoShift corridor to record your first high score.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-base font-bold font-display tracking-wider text-slate-300">
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Speed Tier</th>
                  <th className="py-3 pl-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {entries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="py-3.5 pr-4 font-mono-tabular font-bold text-slate-300">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-display text-lg tracking-wide text-white">
                      {entry.playerName}
                    </td>
                    <td className="py-3.5 px-4 font-display text-base text-slate-300 capitalize">
                      {entry.modeId}
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
