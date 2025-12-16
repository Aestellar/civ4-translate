import React, { useState, useCallback, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import type { XMLFile } from '../types';
import { detectXMLEncoding } from '../utils/utils';
import styles from '../css/FileListHandler.module.css'; // 👈 import styles

interface FileListHandlerProps {
  onFilesProcessed: (files: XMLFile[]) => void;
  hasLoadedFiles: boolean;
}

const FileListHandler: React.FC<FileListHandlerProps> = ({ 
  onFilesProcessed, 
  hasLoadedFiles 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!hasLoadedFiles);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasLoadedFiles) {
      setIsExpanded(false);
    }
  }, [hasLoadedFiles]);

  const processFile = useCallback(async (file: File): Promise<XMLFile[]> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    const processXMLBytes = (bytes: Uint8Array, fileName: string): XMLFile => {
      const encoding = detectXMLEncoding(bytes);
      const decoder = new TextDecoder(encoding, { fatal: false });
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
      setIsExpanded(false);
    }
  };

  // Toggle button when collapsed but files exist
  if (hasLoadedFiles && !isExpanded) {
    return (
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => setIsExpanded(true)}
          className={styles.toggleButton}
          aria-label="Load files"
        >
          <span>📁</span>
          <span>Load files</span>
        </button>
      </div>
    );
  }

  // Full drag pane
  return (
    <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${styles.fileDropZone} ${isDragging ? styles.dragging : ''}`}
    >
      <button
        onClick={() => setIsExpanded(false)}
        className={styles.closeButton}
        aria-label="Close upload area"
      >
        ✕
      </button>

      <p>Drag & drop XML or ZIP files here</p>
      <p>or</p>
      <label htmlFor="file-input" className={styles.fileInputLabel}>
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
      <p className={styles.supportText}>
        Supports: .xml files and .zip archives with XML
      </p>
    </div>
  );
};

export default FileListHandler;