const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const archiver = require('archiver');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

class DocumentService {
  async generatePDF(content, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('# ')) {
          doc.fontSize(18).text(line.substring(2), { align: 'left' }).moveDown();
        } else if (line.startsWith('## ')) {
          doc.fontSize(14).text(line.substring(3), { align: 'left' }).moveDown();
        } else if (line.trim() === '') {
          doc.moveDown();
        } else {
          doc.fontSize(10).text(line);
        }
      }
      
      doc.end();
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  async generateDOCX(content, outputPath) {
    const paragraphs = content.split('\n').map(line => {
      if (line.startsWith('# ')) {
        return new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
        });
      } else if (line.startsWith('## ')) {
        return new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
        });
      } else if (line.trim() === '') {
        return new Paragraph({ text: '' });
      } else {
        return new Paragraph({
          children: [new TextRun(line)],
        });
      }
    });
    
    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    await writeFile(outputPath, buffer);
    return outputPath;
  }

  async createZip(files, outputPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => resolve(outputPath));
      archive.on('error', reject);
      archive.pipe(output);
      
      for (const file of files) {
        archive.file(file.path, { name: file.name });
      }
      
      archive.finalize();
    });
  }

  async cleanupFiles(paths) {
    for (const p of paths) {
      try {
        await unlink(p);
      } catch (err) {
        console.error(`Failed to delete ${p}:`, err);
      }
    }
  }
}

module.exports = new DocumentService();
