
import React, { useState, useEffect } from 'react';
import { Dilemma } from '../types';
import { X, Send, Users, ChevronRight, Loader2 } from 'lucide-react';
import { COLLEAGUES, CORPORATE_SPEAK } from '../constants';

interface DilemmaModalProps {
  dilemma: Dilemma | null;
  isLoading: boolean;
  isEvaluating: boolean;
  onClose: () => void;
  onSubmit: (response: string, usedLifeline: boolean) => void;
  hasLifeline: boolean;
}

const DilemmaModal: React.FC<DilemmaModalProps> = ({ dilemma, isLoading, isEvaluating, onClose, onSubmit, hasLifeline }) => {
  const [input, setInput] = useState('');
  const [showColleagues, setShowColleagues] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);

  const handleTagColleague = (name: string) => {
    const speak = CORPORATE_SPEAK[Math.floor(Math.random() * CORPORATE_SPEAK.length)];
    setInput(`${name}, ${speak}`);
    setSelectedColleague(name);
    setShowColleagues(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl min-h-[400px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 transition-all">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading || isEvaluating ? 'bg-cyan-500 animate-spin' : 'bg-yellow-500 animate-pulse'}`} />
            <h3 className="font-syncopate text-xs tracking-[0.2em] font-bold">YOUR CHOICE</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            <p className="font-syncopate text-[10px] tracking-widest text-zinc-500 uppercase animate-pulse">Thinking of a dilemma...</p>
          </div>
        ) : dilemma ? (
          <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Scenario</span>
              <p className="text-xl text-zinc-100 font-medium leading-relaxed">
                {dilemma.scenario}
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900/50 p-4 rounded-xl">
              <p className="text-sm text-zinc-500 italic">
                Context: {dilemma.context}
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isEvaluating}
                placeholder="What would you do? Type your response..."
                className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-zinc-200 focus:outline-none focus:border-yellow-500 transition-colors resize-none placeholder:text-zinc-700 disabled:opacity-50"
              />
              
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {hasLifeline ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowColleagues(!showColleagues)}
                      disabled={isEvaluating}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                    >
                      <Users className="w-4 h-4" />
                      TAG A COLLEAGUE
                    </button>
                    {showColleagues && (
                      <div className="absolute bottom-full mb-2 left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2">
                        {COLLEAGUES.map(c => (
                          <button
                            key={c}
                            onClick={() => handleTagColleague(c)}
                            className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors flex justify-between items-center"
                          >
                            {c}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">Lifeline Used</span>
                )}

                <button
                  disabled={!input.trim() || isEvaluating}
                  onClick={() => onSubmit(input, !!selectedColleague)}
                  className="px-8 py-3 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isEvaluating ? 'EVALUATING...' : 'SUBMIT CHOICE'}
                  <Send className={`w-4 h-4 ${isEvaluating ? '' : 'group-hover:translate-x-1'} transition-transform`} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-zinc-500 italic">Something went wrong. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DilemmaModal;
