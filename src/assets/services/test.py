import win32print
import win32ui
from PIL import Image, ImageWin
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

image_path = 'img.png'

pdf_path = 'output.pdf'

def generate_pdf(image_path, pdf_path, text):
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter  

    img = Image.open(image_path)
    img_width, img_height = img.size

    img_ratio = img_width / img_height
    page_ratio = width / height

    if img_ratio > page_ratio:
        new_width = width
        new_height = width / img_ratio
    else:
        new_height = height
        new_width = height * img_ratio

    c.drawImage(image_path, 0, height - new_height, width=new_width, height=new_height)

    c.drawString(0, height - new_height - 20, text)  

    c.save()

generate_pdf(image_path, pdf_path, "test")

printer_name = win32print.GetDefaultPrinter()

if not printer_name:
    print("Nie znaleziono drukarki.")
else:
    print(f"Znaleziono drukarkę: {printer_name}")

    try:

        hdc = win32ui.CreateDC()
        hdc.CreatePrinterDC(printer_name)

        hdc.StartDoc(pdf_path)
        hdc.StartPage()

        import win32api
        win32api.ShellExecute(0, "print", pdf_path, None, ".", 0)

        hdc.EndPage()
        hdc.EndDoc()
        hdc.DeleteDC()

        print("PDF został wydrukowany.")
    except Exception as e:
        print(f"Nie udało się wydrukować PDF: {e}")