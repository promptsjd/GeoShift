import React from 'react';
import { LeaderboardEntry } from '../config/types';

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-xs p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-display">
              High-Score Leaderboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top 10 local runs saved in browser storage
            </p>
          </div>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={onClearLeaderboard}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Clear Scores
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Close
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-base font-medium text-slate-300">
              No recorded runs yet
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Complete a run in the GeoShift corridor to record your first high score.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Speed Tier</th>
                  <th className="py-3 pl-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {entries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4 font-mono-tabular font-semibold text-slate-300">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      {entry.playerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 capitalize">
                      {entry.modeId}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-300">
                      Level {entry.speedLevelReached}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono-tabular font-bold text-emerald-400">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
