import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/claim-coffee", (req, res) => {
  exec("python print.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Błąd: ${error.message}`);
      return res.status(500).json({ message: "Błąd serwera." });
    }
    if (stderr) {
      console.error(`Błąd stderr: ${stderr}`);
      return res.status(500).json({ message: "Błąd w skrypcie Pythona." });
    }
    console.log(`Wynik: ${stdout}`);
    return res
      .status(200)
      .json({ message: "Skrypt Pythona wykonany pomyślnie." });
  });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
