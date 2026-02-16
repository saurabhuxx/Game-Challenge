
import React from 'react';
import { Shield } from 'lucide-react';
import { GRID_SIZE, TOTAL_TILES, SNAKES, LADDERS } from '../constants';

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
    
    // Convert to percentage for SVG
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
            className={`relative flex items-center justify-center border border-zinc-800/30 text-[10px] h-full w-full 
              ${isCurrent ? 'bg-zinc-900 border-yellow-500/50' : 'bg-black'}
              transition-all duration-500
            `}
          >
            {/* Improved visibility for tile numbers */}
            <span className="absolute top-1 left-1 text-zinc-500 font-mono text-[9px] font-medium leading-none">
              {tileNumber}
            </span>
            
            {hasShield && !isCurrent && (
              <Shield className="w-5 h-5 text-cyan-900/40 animate-pulse" />
            )}

            {isCurrent && (
              <div className="relative z-20 flex flex-col items-center">
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce`}>
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-500 rounded-full" />
                </div>
                {shieldActive && (
                  <Shield className="absolute -top-1 -right-1 w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                )}
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/5 to-transparent pointer-events-none" />
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="relative aspect-square w-full max-w-[500px] border-4 border-zinc-900 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] bg-zinc-950">
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {renderTiles()}
      </div>
      
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <filter id="toxic-glow">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Ladders */}
        {LADDERS.map((ladder, i) => {
          const start = getTileCoords(ladder.start);
          const end = getTileCoords(ladder.end);
          return (
            <g key={`ladder-${i}`} className="opacity-60" filter="url(#gold-glow)">
              <line x1={start.x-1.2} y1={start.y} x2={end.x-1.2} y2={end.y} stroke="#fbbf24" strokeWidth="0.6" />
              <line x1={start.x+1.2} y1={start.y} x2={end.x+1.2} y2={end.y} stroke="#fbbf24" strokeWidth="0.6" />
              {Array.from({length: 6}).map((_, j) => {
                const t = (j + 1) / 7;
                const rx = start.x + (end.x - start.x) * t;
                const ry = start.y + (end.y - start.y) * t;
                return <line key={j} x1={rx-1.8} y1={ry} x2={rx+1.8} y2={ry} stroke="#fbbf24" strokeWidth="0.4" />;
              })}
            </g>
          );
        })}

        {/* Render Realistic Snake (Single) */}
        {SNAKES.map((snake, i) => {
          const start = getTileCoords(snake.start);
          const end = getTileCoords(snake.end);
          
          // Create a more realistic serpentine curve using a cubic bezier
          const mid1X = start.x + (end.x - start.x) * 0.3 + 15;
          const mid1Y = start.y + (end.y - start.y) * 0.3;
          const mid2X = start.x + (end.x - start.x) * 0.7 - 15;
          const mid2Y = start.y + (end.y - start.y) * 0.7;
          
          return (
            <g key={`snake-${i}`} filter="url(#toxic-glow)" className="opacity-90">
              <path 
                d={`M ${start.x} ${start.y} C ${mid1X} ${mid1Y}, ${mid2X} ${mid2Y}, ${end.x} ${end.y}`} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="1.8" 
                strokeDasharray="4,1"
                className="snake-path"
                strokeLinecap="round"
              />
              {/* Snake Head at Start (the mouth) */}
              <circle cx={start.x} cy={start.y} r="2.2" fill="#065f46" />
              <circle cx={start.x} cy={start.y} r="1.4" fill="#10b981" />
              <circle cx={start.x} cy={start.y} r="0.5" fill="black" />
              {/* Snake Tongue (tiny flicker) */}
              <path d={`M ${start.x} ${start.y} L ${start.x} ${start.y - 2}`} stroke="#ef4444" strokeWidth="0.3" fill="none" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Board;
