
import React, { useMemo } from 'react';
import { TurnLog } from '../types';
import { X, Receipt, Sparkles, Skull, ArrowRight } from 'lucide-react';

interface ProfileModalProps {
  userId: string;
  userName: string;
  log: TurnLog[];
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ userId, userName, log, onClose }) => {
  const analytics = useMemo(() => {
    if (log.length === 0) return null;
    const sortedByKarma = [...log].sort((a, b) => b.karmaDelta - a.karmaDelta);
    return {
      virtuous: sortedByKarma[0],
      darkest: sortedByKarma[sortedByKarma.length - 1]
    };
  }, [log]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-8">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full">
              <Receipt className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-syncopate tracking-tight">GAME SUMMARY</h2>
            <p className="text-xs text-zinc-600 font-mono uppercase tracking-[0.3em]">Player: {userName}</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl relative overflow-hidden group">
              <Sparkles className="absolute -top-1 -right-1 w-12 h-12 text-yellow-500/10 group-hover:scale-125 transition-transform" />
              <h4 className="text-[10px] font-bold text-yellow-500 uppercase mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Best Choice
              </h4>
              <p className="text-sm text-zinc-200 italic mb-2">
                {analytics?.virtuous ? `"${analytics.virtuous.dilemma}"` : "No virtuous acts recorded yet."}
              </p>
              {analytics?.virtuous && (
                <div className="flex items-center gap-2 text-xs text-yellow-500/70 font-mono">
                  <ArrowRight className="w-3 h-3" /> {analytics.virtuous.response}
                </div>
              )}
            </div>

            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative overflow-hidden group">
              <Skull className="absolute -top-1 -right-1 w-12 h-12 text-emerald-500/10 group-hover:scale-125 transition-transform" />
              <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-2 flex items-center gap-2">
                <Skull className="w-3 h-3" /> Worst Choice
              </h4>
              <p className="text-sm text-zinc-200 italic mb-2">
                {analytics?.darkest ? `"${analytics.darkest.dilemma}"` : "No mistakes made yet."}
              </p>
              {analytics?.darkest && (
                <div className="flex items-center gap-2 text-xs text-emerald-500/70 font-mono">
                  <ArrowRight className="w-3 h-3" /> {analytics.darkest.response}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-zinc-900 text-zinc-400 font-syncopate text-xs font-bold tracking-widest rounded-xl hover:text-white transition-all"
            >
              CLOSE SUMMARY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
