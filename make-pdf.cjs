const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ size: 'A4' });
const output = fs.createWriteStream(path.join(__dirname, 'STATUS-icon.pdf'));
doc.pipe(output);

const pageWidth = 595.28;
const pageHeight = 841.89;
const imgSize = 350;
const x = (pageWidth - imgSize) / 2;
const y = (pageHeight - imgSize) / 2 - 30;

doc.image(path.join(__dirname, 'public/icon-512.png'), x, y, { width: imgSize, height: imgSize });

// Add title below
doc.fontSize(24).fillColor('#0A1628').text('STATUS', 0, y + imgSize + 20, { align: 'center' });
doc.fontSize(12).fillColor('#666').text('COMMUNITY AWARENESS SYSTEM', 0, y + imgSize + 50, { align: 'center' });

doc.end();
output.on('finish', () => console.log('PDF created: STATUS-icon.pdf'));
