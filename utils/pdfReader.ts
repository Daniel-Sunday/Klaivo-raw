import * as fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extracts raw text from a PDF file using pdf-parse.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('[pdfReader] Error reading PDF file:', error);
    throw error;
  }
}
