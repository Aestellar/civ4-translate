// FileListHandler.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import type { XMLFile } from '../types';

interface FileListHandlerProps {
  onFilesProcessed: (files: XMLFile[]) => void;
  hasLoadedFiles: boolean;
}

const FileListHandler: React.FC<FileListHandlerProps> = ({ 
  onFilesProcessed, 
  hasLoadedFiles 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!hasLoadedFiles); // Start collapsed if files already loaded
  const dropRef = useRef<HTMLDivElement>(null);

  // If files are added externally (e.g., initial load), ensure pane is collapsed
  useEffect(() => {
    if (hasLoadedFiles) {
      setIsExpanded(false);
    }
  }, [hasLoadedFiles]);

const processFile = useCallback(async (file: File): Promise<XMLFile[]> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // Helper to detect encoding from XML declaration
  const detectXMLEncoding = (bytes: Uint8Array): string => {
    // Convert first 200 bytes (or less) to ASCII string for regex (safe for ASCII chars)
    const sampleLength = Math.min(bytes.length, 200);
    let sample = '';
    for (let i = 0; i < sampleLength; i++) {
      // Stop if we hit a null byte or non-ASCII (unlikely in prolog)
      if (bytes[i] === 0) break;
      if (bytes[i] > 127) {
        // Non-ASCII: might be UTF-16, but XML prolog is ASCII-compatible
        // We'll break and assume no declaration
        break;
      }
      sample += String.fromCharCode(bytes[i]);
    }

    // Match <?xml ... encoding="..." ?> (case-insensitive, supports ' or ")
    const match = sample.match(/<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i);
    if (match) {
      const encoding = match[1].trim();
      // Normalize common encodings
      if (/^utf-8$/i.test(encoding)) return 'utf-8';
      if (/^iso-8859-1$/i.test(encoding)) return 'iso-8859-1';
      if (/^windows-1252$/i.test(encoding)) return 'windows-1252';
      // Add more as needed
      console.warn(`Unsupported XML encoding: ${encoding}, falling back to UTF-8`);
    }

    // Default: per XML spec, if omitted → UTF-8 (or UTF-16 with BOM, but we ignore BOM here)
    return 'utf-8';
  };

  const processXMLBytes = (bytes: Uint8Array, fileName: string): XMLFile => {
    const encoding = detectXMLEncoding(bytes);
    const decoder = new TextDecoder(encoding, { fatal: false }); // non-fatal to avoid crashes
    const text = decoder.decode(bytes);
    return { name: fileName, content: text };
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
        xmlFiles.push(processXMLBytes(bytes, relativePath));
      }
    }
    return xmlFiles;
  }

  return [];
}, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const allXmlFiles: XMLFile[] = [];

    for (const file of files) {
      const xmlFiles = await processFile(file);
      allXmlFiles.push(...xmlFiles);
    }

    if (allXmlFiles.length > 0) {
      onFilesProcessed(allXmlFiles);
      // ✅ Collapse pane after processing
      setIsExpanded(false);
    }
  }, [processFile, onFilesProcessed]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.target === dropRef.current) {
      setIsDragging(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allXmlFiles: XMLFile[] = [];
    for (const file of Array.from(files)) {
      const xmlFiles = await processFile(file);
      allXmlFiles.push(...xmlFiles);
    }

    if (allXmlFiles.length > 0) {
      onFilesProcessed(allXmlFiles);
      // ✅ Collapse after file selection via button
      setIsExpanded(false);
    }
  };

  // If files are already loaded AND pane is collapsed → show small toggle button
  if (hasLoadedFiles && !isExpanded) {
    return (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '0 auto',
            color: '#333'
          }}
          aria-label="Add more files"
        >
          <span>📁</span>
          <span>Add more files</span>
        </button>
      </div>
    );
  }

  // Full drag pane (shown when: no files yet, OR user expanded it)
  return (
    <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'relative',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
        transition: 'background-color 0.2s',
        cursor: 'pointer'
      }}
    >
      {/* ✅ Close button when expanded (even if hasLoadedFiles) */}
      <button
        onClick={() => setIsExpanded(false)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'transparent',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#888',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Close upload area"
      >
        ✕
      </button>

      <p>Drag & drop XML or ZIP files here</p>
      <p>or</p>
      <label
        htmlFor="file-input"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Select Files
        <input
          id="file-input"
          type="file"
          multiple
          accept=".xml,.zip"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </label>
      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        Supports: .xml files and .zip archives with XML
      </p>
    </div>
  );
};

export default FileListHandler;