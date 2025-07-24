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
        <div style={{ marginTop: "0px" }} className="text">Hej!</div>
        <div style={{ marginTop: "10px" }}>Chcesz</div>
        <div style={{ marginTop: "10px" }}>zagrać</div>
        <div style={{ marginTop: "10px" }}>w Grę?</div>
        {/* <div style={{ marginTop: "10px" }}>🧜‍♀️</div> */}
        <div style={{ marginTop: "180px" }}>DOTKNIJ</div>
        <div style={{ marginTop: "10px" }}>ABY</div>
        <div style={{ marginTop: "20px" }}>ROZPOCZĄĆ</div>
      </div>
    </div>
  );
};

export default StartScreen;
