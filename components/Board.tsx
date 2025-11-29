import React from 'react';
import { GameColor, FeedbackType, PegColor, GAME_CONFIG } from '../types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Square, Triangle, Circle, Star, Diamond, Hexagon, Zap, Heart } from 'lucide-react';

// --- Helper for color styles ---
export const getColorClass = (color: PegColor) => {
  switch (color) {
    case GameColor.RED: return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] dark:shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    case GameColor.BLUE: return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] dark:shadow-[0_0_10px_rgba(59,130,246,0.6)]';
    case GameColor.GREEN: return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] dark:shadow-[0_0_10px_rgba(34,197,94,0.6)]';
    case GameColor.YELLOW: return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)] dark:shadow-[0_0_10px_rgba(250,204,21,0.6)]';
    case GameColor.PURPLE: return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] dark:shadow-[0_0_10px_rgba(168,85,247,0.6)]';
    case GameColor.ORANGE: return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] dark:shadow-[0_0_10px_rgba(249,115,22,0.6)]';
    case GameColor.CYAN: return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)] dark:shadow-[0_0_10px_rgba(34,211,238,0.6)]';
    case GameColor.PINK: return 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)] dark:shadow-[0_0_10px_rgba(236,72,153,0.6)]';
    default: return 'bg-slate-200 dark:bg-slate-700/50 inner-shadow';
  }
};

// --- Helper for Color Blind Symbols ---
export const ColorSymbol: React.FC<{ color: PegColor, className?: string }> = ({ color, className }) => {
  if (!color) return null;
  
  const iconProps = { className: clsx("text-white/90 drop-shadow-md", className), strokeWidth: 2.5 };

  switch (color) {
    case GameColor.RED: return <Square {...iconProps} />;
    case GameColor.BLUE: return <Triangle {...iconProps} />;
    case GameColor.GREEN: return <Circle {...iconProps} />;
    case GameColor.YELLOW: return <Star {...iconProps} fill="currentColor" fillOpacity={0.4} />;
    case GameColor.PURPLE: return <Diamond {...iconProps} />;
    case GameColor.ORANGE: return <Hexagon {...iconProps} />;
    case GameColor.CYAN: return <Zap {...iconProps} />;
    case GameColor.PINK: return <Heart {...iconProps} />;
    default: return null;
  }
};

// --- Components ---

interface PegProps {
  color: PegColor;
  onClick?: () => void;
  isActive?: boolean; // True if this specific peg is part of the active row
  isNextEmpty?: boolean; // True if this is the next slot to be filled
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  isColorBlindMode?: boolean;
}

export const Peg: React.FC<PegProps> = ({ 
  color, 
  onClick, 
  isActive, 
  isNextEmpty, 
  size = 'md', 
  animate,
  isColorBlindMode 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  // Adjust icon size based on peg size
  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.9 } : undefined}
      initial={animate ? { scale: 0 } : undefined}
      animate={animate ? { scale: 1 } : undefined}
      className={clsx(
        "rounded-full border-2 transition-all duration-200 cursor-pointer relative flex items-center justify-center",
        sizeClasses[size],
        getColorClass(color),
        isActive && color ? 'border-slate-400 dark:border-white/50 scale-105' : 'border-transparent',
        // Highlighting for the next empty slot to guide the user
        isNextEmpty ? 'border-dashed border-slate-400 dark:border-slate-400 animate-pulse bg-slate-200 dark:bg-slate-700' : ''
      )}
      onClick={onClick}
    >
      {/* Symbol for Color Blind Mode */}
      {isColorBlindMode && color && (
        <ColorSymbol color={color} className={iconSizeClass} />
      )}

      {/* Little dot for next empty indicator */}
      {isNextEmpty && (
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-slate-400/50" />
      )}
    </motion.div>
  );
};

interface FeedbackGridProps {
  feedback: FeedbackType[];
}

export const FeedbackGrid: React.FC<FeedbackGridProps> = ({ feedback }) => {
  return (
    <div className="grid grid-cols-2 gap-1.5 w-8 h-8 md:w-10 md:h-10">
      {feedback.map((type, idx) => (
        <div
          key={idx}
          className={clsx(
            "w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border transition-all duration-500",
            // Exact: Red with glow
            type === FeedbackType.EXACT ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] border-red-600 scale-110" :
            // Partial: White (or Dark Grey in Light Mode?) - keeping White usually standard for Mastermind "White Peg"
            // But for visibility on white bg, maybe Slate-200. Standard Mastermind uses White for Partial.
            // Let's use a distinct color that works on both. Slate-200 on white, White on dark.
            type === FeedbackType.PARTIAL ? "bg-slate-300 dark:bg-slate-100 border-slate-400 dark:border-slate-300 scale-110 shadow-sm" :
            // Empty
            "bg-transparent border-slate-300 dark:border-slate-600 scale-100"
          )}
        />
      ))}
    </div>
  );
};

interface RowProps {
  index: number;
  colors: PegColor[];
  feedback?: FeedbackType[];
  isActive: boolean;
  onSlotClick: (slotIndex: number) => void;
  nextEmptyIndex?: number;
  isColorBlindMode: boolean;
}

export const Row: React.FC<RowProps> = ({ 
  index, 
  colors, 
  feedback, 
  isActive, 
  onSlotClick,
  nextEmptyIndex,
  isColorBlindMode
}) => {
  // Pad feedback with NONE if not provided or incomplete
  const displayFeedback = feedback || Array(GAME_CONFIG.CODE_LENGTH).fill(FeedbackType.NONE);

  return (
    <div className={clsx(
      "flex items-center gap-4 py-3 px-3 rounded-xl border transition-all duration-300",
      isActive 
        ? "bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-500/50 shadow-md dark:shadow-[0_0_15px_rgba(15,23,42,0.5)] scale-[1.02]" 
        : "bg-transparent border-transparent opacity-80"
    )}>
      <span className={clsx(
        "font-mono text-sm w-4 text-center font-bold",
        isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
      )}>{index + 1}</span>
      
      <div className="flex-1 flex justify-center gap-3">
        {colors.map((color, i) => (
          <Peg 
            key={i} 
            color={color} 
            size="md"
            isActive={isActive}
            // Show indicator if this is the next empty slot in active row
            isNextEmpty={isActive && i === nextEmptyIndex}
            onClick={() => isActive && onSlotClick(i)}
            animate={!!color && isActive}
            isColorBlindMode={isColorBlindMode}
          />
        ))}
      </div>

      <div className={clsx(
        "border-l pl-3",
        isActive ? "border-slate-200 dark:border-slate-600" : "border-slate-200 dark:border-slate-800"
      )}>
        <FeedbackGrid feedback={displayFeedback} />
      </div>
    </div>
  );
};