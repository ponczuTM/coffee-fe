import React, { useState, useEffect } from "react";
import { database, ref, onValue } from "../../firebase";
import "./Check.css";

const Check = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div className="check-container">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="ZESKANUJ KOD QR"
        className="input-field"
        style={{ textAlign: "center" }}
      />
      {message && <h2 className="message">{message}</h2>}
    </div>
  );
};

export default Check;
