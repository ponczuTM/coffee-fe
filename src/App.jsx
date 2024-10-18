import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartScreen from "./components/StartScreen";
import Game from "./components/game";
import Table from "./components/Table";
import Check from "./components/Check";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <Router>
      <div style={{ height: "100vh", backgroundColor: "#000" }}>
        <Routes>
          <Route path="/table" element={<Table />} />
          <Route path="/check" element={<Check />} />
          <Route
            path="/"
            element={
              !gameStarted ? (
                <StartScreen startGame={startGame} />
              ) : (
                <Game resetGame={resetGame} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
