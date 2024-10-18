import win32print
import win32ui
from PIL import Image, ImageWin
import qrcode
import random
import json
import sqlite3
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def setup_database():
    conn = sqlite3.connect('qr_codes.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS qr_codes (
            id TEXT PRIMARY KEY,
            used INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

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
    random_id = str(random.randint(100000000000, 999999999999))  
    data = {
        "id": random_id,
        "coffee": True
    }
    json_data = json.dumps(data)

    conn = sqlite3.connect('qr_codes.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO qr_codes (id) VALUES (?)', (random_id,))
    conn.commit()
    conn.close()

    qr_image_path = generate_qr_code(json_data)
    return qr_image_path, random_id

def scan_qr_code(qr_code_id):
    """Sprawdza, czy QR kod został już zeskanowany."""
    conn = sqlite3.connect('qr_codes.db')
    cursor = conn.cursor()
    cursor.execute('SELECT used FROM qr_codes WHERE id = ?', (qr_code_id,))
    result = cursor.fetchone()

    if result is not None:
        if result[0] == 0:  

            cursor.execute('UPDATE qr_codes SET used = 1 WHERE id = ?', (qr_code_id,))
            conn.commit()
            conn.close()
            return True  
        else:
            conn.close()
            return False  
    conn.close()
    return False  

setup_database()

printer_name = win32print.GetDefaultPrinter()

if not printer_name:
    print("Nie znaleziono drukarki.")
else:
    print(f"Znaleziono drukarkę: {printer_name}")

    qr_image_path, qr_code_id = create_single_use_qr()
    print_image('blank1.png', printer_name)
    print_image(qr_image_path, printer_name)
    print_image('blank2.png', printer_name)

    scanned_id = qr_code_id  
    if scan_qr_code(scanned_id):
        print(f"QR kod '{scanned_id}' został zeskanowany i jest ważny.")
    else:
        print(f"QR kod '{scanned_id}' został już użyty lub nie istnieje.")