import pdfParse from 'pdf-parse-fork';
import * as fs from 'fs';

/**
 * Production-Grade PDF Text Extractor
 * Accepts either a file path or a Buffer directly.
 * Pure memory-buffer extraction without legacy fs.promises side-effects.
 */
export async function extractTextFromPdf(filePathOrBuffer: string | Buffer): Promise<string> {
  try {
    let dataBuffer: Buffer;
    if (typeof filePathOrBuffer === 'string') {
      if (!fs.existsSync(filePathOrBuffer)) {
        return '';
      }
      dataBuffer = fs.readFileSync(filePathOrBuffer);
    } else {
      dataBuffer = filePathOrBuffer;
    }
    const data = await pdfParse(dataBuffer);
    return data && data.text ? data.text.trim() : '';
  } catch (error: any) {
    console.error('[pdfReader] Extraction failed:', error.message || error);
    return '';
  }
}
