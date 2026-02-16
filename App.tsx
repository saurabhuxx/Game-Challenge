
import React, { useState, useEffect, useMemo } from 'react';
import { User, GameState, TurnLog, LeaderboardEntry, Dilemma } from './types';
import { generateDilemma, evaluateKarma } from './services/geminiService';
import { CITIES, REGIONS, TOTAL_TILES, SHIELD_TILES } from './constants';
import Board from './components/Board';
import AuditLog from './components/AuditLog';
import DilemmaModal from './components/DilemmaModal';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import ProfileModal from './components/ProfileModal';
import { Shield, Trophy, User as UserIcon, Play } from 'lucide-react';

const STORAGE_KEY = 'prompt_wars_user_v2';
const GHOST_TURNS_LIMIT = 3;

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
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isDilemmaLoading, setIsDilemmaLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load user on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      const guest: User = {
        id: `guest_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Guest Player',
        isGuest: true,
        totalKarma: 0
      };
      setUser(guest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    }
  }, []);

  // Persist user on changes (Karma updates)
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const handleSeekPath = async () => {
    if (gameState.currentTile >= TOTAL_TILES) return;
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
      let movement = usedLifeline ? 0 : evaluation.board_movement;
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
        response: response,
        feedback: evaluation.feedback,
        karmaDelta: evaluation.karma_score,
        movement: movement
      };

      setGameState(prev => ({
        ...prev,
        currentTile: nextTile,
        turnCount: prev.turnCount + 1,
        history: [...prev.history, newLog],
        shieldActive: (prev.shieldActive && !shieldConsumed) || isOnShieldTile,
        hasTagLifeline: usedLifeline ? false : prev.hasTagLifeline
      }));

      setUser(prev => prev ? { ...prev, totalKarma: prev.totalKarma + evaluation.karma_score } : null);
      setShowDilemma(false);
      
      if (user?.isGuest && gameState.turnCount + 1 === GHOST_TURNS_LIMIT) {
        setShowAuth(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAuthSubmit = (name: string, city: string, region: string) => {
    if (!user) return;
    const updatedUser: User = { ...user, name, city, region, isGuest: false };
    setUser(updatedUser);
    setShowAuth(false);
  };

  const currentLeaderboard: LeaderboardEntry[] = useMemo(() => {
    const base = [
      { id: '1', name: 'Arjun Cyber', karma: 450, city: 'Gurugram', region: 'North India' },
      { id: '2', name: 'Meera.eth', karma: 420, city: 'Bengaluru', region: 'South India' },
      { id: '3', name: 'V. Dharma', karma: 390, city: 'Mumbai', region: 'West India' },
      { id: '4', name: 'Cyber Pandit', karma: 310, city: 'Noida', region: 'North India' },
      { id: '5', name: 'Rani 2.0', karma: 280, city: 'Pune', region: 'West India' },
    ];
    if (user) {
      const userEntry = { id: user.id, name: user.name, karma: user.totalKarma, city: user.city || 'Gurugram', region: user.region || 'North India' };
      if (!base.find(e => e.id === user.id)) base.push(userEntry);
    }
    return base.sort((a, b) => b.karma - a.karma);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 lg:p-8 gap-8 overflow-hidden bg-[#050505]">
      <main className="flex-1 flex flex-col gap-6 relative">
        <header className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold font-syncopate tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              PROMPT WARS
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-syncopate italic">Cyber-Moksha 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-yellow-500/50 transition-colors group"
            >
              <Trophy className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold font-syncopate tracking-widest text-zinc-400">RANKINGS</span>
            </button>
            <div className="flex flex-col items-end border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase">Profile</span>
              <span className="font-bold text-sm flex items-center gap-2">
                {user?.isGuest ? <span className="text-zinc-600 italic">Guest</span> : <span className="text-yellow-500">{user?.name}</span>}
                <UserIcon className="w-3 h-3" />
              </span>
            </div>
          </div>
        </header>

        <div className="relative flex-1 bg-black rounded-2xl border border-zinc-900 shadow-2xl p-4 flex items-center justify-center overflow-hidden">
          {/* Cyber scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-30 opacity-20"></div>
          <Board currentTile={gameState.currentTile} shieldActive={gameState.shieldActive} shieldTiles={SHIELD_TILES} />
        </div>

        <footer className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl backdrop-blur-sm">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Current Karma</span>
              <span className="text-xl font-bold text-yellow-500 font-syncopate">{user?.totalKarma}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">Shield</span>
              <span className={`text-xl font-bold flex items-center gap-2 ${gameState.shieldActive ? 'text-cyan-400' : 'text-zinc-800'}`}>
                <Shield className="w-5 h-5" />
                {gameState.shieldActive ? 'READY' : 'OFF'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSeekPath}
            disabled={isDilemmaLoading || isEvaluating || gameState.currentTile >= TOTAL_TILES}
            className={`px-10 py-4 rounded-xl font-syncopate text-xs font-bold tracking-widest transition-all flex items-center gap-2 
              ${gameState.currentTile >= TOTAL_TILES 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(234,179,8,0.4)]'
              }`}
          >
            {isDilemmaLoading ? 'SYNCING...' : gameState.currentTile >= TOTAL_TILES ? 'MOKSHA ATTAINED' : 'SEEK PATH'}
            <Play className="w-3 h-3 fill-current" />
          </button>
        </footer>
      </main>

      <aside className="w-full lg:w-80 h-[400px] lg:h-auto">
        <AuditLog history={gameState.history} />
      </aside>

      {showDilemma && (
        <DilemmaModal 
          dilemma={currentDilemma} isLoading={isDilemmaLoading} isEvaluating={isEvaluating}
          onClose={() => setShowDilemma(false)} onSubmit={handleEvaluateTurn} hasLifeline={gameState.hasTagLifeline}
        />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSubmit={handleAuthSubmit} />}
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
