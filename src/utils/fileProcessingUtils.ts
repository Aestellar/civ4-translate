// fileProcessingUtils.ts
import JSZip from 'jszip';
import type { XMLFile } from '../types';
import { detectXMLEncoding } from './utils';

/**
 * Processes a single file (XML or ZIP) and returns XMLFile objects
 */
export const processFile = async (file: File): Promise<XMLFile[]> => {
  const match = file.name.match(/\.([^.]+)$/);
  const fileExtension = match ? match[1].toLowerCase() : '';

  const processXMLBytes = (bytes: Uint8Array, originalName: string): XMLFile => {
    const encoding = detectXMLEncoding(bytes);
    const decoder = new TextDecoder(encoding, { fatal: false });
    let text = decoder.decode(bytes);
    // Normalize encoding declaration to UTF-8
    text = text.replace(
      /(<\?xml[^>]*\bencoding\s*=\s*["'])[^"']*(["'][^>]*\?>)/gi, 
      `$1UTF-8$2`
    );
    return { name: originalName, content: text };
  };

  if (fileExtension === 'xml') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return [processXMLBytes(bytes, file.name)];
  }

  if (fileExtension === 'zip') {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const xmlFiles: XMLFile[] = [];

    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir && relativePath.endsWith('.xml')) {
        const bytes = await zipEntry.async('uint8array');
        const fileName = relativePath.split('/').pop() || relativePath;
        xmlFiles.push(processXMLBytes(bytes, fileName));
      }
    }
    return xmlFiles;
  }

  return [];
};

/**
 * Processes multiple files concurrently
 */
export const processFiles = async (files: File[]): Promise<XMLFile[]> => {
  const results = await Promise.allSettled(files.map(processFile));
  const validResults: XMLFile[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      validResults.push(...result.value);
    } else {
      console.error('Error processing file:', files[index].name, result.reason);
    }
  });

  return validResults;
};

export const createZipFromXMLFiles = async (files: { name: string; content: string }[]): Promise<Blob> => {
  const zip = new JSZip();
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};