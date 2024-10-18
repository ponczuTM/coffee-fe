import React, { useState } from "react";
import "./StartScreen.css";

const StartScreen = ({ startGame }) => {
  const [startAnimation, setStartAnimation] = useState(false);

  const handleClick = () => {
    setStartAnimation(true);
    setTimeout(() => {
      startGame();
    }, 2000);
  };

  return (
    <div
      className={`start-screen ${startAnimation ? "slide-down" : ""}`}
      onClick={handleClick}
    >
      <video className="background-video" autoPlay loop muted>
        <source src="src/assets/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="start-text">
        <div style={{ marginTop: "-100px" }} className="text">Hej!</div>
        <div style={{ marginTop: "10px" }}>Chcesz darmową</div>
        <div style={{ marginTop: "10px" }}>Kawę ☕?</div>
        <div style={{ marginTop: "250px" }}>DOTKNIJ BY</div>
        <div style={{ marginTop: "20px" }}>ROZPOCZĄĆ</div>
      </div>
    </div>
  );
};

export default StartScreen;
