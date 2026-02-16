
import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types';
import { X, Trophy, Filter, MapPin, Search } from 'lucide-react';
import { CITIES, REGIONS } from '../constants';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  currentUserId: string;
  onClose: () => void;
  onProfileClick: (id: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, currentUserId, onClose, onProfileClick }) => {
  const [cityFilter, setCityFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (cityFilter === 'All' || item.city === cityFilter) &&
      (regionFilter === 'All' || item.region === regionFilter) &&
      (item.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, cityFilter, regionFilter, search]);

  const currentUserRank = data.findIndex(e => e.id === currentUserId) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 transition-all">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-syncopate text-xs tracking-[0.2em] font-bold">LEADERBOARD</h3>
              <p className="text-[10px] text-zinc-500 uppercase">Top Players 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors group">
            <X className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="p-6 space-y-4 bg-zinc-950/50 backdrop-blur-sm border-b border-zinc-900">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <select 
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer"
              >
                <option value="All">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer"
              >
                <option value="All">All Regions</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm space-y-2">
              <Trophy className="w-12 h-12 opacity-10" />
              <p className="italic">No players found...</p>
            </div>
          ) : (
            filteredData.map((entry, idx) => {
              const globalRank = data.findIndex(e => e.id === entry.id) + 1;
              const isMe = entry.id === currentUserId;
              
              return (
                <button
                  key={entry.id}
                  onClick={() => onProfileClick(entry.id)}
                  className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all border
                    ${isMe 
                      ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                      : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/40'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center font-bold font-syncopate text-xs rounded-xl transition-all
                      ${globalRank === 1 ? 'bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                        globalRank === 2 ? 'bg-zinc-300 text-black' :
                        globalRank === 3 ? 'bg-amber-600 text-black' : 'bg-zinc-800/50 text-zinc-500'}
                    `}>
                      {globalRank}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm flex items-center gap-2 text-zinc-100">
                        {entry.name}
                        {isMe && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold uppercase">You</span>}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-zinc-700" />
                        {entry.city}, {entry.region}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold transition-all ${isMe ? 'text-yellow-500 scale-105' : 'text-zinc-400 group-hover:text-yellow-500/70'}`}>
                      {entry.karma}
                    </div>
                    <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-tighter">Karma</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        {currentUserRank > 0 && (
          <div className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex justify-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-syncopate">
              Your Rank: <span className="text-yellow-500">#{currentUserRank}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
