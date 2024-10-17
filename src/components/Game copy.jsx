import React, { useState, useEffect } from "react";
import "./Game.css";

const GRID_SIZE = 10;

const Game = ({ resetGame }) => {
  const [grid, setGrid] = useState([]);
  const [redSquare, setRedSquare] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [isCoffeeClaimed, setIsCoffeeClaimed] = useState(false);

  useEffect(() => {
    const generateGrid = () => {
      const tempGrid = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        tempGrid.push(new Array(GRID_SIZE).fill(false));
      }
      return tempGrid;
    };

    setGrid(generateGrid());
    randomizeRedSquare();
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (startTime && !gameOver) {
      const interval = setInterval(() => {
        setTimeElapsed(((Date.now() - startTime) / 1000).toFixed(2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, gameOver]);

  const randomizeRedSquare = () => {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    setRedSquare({ row, col });
  };

  const handleSquareClick = (row, col) => {
    if (row === redSquare.row && col === redSquare.col) {
      setScore(score + 1);
      if (score + 1 === 1) {
        setGameOver(true);
        if (timeElapsed <= 10) {
          setMessage(
            <>
              {`Twój czas to: ${timeElapsed} s.`}
              <br />
              <br />
              {`Gratulacje!`}
              <br />
              {`Wygrałeś kawę!`}
              <br />
              <br />
              {`Odbierz ją w sali konferencyjnej!`}
              <br />
              <br />
            </>
          );
        } else {
          setMessage(
            <>
              {`Twój czas to: ${timeElapsed} s.`}
              <br />
              <br />
              {`Niestety, musisz spróbować jeszcze raz.`}
              <br />
              {`osiągnij czas do 10s,`}
              <br />
              {`aby wygrać kawę.`}
            </>
          );
          setTimeout(() => {
            setMessage("");
            resetGame();
          }, 10000);
        }
      } else {
        randomizeRedSquare();
      }
    }
  };

  const handleCoffeeClaim = () => {
    setIsCoffeeClaimed(true);
  };
  const handleCoffeeRefuse = () => {
    resetGame();
  };

  return (
    <div className="game-container">
      {gameOver ? (
        <div className="game-over">
          {message}
          {timeElapsed <= 10 && !isCoffeeClaimed && (
            <div>
              <button onClick={() => handleCoffeeClaim()}>
                ODBIERZ KAWĘ ZA POMOCĄ KODU QR
              </button>
              
              <button className="no" onClick={() => handleCoffeeRefuse ()}>
                NIE CHCĘ KAWY
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="timer">Czas: {timeElapsed}s</div>
          <div className="grid">
            {grid.map((row, rowIndex) =>
              row.map((_, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`square ${
                    redSquare.row === rowIndex && redSquare.col === colIndex
                      ? "red"
                      : "white"
                  }`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
          <div className="score">Punkty: {score}</div>
        </>
      )}
    </div>
  );
};

export default Game;
