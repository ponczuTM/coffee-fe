import win32print
import win32ui
from PIL import Image, ImageWin
import qrcode
import random
import json

def generate_qr_code(data):
    """Generuje kod QR dla podanych danych i zwraca ścieżkę do zapisanego obrazu."""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    qr_image_path = 'qr_code.png'
    img.save(qr_image_path)
    return qr_image_path

def print_image(image_path, printer_name):
    """Wydrukuje obraz pod podaną ścieżką na wybranej drukarce."""
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"Nie udało się otworzyć obrazu: {e}")
        return

    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(printer_name)

    hdc.StartDoc(image_path)
    hdc.StartPage()

    width, height = img.size
    dib = ImageWin.Dib(img)

    x, y = 0, 0

    dib.draw(hdc.GetHandleOutput(), (x, y, width, height))

    hdc.EndPage()
    hdc.EndDoc()
    hdc.DeleteDC()

    print(f"Obraz '{image_path}' został wydrukowany.")

def create_single_use_qr():
    """Tworzy jednorazowy QR kod z losowym 12-cyfrowym identyfikatorem."""
    random_id = random.randint(100000000000, 999999999999)  
    data = {
        "id": str(random_id),
        "coffee": True
    }
    json_data = json.dumps(data)
    qr_image_path = generate_qr_code(json_data)
    return qr_image_path

printer_name = win32print.GetDefaultPrinter()

if not printer_name:
    print("Nie znaleziono drukarki.")
else:
    print(f"Znaleziono drukarkę: {printer_name}")

    qr_image_path = create_single_use_qr()
    print_image('blank1.png', printer_name)
    print_image(qr_image_path, printer_name)
    print_image('blank2.png', printer_name)