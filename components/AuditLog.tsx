
import React from 'react';
import { TurnLog } from '../types';
import { ScrollText, MoveUp, MoveDown, Minus } from 'lucide-react';

interface AuditLogProps {
  history: TurnLog[];
}

const AuditLog: React.FC<AuditLogProps> = ({ history }) => {
  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 font-syncopate text-xs tracking-widest border-b border-zinc-900 pb-2">
        <ScrollText className="w-4 h-4" />
        GAME HISTORY
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-700 text-sm text-center px-4 italic">
            Make a move to start your journey...
          </div>
        ) : (
          [...history].reverse().map((turn, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-xl border-l-4 bg-zinc-900/50 backdrop-blur-sm transition-all animate-in slide-in-from-right-4
                ${turn.movement > 0 ? 'border-yellow-500' : turn.movement < 0 ? 'border-emerald-500' : 'border-zinc-700'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-zinc-500">TURN {turn.turnNumber}</span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase
                  ${turn.movement > 0 ? 'bg-yellow-500/10 text-yellow-500' : turn.movement < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}
                `}>
                  {turn.movement > 0 ? <MoveUp className="w-3 h-3" /> : turn.movement < 0 ? <MoveDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {turn.movement === 0 ? 'No Move' : `${Math.abs(turn.movement)} Spaces`}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mb-2 line-clamp-2 italic">"{turn.dilemma}"</p>
              <p className="text-[10px] text-zinc-500 font-medium">Feedback: <span className="text-zinc-400">{turn.feedback}</span></p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500">CHANGE: <span className={turn.karmaDelta > 0 ? 'text-yellow-500' : 'text-emerald-500'}>{turn.karmaDelta > 0 ? '+' : ''}{turn.karmaDelta} Karma</span></span>
                <span className="text-[10px] font-mono text-zinc-600">TILE {turn.tile}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLog;
