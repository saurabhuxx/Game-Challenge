
import React, { useState } from 'react';
import { CITIES, REGIONS } from '../constants';
import { LogIn } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSubmit: (name: string, city: string, region: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [region, setRegion] = useState('North India');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-yellow-500/10 rounded-2xl mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-500 rounded-xl text-black">
              <LogIn className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-syncopate tracking-tight">Save your progress.</h2>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            You've completed your first few trials! Sign in to save your score and continue your journey.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-6 shadow-2xl">
          <button 
            className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-600">Your Profile</span></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Nickname</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">City</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Region</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button 
            disabled={!name.trim()}
            onClick={() => onSubmit(name, city, region)}
            className="w-full py-4 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SAVE & START
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
