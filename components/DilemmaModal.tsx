import React, { useState, useEffect, useRef } from 'react';
import { Dilemma, KarmicEvaluation } from '../types';
import { X, Send, Users, ChevronRight, Loader2, ShieldCheck, Star, ArrowRightCircle, Sparkles, Quote } from 'lucide-react';
import { COLLEAGUES, CORPORATE_SPEAK } from '../constants';

interface DilemmaModalProps {
  dilemma: Dilemma | null;
  isLoading: boolean;
  isEvaluating: boolean;
  evaluation: KarmicEvaluation | null;
  gitaImageUrl: string | null;
  isImageLoading: boolean;
  typedFeedback?: string;
  onClose: () => void;
  onSubmit: (response: string, usedLifeline: boolean) => void;
  onContinue: () => void;
  hasLifeline: boolean;
}

const DilemmaModal: React.FC<DilemmaModalProps> = ({ 
  dilemma, isLoading, isEvaluating, evaluation, gitaImageUrl, isImageLoading, typedFeedback, onClose, onSubmit, onContinue, hasLifeline 
}) => {
  const [input, setInput] = useState('');
  const [showColleagues, setShowColleagues] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Focus management
  useEffect(() => {
    if (!isLoading && !evaluation && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isLoading, evaluation]);

  const handleTagColleague = (name: string) => {
    const speak = CORPORATE_SPEAK[Math.floor(Math.random() * CORPORATE_SPEAK.length)];
    setInput(`${name}, ${speak}`);
    setSelectedColleague(name);
    setShowColleagues(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter' && input.trim() && !isEvaluating) {
      onSubmit(input, !!selectedColleague);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dilemma-title"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] w-full max-w-2xl my-auto overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 transition-all">
        <header className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading || isEvaluating ? 'bg-cyan-500 animate-spin' : 'bg-yellow-500 animate-pulse'}`} aria-hidden="true" />
            <h3 id="dilemma-title" className="font-syncopate text-[10px] tracking-[0.2em] font-bold uppercase text-zinc-400">
              {evaluation ? 'SOUL REFLECTION' : 'A MOMENT OF CHOICE'}
            </h3>
          </div>
          {!evaluation && (
            <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors" aria-label="Close choice modal">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-12">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" aria-hidden="true" />
            <p className="font-syncopate text-[10px] tracking-widest text-zinc-500 uppercase animate-pulse text-center">Weaving the threads of destiny...</p>
          </div>
        ) : evaluation ? (
          <div className="flex-1 p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="text-center space-y-4" aria-live="polite">
              <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-lg font-bold font-syncopate shadow-lg border
                ${evaluation.karma_score > 0 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 shadow-yellow-500/5' : evaluation.karma_score < 0 ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/5' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}
              `}>
                <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                {evaluation.karma_score > 0 ? `+${evaluation.karma_score}` : evaluation.karma_score} KARMA
              </div>
              <p className="text-xl text-zinc-100 font-medium leading-relaxed italic px-4 min-h-[3rem] flex items-center justify-center text-center">
                "{typedFeedback || evaluation.feedback}"
              </p>
            </div>

            <article className="relative group bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-yellow-500/40">
              <div className="absolute top-0 right-0 p-4 z-10">
                <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl">
                  <Sparkles className="w-3 h-3 text-yellow-500" aria-hidden="true" />
                  <span className="text-[9px] font-bold text-yellow-500 font-syncopate tracking-widest uppercase">Ancient Wisdom</span>
                </div>
              </div>

              <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                {isImageLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20 space-y-3">
                    <Loader2 className="w-8 h-8 text-yellow-500/50 animate-spin" aria-hidden="true" />
                    <span className="text-[9px] font-syncopate text-zinc-600 tracking-widest uppercase animate-pulse">Manifesting Scene...</span>
                  </div>
                ) : gitaImageUrl ? (
                  <img src={gitaImageUrl} alt="A cinematic representation of Bhagavad Gita wisdom" className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/20">
                    <Quote className="w-12 h-12 text-zinc-800 opacity-20" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" aria-hidden="true"></div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-yellow-500/40 rotate-180" aria-hidden="true" />
                    <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-tighter uppercase">{evaluation.gitaCitation}</span>
                  </div>
                  <p className="text-base text-zinc-300 font-serif leading-relaxed line-clamp-4 italic">
                    {evaluation.gitaVerse}
                  </p>
                </div>
              </div>
            </article>

            <div className="grid grid-cols-2 gap-4" aria-label="Turn summary stats">
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 text-center transition-all hover:bg-zinc-900/50">
                <span className="text-[9px] text-zinc-500 uppercase block mb-1 font-syncopate tracking-widest">Board Move</span>
                <span className={`text-lg font-bold font-syncopate ${evaluation.board_movement > 0 ? 'text-yellow-500' : 'text-red-400'}`}>
                  {evaluation.board_movement > 0 ? `+${evaluation.board_movement}` : evaluation.board_movement} Steps
                </span>
              </div>
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 text-center transition-all hover:bg-zinc-900/50">
                <span className="text-[9px] text-zinc-500 uppercase block mb-1 font-syncopate tracking-widest">Nature</span>
                <span className="text-lg font-bold text-cyan-400 uppercase tracking-widest font-syncopate">
                  {evaluation.karma_score > 0 ? 'Virtuous' : evaluation.karma_score < 0 ? 'Selfish' : 'Neutral'}
                </span>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="w-full py-5 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-[0.3em] rounded-2xl hover:bg-yellow-400 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.2)] active:scale-95"
            >
              CONTINUE JOURNEY
              <ArrowRightCircle className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ) : dilemma ? (
          <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-bold text-zinc-500 font-syncopate tracking-widest uppercase">
                Packet ID: 0x{Math.random().toString(16).substr(2, 4).toUpperCase()}
              </div>
              <p id="dilemma-scenario" className="text-2xl lg:text-3xl text-zinc-100 font-medium leading-tight tracking-tight">
                {dilemma.scenario}
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl flex items-center gap-4 group">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-600 group-hover:text-yellow-500/50 transition-colors">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-sm text-zinc-400 italic font-bold uppercase tracking-widest">
                {dilemma.context}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <textarea
                  ref={textAreaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isEvaluating}
                  placeholder="Type your response to the universe..."
                  aria-label="Your choice for this dilemma"
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all resize-none placeholder:text-zinc-700 disabled:opacity-50 text-lg leading-relaxed shadow-inner"
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-700 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  CTRL + ENTER TO SUBMIT
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {hasLifeline ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowColleagues(!showColleagues)}
                      disabled={isEvaluating}
                      aria-expanded={showColleagues}
                      className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors disabled:opacity-30 uppercase tracking-[0.2em] font-syncopate"
                    >
                      <Users className="w-4 h-4" aria-hidden="true" />
                      Social Link
                    </button>
                    {showColleagues && (
                      <div className="absolute bottom-full mb-3 left-0 w-56 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95">
                        <div className="p-3 border-b border-zinc-900 bg-zinc-900/20">
                          <span className="text-[9px] font-bold text-zinc-600 font-syncopate uppercase tracking-widest">Query Network</span>
                        </div>
                        {COLLEAGUES.map(c => (
                          <button
                            key={c}
                            onClick={() => handleTagColleague(c)}
                            className="w-full text-left px-4 py-3 text-xs text-zinc-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all flex justify-between items-center uppercase font-bold tracking-tight border-b border-zinc-900/50 last:border-0"
                          >
                            {c}
                            <ChevronRight className="w-3 h-3 opacity-30" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-700 font-bold uppercase font-syncopate tracking-widest">Link Used</span>
                )}

                <button
                  disabled={!input.trim() || isEvaluating}
                  onClick={() => onSubmit(input, !!selectedColleague)}
                  className="px-12 py-4 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-2xl hover:bg-yellow-400 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                >
                  {isEvaluating ? 'REFLECTING...' : 'COMMIT SOUL'}
                  <Send className={`w-4 h-4 ${isEvaluating ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1'} transition-transform`} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DilemmaModal;