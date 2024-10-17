import win32print
import win32ui
from PIL import Image, ImageWin

printer_name = win32print.GetDefaultPrinter()

if not printer_name:
    print("Nie znaleziono drukarki.")
else:
    print(f"Znaleziono drukarkę: {printer_name}")

    image_path = 'img.png'
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"Nie udało się otworzyć obrazu: {e}")
        exit(1)

    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(printer_name)

    hdc.StartDoc(image_path)
    hdc.StartPage()

    width, height = img.size
    dib = ImageWin.Dib(img)

    dib.draw(hdc.GetHandleOutput(), (0, 0, width, height))

    line_height = 20  
    for _ in range(20):
        hdc.TextOut(0, height + line_height * _, " ")  

    hdc.TextOut(0, height + line_height * 20, "test")  

    hdc.EndPage()
    hdc.EndDoc()
    hdc.DeleteDC()

    print("DZIAŁA.")