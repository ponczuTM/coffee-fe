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
  const [countdown, setCountdown] = useState(3); // Dodajemy stan odliczania
  const [isCountdownActive, setIsCountdownActive] = useState(true); // Czy odliczanie trwa

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
  }, []);

  useEffect(() => {
    if (isCountdownActive) {
      if (countdown > 0) {
        const countdownInterval = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(countdownInterval);
      } else {
        setIsCountdownActive(false);
        setStartTime(Date.now()); // Zaczynamy grę po zakończeniu odliczania
      }
    }
  }, [countdown, isCountdownActive]);

  useEffect(() => {
    if (startTime && !gameOver && !isCountdownActive) {
      const interval = setInterval(() => {
        setTimeElapsed(((Date.now() - startTime) / 1000).toFixed(2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, gameOver, isCountdownActive]);

  const randomizeRedSquare = () => {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    setRedSquare({ row, col });
  };

  const handleSquareClick = (row, col) => {
    if (row === redSquare.row && col === redSquare.col) {
      setScore(score + 1);
      if (score + 1 === 10) {
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
              {`POKAŻ KOD QR W SALI KONFERENCYJNEJ.`}
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

    fetch("http://localhost:5000/api/claim-coffee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log("Serwis wykonał skrypt Pythona");
        } else {
          console.error(`Wystąpił problem z serwisem: ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error("Błąd podczas komunikacji z serwisem:", error);
      });
    resetGame();
  };

  const countdownBackgroundColors = ["#470500", "#464700", "#014700"];

  return (
    <div className="game-container">
      {isCountdownActive ? (
        <div
          className="countdown"
          style={{
            fontSize: "10rem",
            width: "100vw",
            height: "110vh",
            marginTop: "-30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            backgroundColor: countdownBackgroundColors[countdown - 1],
          }}
        >
          {countdown}
        </div>
      ) : gameOver ? (
        <div className="game-over">
          {message}
          {timeElapsed <= 10 && !isCoffeeClaimed && (
            <div>
              <button onClick={handleCoffeeClaim} style={{ marginTop: "50px" }}>
                KLIKNIJ, ABY WYDRUKOWAĆ <br></br> KOD QR
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
