import React, { useState, useEffect } from "react";
import { database, ref, set, get, child } from "../../firebase";
import "./Game.css";
import logo from "./../assets/images/logo.png";

// Definicje stałych dla obszaru gry
const GAME_AREA_WIDTH = 900; // Szerokość obszaru (np. 900 - 100)
const GAME_AREA_HEIGHT = 1500; // Wysokość obszaru (np. 1200 - 200)
const GAME_AREA_OFFSET_X = 100; // Współrzędna X lewego górnego rogu
const GAME_AREA_OFFSET_Y = 200; // Współrzędna Y lewego górnego rogu

const SCORE_NEEDED = 10;
const IMAGE_SIZE_PX = 200; // Przyjmujemy rozmiar obrazka z CSS
const MIN_DISTANCE = 200; // Minimalna odległość od poprzedniej pozycji

const Game = ({ resetGame }) => {
  const [redSquarePosition, setRedSquarePosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [isCoffeeClaimed, setIsCoffeeClaimed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [name, setName] = useState("");
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    randomizeRedSquare(true); // Wywołaj przy pierwszym renderze, pomijając sprawdzenie odległości
  }, []);

  useEffect(() => {
    if (isCountdownActive) {
      if (countdown > 0) {
        const countdownInterval = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 2000);

        return () => clearInterval(countdownInterval);
      } else {
        setIsCountdownActive(false);
        setStartTime(Date.now());
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

  const randomizeRedSquare = (initial = false) => {
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 50; // Ogranicz liczbę prób, aby uniknąć nieskończonej pętli

    do {
      newX = Math.random() * (GAME_AREA_WIDTH - IMAGE_SIZE_PX);
      newY = Math.random() * (GAME_AREA_HEIGHT - IMAGE_SIZE_PX);
      attempts++;

      if (initial || attempts > maxAttempts) {
        // Przy pierwszym uruchomieniu lub po wielu próbach, zaakceptuj dowolną pozycję
        break;
      }

      // Oblicz odległość od poprzedniej pozycji
      const distance = Math.sqrt(
        Math.pow(newX - redSquarePosition.x, 2) +
        Math.pow(newY - redSquarePosition.y, 2)
      );

      if (distance >= MIN_DISTANCE) {
        break; // Znaleziono odpowiednią pozycję
      }
    } while (true); // Pętla będzie kontynuowana, dopóki nie znajdziemy odpowiedniej pozycji lub nie przekroczymy maxAttempts

    setRedSquarePosition({ x: newX, y: newY });
  };

  const handleImageClick = () => {
    setScore(score + 1);
    if (score + 1 === SCORE_NEEDED) {
      setGameOver(true);
      if (timeElapsed <= 10) {
        setMessage(
          <>
            {`Twój czas to: ${timeElapsed} s.`}
            <br />
            {"Gratulacje! Wygrałeś!"}
          </>
        );
      } else {
        setMessage(
          <>
            {`Twój czas to: ${timeElapsed} s.`}
            <br />
            <br />
            {"Niestety, musisz spróbować jeszcze raz."}
            <br />
            {"Osiągnij czas do 10s, aby wygrać!"}
            <br />
            <br />
            <button
              onClick={() => window.location.reload()} // Zmieniono z handleCoffeeReject na odświeżenie
              style={{ marginTop: "50px" }}
              className="no2"
            >
              {"Spróbuj ponownie"}
            </button>
          </>
        );
        // Usunięto setTimeout, ponieważ strona będzie odświeżona od razu po kliknięciu "Spróbuj ponownie"
      }
    } else {
      randomizeRedSquare();
    }
  };

  const saveScoreToFirebase = (name, time) => {
    const scoreRef = ref(database, "coffeescores/" + name);
    set(scoreRef, time)
      .then(() => {
        console.log("Wynik zapisany pomyślnie!");
        setIsNameSubmitted(true);
      })
      .catch((error) => {
        console.error("Błąd przy zapisie wyniku:", error);
      });
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      saveScoreToFirebase(name, timeElapsed);
    }
  };

  const handleCoffeeClaim = () => {
    if (name.trim()) {
      saveScoreToFirebase(name, timeElapsed);
    }

    setIsCoffeeClaimed(true);
    setIsPrinting(true);

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

    setTimeout(() => {
      setIsPrinting(false);
      window.location.reload(); // Zmieniono z resetGame na odświeżenie
    }, 5000);
  };

  const handleCoffeeReject = () => {
    window.location.reload(); // Zmieniono z resetGame na odświeżenie
  };

  const fetchScoresFromFirebase = () => {
    const scoresRef = ref(database);
    get(child(scoresRef, "coffeescores"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const scoresArray = Object.entries(data).map(([name, time]) => ({
            name,
            time: parseFloat(time.replace(":", ".")),
          }));

          scoresArray.sort((a, b) => a.time - b.time);
          setScores(scoresArray.slice(0, 5));
          setIsTableVisible(true);
        } else {
          console.log("Brak danych");
        }
      })
      .catch((error) => {
        console.error("Błąd przy pobieraniu wynoruw:", error);
      });
  };

  const countdownMessages = [
    "Kliknij syrenkę 10 razy",
    "Masz na to 10 sekund",
    "POWODZENIA!",
  ];

  const countdownBackgroundColors = ["#470500", "#464700", "#014700"];

  const VirtualKeyboard = ({ onKeyPress }) => {
    const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "✖"];
    const keys2 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    const keys3 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    const keys4 = ["Z", "X", "C", "V", "B", "N", "M"];
    const keys5 = ["___________________"];

    return (
      <div className="virtual-keyboard">
        <div>
          {keys.map((key) => (
            <button
              key={key}
              className="key"
              onClick={() => {
                if (key === "✖") {
                  onKeyPress(name.slice(0, -1)); // Usuń ostatni znak
                } else {
                  onKeyPress(name + key);
                }
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <div>
          {keys2.map((key) => (
            <button
              key={key}
              className="key"
              onClick={() => {
                onKeyPress(name + key);
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <div>
          {keys3.map((key) => (
            <button
              key={key}
              className="key"
              onClick={() => {
                onKeyPress(name + key);
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <div>
          {keys4.map((key) => (
            <button
              key={key}
              className="key"
              onClick={() => {
                onKeyPress(name + key);
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="wide-keyboard">
          {keys5.map((key) => (
            <button
              key={key}
              className="key"
              onClick={() => {
                onKeyPress(name + " ");
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      {isPrinting ? (
        <div
          className="printing-message"
          style={{
            fontSize: "4rem",
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            backgroundColor: "#693300",
            textAlign: "center",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          {"POCZEKAJ NA WYDRUK"}
        </div>
      ) : isCountdownActive ? (
        <div
          className="countdown"
          style={{
            fontSize: "4rem",
            width: "100vw",
            height: "110vh",
            marginTop: "-30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            backgroundColor: countdownBackgroundColors[countdown - 1],
            textAlign: "center",
          }}
        >
          {countdownMessages[3 - countdown]}
        </div>
      ) : gameOver ? (
        <div className="game-over">
          {message}
          {timeElapsed <= 10 && !isCoffeeClaimed && (
            <div>
              {!isNameSubmitted ? (
                <form onSubmit={handleNameSubmit}>
                  <input
                    type="text"
                    placeholder="Twoje imię/nazwisko lub nick"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      fontSize: "3rem",
                      textAlign: "center",
                      marginBottom: "20px",
                      border: "5px solid #007bff",
                      borderRadius: "1rem",
                      width: "700px",
                      height: "5rem",
                    }}
                  />
                  <div>
                    {/* The submit button for the form is implicitly handled by VirtualKeyboard and its onKeyPress */}
                  </div>
                </form>
              ) : (
                <p>Dziękujemy za przesłanie wyniku!</p>
              )}
              <button
                onClick={handleCoffeeClaim}
                style={{ marginTop: "50px", fontSize: "2rem" }}
              >
                ODBIERZ KAWĘ (KOD QR)
              </button>
              <br />
              <button onClick={handleCoffeeReject} className="no2">
                <a className="a">Nie chcę kawy</a>
              </button>

              {timeElapsed <= 10 && (
                <button
                  onClick={fetchScoresFromFirebase}
                  className="tabletable"
                >
                  {"Tabela Wyników"}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="timer">
            <a className="gameText">Czas: {timeElapsed}s</a>
          </div>
          <div className="game-area">
            <div
              className="red-image-wrapper"
              style={{
                transform: `translate(${redSquarePosition.x}px, ${redSquarePosition.y}px)`,
              }}
            >
              <img
                src={logo}
                alt="Click Me"
                className="red-image"
                onClick={handleImageClick}
              />
            </div>
          </div>
          <div className="score">
            <a className="gameText">Punkty: {score}</a>
          </div>
        </>
      )}

      {isTableVisible && (
        <div className="results-table">
          <div className="results-content">
            <h2 style={{ fontSize: "4rem" }}>
              TABELA WYNIKÓW
              <br />
              (Dzisiejsze TOP 5)
            </h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Imię</th>
                  <th>Czas</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{score.name}</td>
                    <td>{score.time.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setIsTableVisible(false)} className="close">
              Zamknij
            </button>
          </div>
        </div>
      )}

      {!isNameSubmitted && gameOver && timeElapsed <= 10 && (
        <VirtualKeyboard onKeyPress={(value) => setName(value)} />
      )}
    </div>
  );
};

export default Game;