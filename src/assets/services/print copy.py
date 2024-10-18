import win32print
import win32ui
from PIL import Image, ImageWin
import qrcode
import random
import sqlite3
import sys
import io
import requests  

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
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)  
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    qr_image_path = 'qr_code.png'
    img.save(qr_image_path)
    return qr_image_path

def print_image(image_path, printer_name):
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

def send_to_firebase(coffee_number):
    firebase_url = "https://mroczkowski-well-default-rtdb.europe-west1.firebasedatabase.app/coffees.json"

    data = {
        "coffee": coffee_number
    }

    response = requests.post(firebase_url, json=data)

    if response.status_code == 200:
        print(f"ID '{coffee_number}' zostało wysłane do Firebase.")
    else:
        print(f"Nie udało się wysłać danych do Firebase. Status: {response.status_code}")

def create_single_use_qr():
    random_id = str(random.randint(100000, 999999))  

    conn = sqlite3.connect('qr_codes.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO qr_codes (id) VALUES (?)', (random_id,))
    conn.commit()
    conn.close()

    qr_image_path = generate_qr_code(random_id)  
    send_to_firebase(random_id)  
    return qr_image_path, random_id

def scan_qr_code(qr_code_id):
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