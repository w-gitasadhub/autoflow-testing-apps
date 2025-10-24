import React, { useState, useEffect, useCallback } from 'react';
import { getWittyFeedback } from './services/geminiService';
import { SparklesIcon, TargetIcon, LoaderIcon } from './components/icons';
import { GuessFeedback } from './components/GuessFeedback';

const App: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startGame = useCallback(() => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setUserGuess('');
    setFeedback('');
    setAiFeedback('');
    setAttempts(0);
    setIsGameOver(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleGuess = async () => {
    const guess = parseInt(userGuess, 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setFeedback('Please enter a number between 1 and 100.');
      setAiFeedback('');
      return;
    }

    setIsLoading(true);
    setAttempts(prev => prev + 1);
    
    let currentFeedback: 'high' | 'low' | 'correct';
    if (guess === randomNumber) {
      currentFeedback = 'correct';
      setFeedback(`You got it in ${attempts + 1} attempts!`);
      setIsGameOver(true);
    } else if (guess > randomNumber) {
      currentFeedback = 'high';
      setFeedback('Too high! Try a lower number.');
    } else {
      currentFeedback = 'low';
      setFeedback('Too low! Try a higher number.');
    }
    
    try {
        const wittyResponse = await getWittyFeedback(guess, randomNumber, attempts + 1, currentFeedback);
        setAiFeedback(wittyResponse);
    } catch (error) {
        console.error("Failed to get witty feedback:", error);
        setAiFeedback("My circuits are buzzing... try another guess!");
    } finally {
        setIsLoading(false);
        setUserGuess('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGameOver) {
      handleGuess();
    }
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <TargetIcon />
            <h1>The Witty Guessing Game</h1>
          </div>
          <p>I'm thinking of a number between 1 and 100.</p>
        </div>

        <div>
          <div>
            <input
              type="number"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your guess..."
              disabled={isGameOver || isLoading}
            />
            <button
              onClick={isGameOver ? startGame : handleGuess}
              disabled={isLoading && !isGameOver}
            >
              {isLoading ? (
                <LoaderIcon />
              ) : isGameOver ? (
                'Play Again'
              ) : (
                'Guess'
              )}
            </button>
          </div>

          <GuessFeedback feedback={feedback} aiFeedback={aiFeedback} isLoading={isLoading} />
        </div>
        
        <div>
          Attempts: <span>{attempts}</span>
        </div>
      </div>
    </div>
  );
};

export default App;