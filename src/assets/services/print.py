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

def cut_paper(printer_name):
    GS = '\x1D'
    cut_command_full = GS + 'V' + '\x00'

    hPrinter = win32print.OpenPrinter(printer_name)
    try:
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Cut Paper", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)
        win32print.WritePrinter(hPrinter, cut_command_full.encode())
        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
    finally:
        win32print.ClosePrinter(hPrinter)

    print("Wysłano komendę do ucięcia papieru.")

printer_name = win32print.GetDefaultPrinter()

if not printer_name:
    print("Nie znaleziono drukarki.")
else:
    print(f"Znaleziono drukarkę: {printer_name}")

    # qr_image_path, qr_code_id = create_single_use_qr()
    print_image('blank1.png', printer_name)
    # print_image(qr_image_path, printer_name)
    print_image('blank2.png', printer_name)
    cut_paper(printer_name)