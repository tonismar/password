import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameStatus, GAME_CONFIG, Guess, GameColor, FeedbackType } from './types';
import { generateSecretCode, calculateFeedback } from './services/gameLogic';
import { Row, Peg } from './components/Board';
import { ColorPicker } from './components/Controls';
import { Icons } from './components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Game State
  const [state, setState] = useState<GameState>({
    secretCode: [],
    guesses: [],
    currentTurn: 0,
    status: GameStatus.PLAYING,
    selectedColor: GAME_CONFIG.AVAILABLE_COLORS[0], // Default select first
    currentDraft: Array(GAME_CONFIG.CODE_LENGTH).fill(null),
    difficulty: 'normal',
  });

  const [showRules, setShowRules] = useState(false);
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  
  // Ref for scrolling to bottom of board
  const bottomRef = useRef<HTMLDivElement>(null);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize Game
  useEffect(() => {
    startNewGame();
    // Open rules automatically on first load to explain how to play
    setShowRules(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [state.guesses.length, state.currentTurn]);

  const startNewGame = (difficulty: 'normal' | 'hard' = 'normal') => {
    setState({
      secretCode: generateSecretCode(difficulty === 'hard'),
      guesses: [],
      currentTurn: 0,
      status: GameStatus.PLAYING,
      selectedColor: GAME_CONFIG.AVAILABLE_COLORS[0],
      currentDraft: Array(GAME_CONFIG.CODE_LENGTH).fill(null),
      difficulty,
    });
  };

  const handleSlotClick = (index: number) => {
    if (state.status !== GameStatus.PLAYING) return;
    
    // If a color is selected from the palette, place it
    if (state.selectedColor) {
      const newDraft = [...state.currentDraft];
      newDraft[index] = state.selectedColor;
      setState(prev => ({ ...prev, currentDraft: newDraft }));
    }
  };

  const handleColorSelect = (color: GameColor) => {
    setState(prev => ({ ...prev, selectedColor: color }));
    
    // Auto-fill next empty slot strategy
    const firstEmpty = state.currentDraft.findIndex(c => c === null);
    if (firstEmpty !== -1) {
      const newDraft = [...state.currentDraft];
      newDraft[firstEmpty] = color;
      setState(prev => ({ ...prev, currentDraft: newDraft }));
    }
  };

  const handleDelete = () => {
    const newDraft = [...state.currentDraft];
    let lastFilledIndex = -1;
    for (let i = newDraft.length - 1; i >= 0; i--) {
        if (newDraft[i] !== null) {
            lastFilledIndex = i;
            break;
        }
    }
    
    if (lastFilledIndex !== -1) {
        newDraft[lastFilledIndex] = null;
        setState(prev => ({ ...prev, currentDraft: newDraft }));
    }
  };

  const handleSubmitGuess = () => {
    if (state.currentDraft.includes(null)) return;
    
    const guessColors = state.currentDraft as GameColor[];
    const feedback = calculateFeedback(state.secretCode, guessColors);
    
    const newGuess: Guess = {
      id: state.currentTurn,
      colors: guessColors,
      feedback: feedback
    };

    const isWin = feedback.every(f => f === FeedbackType.EXACT);
    const isLoss = !isWin && state.currentTurn + 1 >= GAME_CONFIG.MAX_TURNS;

    let newStatus = GameStatus.PLAYING;
    if (isWin) newStatus = GameStatus.WON;
    if (isLoss) newStatus = GameStatus.LOST;

    setState(prev => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      currentTurn: prev.currentTurn + 1,
      currentDraft: Array(GAME_CONFIG.CODE_LENGTH).fill(null),
      status: newStatus
    }));
  };

  // Helper text logic for the user instruction bar
  const getInstructionText = () => {
    if (state.status !== GameStatus.PLAYING) return "Jogo Finalizado";
    
    const emptyCount = state.currentDraft.filter(c => c === null).length;
    if (emptyCount === 4) return "Toque nas cores abaixo para preencher";
    if (emptyCount > 0) return `Faltam ${emptyCount} cores para completar`;
    return "Tudo pronto! Toque em Confirmar";
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Header */}
      <header className="w-full max-w-md px-4 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/10">
             <span className="font-bold text-lg text-white">P</span>
           </div>
           <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Password</h1>
        </div>
        <div className="flex gap-1.5">
          {/* Theme Toggle */}
          <button 
             onClick={toggleTheme} 
             className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 text-slate-500 dark:text-slate-400"
             aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
          </button>

          {/* Color Blind Toggle */}
          <button 
             onClick={() => setIsColorBlindMode(prev => !prev)} 
             className={clsx(
               "p-2 rounded-full transition-colors active:scale-95",
               isColorBlindMode 
                 ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/50" 
                 : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
             )}
             aria-label="Toggle Color Blind Mode"
          >
            {isColorBlindMode ? <Icons.Eye className="w-5 h-5" /> : <Icons.EyeOff className="w-5 h-5" />}
          </button>
          
          <button 
             onClick={startNewGame.bind(null, state.difficulty)} 
             className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
             aria-label="Restart"
          >
            <Icons.Restart className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
          </button>

          <button 
             onClick={() => setShowRules(true)}
             className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
             aria-label="Rules"
          >
             <Icons.Help className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
          </button>
        </div>
      </header>

      {/* Main Game Board */}
      <main className="flex-1 w-full max-w-md p-4 flex flex-col gap-3 overflow-y-auto min-h-0 pb-32 scroll-smooth">
        {/* Previous Guesses */}
        {state.guesses.map((guess, idx) => (
          <Row 
            key={guess.id}
            index={idx}
            colors={guess.colors}
            feedback={guess.feedback}
            isActive={false}
            onSlotClick={() => {}}
            isColorBlindMode={isColorBlindMode}
          />
        ))}

        {/* Current Active Row */}
        {state.status === GameStatus.PLAYING && (
          <div ref={bottomRef} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Row 
              index={state.currentTurn}
              colors={state.currentDraft}
              isActive={true}
              onSlotClick={handleSlotClick}
              nextEmptyIndex={state.currentDraft.findIndex(c => c === null)}
              isColorBlindMode={isColorBlindMode}
            />
          </div>
        )}
        
        {/* Remaining Empty Rows (Visual filler) */}
        {Array.from({ length: Math.max(0, GAME_CONFIG.MAX_TURNS - 1 - state.currentTurn) }).map((_, idx) => (
           <div key={`empty-${idx}`} className="opacity-20 pointer-events-none grayscale">
             <Row 
               index={state.currentTurn + 1 + idx} 
               colors={Array(4).fill(null)} 
               isActive={false} 
               onSlotClick={() => {}}
               isColorBlindMode={isColorBlindMode}
             />
           </div>
        ))}
        
        <div className="h-4"></div>
      </main>

      {/* Game Over Modal / Status Area */}
      <AnimatePresence>
        {state.status !== GameStatus.PLAYING && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 text-center transition-colors"
             >
                <div className="mb-4 flex justify-center">
                   {state.status === GameStatus.WON ? (
                     <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                       <Icons.Trophy className="w-10 h-10 text-green-600 dark:text-green-500" />
                     </div>
                   ) : (
                     <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-shake">
                       <Icons.Alert className="w-10 h-10 text-red-600 dark:text-red-500" />
                     </div>
                   )}
                </div>
                
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                  {state.status === GameStatus.WON ? "Você Venceu!" : "Fim de Jogo"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                  {state.status === GameStatus.WON 
                    ? `Parabéns! Você descobriu a senha em ${state.guesses.length} tentativas.` 
                    : "Não foi dessa vez. A senha secreta era:"}
                </p>

                {/* Reveal Code */}
                <div className="flex justify-center gap-4 mb-8 bg-slate-100 dark:bg-slate-900/80 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                   {state.secretCode.map((c, i) => (
                     <Peg key={i} color={c} size="md" isColorBlindMode={isColorBlindMode} />
                   ))}
                </div>

                <button 
                  onClick={() => startNewGame(state.difficulty)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 text-lg"
                >
                  Jogar Novamente
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowRules(false)}
          >
             <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] transition-colors" 
                onClick={e => e.stopPropagation()}
             >
                <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Como Jogar</h3>
                  <button onClick={() => setShowRules(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Icons.Close /></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed custom-scrollbar">
                   <section>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">O Objetivo</h4>
                     <p>Descubra a combinação secreta de 4 cores em até {GAME_CONFIG.MAX_TURNS} tentativas.</p>
                   </section>

                   <section>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">Os Pinos de Feedback</h4>
                      <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700/50">
                          <div className="flex items-start gap-3">
                             <div className="w-4 h-4 mt-0.5 rounded-full bg-red-500 border border-red-600 shadow-sm shrink-0"></div>
                             <div>
                               <p className="font-bold text-red-500 dark:text-red-400">Vermelho (Preto)</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Uma cor certa na posição certa.</p>
                             </div>
                          </div>
                          <div className="flex items-start gap-3">
                             <div className="w-4 h-4 mt-0.5 rounded-full bg-slate-300 dark:bg-white border border-slate-400 dark:border-slate-300 shadow-sm shrink-0"></div>
                             <div>
                               <p className="font-bold text-slate-700 dark:text-white">Branco</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Uma cor certa, mas na posição errada.</p>
                             </div>
                          </div>
                      </div>
                      <p className="mt-2 text-xs italic text-slate-500">*A ordem dos pinos de feedback não corresponde à ordem dos buracos.</p>
                   </section>

                   <section>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">Dicas Estratégicas</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                        <li>Cores podem se repetir na senha secreta.</li>
                        <li>Comece chutando 2 pares de cores para eliminar possibilidades rapidamente.</li>
                      </ul>
                   </section>
                </div>

                <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                   <button 
                      onClick={() => setShowRules(false)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                   >
                     Entendi, Vamos Jogar!
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {state.status === GameStatus.PLAYING && (
        <ColorPicker
          availableColors={state.difficulty === 'hard' ? GAME_CONFIG.AVAILABLE_COLORS_HARD : GAME_CONFIG.AVAILABLE_COLORS}
          selectedColor={state.selectedColor}
          onSelectColor={handleColorSelect}
          onDelete={handleDelete}
          onSubmit={handleSubmitGuess}
          canSubmit={!state.currentDraft.includes(null)}
          instruction={getInstructionText()}
          isColorBlindMode={isColorBlindMode}
        />
      )}
    </div>
  );
};

export default App;