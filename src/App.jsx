import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import Game from "./components/game";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <div style={{ height: "100vh", backgroundColor: "#000" }}>
      {!gameStarted ? (
        <StartScreen startGame={startGame} />
      ) : (
        <Game resetGame={resetGame} />
      )}
    </div>
  );
}

export default App;
