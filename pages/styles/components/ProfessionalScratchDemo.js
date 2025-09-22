import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProfessionalScratchDemo = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [gameState, setGameState] = useState('setup');
  const [cardType, setCardType] = useState('symbol');
  const [buyIn, setBuyIn] = useState(1);
  const [gridSize, setGridSize] = useState(9);
  const [theme, setTheme] = useState('vegas');
  const [scratchedSquares, setScratchedSquares] = useState([]);
  const [cardData, setCardData] = useState([]);
  const [winningCombination, setWinningCombination] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [balance, setBalance] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [totalGames, setTotalGames] = useState(0);

  const themes = {
    vegas: {
      name: 'Vegas Classic',
      symbols: ['🎰', '💎', '🍒', '⭐', '🔔', '💰'],
      colors: 'from-red-600 to-yellow-600',
      cardColor: 'from-yellow-400 to-red-500'
    },
    ocean: {
      name: 'Ocean Treasure',
      symbols: ['🐚', '🐠', '⚓', '🏝️', '🦑', '💙'],
      colors: 'from-blue-600 to-cyan-600',
      cardColor: 'from-cyan-400 to-blue-500'
    },
    space: {
      name: 'Cosmic Adventure',
      symbols: ['🚀', '🌟', '🛸', '🌙', '⭐', '🪐'],
      colors: 'from-purple-600 to-indigo-600',
      cardColor: 'from-indigo-400 to-purple-500'
    },
    jungle: {
      name: 'Jungle Quest',
      symbols: ['🦁', '🐅', '🦒', '🌿', '💚', '🗿'],
      colors: 'from-green-600 to-emerald-600',
      cardColor: 'from-emerald-400 to-green-500'
    }
  };

  const currentTheme = themes[theme];
  const multipliers = ['2x', '3x', '5x', '10x', '15x', '20x'];

  const symbolValues = {
    [currentTheme.symbols[0]]: 50,
    [currentTheme.symbols[1]]: 25,
    [currentTheme.symbols[2]]: 15,
    [currentTheme.symbols[3]]: 10,
    [currentTheme.symbols[4]]: 8,
    [currentTheme.symbols[5]]: 5
  };

  const winRate = totalGames > 0 ? (gameHistory.filter(g => g.win).length / totalGames * 100).toFixed(1) : 0;
  const totalWinnings = gameHistory.reduce((sum, game) => sum + (game.win ? game.payout : 0), 0);
  const totalSpent = gameHistory.reduce((sum, game) => sum + game.buyIn, 0);
  const netProfit = totalWinnings - totalSpent;

  const generateCard = () => {
    const squares = [];
    let winningSymbol;
    const symbolSet = cardType === 'symbol' ? currentTheme.symbols : multipliers;
    
    winningSymbol = symbolSet[Math.floor(Math.random() * symbolSet.length)];
    
    const winningPositions = [];
    while (winningPositions.length < 3) {
      const pos = Math.floor(Math.random() * gridSize);
      if (!winningPositions.includes(pos)) {
        winningPositions.push(pos);
      }
    }
    
    setWinningCombination(winningPositions);
    
    for (let i = 0; i < gridSize; i++) {
      if (winningPositions.includes(i)) {
        squares.push(winningSymbol);
      } else {
        const otherSymbols = symbolSet.filter(s => s !== winningSymbol);
        squares.push(otherSymbols[Math.floor(Math.random() * otherSymbols.length)]);
      }
    }
    
    setCardData(squares);
  };

  const startGame = () => {
    if (balance < buyIn) {
      alert('Insufficient balance!');
      return;
    }
    
    setBalance(balance - buyIn);
    setScratchedSquares([]);
    setGameResult(null);
    generateCard();
    setGameState('playing');
  };

  const scratchSquare = (index) => {
    if (scratchedSquares.includes(index) || gameState !== 'playing') return;
    
    const newScratched = [...scratchedSquares, index];
    setScratchedSquares(newScratched);
    
    if (newScratched.length >= 4) {
      const gameData = { win: false, buyIn, reason: 'Too many squares', theme, gridSize };
      setGameHistory(prev => [...prev, gameData]);
      setTotalGames(prev => prev + 1);
      setGameResult({ win: false, reason: 'Too many squares scratched!' });
      setGameState('gameOver');
      return;
    }
    
    if (newScratched.length === 3) {
      const isWinningCombo = newScratched.every(pos => winningCombination.includes(pos));
      
      if (isWinningCombo) {
        let payout;
        if (cardType === 'symbol') {
          payout = symbolValues[cardData[index]];
        } else {
          const multiplierValue = parseInt(cardData[index].replace('x', ''));
          payout = buyIn * multiplierValue;
        }
        
        setBalance(prev => prev + payout);
        const gameData = { win: true, buyIn, payout, symbol: cardData[index], theme, gridSize };
        setGameHistory(prev => [...prev, gameData]);
        setGameResult({ win: true, payout, symbol: cardData[index] });
      } else {
        const gameData = { win: false, buyIn, reason: 'Wrong combination', theme, gridSize };
        setGameHistory(prev => [...prev, gameData]);
        setGameResult({ win: false, reason: 'Wrong combination!' });
      }
      setTotalGames(prev => prev + 1);
      setGameState('gameOver');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setScratchedSquares([]);
    setCardData([]);
    setGameResult(null);
  };

  const getGridCols = () => {
    if (gridSize === 6) return 'grid-cols-3';
    if (gridSize === 9) return 'grid-cols-3';
    if (gridSize === 15) return 'grid-cols-5';
    if (gridSize === 20) return 'grid-cols-5';
    return 'grid-cols-3';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <nav className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">ScratchStrategy™</h1>
          <div className="space-x-4">
            <button 
              onClick={() => setCurrentView('landing')} 
              className="text-white hover:text-blue-300 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentView('game')} 
              className="text-white hover:text-blue-300 transition-colors"
            >
              Demo
            </button>
          </div>
        </div>
      </nav>

      {currentView === 'landing' && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center text-white">
          <h2 className="text-5xl font-bold mb-6">
            Revolutionary Scratch Card Gaming
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Every card has winning potential. Strategic gameplay meets guaranteed opportunity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Strategic Choice</h3>
              <p className="text-gray-300">Choose exactly 3 squares. Every decision matters.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Always Winnable</h3>
              <p className="text-gray-300">Every card contains a winning combination.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Instant Results</h3>
              <p className="text-gray-300">Quick gameplay with immediate feedback.</p>
            </div>
          </div>

          <button 
            onClick={() => setCurrentView('game')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105"
          >
            Try the Demo
          </button>

          <div className="grid md:grid-cols-4 gap-6 text-center text-white mt-16">
            <div className="bg-white/5 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-400">{totalGames}</div>
              <div className="text-gray-300">Games Played</div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-400">{winRate}%</div>
              <div className="text-gray-300">Win Rate</div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl">
              <div className="text-3xl font-bold text-yellow-400">${totalWinnings}</div>
              <div className="text-gray-300">Total Winnings</div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl">
              <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${netProfit}
              </div>
              <div className="text-gray-300">Net Profit</div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'game' && gameState === 'setup' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className={`bg-gradient-to-br ${currentTheme.colors} p-6 rounded-xl text-white`}>
            <h2 className="text-xl font-bold text-center mb-6">🎰 {currentTheme.name}</h2>
            
            <div className="bg-white/10 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Balance: ${balance}</p>
                <button 
                  onClick={() => setBalance(100)}
                  className="bg-red-500/30 hover:bg-red-500/50 text-white text-xs font-semibold py-1 px-3 rounded transition-all"
                >
                  Reset ($100)
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Theme:</label>
                <select 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-2 rounded bg-white/20 text-white"
                >
                  {Object.entries(themes).map(([key, t]) => (
                    <option key={key} value={key} className="text-black">{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Card Type:</label>
                <select 
                  value={cardType} 
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full p-2 rounded bg-white/20 text-white"
                >
                  <option value="symbol" className="text-black">Symbol Match</option>
                  <option value="multiplier" className="text-black">Multiplier</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Buy-in Amount:</label>
                <select 
                  value={buyIn} 
                  onChange={(e) => setBuyIn(Number(e.target.value))}
                  className="w-full p-2 rounded bg-white/20 text-white"
                >
                  <option value={1} className="text-black">$1</option>
                  <option value={5} className="text-black">$5</option>
                  <option value={10} className="text-black">$10</option>
                  <option value={20} className="text-black">$20</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Difficulty:</label>
                <select 
                  value={gridSize} 
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="w-full p-2 rounded bg-white/20 text-white"
                >
                  <option value={6} className="text-black">6 squares (Easy)</option>
                  <option value={9} className="text-black">9 squares (Medium)</option>
                  <option value={15} className="text-black">15 squares (Hard)</option>
                  <option value={20} className="text-black">20 squares (Expert)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-white/20 rounded text-sm">
              <p><strong>Rules:</strong></p>
              <p>• Find exactly 3 matching symbols</p>
              <p>• Scratch only 3 squares - no more!</p>
              <p>• Every card has a winning combination</p>
              <p>• Wrong match or 4+ squares = you lose</p>
            </div>
            
            <button 
              onClick={startGame}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Start Game (${buyIn})
            </button>
          </div>
        </div>
      )}

      {currentView === 'game' && gameState === 'playing' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className={`bg-gradient-to-br ${currentTheme.colors} p-6 rounded-xl text-white`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🎯 Symbol Hunt</h2>
              <div className="text-right">
                <p className="text-sm">Balance: ${balance + buyIn}</p>
                <p className="text-sm">Scratched: {scratchedSquares.length}/3</p>
              </div>
            </div>
            
            <div className={`grid ${getGridCols()} gap-3 mb-4`}>
              {cardData.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scratchSquare(index)}
                  className={`
                    aspect-square rounded-lg text-2xl font-bold transition-all transform hover:scale-105
                    ${scratchedSquares.includes(index) 
                      ? 'bg-white text-gray-800 shadow-lg' 
                      : `bg-gradient-to-br ${currentTheme.cardColor} hover:brightness-110 text-white shadow-md`
                    }
                  `}
                >
                  {scratchedSquares.includes(index) ? item : '?'}
                </button>
              ))}
            </div>
            
            <div className="bg-white/20 p-3 rounded text-center">
              <p className="text-sm">Click squares to scratch them off</p>
              <p className="text-xs text-gray-200">Find 3 matching symbols</p>
            </div>
          </div>
        </div>
      )}

      {currentView === 'game' && gameState === 'gameOver' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className={`bg-gradient-to-br ${currentTheme.colors} p-6 rounded-xl text-white text-center`}>
            <h2 className="text-2xl font-bold mb-4">
              {gameResult.win ? '🎉 You Won!' : '💔 Game Over'}
            </h2>
            
            {gameResult.win ? (
              <div className="bg-green-500/30 p-4 rounded-lg mb-4">
                <p className="text-4xl mb-2">{gameResult.symbol}</p>
                <p className="text-2xl font-bold">Won: ${gameResult.payout}</p>
                <p className="text-sm">New Balance: ${balance}</p>
              </div>
            ) : (
              <div className="bg-red-500/30 p-4 rounded-lg mb-4">
                <p className="text-lg">{gameResult.reason}</p>
                <p className="text-sm">Balance: ${balance}</p>
              </div>
            )}
            
            <button 
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalScratchDemo;
