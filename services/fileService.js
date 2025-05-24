const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (file) => {
  const filePath = file.path;
  const fileExt = file.originalname.split('.').pop().toLowerCase();

  if (fileExt === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (fileExt === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    throw new Error('Unsupported file type.');
  }
};
