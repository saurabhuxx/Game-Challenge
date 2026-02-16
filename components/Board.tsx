
import React from 'react';
import { Shield } from 'lucide-react';
import { GRID_SIZE, SNAKES, LADDERS } from '../constants';

interface BoardProps {
  currentTile: number;
  shieldActive: boolean;
  shieldTiles: number[];
}

const Board: React.FC<BoardProps> = ({ currentTile, shieldActive, shieldTiles }) => {
  const getTileCoords = (tile: number) => {
    const zeroBased = tile - 1;
    const row = Math.floor(zeroBased / GRID_SIZE);
    const colInRow = zeroBased % GRID_SIZE;
    const isEvenRow = row % 2 === 0;
    const col = isEvenRow ? colInRow : GRID_SIZE - 1 - colInRow;
    
    return {
      x: (col * 10) + 5,
      y: 100 - ((row * 10) + 5)
    };
  };

  const renderTiles = () => {
    const tiles = [];
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const isEvenRow = row % 2 === 0;
        let tileNumber;
        if (isEvenRow) {
          tileNumber = row * GRID_SIZE + col + 1;
        } else {
          tileNumber = (row + 1) * GRID_SIZE - col;
        }

        const isCurrent = currentTile === tileNumber;
        const hasShield = shieldTiles.includes(tileNumber);

        tiles.push(
          <div 
            key={tileNumber} 
            className={`relative flex items-center justify-center border border-zinc-900/40 text-[10px] h-full w-full 
              ${isCurrent ? 'bg-zinc-900/80 border-cyan-500/50' : 'bg-black/40'}
              transition-all duration-700
            `}
          >
            <span className="absolute top-1 left-1 text-zinc-800 font-mono text-[9px] font-bold leading-none select-none">
              {tileNumber}
            </span>
            
            {hasShield && !isCurrent && (
              <Shield className="w-5 h-5 text-cyan-500/5 animate-pulse" />
            )}

            {isCurrent && (
              <div className="relative z-20 flex flex-col items-center">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,1)] animate-bounce`}>
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-500 rounded-full shadow-[0_0_15px_#fbbf24]" />
                </div>
                {shieldActive && (
                  <Shield className="absolute -top-1 -right-1 w-4 h-4 text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_5px_cyan]" />
                )}
              </div>
            )}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="relative aspect-square w-full h-full max-w-[650px] max-h-[650px] border-[6px] border-zinc-900/80 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] bg-zinc-950">
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {renderTiles()}
      </div>
      
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="ladder-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="snake-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <filter id="cyber-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {LADDERS.map((ladder, i) => {
          const start = getTileCoords(ladder.start);
          const end = getTileCoords(ladder.end);
          return (
            <g key={`ladder-${i}`} filter="url(#cyber-glow)" opacity="0.9">
              <line x1={start.x-1.2} y1={start.y} x2={end.x-1.2} y2={end.y} stroke="url(#ladder-grad)" strokeWidth="0.9" strokeLinecap="round" />
              <line x1={start.x+1.2} y1={start.y} x2={end.x+1.2} y2={end.y} stroke="url(#ladder-grad)" strokeWidth="0.9" strokeLinecap="round" />
              {Array.from({length: 8}).map((_, j) => {
                const t = (j + 1) / 9;
                const rx = start.x + (end.x - start.x) * t;
                const ry = start.y + (end.y - start.y) * t;
                return <line key={j} x1={rx-1.8} y1={ry} x2={rx+1.8} y2={ry} stroke="url(#ladder-grad)" strokeWidth="0.5" />;
              })}
            </g>
          );
        })}

        {SNAKES.map((snake, i) => {
          const start = getTileCoords(snake.start);
          const end = getTileCoords(snake.end);
          const mid1X = start.x + (end.x - start.x) * 0.3 + 15;
          const mid1Y = start.y + (end.y - start.y) * 0.3;
          const mid2X = start.x + (end.x - start.x) * 0.7 - 15;
          const mid2Y = start.y + (end.y - start.y) * 0.7;
          
          return (
            <g key={`snake-${i}`} filter="url(#cyber-glow)">
              <path 
                d={`M ${start.x} ${start.y} C ${mid1X} ${mid1Y}, ${mid2X} ${mid2Y}, ${end.x} ${end.y}`} 
                fill="none" 
                stroke="url(#snake-grad)" 
                strokeWidth="3" 
                className="snake-path"
                strokeLinecap="round"
              />
              <circle cx={start.x} cy={start.y} r="3" fill="#000" stroke="#ef4444" strokeWidth="0.5" />
              <circle cx={start.x - 0.7} cy={start.y - 0.7} r="0.5" fill="#ef4444" className="animate-pulse" />
              <circle cx={start.x + 0.7} cy={start.y - 0.7} r="0.5" fill="#ef4444" className="animate-pulse" />
              <path d={`M ${start.x} ${start.y} L ${start.x} ${start.y - 4} L ${start.x - 1.5} ${start.y - 5.5} M ${start.x} ${start.y - 4} L ${start.x + 1.5} ${start.y - 5.5}`} stroke="#ef4444" strokeWidth="0.3" fill="none" opacity="0.8" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Board;
