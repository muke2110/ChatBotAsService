const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (file) => {
  const filePath = file.path;
  const fileExt = file.originalname.split('.').pop().toLowerCase();

  try {
    switch (fileExt) {
      case 'pdf':
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      
      case 'docx':
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      
      case 'txt':
        const txtContent = fs.readFileSync(filePath, 'utf8');
        return txtContent;
      
      case 'csv':
        const csvContent = fs.readFileSync(filePath, 'utf8');
        // Convert CSV to readable text format
        const lines = csvContent.split('\n');
        const headers = lines[0]?.split(',').map(h => h.trim()) || [];
        const dataRows = lines.slice(1).filter(line => line.trim());
        
        let textContent = 'CSV Data:\n\n';
        dataRows.forEach((row, index) => {
          const values = row.split(',').map(v => v.trim());
          textContent += `Row ${index + 1}:\n`;
          headers.forEach((header, i) => {
            if (values[i]) {
              textContent += `${header}: ${values[i]}\n`;
            }
          });
          textContent += '\n';
        });
        
        return textContent;
      
      default:
        throw new Error(`Unsupported file type: ${fileExt}. Supported types: PDF, DOCX, TXT, CSV`);
    }
  } catch (error) {
    if (error.message.includes('Unsupported file type')) {
      throw error;
    }
    throw new Error(`Error processing ${fileExt} file: ${error.message}`);
  }
};

// Helper function to get supported file types
exports.getSupportedFileTypes = () => {
  return ['pdf', 'docx', 'txt', 'csv'];
};

// Helper function to validate file type
exports.isValidFileType = (filename) => {
  const fileExt = filename.split('.').pop().toLowerCase();
  return exports.getSupportedFileTypes().includes(fileExt);
};
