import React, { useState, useEffect } from "react";
import { database, ref, onValue } from "../../firebase";
import "./Check.css";

const Check = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [inputText, setInputText] = useState("☝ kliknij ☝");
  const [inputBackground, setInputBackground] = useState(
    "rgba(255, 111, 111, 0.266)"
  );

  useEffect(() => {
    if (code.length >= 6) {
      const codeRef = ref(database, `coffees`);
      onValue(
        codeRef,
        (snapshot) => {
          let codeExists = false;

          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().coffee === code) {
              codeExists = true;
            }
          });

          if (codeExists) {
            setMessage(
              <>
                <h1>SUPER!</h1>
                <h1>kod QR jest aktualny!</h1>
                <h1>Odbierz kawę w sali konferencyjnej</h1>
              </>
            );
          } else {
            setMessage(
              <>
                <h1>Niestety,</h1>
                <h1>kod QR wygasł,</h1>
                <h1>lub został użyty</h1>
              </>
            );
          }

          setTimeout(() => {
            setMessage("");
            setCode("");
          }, 4000);
        },
        {
          onlyOnce: true,
        }
      );
    } else {
      setMessage("");
    }
  }, [code]);

  const handleInputClick = () => {
    setInputText("📲 ZESKANUJ QR 📲");
    setInputBackground("rgba(0, 90, 0, 0.566)");
  };

  return (
    <div className="check-container">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={inputText}
        className="input-check"
        style={{ textAlign: "center", backgroundColor: inputBackground }}
        onClick={handleInputClick}
      />
      {message && <h2 className="message">{message}</h2>}
    </div>
  );
};

export default Check;
