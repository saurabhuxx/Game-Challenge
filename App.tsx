import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, GameState, TurnLog, Dilemma, KarmicEvaluation } from './types';
import { moralEngine } from './services/geminiService';
import { SHIELD_TILES, MOCK_LEADERBOARD } from './constants';
import Board from './components/Board';
import AuditLog from './components/AuditLog';
import LivePlayers from './components/LivePlayers';
import DilemmaModal from './components/DilemmaModal';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import ProfileModal from './components/ProfileModal';
import { Trophy, User as UserIcon, Zap, ArrowRight, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'cyber_moksha_v1_prod';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentTile: 1,
    turnCount: 0,
    history: [],
    shieldActive: false,
    hasTagLifeline: true,
    stamina: 100,
    isGridExpanded: false
  });
  
  const [nextDilemma, setNextDilemma] = useState<Dilemma | null>(null);
  const [modalState, setModalState] = useState<{
    showDilemma: boolean;
    currentDilemma: Dilemma | null;
    lastEvaluation: KarmicEvaluation | null;
    gitaImageUrl: string | null;
    isEvaluating: boolean;
    isImageLoading: boolean;
  }>({
    showDilemma: false,
    currentDilemma: null,
    lastEvaluation: null,
    gitaImageUrl: null,
    isEvaluating: false,
    isImageLoading: false
  });

  const [typedFeedback, setTypedFeedback] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);

  const archetype = useMemo(() => {
    if (!user) return 'THE SEEKER';
    const k = user.totalKarma;
    if (k >= 300) return 'MAHATMA';
    if (k >= 150) return 'DHARMA KEEPER';
    if (k >= 50) return 'VIGILANT SOUL';
    if (k >= 0) return 'PILGRIM';
    if (k >= -100) return 'WAYWARD TRAVELER';
    return 'SHADOW WALKER';
  }, [user?.totalKarma]);

  const prefetchDilemma = useCallback(async () => {
    try {
      const dilemma = await moralEngine.generateDilemma();
      setNextDilemma(dilemma);
    } catch (err) {
      console.error("Prefetch failed", err);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      const guest: User = {
        id: `seeker_${Math.random().toString(36).substr(2, 9)}`,
        name: 'The Seeker',
        isGuest: true,
        totalKarma: 0,
      };
      setUser(guest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    }
    prefetchDilemma();
  }, [prefetchDilemma]);

  const typeWriterEffect = useCallback((text: string) => {
    setTypedFeedback('');
    let i = 0;
    const speed = 10; // Faster typewriter for perceived speed
    const interval = setInterval(() => {
      setTypedFeedback((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, []);

  const handleSeekPath = async () => {
    if (gameState.stamina < 15) return;

    const dilemmaToUse = nextDilemma || await moralEngine.generateDilemma();
    setModalState(prev => ({ 
      ...prev, 
      showDilemma: true, 
      currentDilemma: dilemmaToUse, 
      lastEvaluation: null, 
      gitaImageUrl: null 
    }));
    
    // Always pre-warm the next one immediately
    prefetchDilemma();
  };

  const handleEvaluateTurn = async (response: string) => {
    if (!modalState.currentDilemma) return;
    setModalState(prev => ({ ...prev, isEvaluating: true }));
    
    try {
      // Step 1: Rapid Evaluation
      const evaluation = await moralEngine.evaluateChoice(modalState.currentDilemma.scenario, response);
      
      // Step 2: Show text results immediately while image generates in background
      setModalState(prev => ({ 
        ...prev, 
        lastEvaluation: evaluation, 
        isEvaluating: false, 
        isImageLoading: true 
      }));
      typeWriterEffect(evaluation.feedback);

      // Step 3: Trigger Image generation without blocking UI
      moralEngine.generateVerseImage(evaluation.gitaImagePrompt)
        .then(url => setModalState(prev => ({ ...prev, gitaImageUrl: url, isImageLoading: false })))
        .catch(() => setModalState(prev => ({ ...prev, isImageLoading: false })));
        
    } catch (err) {
      setModalState(prev => ({ ...prev, isEvaluating: false }));
    }
  };

  const applyTurnResults = () => {
    const { lastEvaluation, currentDilemma, gitaImageUrl } = modalState;
    if (!lastEvaluation || !currentDilemma) return;
    
    let movement = lastEvaluation.board_movement;
    if (movement < 0 && gameState.shieldActive) movement = 0;

    const currentMax = gameState.isGridExpanded ? 110 : 100;
    const nextTile = Math.min(Math.max(gameState.currentTile + movement, 1), currentMax);
    const energyChange = lastEvaluation.karma_score > 0 ? -15 : 10;
    const nextStamina = Math.min(Math.max(gameState.stamina + energyChange, 0), 100);

    const newLog: TurnLog = {
      turnNumber: gameState.turnCount + 1,
      tile: nextTile,
      dilemma: currentDilemma.scenario,
      response: "Determined Action",
      feedback: lastEvaluation.feedback,
      karmaDelta: lastEvaluation.karma_score,
      movement: movement,
      gitaVerse: lastEvaluation.gitaVerse,
      gitaCitation: lastEvaluation.gitaCitation,
      gitaImageUrl: gitaImageUrl || undefined,
      analytics: {
        pragmatism: lastEvaluation.pragmatism,
        empathy: lastEvaluation.empathy,
        chaos: lastEvaluation.chaos
      }
    };

    setGameState(prev => ({
      ...prev,
      currentTile: nextTile,
      turnCount: prev.turnCount + 1,
      history: [...prev.history, newLog],
      shieldActive: SHIELD_TILES.includes(nextTile),
      stamina: nextStamina,
      isGridExpanded: nextTile >= 95 || prev.isGridExpanded
    }));

    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, totalKarma: prev.totalKarma + lastEvaluation.karma_score };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setModalState(prev => ({ ...prev, showDilemma: false }));
    if (nextTile >= currentMax) setShowEndGame(true);
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row p-4 lg:p-6 gap-6 bg-[#050505] overflow-hidden ${user?.totalKarma && user.totalKarma < -40 ? 'glitch-state' : ''}`}>
      <main id="main-content" role="main" className="w-full lg:w-[70%] flex flex-col gap-6 relative overflow-hidden">
        <header role="banner" className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold font-syncopate tracking-widest text-cyber-gradient leading-none">MOKSHA</h1>
            <p className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-zinc-400 uppercase tracking-[0.5em] font-syncopate font-bold border-l-2 border-red-500 pl-4">ETHICS OVER FATE</span>
            </p>
          </div>
          
          <nav aria-label="Main Navigation" className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                <Zap className={`w-3 h-3 ${gameState.stamina < 30 ? 'text-red-500' : 'text-yellow-500'}`} aria-hidden="true" /> ENERGY
              </span>
              <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800" role="progressbar" aria-valuenow={gameState.stamina} aria-valuemin={0} aria-valuemax={100} aria-label="Stamina bar">
                <div 
                  className={`h-full transition-all duration-500 ${gameState.stamina < 30 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${gameState.stamina}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => setShowProfile(true)} 
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-500/50 transition-all flex items-center gap-2"
              aria-label="View lifetime soul summary"
            >
              <BookOpen className="w-5 h-5 text-yellow-500" aria-hidden="true" />
              <span className="hidden md:block text-[10px] font-syncopate font-bold text-zinc-400 uppercase tracking-widest">Summary</span>
            </button>

            <button onClick={() => setShowLeaderboard(true)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 transition-all" aria-label="View leaderboard">
              <Trophy className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            </button>
            <div className="flex flex-col items-end border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Seeker</span>
              <span className="font-bold text-base flex items-center gap-2 text-yellow-500">
                {user?.name}
                <UserIcon className="w-4 h-4 text-zinc-400" aria-hidden="true" />
              </span>
            </div>
          </nav>
        </header>

        <section aria-label="Game Board" className="relative flex-1 bg-zinc-950 rounded-[2.5rem] border border-zinc-900 shadow-[0_0_60px_rgba(0,0,0,1)] p-8 flex items-center justify-center overflow-hidden">
          <Board currentTile={gameState.currentTile} shieldActive={gameState.shieldActive} shieldTiles={SHIELD_TILES} isExpanded={gameState.isGridExpanded} />
        </section>

        <footer role="contentinfo" className="flex items-center justify-between p-6 bg-zinc-950/80 border border-zinc-900 rounded-[2rem] backdrop-blur-xl relative z-10">
          <div className="flex gap-10" aria-live="polite">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em] mb-1">Karma Index</span>
              <span className="text-2xl font-bold text-yellow-500 font-syncopate leading-none">{user?.totalKarma}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.2em] mb-1">Cycle Count</span>
              <span className="text-2xl font-bold text-zinc-300 font-syncopate leading-none">{gameState.turnCount}</span>
            </div>
          </div>
          <button
            onClick={handleSeekPath}
            disabled={gameState.stamina < 15 || gameState.currentTile >= (gameState.isGridExpanded ? 110 : 100)}
            className={`px-16 py-5 rounded-2xl font-syncopate text-xs font-bold tracking-[0.3em] transition-all flex items-center gap-4
              ${gameState.stamina < 15 ? 'opacity-30 grayscale cursor-not-allowed border border-zinc-800' : 'bg-yellow-500 text-black hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.2)]'}
            `}
            aria-label={gameState.stamina < 15 ? "Stamina low, cannot choose path" : "Choose your next moral path"}
          >
            {gameState.stamina < 15 ? 'RESTING...' : 'CHOOSE PATH'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </footer>
      </main>

      <aside role="complementary" className="w-full lg:w-[30%] flex flex-col gap-6 h-full overflow-hidden">
        <section aria-label="Other Seekers" className="h-[45%] flex-shrink-0">
          <LivePlayers />
        </section>
        <section aria-label="Spiritual Logs" className="flex-1 overflow-hidden min-h-[300px]">
          <AuditLog history={gameState.history} />
        </section>
      </aside>

      {modalState.showDilemma && (
        <DilemmaModal 
          dilemma={modalState.currentDilemma} 
          isLoading={!modalState.currentDilemma}
          isEvaluating={modalState.isEvaluating}
          evaluation={modalState.lastEvaluation}
          gitaImageUrl={modalState.gitaImageUrl}
          isImageLoading={modalState.isImageLoading}
          typedFeedback={typedFeedback}
          onClose={() => setModalState(prev => ({ ...prev, showDilemma: false }))} 
          onSubmit={handleEvaluateTurn}
          onContinue={applyTurnResults}
          hasLifeline={gameState.hasTagLifeline}
        />
      )}

      {showEndGame && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6" role="dialog" aria-modal="true" aria-labelledby="endgame-title">
          <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 text-center space-y-8">
            <h2 id="endgame-title" className="text-3xl font-bold font-syncopate text-yellow-500 uppercase">Moksha Attained</h2>
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 aspect-square flex items-center justify-center">
               <div className="space-y-4">
                 <p className="text-[10px] text-zinc-400 uppercase tracking-[0.4em]">Final Signature</p>
                 <h3 className="text-2xl font-bold font-syncopate text-white">{archetype}</h3>
               </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-5 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-2xl">
              RESTART JOURNEY
            </button>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSubmit={() => setShowAuth(false)} />}
      {showLeaderboard && <Leaderboard data={MOCK_LEADERBOARD} currentUserId={user?.id || ''} onClose={() => setShowLeaderboard(false)} onProfileClick={() => {}} />}
      {showProfile && user && <ProfileModal userId={user.id} userName={user.name} log={gameState.history} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default App;
