import { exec } from "child_process";

exec("python print.py", (error, stdout, stderr) => {
  if (error) {
    console.error(`Błąd: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Błąd stderr: ${stderr}`);
    return;
  }
  console.log(`Wynik: ${stdout}`);
});
