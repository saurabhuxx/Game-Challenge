import React from 'react';
import { TurnLog } from '../types';
import { ScrollText, MoveUp, MoveDown, Minus, Quote } from 'lucide-react';

interface AuditLogProps {
  history: TurnLog[];
}

const AuditLog: React.FC<AuditLogProps> = ({ history }) => {
  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 font-syncopate text-xs tracking-widest border-b border-zinc-900 pb-2">
        <ScrollText className="w-4 h-4" aria-hidden="true" />
        JOURNEY LOG
      </div>
      
      <ul className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar" aria-label="Journey log entries">
        {history.length === 0 ? (
          <li className="h-full flex items-center justify-center text-zinc-600 text-sm text-center px-4 italic">
            Your footprints will appear here...
          </li>
        ) : (
          [...history].reverse().map((turn, idx) => (
            <li 
              key={idx}
              className={`p-4 rounded-2xl border-l-4 bg-zinc-900/30 backdrop-blur-sm transition-all animate-in slide-in-from-right-4
                ${turn.karmaDelta > 0 ? 'border-yellow-500' : turn.karmaDelta < 0 ? 'border-red-500' : 'border-zinc-700'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Turn {turn.turnNumber}</span>
                <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-syncopate
                  ${turn.movement > 0 ? 'bg-yellow-500/10 text-yellow-500' : turn.movement < 0 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-300'}
                `}>
                  {turn.movement > 0 ? <MoveUp className="w-3 h-3" aria-hidden="true" /> : turn.movement < 0 ? <MoveDown className="w-3 h-3" aria-hidden="true" /> : <Minus className="w-3 h-3" aria-hidden="true" />}
                  {turn.movement === 0 ? 'Stay' : `${Math.abs(turn.movement)} steps`}
                </span>
              </div>
              <p className="text-xs text-zinc-200 mb-2 line-clamp-2 italic leading-relaxed">"{turn.dilemma}"</p>
              
              {turn.gitaVerse && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-start gap-2">
                  <Quote className="w-3 h-3 text-yellow-500/40 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[10px] text-zinc-400 italic line-clamp-2 leading-tight">
                    {turn.gitaVerse}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-zinc-800/50 pt-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase font-syncopate tracking-widest">
                  Points: <span className={turn.karmaDelta > 0 ? 'text-yellow-500' : 'text-red-500'}>{turn.karmaDelta > 0 ? '+' : ''}{turn.karmaDelta}</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-400 font-bold">TILE {turn.tile}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AuditLog;