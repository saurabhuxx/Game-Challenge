
import React, { useState, useEffect, useMemo } from 'react';
import { User, GameState, TurnLog, LeaderboardEntry, Dilemma, KarmicEvaluation } from './types';
import { generateDilemma, evaluateKarma } from './services/geminiService';
import { SHIELD_TILES, TOTAL_TILES } from './constants';
import Board from './components/Board';
import AuditLog from './components/AuditLog';
import LivePlayers from './components/LivePlayers';
import DilemmaModal from './components/DilemmaModal';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import ProfileModal from './components/ProfileModal';
import { Shield, Trophy, User as UserIcon, Play, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'prompt_wars_user_v2';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentTile: 1,
    turnCount: 0,
    history: [],
    shieldActive: false,
    hasTagLifeline: true
  });
  
  const [showDilemma, setShowDilemma] = useState(false);
  const [currentDilemma, setCurrentDilemma] = useState<Dilemma | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<KarmicEvaluation | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isDilemmaLoading, setIsDilemmaLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      const guest: User = {
        id: `guest_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Guest Player',
        isGuest: true,
        totalKarma: 0,
        hasDismissedAuth: false
      };
      setUser(guest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const handleSeekPath = async () => {
    if (gameState.currentTile >= TOTAL_TILES) return;
    setLastEvaluation(null);
    setShowDilemma(true);
    setCurrentDilemma(null);
    setIsDilemmaLoading(true);
    try {
      const dilemma = await generateDilemma();
      setCurrentDilemma(dilemma);
    } catch (err) {
      setShowDilemma(false);
    } finally {
      setIsDilemmaLoading(false);
    }
  };

  const handleEvaluateTurn = async (response: string, usedLifeline: boolean) => {
    if (!currentDilemma) return;
    setIsEvaluating(true);
    try {
      const evaluation = await evaluateKarma(currentDilemma.scenario, response);
      setLastEvaluation(evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const applyTurnResults = () => {
    if (!lastEvaluation || !currentDilemma) return;
    
    const evaluation = lastEvaluation;
    let movement = evaluation.board_movement;
    let shieldConsumed = false;

    if (movement < 0 && gameState.shieldActive) {
      movement = 0;
      shieldConsumed = true;
    }

    const nextTile = Math.min(Math.max(gameState.currentTile + movement, 1), TOTAL_TILES);
    const isOnShieldTile = SHIELD_TILES.includes(nextTile);

    const newLog: TurnLog = {
      turnNumber: gameState.turnCount + 1,
      tile: nextTile,
      dilemma: currentDilemma.scenario,
      response: "...", 
      feedback: evaluation.feedback,
      karmaDelta: evaluation.karma_score,
      movement: movement
    };

    const newTurnCount = gameState.turnCount + 1;
    setGameState(prev => ({
      ...prev,
      currentTile: nextTile,
      turnCount: newTurnCount,
      history: [...prev.history, newLog],
      shieldActive: (prev.shieldActive && !shieldConsumed) || isOnShieldTile,
    }));

    setUser(prev => prev ? { ...prev, totalKarma: prev.totalKarma + evaluation.karma_score } : null);
    setShowDilemma(false);
    setLastEvaluation(null);
    
    if (user?.isGuest && newTurnCount === 1 && !user?.hasDismissedAuth) {
      setShowAuth(true);
    }
  };

  const handleExitGame = () => {
    if (confirm("Do you want to reset progress?")) {
      setGameState({
        currentTile: 1,
        turnCount: 0,
        history: [],
        shieldActive: false,
        hasTagLifeline: true
      });
      setUser(prev => prev ? { ...prev, totalKarma: 0 } : null);
    }
  };

  const handleAuthDismiss = () => {
    setShowAuth(false);
    setUser(prev => prev ? { ...prev, hasDismissedAuth: true } : null);
  };

  const handleAuthSubmit = (name: string, city: string, region: string) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name,
        city,
        region,
        isGuest: false
      };
    });
    setShowAuth(false);
  };

  const currentLeaderboard: LeaderboardEntry[] = useMemo(() => {
    const base = [
      { id: '1', name: 'Arjun', karma: 450, city: 'Gurugram', region: 'North India' },
      { id: '2', name: 'Meera', karma: 420, city: 'Bengaluru', region: 'South India' },
      { id: '3', name: 'Kishan', karma: 390, city: 'Mumbai', region: 'West India' },
      { id: '4', name: 'Deepa', karma: 310, city: 'Noida', region: 'North India' },
      { id: '5', name: 'Rani', karma: 280, city: 'Pune', region: 'West India' },
    ];
    if (user) {
      const userEntry = { id: user.id, name: user.name, karma: user.totalKarma, city: user.city || 'Visitor', region: user.region || 'India' };
      if (!base.find(e => e.id === user.id)) base.push(userEntry);
    }
    return base.sort((a, b) => b.karma - a.karma);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 lg:p-6 gap-6 bg-[#050505] overflow-hidden">
      {/* 70% Real Estate: The Playground */}
      <main className="w-full lg:w-[70%] flex flex-col gap-6 relative overflow-hidden">
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold font-syncopate tracking-widest text-cyber-gradient leading-none">
              CYBER MOKSHA
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-[0.5em] font-syncopate font-bold border-l-2 border-red-500 pl-4">
                ETHICS OVER FATE
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 transition-all hover:scale-105 active:scale-95 group"
              title="Global Rankings"
            >
              <Trophy className="w-5 h-5 text-cyan-400 group-hover:drop-shadow-[0_0_8px_cyan]" />
            </button>
            <button 
              onClick={handleExitGame}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-red-500/50 transition-all hover:scale-105 active:scale-95 text-zinc-500 hover:text-red-500"
              title="Reset Link"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-end border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Operator</span>
              <span className="font-bold text-base flex items-center gap-2">
                {user?.isGuest ? <span className="text-zinc-600 italic">Guest_X</span> : <span className="text-yellow-500">{user?.name}</span>}
                <UserIcon className="w-4 h-4 text-zinc-400" />
              </span>
            </div>
          </div>
        </header>

        {/* Board Area */}
        <div className="relative flex-1 bg-zinc-950 rounded-3xl border border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,1)] p-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-30 opacity-20"></div>
          <Board currentTile={gameState.currentTile} shieldActive={gameState.shieldActive} shieldTiles={SHIELD_TILES} />
        </div>

        {/* Control Footer */}
        <footer className="flex items-center justify-between p-6 bg-zinc-950/80 border border-zinc-900 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-1">Karma Index</span>
              <span className="text-2xl font-bold text-yellow-500 font-syncopate leading-none">{user?.totalKarma}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-1">Grid Sync</span>
              <span className="text-2xl font-bold text-zinc-300 font-syncopate leading-none">{gameState.turnCount}<span className="text-zinc-700 text-xs ml-1">CYCLES</span></span>
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-1">Deflection</span>
              <span className={`text-2xl font-bold flex items-center gap-2 ${gameState.shieldActive ? 'text-cyan-400' : 'text-zinc-800'}`}>
                <Shield className={`w-6 h-6 ${gameState.shieldActive ? 'animate-pulse' : ''}`} />
                {gameState.shieldActive ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSeekPath}
            disabled={isDilemmaLoading || isEvaluating || gameState.currentTile >= TOTAL_TILES}
            className={`px-16 py-5 rounded-2xl font-syncopate text-sm font-bold tracking-[0.3em] transition-all flex items-center gap-4
              ${gameState.currentTile >= TOTAL_TILES 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.4)]'
              }`}
          >
            {isDilemmaLoading ? 'SYNCING...' : gameState.currentTile >= TOTAL_TILES ? 'ZENITH REACHED' : 'ENTER CHOICE'}
            <Play className="w-4 h-4 fill-current" />
          </button>
        </footer>
      </main>

      {/* 30% Real Estate: Cluster Live & Audit Log */}
      <aside className="w-full lg:w-[30%] flex flex-col gap-6 h-full overflow-hidden">
        <div className="h-[55%] flex-shrink-0">
          <LivePlayers />
        </div>
        <div className="flex-1 overflow-hidden min-h-[300px]">
          <AuditLog history={gameState.history} />
        </div>
      </aside>

      {/* Modals */}
      {showDilemma && (
        <DilemmaModal 
          dilemma={currentDilemma} 
          isLoading={isDilemmaLoading} 
          isEvaluating={isEvaluating}
          evaluation={lastEvaluation}
          onClose={() => setShowDilemma(false)} 
          onSubmit={handleEvaluateTurn}
          onContinue={applyTurnResults}
          hasLifeline={gameState.hasTagLifeline}
        />
      )}
      {showAuth && <AuthModal onClose={handleAuthDismiss} onSubmit={handleAuthSubmit} />}
      {showLeaderboard && (
        <Leaderboard 
          data={currentLeaderboard} currentUserId={user?.id || ''} onClose={() => setShowLeaderboard(false)}
          onProfileClick={(id) => { setSelectedProfileId(id); setShowLeaderboard(false); }}
        />
      )}
      {selectedProfileId && (
        <ProfileModal 
          userId={selectedProfileId} onClose={() => setSelectedProfileId(null)} log={gameState.history}
          userName={currentLeaderboard.find(u => u.id === selectedProfileId)?.name || 'Soul'}
        />
      )}
    </div>
  );
};

export default App;
