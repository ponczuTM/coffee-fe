import escpos from 'escpos';
import sharp from 'sharp';
import fs from 'fs';

const device = new escpos.USB(); 

const printer = new escpos.Printer(device);

const imgPath = './img.png';

sharp(imgPath)
  .resize(512)  
  .toBuffer()
  .then(data => {

    device.open(() => {

      escpos.Image.load(data, (image) => {
        printer
          .align('ct')  
          .image(image, 's8')  
          .cut()  
          .close();  
      });
    });
  })
  .catch(err => {
    console.error("Błąd przetwarzania obrazu:", err);
  });