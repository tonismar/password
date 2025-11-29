import React from 'react';
import { GameColor, PegColor, GAME_CONFIG } from '../types';
import { Peg, getColorClass, ColorSymbol } from './Board';
import clsx from 'clsx';
import { Icons } from './Icons';

// --- Color Picker Component ---

interface ColorPickerProps {
  availableColors: GameColor[];
  selectedColor: GameColor | null;
  onSelectColor: (color: GameColor) => void;
  onDelete: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  instruction: string;
  isColorBlindMode: boolean;
}

const colorNames: Record<string, string> = {
  [GameColor.RED]: 'Vermelho',
  [GameColor.BLUE]: 'Azul',
  [GameColor.GREEN]: 'Verde',
  [GameColor.YELLOW]: 'Amarelo',
  [GameColor.PURPLE]: 'Roxo',
  [GameColor.ORANGE]: 'Laranja',
  [GameColor.CYAN]: 'Ciano',
  [GameColor.PINK]: 'Rosa',
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  availableColors,
  selectedColor,
  onSelectColor,
  onDelete,
  onSubmit,
  canSubmit,
  instruction,
  isColorBlindMode
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-8 md:pb-4 shadow-2xl z-20 sticky bottom-0 transition-colors duration-300">
      <div className="max-w-md mx-auto flex flex-col gap-3">
        
        {/* Helper Text */}
        <div className="text-center -mt-2 mb-1">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-300 animate-pulse bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
            {instruction}
          </span>
        </div>

        {/* Colors */}
        <div className="flex justify-between items-center px-1">
          {availableColors.map((color) => (
            <button
              key={color}
              className={clsx(
                "w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200 active:scale-95 border-2 relative flex items-center justify-center",
                getColorClass(color),
                selectedColor === color 
                  ? "border-slate-600 dark:border-white scale-110 -translate-y-2 shadow-lg ring-2 ring-slate-400/30 dark:ring-white/30" 
                  : "border-transparent opacity-90 hover:opacity-100 hover:-translate-y-1"
              )}
              onClick={() => onSelectColor(color)}
              aria-label={`Select ${colorNames[color]}`}
            >
              {isColorBlindMode && (
                <ColorSymbol color={color} className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <div className="flex-1">
             <button
              onClick={onDelete}
              className="w-full py-3 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 active:bg-slate-300 dark:active:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-600"
            >
              <Icons.Close className="w-5 h-5" />
              Apagar
            </button>
          </div>
          
          <div className="flex-[2]">
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={clsx(
                "w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 border",
                canSubmit 
                  ? "bg-green-600 hover:bg-green-500 active:scale-[0.98] shadow-green-900/20 dark:shadow-green-900/50 border-green-500 dark:border-green-400 animate-[pop_0.3s_ease-out]" 
                  : "bg-slate-300 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
              )}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};