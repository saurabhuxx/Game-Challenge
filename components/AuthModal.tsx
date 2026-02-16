import React, { useState, useEffect, useRef } from 'react';
import { CITIES, REGIONS } from '../constants';
import { LogIn, X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSubmit: (name: string, city: string, region: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Varanasi');
  const [region, setRegion] = useState('North');
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!focusableElements) return;
      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div ref={modalRef} className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 relative">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-yellow-500/10 rounded-2xl mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-500 rounded-xl text-black">
              <LogIn className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
          <h2 id="auth-title" className="text-3xl font-bold font-syncopate tracking-tight">IDENTITY SYNC</h2>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            Tell us who you are to save your score and continue the path.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="seeker-name" className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Seeker Name</label>
              <input 
                id="seeker-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seeker-city" className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">City</label>
                <select 
                  id="seeker-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="seeker-region" className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Region</label>
                <select 
                  id="seeker-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              disabled={!name.trim()}
              onClick={() => onSubmit(name, city, region)}
              className="w-full py-4 bg-yellow-500 text-black font-syncopate text-xs font-bold tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SYNC PROGRESS
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-zinc-500 text-[10px] uppercase font-bold hover:text-zinc-300 transition-colors"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;