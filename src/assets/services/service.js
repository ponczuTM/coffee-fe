import printer from 'printer'; // Upewnij się, że masz zainstalowaną tę bibliotekę
import fs from 'fs'; // Użyj do odczytu pliku
import path from 'path'; // Użyj do obsługi ścieżek

// Ścieżka do obrazu
const imagePath = path.join(__dirname, 'img.png');

// Funkcja do drukowania obrazu
function printImage(imagePath) {
    // Sprawdź, czy drukarka jest dostępna
    const printers = printer.getPrinters();
    const printerName = 'EPSON TM-L90'; // Upewnij się, że ta nazwa pasuje do Twojej drukarki

    const foundPrinter = printers.find(p => p.name === printerName);
    if (!foundPrinter) {
        console.error('Drukarka nie została znaleziona.');
        return;
    }

    // Odczytaj plik obrazu
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            console.error('Błąd odczytu pliku:', err);
            return;
        }

        // Wydrukuj obraz
        printer.printDirect({
            data: data,
            printer: printerName,
            type: 'RAW', // Możesz spróbować 'PNG' w zależności od ustawień drukarki
            success: function (jobID) {
                console.log(`Zlecenie druku wysłane. ID zlecenia: ${jobID}`);
            },
            error: function (err) {
                console.error('Błąd drukowania:', err);
            }
        });
    });
}

// Wywołaj funkcję drukującą
printImage(imagePath);
