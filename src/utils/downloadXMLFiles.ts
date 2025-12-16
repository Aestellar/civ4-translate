// src/utils/downloadXMLFiles.ts
import JSZip from 'jszip';

interface XMLFile {
  name: string;
  content: string;
}

/**
 * Downloads XML files as either a single .xml file or a .zip archive.
 * @param files Array of { name, content }
 * @param zipIfMultiple If true (default), downloads ZIP when files.length > 1
 */
export const downloadXMLFiles = async (
  files: XMLFile[],
  zipIfMultiple: boolean = true
): Promise<void> => {
  if (files.length === 0) return;

  // Single file → direct download
  if (files.length === 1 && !zipIfMultiple) {
    const file = files[0];
    const blob = new Blob([file.content], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.endsWith('.xml') ? file.name : `${file.name}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // Multiple files → ZIP
  const zip = new JSZip();
  for (const file of files) {
    // Ensure .xml extension
    const fileName = file.name.endsWith('.xml') ? file.name : `${file.name}.xml`;
    zip.file(fileName, file.content, { binary: false });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = files.length === 1 ? `${files[0].name}.zip` : 'localization_files.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};