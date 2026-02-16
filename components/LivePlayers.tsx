
import React, { useState, useEffect } from 'react';
import { Activity, Zap, Users, Globe } from 'lucide-react';
import { TOTAL_TILES } from '../constants';

interface LivePlayer {
  id: string;
  name: string;
  tile: number;
  status: 'idle' | 'moving' | 'thinking';
  karma: number;
}

const MOCK_NAMES = ['Zero_Kool', 'Neo_Sage', 'Dharma_Punk', 'Veda_Grid', 'Kali_Blade', 'Zen_Sync', 'Moksha_01'];

const LivePlayers: React.FC = () => {
  const [players, setPlayers] = useState<LivePlayer[]>(() => 
    MOCK_NAMES.slice(0, 5).map((name, i) => ({
      id: `live_${i}`,
      name,
      tile: Math.floor(Math.random() * 40) + 1,
      status: 'idle',
      karma: Math.floor(Math.random() * 200) + 100
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const player = { ...next[randomIndex] };
        
        const statuses: LivePlayer['status'][] = ['idle', 'moving', 'thinking'];
        player.status = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (player.status === 'moving') {
          player.tile = Math.min(TOTAL_TILES, player.tile + Math.floor(Math.random() * 8) + 1);
          player.karma += Math.floor(Math.random() * 15);
        } else if (player.status === 'thinking') {
          player.karma += 2;
        }

        // Handle respawn for mock players reaching the end
        if (player.tile >= TOTAL_TILES) {
          player.tile = 1;
        }
        
        next[randomIndex] = player;
        
        // Sorting by tile creates the "shuffling" effect in the list as positions change
        return [...next].sort((a, b) => b.tile - a.tile);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none">
        <Globe className="w-24 h-24 text-cyan-500" />
      </div>

      <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2 relative z-10">
        <div className="flex items-center gap-2 text-cyan-400 font-syncopate text-[10px] tracking-widest font-bold">
          <Activity className="w-3 h-3 animate-pulse" />
          CLUSTER LIVE
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
            {players.length} USERS ACTIVE
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
        {players.map((player) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl transition-all duration-700 
              ${player.status === 'moving' ? 'border-yellow-500/30 scale-[1.02] bg-yellow-500/5' : 'hover:border-zinc-700'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-black transition-all duration-500 
                  ${player.status === 'moving' ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : ''}
                `}>
                  <Zap className={`w-3.5 h-3.5 ${player.status === 'moving' ? 'text-yellow-500' : 'text-zinc-600'}`} />
                </div>
                {player.status === 'thinking' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-100 font-mono tracking-tight">{player.name}</span>
                <span className={`text-[8px] uppercase font-bold tracking-widest ${player.status === 'moving' ? 'text-yellow-500/80 animate-pulse' : player.status === 'thinking' ? 'text-cyan-500/80' : 'text-zinc-600'}`}>
                  {player.status === 'moving' ? 'JUMP_PATH' : player.status === 'thinking' ? 'SYNC_KARMA' : 'IDLE_STATE'}
                </span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-zinc-600 font-bold uppercase">Tile</span>
                <div className={`text-sm font-syncopate font-bold leading-none ${player.status === 'moving' ? 'text-white' : 'text-cyan-400'}`}>
                  {player.tile.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-[9px] text-zinc-700 font-mono font-bold mt-0.5">
                {player.karma} <span className="text-[7px]">PTS</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-zinc-700" />
          <span className="text-[8px] text-zinc-700 font-syncopate font-bold uppercase tracking-widest">Global Link</span>
        </div>
        <div className="text-[8px] text-zinc-800 font-mono">ID: 0x{Math.random().toString(16).substr(2, 6).toUpperCase()}</div>
      </div>
    </div>
  );
};

export default LivePlayers;
