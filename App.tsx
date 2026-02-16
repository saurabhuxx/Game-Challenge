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
import { Trophy, User as UserIcon, Play, Zap, ArrowRight, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'cyber_moksha_seeker_v1';

const App: React.FC = () => {
  // --- STATE ---
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
  
  const [modalState, setModalState] = useState<{
    showDilemma: boolean;
    currentDilemma: Dilemma | null;
    lastEvaluation: KarmicEvaluation | null;
    gitaImageUrl: string | null;
    isDilemmaLoading: boolean;
    isEvaluating: boolean;
    isImageLoading: boolean;
  }>({
    showDilemma: false,
    currentDilemma: null,
    lastEvaluation: null,
    gitaImageUrl: null,
    isDilemmaLoading: false,
    isEvaluating: false,
    isImageLoading: false
  });

  const [typedFeedback, setTypedFeedback] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const radarChartRef = useRef<HTMLCanvasElement>(null);

  // --- INITIALIZATION ---
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
        hasDismissedAuth: false
      };
      setUser(guest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    }
  }, []);

  // --- FEEDBACK EFFECT ---
  const typeWriterEffect = useCallback((text: string) => {
    setTypedFeedback('');
    let i = 0;
    const speed = 20; // Fast and snappy
    const interval = setInterval(() => {
      setTypedFeedback((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, []);

  // --- GAME ACTIONS ---
  const handleSeekPath = async () => {
    if (gameState.stamina < 15) {
      alert("Energy depleted. Reflect on your choices to recover vitality.");
      return;
    }

    setModalState(prev => ({ 
      ...prev, 
      showDilemma: true, 
      currentDilemma: null, 
      isDilemmaLoading: true, 
      lastEvaluation: null, 
      gitaImageUrl: null 
    }));

    try {
      const dilemma = await moralEngine.generateDilemma();
      setModalState(prev => ({ ...prev, currentDilemma: dilemma, isDilemmaLoading: false }));
    } catch (err) {
      setModalState(prev => ({ ...prev, showDilemma: false, isDilemmaLoading: false }));
    }
  };

  const handleEvaluateTurn = async (response: string) => {
    if (!modalState.currentDilemma) return;
    setModalState(prev => ({ ...prev, isEvaluating: true }));
    
    try {
      const evaluation = await moralEngine.evaluateChoice(modalState.currentDilemma.scenario, response);
      setModalState(prev => ({ ...prev, lastEvaluation: evaluation, isEvaluating: false, isImageLoading: true }));
      typeWriterEffect(evaluation.feedback);
      
      // Background Image Generation
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
    let shieldConsumed = false;
    
    if (movement < 0 && gameState.shieldActive) {
      movement = 0;
      shieldConsumed = true;
    }

    const currentMax = gameState.isGridExpanded ? 110 : 100;
    const nextTile = Math.min(Math.max(gameState.currentTile + movement, 1), currentMax);
    
    let expanded = gameState.isGridExpanded;
    if (nextTile >= 95 && !expanded) {
      expanded = true;
    }

    // Energy Logic
    let energyChange = lastEvaluation.karma_score > 0 ? -20 : 15; // Virtue is draining, indulgence is easy
    const nextStamina = Math.min(Math.max(gameState.stamina + energyChange, 0), 100);

    const newLog: TurnLog = {
      turnNumber: gameState.turnCount + 1,
      tile: nextTile,
      dilemma: currentDilemma.scenario,
      response: responseTextFromInput(lastEvaluation.feedback), // Conceptually tracking the "action"
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
      shieldActive: (prev.shieldActive && !shieldConsumed) || SHIELD_TILES.includes(nextTile),
      stamina: nextStamina,
      isGridExpanded: expanded
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

  const responseTextFromInput = (feedback: string) => {
    // Helper to extract a short "Action" summary if needed, otherwise default
    return "Decisive Action";
  };

  // --- ANALYTICS ---
  useEffect(() => {
    if (showEndGame && radarChartRef.current) {
      const avg = gameState.history.reduce((acc, curr) => ({
        p: acc.p + curr.analytics.pragmatism,
        e: acc.e + curr.analytics.empathy,
        c: acc.c + curr.analytics.chaos
      }), {p:0, e:0, c:0});
      const len = gameState.history.length || 1;
      
      const ctx = radarChartRef.current.getContext('2d');
      if (ctx) {
        new (window as any).Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['Mindful', 'Kind', 'Brave'],
            datasets: [{
              label: 'Soul Signature',
              data: [avg.p/len, avg.e/len, avg.c/len],
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              borderColor: 'rgba(234, 179, 8, 1)',
              pointBackgroundColor: '#fbbf24',
              borderWidth: 2
            }]
          },
          options: {
            scales: {
              r: { min: 0, max: 10, beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, angleLines: { color: 'rgba(255, 255, 255, 0.1)' }, pointLabels: { color: '#888', font: { family: 'Syncopate', size: 8 } } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  }, [showEndGame, gameState.history]);

  const archetype = useMemo(() => {
    if (gameState.history.length === 0) return "The Unwritten";
    const avg = gameState.history.reduce((acc, curr) => ({
      p: acc.p + curr.analytics.pragmatism,
      e: acc.e + curr.analytics.empathy,
      c: acc.c + curr.analytics.chaos
    }), {p:0, e:0, c:0});
    const len = gameState.history.length;
    const p = avg.p / len;
    const e = avg.e / len;
    const c = avg.c / len;

    if (p > 7 && e < 4) return "The Wise Guardian";
    if (e > 7 && p > 5) return "The Compassionate Guide";
    if (c > 7) return "The Ethical Disruptor";
    return "The Balanced Soul";
  }, [gameState.history]);

  // --- RENDER ---
  return (
    <div className={`min-h-screen flex flex-col lg:flex-row p-4 lg:p-6 gap-6 bg-[#050505] overflow-hidden ${user?.totalKarma && user.totalKarma < -40 ? 'glitch-state' : ''}`}>
      <main className="w-full lg:w-[70%] flex flex-col gap-6 relative overflow-hidden">
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold font-syncopate tracking-widest text-cyber-gradient leading-none">MOKSHA</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-[0.5em] font-syncopate font-bold border-l-2 border-red-500 pl-4">THE PATH OF VIRTUE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                <Zap className={`w-3 h-3 ${gameState.stamina < 30 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} /> ENERGY
              </span>
              <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className={`h-full transition-all duration-500 ${gameState.stamina < 30 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'}`}
                  style={{ width: `${gameState.stamina}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => setShowProfile(true)} 
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-500/50 transition-all group flex items-center gap-2"
              title="Lifetime Summary"
            >
              <BookOpen className="w-5 h-5 text-yellow-500 group-hover:drop-shadow-[0_0_8px_gold]" />
              <span className="hidden md:block text-[10px] font-syncopate font-bold text-zinc-500 uppercase tracking-widest">Summary</span>
            </button>

            <button onClick={() => setShowLeaderboard(true)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 transition-all group">
              <Trophy className="w-5 h-5 text-cyan-400 group-hover:drop-shadow-[0_0_8px_cyan]" />
            </button>
            <div className="flex flex-col items-end border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Seeker</span>
              <span className="font-bold text-base flex items-center gap-2">
                <span className="text-yellow-500">{user?.name}</span>
                <UserIcon className="w-4 h-4 text-zinc-400" />
              </span>
            </div>
          </div>
        </header>

        <div className="relative flex-1 bg-zinc-950 rounded-[2.5rem] border border-zinc-900 shadow-[0_0_60px_rgba(0,0,0,1)] p-8 flex items-center justify-center overflow-hidden">
          <Board currentTile={gameState.currentTile} shieldActive={gameState.shieldActive} shieldTiles={SHIELD_TILES} isExpanded={gameState.isGridExpanded} />
        </div>

        <footer className="flex items-center justify-between p-6 bg-zinc-950/80 border border-zinc-900 rounded-[2rem] backdrop-blur-xl shadow-2xl relative z-10">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-1">Karma Index</span>
              <span className="text-2xl font-bold text-yellow-500 font-syncopate leading-none">{user?.totalKarma}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-1">Cycles Completed</span>
              <span className="text-2xl font-bold text-zinc-300 font-syncopate leading-none">{gameState.turnCount}</span>
            </div>
          </div>
          <button
            onClick={handleSeekPath}
            disabled={modalState.isDilemmaLoading || modalState.isEvaluating || gameState.currentTile >= (gameState.isGridExpanded ? 110 : 100)}
            className={`px-16 py-5 rounded-2xl font-syncopate text-xs font-bold tracking-[0.3em] transition-all flex items-center gap-4
              ${gameState.stamina < 15 ? 'opacity-30 grayscale cursor-not-allowed border border-zinc-800' : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.3)]'}
            `}
          >
            {gameState.stamina < 15 ? 'ENERGY DEPLETED' : modalState.isDilemmaLoading ? 'SYNCING...' : 'CHOOSE PATH'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </footer>
      </main>

      <aside className="w-full lg:w-[30%] flex flex-col gap-6 h-full overflow-hidden">
        <div className="h-[45%] flex-shrink-0">
          <LivePlayers />
        </div>
        <div className="flex-1 overflow-hidden min-h-[300px]">
          <AuditLog history={gameState.history} />
        </div>
      </aside>

      {modalState.showDilemma && (
        <DilemmaModal 
          dilemma={modalState.currentDilemma} 
          isLoading={modalState.isDilemmaLoading} 
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6">
          <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
            <h2 className="text-3xl font-bold font-syncopate tracking-tight text-yellow-500 uppercase">Enlightenment Reached</h2>
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 aspect-square flex items-center justify-center">
              <canvas ref={radarChartRef}></canvas>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em]">Soul Archetype</p>
              <h3 className="text-xl font-bold font-syncopate text-white">{archetype}</h3>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-5 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-2xl hover:scale-[1.02] transition-transform">
              BEGIN NEW JOURNEY
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