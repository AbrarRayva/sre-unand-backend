// src/utils/csvParser.js
const csv = require('csv-parser');
const { Readable } = require('stream');

exports.parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Validate user CSV data
exports.validateUserCSV = (data) => {
  const errors = [];
  const validPositions = ['P', 'VP', 'SEC', 'DIRECTOR', 'MANAGER', 'STAFF'];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because CSV starts at row 2 (row 1 is header)

    if (!row.name || row.name.trim() === '') {
      errors.push(`Row ${rowNum}: Name is required`);
    }

    if (!row.email || row.email.trim() === '') {
      errors.push(`Row ${rowNum}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${rowNum}: Invalid email format`);
    }

    if (!row.password || row.password.trim() === '') {
      errors.push(`Row ${rowNum}: Password is required`);
    }

    if (row.position && !validPositions.includes(row.position.toUpperCase())) {
      errors.push(`Row ${rowNum}: Invalid position. Must be one of: ${validPositions.join(', ')}`);
    }
  });

  return errors;
};