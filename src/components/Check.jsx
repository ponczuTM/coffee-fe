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
              "Kod QR jest aktualny! Odbierz KAWĘ w sali konferencyjnej!"
            );
          } else {
            setMessage("Niestety, kod QR wygasł lub został już wykorzystany");
          }

          setTimeout(() => {
            setMessage("");
            setCode("");
          }, 3000);
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
        style={{ textAlign: 'center' }}
      />
      {message && <h2 className="message">{message}</h2>}
    </div>
  );
};

export default Check;
