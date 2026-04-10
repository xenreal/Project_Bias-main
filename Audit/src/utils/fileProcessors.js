import Papa from 'papaparse';

/**
 * Process a CSV file using PapaParse
 */
export function processCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const content = results.data
          .map((row) => Object.values(row).join(', '))
          .join('\n');
        const headers = results.meta.fields || [];
        resolve({
          type: 'data',
          format: 'csv',
          fileName: file.name,
          content: `Columns: ${headers.join(', ')}\n\n${content}`,
          preview: results.data.slice(0, 10),
          headers,
          rowCount: results.data.length,
        });
      },
      error: (err) => reject(err),
    });
  });
}

/**
 * Process a JSON file
 */
export function processJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const dataArray = Array.isArray(parsed) ? parsed : [parsed];
        const headers = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];
        resolve({
          type: 'data',
          format: 'json',
          fileName: file.name,
          content: JSON.stringify(parsed, null, 2),
          preview: dataArray.slice(0, 10),
          headers,
          rowCount: dataArray.length,
        });
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Process a plain text file
 */
export function processTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        type: 'data',
        format: 'txt',
        fileName: file.name,
        content: e.target.result,
        preview: e.target.result.slice(0, 2000),
        headers: [],
        rowCount: e.target.result.split('\n').length,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Convert an image file to a Base64 string
 */
export function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Full = e.target.result; // data:image/...;base64,...
      const base64Data = base64Full.split(',')[1]; // raw base64
      resolve({
        type: 'image',
        format: file.type.split('/')[1] || 'unknown',
        fileName: file.name,
        content: base64Data,
        mimeType: file.type,
        preview: base64Full, // for <img src>
        fileSize: file.size,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

/**
 * Dispatcher — routes file to the correct processor based on extension/MIME
 */
export async function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const mime = file.type.toLowerCase();

  // Images
  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)
  ) {
    return processImage(file);
  }

  // CSV
  if (ext === 'csv' || mime === 'text/csv') {
    return processCSV(file);
  }

  // JSON
  if (ext === 'json' || mime === 'application/json') {
    return processJSON(file);
  }

  // TXT / fallback text
  if (
    ext === 'txt' ||
    mime.startsWith('text/') ||
    ext === 'log' ||
    ext === 'md'
  ) {
    return processTXT(file);
  }

  // Parquet — can't parse in-browser easily, read as text fallback
  if (ext === 'parquet') {
    return processTXT(file);
  }

  // Default: try to read as text
  return processTXT(file);
}
