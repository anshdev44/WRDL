import React from 'react';

const Rules = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mt-10 mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        WRDL Rules: The Word Clash
      </h1>

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Section 1: Objective */}
        <div className="p-6 rounded-xl border border-purple-600 shadow-2xl shadow-purple-900/50 bg-gray-800/70 transition duration-300 hover:border-blue-500">
          <h2 className="text-3xl font-bold mb-4 text-blue-400 flex items-center">
            <span className="mr-3 text-purple-400 text-4xl">🎯</span> Objective
          </h2>
          <p className="text-lg leading-relaxed text-gray-300">
            The goal of WRDL is to be the first player to correctly guess the hidden 5-letter word. You and your opponent take turns attempting to solve the mystery word using visual clues provided after each guess.
          </p>
        </div>

        {/* Section 2: Gameplay */}
        <div className="p-6 rounded-xl border border-blue-600 shadow-2xl shadow-blue-900/50 bg-gray-800/70 transition duration-300 hover:border-purple-500">
          <h2 className="text-3xl font-bold mb-4 text-purple-400 flex items-center">
            <span className="mr-3 text-blue-400 text-4xl">⚔️</span> How to Play
          </h2>
          
          <ul className="space-y-4 list-disc list-inside ml-4 text-lg text-gray-300">
            <li>
              <span className="font-semibold text-blue-300">Turn-Based Guessing:</span> Players take turns entering a valid 5-letter word. You have a limited time (e.g., 30 seconds) to submit your guess before your turn is skipped.
            </li>
            <li>
              <span className="font-semibold text-blue-300">Total Attempts:</span> Each player has up to 6 total guesses combined to solve the word. The game ends when one player guesses correctly or the attempts run out.
            </li>
            <li>
              <span className="font-semibold text-blue-300">Score and Streak:</span> Guessing correctly earns you a point. A streak bonus is applied for winning multiple consecutive rounds!
            </li>
          </ul>
        </div>

        {/* Section 3: The Clues (Feedback) */}
        <div className="p-6 rounded-xl border border-purple-600 shadow-2xl shadow-purple-900/50 bg-gray-800/70 transition duration-300 hover:border-blue-500">
          <h2 className="text-3xl font-bold mb-4 text-blue-400 flex items-center">
            <span className="mr-3 text-purple-400 text-4xl">💡</span> Understanding the Clues
          </h2>
          
          <p className="mb-4 text-lg text-gray-300">
            After every guess submitted by either player, the letter tiles will change color to provide clues to BOTH players:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-16 h-10 flex items-center justify-center font-bold text-xl rounded bg-green-600 text-white shadow-lg">W</span>
              <p className="text-lg text-gray-300">
                <span className="font-bold text-green-400">Green:</span> The letter is correct AND in the correct spot.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="w-16 h-10 flex items-center justify-center font-bold text-xl rounded bg-yellow-600 text-white shadow-lg">R</span>
              <p className="text-lg text-gray-300">
                <span className="font-bold text-yellow-400">Yellow:</span> The letter is correct but is in the wrong spot.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="w-16 h-10 flex items-center justify-center font-bold text-xl rounded bg-gray-600 text-white shadow-lg">D</span>
              <p className="text-lg text-gray-300">
                <span className="font-bold text-gray-400">Gray/Dark:</span> The letter is not in the hidden word at all.
              </p>
            </div>
          </div>
          
        </div>

        {/* Section 4: Winning */}
        <div className="p-6 rounded-xl border border-blue-600 shadow-2xl shadow-blue-900/50 bg-gray-800/70 transition duration-300 hover:border-purple-500">
          <h2 className="text-3xl font-bold mb-4 text-purple-400 flex items-center">
            <span className="mr-3 text-blue-400 text-4xl">🏆</span> Winning the Match
          </h2>
          <p className="text-lg leading-relaxed text-gray-300">
            A match consists of a pre-determined number of rounds (e.g., Best of 5). The player who wins the most rounds is declared the WRDL Champion! Good luck, and may the sharpest mind win!
          </p>
        </div>

      </div>
      
      {/* Small Footer/Spacer */}
      <div className="h-20"></div>
    </div>
  );
}

export default Rules;